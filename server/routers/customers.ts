import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { customers } from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";

export const customersRouter = router({
  // Verifica acesso do cliente por email
  verificarAcesso: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      const email = input.email.toLowerCase().trim();
      const result = await db
        .select()
        .from(customers)
        .where(eq(customers.email, email));

      // Filtra apenas planos ativos e não expirados
      const activeCustomers = result.filter(c => {
        if (c.status !== "active") return false;
        if (c.expiresAt && new Date(c.expiresAt) < new Date()) return false;
        // Relatório avulso: máximo 1 uso
        if (c.plano === "relatorio_avulso" && c.relatoriosUsados >= 1) return false;
        return true;
      });

      if (activeCustomers.length === 0) {
        return { hasAccess: false as const, planos: [] as string[] };
      }

      // Retorna o melhor plano disponível
      const planos = activeCustomers.map(c => c.plano);
      const melhorPlano = planos.includes("consultoria")
        ? "consultoria"
        : planos.includes("plano_anual")
          ? "plano_anual"
          : "relatorio_avulso";

      return {
        hasAccess: true as const,
        planos,
        melhorPlano,
        nome: activeCustomers[0].nome,
      };
    }),

  // Incrementa uso de relatório (chamado após gerar relatório)
  registrarUso: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      const email = input.email.toLowerCase().trim();
      const result = await db
        .select()
        .from(customers)
        .where(
          and(
            eq(customers.email, email),
            eq(customers.status, "active"),
          )
        );

      // Incrementa relatórios usados no plano avulso
      for (const customer of result) {
        if (customer.plano === "relatorio_avulso") {
          await db.update(customers)
            .set({ relatoriosUsados: customer.relatoriosUsados + 1 })
            .where(eq(customers.id, customer.id));
        }
      }

      return { ok: true };
    }),
});
