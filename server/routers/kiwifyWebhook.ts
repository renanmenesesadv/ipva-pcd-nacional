import { Router } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { customers } from "../../drizzle/schema";

const kiwifyRouter = Router();

// Mapeia nome do produto Kiwify → plano interno
function mapProductToPlano(productName: string): "relatorio_avulso" | "plano_anual" | "consultoria" | null {
  const name = productName.toLowerCase();
  if (name.includes("consultoria")) return "consultoria";
  if (name.includes("anual") || name.includes("ipva zero")) return "plano_anual";
  if (name.includes("avulso") || name.includes("relatório")) return "relatorio_avulso";
  return null;
}

// POST /api/kiwify/webhook
kiwifyRouter.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    // Kiwify envia diferentes eventos
    const eventType = body.webhook_event_type || body.order_status;
    const orderStatus = body.order_status;

    console.log("[Kiwify Webhook]", JSON.stringify({ eventType, orderStatus }, null, 2));

    // Dados do cliente
    const customerData = body.Customer || body.customer || {};
    const productData = body.Product || body.product || {};
    const email = customerData.email?.toLowerCase()?.trim();
    const nome = customerData.full_name || customerData.name || "";
    const telefone = customerData.mobile || customerData.phone || "";
    const orderId = body.order_id || body.order_ref || "";
    const productName = productData.product_name || productData.name || "";

    if (!email) {
      console.warn("[Kiwify Webhook] Email não encontrado no payload");
      return res.status(200).json({ ok: true, message: "No email found" });
    }

    const plano = mapProductToPlano(productName);
    if (!plano) {
      console.warn("[Kiwify Webhook] Produto não mapeado:", productName);
      return res.status(200).json({ ok: true, message: "Product not mapped" });
    }

    const db = await getDb();
    if (!db) {
      console.error("[Kiwify Webhook] Database not available");
      return res.status(500).json({ error: "Database not available" });
    }

    // Pagamento aprovado
    if (orderStatus === "paid" || eventType === "order_approved") {
      const expiresAt = plano === "plano_anual"
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
        : null;

      // Verifica se já existe cliente com esse email e plano
      const existing = await db
        .select()
        .from(customers)
        .where(eq(customers.email, email))
        .limit(10);

      const existingPlan = existing.find(c => c.plano === plano && c.status === "active");

      if (existingPlan) {
        // Atualiza o existente (renova)
        await db.update(customers)
          .set({
            status: "active",
            kiwifyOrderId: orderId,
            ...(expiresAt ? { expiresAt } : {}),
          })
          .where(eq(customers.id, existingPlan.id));

        console.log("[Kiwify Webhook] Cliente atualizado:", email, plano);
      } else {
        // Cria novo registro
        await db.insert(customers).values({
          email,
          nome,
          telefone,
          plano,
          kiwifyOrderId: orderId,
          status: "active",
          relatoriosUsados: 0,
          expiresAt,
        });

        console.log("[Kiwify Webhook] Novo cliente:", email, plano);
      }

      return res.status(200).json({ ok: true, message: "Customer created/updated" });
    }

    // Reembolso
    if (orderStatus === "refunded" || eventType === "order_refunded") {
      await db.update(customers)
        .set({ status: "refunded" })
        .where(eq(customers.email, email));

      console.log("[Kiwify Webhook] Cliente reembolsado:", email);
      return res.status(200).json({ ok: true, message: "Customer refunded" });
    }

    // Outros eventos - apenas log
    console.log("[Kiwify Webhook] Evento não tratado:", eventType);
    return res.status(200).json({ ok: true, message: "Event ignored" });

  } catch (error) {
    console.error("[Kiwify Webhook] Erro:", error);
    return res.status(200).json({ ok: true, message: "Error processed" });
  }
});

export { kiwifyRouter };
