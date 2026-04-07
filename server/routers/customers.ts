import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { customers, reports } from "../../drizzle/schema";
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

      // Verifica se algum plano está perto de expirar (30 dias)
      const expirandoEm30d = activeCustomers.some(c => {
        if (!c.expiresAt) return false;
        const diasRestantes = Math.ceil((new Date(c.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return diasRestantes <= 30 && diasRestantes > 0;
      });

      const diasParaExpirar = activeCustomers
        .filter(c => c.expiresAt)
        .map(c => Math.ceil((new Date(c.expiresAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        .sort((a, b) => a - b)[0] || null;

      return {
        hasAccess: true as const,
        planos,
        melhorPlano,
        nome: activeCustomers[0].nome,
        expirandoEm30d,
        diasParaExpirar,
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

  // Salva relatório no histórico (server-side)
  salvarRelatorio: publicProcedure
    .input(z.object({
      email: z.string().email(),
      estado: z.string(),
      estadoNome: z.string(),
      deficiencia: z.string(),
      condutor: z.string(),
      tipoVeiculo: z.string(),
      valorVeiculo: z.string(),
      elegivel: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.insert(reports).values({
        customerEmail: input.email.toLowerCase().trim(),
        estado: input.estado,
        estadoNome: input.estadoNome,
        deficiencia: input.deficiencia,
        condutor: input.condutor,
        tipoVeiculo: input.tipoVeiculo,
        valorVeiculo: input.valorVeiculo,
        elegivel: input.elegivel,
      });

      return { ok: true };
    }),

  // Lista relatórios gerados pelo cliente
  meusRelatorios: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const email = input.email.toLowerCase().trim();
      return db.select().from(reports)
        .where(eq(reports.customerEmail, email))
        .orderBy(desc(reports.createdAt))
        .limit(50);
    }),

  // Atualizar dados da conta
  atualizarConta: publicProcedure
    .input(z.object({
      emailAtual: z.string().email(),
      nome: z.string().min(2).optional(),
      telefone: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const email = input.emailAtual.toLowerCase().trim();
      const updateData: Record<string, any> = {};
      if (input.nome) updateData.nome = input.nome;
      if (input.telefone) updateData.telefone = input.telefone;

      if (Object.keys(updateData).length === 0) {
        return { ok: true };
      }

      await db.update(customers)
        .set(updateData)
        .where(eq(customers.email, email));

      return { ok: true };
    }),
});
