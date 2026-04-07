import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { leads, customers, webhookEvents } from "../../drizzle/schema";
import { eq, desc, like, and, or, sql } from "drizzle-orm";

// Middleware para verificar se é admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // Listar todos os leads com filtros
  listarLeads: adminProcedure
    .input(
      z.object({
        pagina: z.number().default(1),
        porPagina: z.number().default(20),
        busca: z.string().optional(),
        deficiencia: z.string().optional(),
        estado: z.string().optional(),
        elegivel: z.boolean().optional(),
        contatado: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const offset = (input.pagina - 1) * input.porPagina;

      const conditions = [];

      if (input.busca) {
        conditions.push(
          or(
            like(leads.nome, `%${input.busca}%`),
            like(leads.email, `%${input.busca}%`),
            like(leads.telefone, `%${input.busca}%`)
          )
        );
      }
      if (input.deficiencia) {
        conditions.push(like(leads.deficiencia, `%${input.deficiencia}%`));
      }
      if (input.estado) {
        conditions.push(eq(leads.estado, input.estado));
      }
      if (input.elegivel !== undefined) {
        conditions.push(eq(leads.elegivel, input.elegivel));
      }
      if (input.contatado !== undefined) {
        conditions.push(eq(leads.contatado, input.contatado));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [allLeads, totalCount] = await Promise.all([
        db
          .select()
          .from(leads)
          .where(whereClause)
          .orderBy(desc(leads.createdAt))
          .limit(input.porPagina)
          .offset(offset),
        db.select({ id: leads.id }).from(leads).where(whereClause),
      ]);

      return {
        leads: allLeads,
        total: totalCount.length,
        paginas: Math.ceil(totalCount.length / input.porPagina),
        paginaAtual: input.pagina,
      };
    }),

  // Estatísticas para o dashboard
  estatisticas: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const todos = await db.select().from(leads).orderBy(desc(leads.createdAt));

    const total = todos.length;
    const elegiveis = todos.filter((l) => l.elegivel).length;
    const naoContatados = todos.filter((l) => !l.contatado).length;

    // Agrupar por deficiência
    const porDeficiencia: Record<string, number> = {};
    todos.forEach((l) => {
      if (l.deficiencia) {
        porDeficiencia[l.deficiencia] = (porDeficiencia[l.deficiencia] || 0) + 1;
      }
    });

    // Agrupar por estado
    const porEstado: Record<string, number> = {};
    todos.forEach((l) => {
      if (l.estado) {
        porEstado[l.estado] = (porEstado[l.estado] || 0) + 1;
      }
    });

    // Leads dos últimos 7 dias
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    const recentes = todos.filter((l) => new Date(l.createdAt) >= seteDiasAtras).length;

    return {
      total,
      elegiveis,
      naoContatados,
      recentes,
      porDeficiencia,
      porEstado,
      ultimosLeads: todos.slice(0, 5),
    };
  }),

  // Marcar lead como contatado
  marcarContatado: adminProcedure
    .input(z.object({ id: z.number(), contatado: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(leads)
        .set({ contatado: input.contatado })
        .where(eq(leads.id, input.id));

      return { success: true };
    }),

  // Adicionar observação
  adicionarObservacao: adminProcedure
    .input(z.object({ id: z.number(), observacoes: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(leads)
        .set({ observacoes: input.observacoes })
        .where(eq(leads.id, input.id));

      return { success: true };
    }),

  // Exportar leads como CSV
  exportarCSV: adminProcedure
    .input(
      z.object({
        deficiencia: z.string().optional(),
        estado: z.string().optional(),
        elegivel: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const conditions = [];
      if (input.deficiencia) conditions.push(like(leads.deficiencia, `%${input.deficiencia}%`));
      if (input.estado) conditions.push(eq(leads.estado, input.estado));
      if (input.elegivel !== undefined) conditions.push(eq(leads.elegivel, input.elegivel));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const todos = await db
        .select()
        .from(leads)
        .where(whereClause)
        .orderBy(desc(leads.createdAt));

      // Gerar CSV
      const cabecalho = [
        "ID", "Nome", "Email", "WhatsApp", "Deficiência", "Estado",
        "Condutor", "Tipo Veículo", "Valor Veículo", "Laudo Médico",
        "Elegível", "Contatado", "Observações", "Data Cadastro"
      ].join(",");

      const linhas = todos.map((l) =>
        [
          l.id,
          `"${l.nome}"`,
          `"${l.email}"`,
          `"${l.telefone}"`,
          `"${l.deficiencia}"`,
          `"${l.estadoNome || l.estado}"`,
          `"${l.condutor}"`,
          `"${l.tipoVeiculo}"`,
          `"${l.valorVeiculo}"`,
          `"${l.laudoMedico}"`,
          l.elegivel ? "Sim" : "Não",
          l.contatado ? "Sim" : "Não",
          `"${l.observacoes || ""}"`,
          `"${new Date(l.createdAt).toLocaleDateString("pt-BR")}"`,
        ].join(",")
      );

      return { csv: [cabecalho, ...linhas].join("\n"), total: todos.length };
    }),

  // ===== GESTÃO DE CLIENTES (PÓS-PAGAMENTO) =====

  // Listar todos os clientes
  listarClientes: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return db.select().from(customers).orderBy(desc(customers.createdAt));
  }),

  // Adicionar cliente manualmente (para liberar acesso sem webhook)
  adicionarCliente: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        nome: z.string().min(2),
        telefone: z.string().optional(),
        plano: z.enum(["relatorio_avulso", "plano_anual", "consultoria"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const email = input.email.toLowerCase().trim();
      const expiresAt = input.plano === "plano_anual"
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : null;

      await db.insert(customers).values({
        email,
        nome: input.nome,
        telefone: input.telefone || null,
        plano: input.plano,
        status: "active",
        relatoriosUsados: 0,
        kiwifyOrderId: "manual",
        expiresAt,
      });

      return { success: true };
    }),

  // Remover/desativar cliente
  removerCliente: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.update(customers)
        .set({ status: "expired" })
        .where(eq(customers.id, input.id));

      return { success: true };
    }),

  // Reativar cliente
  reativarCliente: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.update(customers)
        .set({ status: "active" })
        .where(eq(customers.id, input.id));

      return { success: true };
    }),

  // ===== WEBHOOK EVENTS LOG (AUDITORIA) =====

  // Listar eventos do webhook com paginação
  listarWebhookEvents: adminProcedure
    .input(
      z.object({
        pagina: z.number().default(1),
        porPagina: z.number().default(50),
        status: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const offset = (input.pagina - 1) * input.porPagina;

      const conditions = [];
      if (input.status) conditions.push(eq(webhookEvents.status, input.status));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [events, totalCount] = await Promise.all([
        db.select().from(webhookEvents)
          .where(whereClause)
          .orderBy(desc(webhookEvents.createdAt))
          .limit(input.porPagina)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(webhookEvents).where(whereClause),
      ]);

      return {
        events,
        total: Number(totalCount[0]?.count || 0),
        paginas: Math.ceil(Number(totalCount[0]?.count || 0) / input.porPagina),
        paginaAtual: input.pagina,
      };
    }),

  // Estatísticas de webhook
  webhookStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const all = await db.select().from(webhookEvents).orderBy(desc(webhookEvents.createdAt));

    const total = all.length;
    const success = all.filter(e => e.status === "success").length;
    const errors = all.filter(e => e.status === "error").length;
    const ignored = all.filter(e => e.status === "ignored").length;
    const last7days = all.filter(e => {
      const d = new Date(e.createdAt);
      return d >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }).length;

    return { total, success, errors, ignored, last7days, ultimosEventos: all.slice(0, 10) };
  }),

  // ===== DASHBOARD DE RECEITA =====

  dashboardReceita: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const allCustomers = await db.select().from(customers);

    const ativos = allCustomers.filter(c => c.status === "active");
    const reembolsados = allCustomers.filter(c => c.status === "refunded");

    // Receita por plano
    const precos = { relatorio_avulso: 17, plano_anual: 37, consultoria: 297 };
    let receitaTotal = 0;
    let receitaAtiva = 0;
    const porPlano = { relatorio_avulso: 0, plano_anual: 0, consultoria: 0 };

    allCustomers.forEach(c => {
      if (c.status !== "refunded") {
        const valor = precos[c.plano] || 0;
        receitaTotal += valor;
        porPlano[c.plano]++;
        if (c.status === "active") receitaAtiva += valor;
      }
    });

    // Últimos 30 dias
    const ultimos30 = allCustomers.filter(c => {
      const d = new Date(c.createdAt);
      return d >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && c.status !== "refunded";
    });
    const receita30dias = ultimos30.reduce((sum, c) => sum + (precos[c.plano] || 0), 0);

    return {
      totalClientes: allCustomers.length,
      clientesAtivos: ativos.length,
      clientesReembolsados: reembolsados.length,
      receitaTotal,
      receitaAtiva,
      receita30dias,
      porPlano,
    };
  }),
});
