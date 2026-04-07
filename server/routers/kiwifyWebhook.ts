import { Router } from "express";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { customers, webhookEvents } from "../../drizzle/schema";

const kiwifyRouter = Router();

// Mapeia nome do produto Kiwify → plano interno
function mapProductToPlano(productName: string): "relatorio_avulso" | "plano_anual" | "consultoria" | null {
  const name = productName.toLowerCase();
  if (name.includes("consultoria") || name.includes("consulta")) return "consultoria";
  if (name.includes("anual") || name.includes("ipva zero")) return "plano_anual";
  if (name.includes("avulso") || name.includes("relatório") || name.includes("relatorio")) return "relatorio_avulso";
  return null;
}

// Verifica assinatura do webhook da Kiwify
function verifyKiwifySignature(payload: string, signature: string | undefined, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// Log do evento no banco
async function logWebhookEvent(data: {
  eventType: string;
  orderId?: string;
  email?: string;
  productName?: string;
  plano?: string;
  status: "success" | "error" | "ignored";
  errorMessage?: string;
  rawPayload?: string;
  ipAddress?: string;
}) {
  try {
    const db = await getDb();
    if (!db) return;
    await db.insert(webhookEvents).values({
      eventType: data.eventType,
      orderId: data.orderId || null,
      email: data.email || null,
      productName: data.productName || null,
      plano: data.plano || null,
      status: data.status,
      errorMessage: data.errorMessage || null,
      rawPayload: data.rawPayload ? data.rawPayload.substring(0, 5000) : null, // Limita tamanho
      ipAddress: data.ipAddress || null,
    });
  } catch (e) {
    console.error("[Webhook Log] Failed to save:", e);
  }
}

// POST /api/kiwify/webhook
kiwifyRouter.post("/webhook", async (req, res) => {
  const rawBody = JSON.stringify(req.body);
  const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "";

  try {
    const body = req.body;

    // Verificação de assinatura (se KIWIFY_WEBHOOK_SECRET estiver configurado)
    const webhookSecret = process.env.KIWIFY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers["x-kiwify-signature"] as string | undefined
        || req.headers["signature"] as string | undefined;
      if (!verifyKiwifySignature(rawBody, signature, webhookSecret)) {
        console.warn("[Kiwify Webhook] Assinatura inválida de", ipAddress);
        await logWebhookEvent({
          eventType: "signature_invalid",
          status: "error",
          errorMessage: "Invalid webhook signature",
          rawPayload: rawBody,
          ipAddress,
        });
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    const eventType = body.webhook_event_type || body.order_status || "unknown";
    const orderStatus = body.order_status;

    // Dados do cliente
    const customerData = body.Customer || body.customer || {};
    const productData = body.Product || body.product || {};
    const email = customerData.email?.toLowerCase()?.trim();
    const nome = customerData.full_name || customerData.name || "";
    const telefone = customerData.mobile || customerData.phone || "";
    const orderId = body.order_id || body.order_ref || "";
    const productName = productData.product_name || productData.name || "";

    if (!email) {
      await logWebhookEvent({
        eventType, status: "ignored",
        errorMessage: "No email in payload",
        rawPayload: rawBody, ipAddress,
      });
      return res.status(200).json({ ok: true, message: "No email found" });
    }

    const plano = mapProductToPlano(productName);
    if (!plano) {
      await logWebhookEvent({
        eventType, orderId, email, productName,
        status: "ignored",
        errorMessage: `Product not mapped: ${productName}`,
        rawPayload: rawBody, ipAddress,
      });
      return res.status(200).json({ ok: true, message: "Product not mapped" });
    }

    const db = await getDb();
    if (!db) {
      await logWebhookEvent({
        eventType, orderId, email, productName, plano,
        status: "error", errorMessage: "Database not available",
        rawPayload: rawBody, ipAddress,
      });
      return res.status(500).json({ error: "Database not available" });
    }

    // Pagamento aprovado
    if (orderStatus === "paid" || eventType === "order_approved") {
      const expiresAt = plano === "plano_anual"
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : null;

      // Deduplicação por orderId
      if (orderId) {
        const existingOrder = await db
          .select()
          .from(customers)
          .where(eq(customers.kiwifyOrderId, orderId))
          .limit(1);

        if (existingOrder.length > 0) {
          await logWebhookEvent({
            eventType, orderId, email, productName, plano,
            status: "ignored", errorMessage: "Duplicate order ID",
            ipAddress,
          });
          return res.status(200).json({ ok: true, message: "Duplicate order" });
        }
      }

      // Cria novo registro
      await db.insert(customers).values({
        email,
        nome,
        telefone,
        plano,
        kiwifyOrderId: orderId || null,
        status: "active",
        relatoriosUsados: 0,
        expiresAt,
      });

      await logWebhookEvent({
        eventType, orderId, email, productName, plano,
        status: "success", ipAddress,
      });

      console.log("[Kiwify Webhook] Novo cliente:", email, plano, orderId);
      return res.status(200).json({ ok: true, message: "Customer created" });
    }

    // Reembolso ou chargeback
    if (orderStatus === "refunded" || eventType === "order_refunded"
      || orderStatus === "chargedback" || eventType === "chargeback") {
      if (orderId) {
        await db.update(customers)
          .set({ status: "refunded" })
          .where(eq(customers.kiwifyOrderId, orderId));
      } else {
        await db.update(customers)
          .set({ status: "refunded" })
          .where(eq(customers.email, email));
      }

      await logWebhookEvent({
        eventType, orderId, email, productName, plano,
        status: "success", ipAddress,
      });

      console.log("[Kiwify Webhook] Reembolso:", email, orderId);
      return res.status(200).json({ ok: true, message: "Customer refunded" });
    }

    // Outros eventos
    await logWebhookEvent({
      eventType, orderId, email, productName, plano,
      status: "ignored", errorMessage: `Unhandled event: ${eventType}`,
      ipAddress,
    });
    return res.status(200).json({ ok: true, message: "Event ignored" });

  } catch (error: any) {
    console.error("[Kiwify Webhook] Erro:", error);
    await logWebhookEvent({
      eventType: "processing_error",
      status: "error",
      errorMessage: error.message || String(error),
      rawPayload: rawBody,
      ipAddress,
    });
    return res.status(200).json({ ok: true, message: "Error processed" });
  }
});

export { kiwifyRouter };
