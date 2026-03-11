import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { leads } from "../../drizzle/schema";
import { estadosIPVAPCD } from "../data/estadosIPVAPCD";
import { notifyOwner } from "../_core/notification";

export const leadsRouter = router({
  // Criar um novo lead (captura inicial)
  criar: publicProcedure
    .input(
      z.object({
        nome: z.string().min(2),
        email: z.string().email(),
        telefone: z.string().min(10),
        deficiencia: z.string().min(1),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");

      const [result] = await db.insert(leads).values({
        nome: input.nome,
        email: input.email,
        telefone: input.telefone,
        deficiencia: input.deficiencia,
        estado: "",
        estadoNome: "",
        condutor: "",
        tipoVeiculo: "",
        valorVeiculo: "",
        laudoMedico: "",
        elegivel: false,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
      });

      // Notificar o dono sobre novo lead
      await notifyOwner({
        title: `🎯 Novo Lead Capturado: ${input.nome}`,
        content: `**Nome:** ${input.nome}\n**Email:** ${input.email}\n**WhatsApp:** ${input.telefone}\n**Deficiência:** ${input.deficiencia}`,
      }).catch(() => {}); // Não falhar se notificação falhar

      return { success: true, id: (result as any).insertId };
    }),

  // Atualizar lead com dados da análise
  atualizarAnalise: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        estado: z.string().length(2),
        condutor: z.string(),
        tipoVeiculo: z.string(),
        valorVeiculo: z.string(),
        laudoMedico: z.string(),
        elegivel: z.boolean(),
        motivoElegibilidade: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      const estadoDados = estadosIPVAPCD[input.estado as keyof typeof estadosIPVAPCD];
      const estadoNome = estadoDados?.nome || input.estado;

      const { eq, desc } = await import("drizzle-orm");

      // Buscar o lead mais recente com esse email
      const leadsExistentes = await db
        .select()
        .from(leads)
        .where(eq(leads.email, input.email))
        .orderBy(desc(leads.createdAt))
        .limit(1);

      if (leadsExistentes.length === 0) return { success: false };

      await db
        .update(leads)
        .set({
          estado: input.estado,
          estadoNome,
          condutor: input.condutor,
          tipoVeiculo: input.tipoVeiculo,
          valorVeiculo: input.valorVeiculo,
          laudoMedico: input.laudoMedico,
          elegivel: input.elegivel,
          motivoElegibilidade: input.motivoElegibilidade,
        })
        .where(eq(leads.id, leadsExistentes[0].id));

      return { success: true };
    }),
});
