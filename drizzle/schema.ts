import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de leads capturados pela plataforma IPVA Zero PCD
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),

  // Dados pessoais
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),

  // Dados da análise
  estado: varchar("estado", { length: 2 }).notNull(),
  estadoNome: varchar("estadoNome", { length: 100 }).notNull(),
  deficiencia: varchar("deficiencia", { length: 100 }).notNull(),
  condutor: varchar("condutor", { length: 10 }).notNull(), // "sim" | "nao"
  tipoVeiculo: varchar("tipoVeiculo", { length: 10 }).notNull(), // "novo" | "usado"
  valorVeiculo: varchar("valorVeiculo", { length: 20 }).notNull(),
  laudoMedico: varchar("laudoMedico", { length: 10 }).notNull(), // "sim" | "nao"

  // Resultado
  elegivel: boolean("elegivel").notNull().default(false),
  motivoElegibilidade: text("motivoElegibilidade"),

  // Metadados
  origem: varchar("origem", { length: 50 }).default("site").notNull(), // "site" | "social" | etc.
  utmSource: varchar("utmSource", { length: 100 }),
  utmMedium: varchar("utmMedium", { length: 100 }),
  utmCampaign: varchar("utmCampaign", { length: 100 }),

  // Controle
  contatado: boolean("contatado").default(false).notNull(),
  observacoes: text("observacoes"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// Tabela de clientes pagos via Kiwify
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),

  // Dados do cliente
  email: varchar("email", { length: 320 }).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }),

  // Plano: relatorio_avulso (R$17), plano_anual (R$37), consultoria (R$297)
  plano: mysqlEnum("plano", ["relatorio_avulso", "plano_anual", "consultoria"]).notNull(),

  // Controle de uso (relatório avulso = max 1)
  relatoriosUsados: int("relatoriosUsados").default(0).notNull(),

  // Kiwify
  kiwifyOrderId: varchar("kiwifyOrderId", { length: 100 }),

  // Status
  status: mysqlEnum("status", ["active", "expired", "refunded"]).default("active").notNull(),

  // Expiração (plano_anual expira em 12 meses, outros não expiram)
  expiresAt: timestamp("expiresAt"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// Tabela de relatórios gerados (histórico server-side)
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  estado: varchar("estado", { length: 2 }).notNull(),
  estadoNome: varchar("estadoNome", { length: 100 }).notNull(),
  deficiencia: varchar("deficiencia", { length: 100 }).notNull(),
  condutor: varchar("condutor", { length: 10 }).notNull(),
  tipoVeiculo: varchar("tipoVeiculo", { length: 10 }).notNull(),
  valorVeiculo: varchar("valorVeiculo", { length: 20 }).notNull(),
  elegivel: boolean("elegivel").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Tabela de log de eventos do webhook (auditoria)
export const webhookEvents = mysqlTable("webhook_events", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 50 }).notNull(), // "order_approved", "order_refunded", etc.
  orderId: varchar("orderId", { length: 100 }),
  email: varchar("email", { length: 320 }),
  productName: varchar("productName", { length: 255 }),
  plano: varchar("plano", { length: 50 }),
  status: varchar("status", { length: 20 }).notNull(), // "success", "error", "ignored"
  errorMessage: text("errorMessage"),
  rawPayload: text("rawPayload"), // JSON do payload completo
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
