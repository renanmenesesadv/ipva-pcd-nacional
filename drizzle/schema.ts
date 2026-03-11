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
