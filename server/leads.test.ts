import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock do banco de dados usando vi.hoisted para garantir ordem de inicialização
vi.mock("./db", () => {
  const chain: Record<string, unknown> = {};
  chain.from = vi.fn().mockReturnValue(chain);
  chain.where = vi.fn().mockReturnValue(chain);
  chain.orderBy = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.offset = vi.fn().mockResolvedValue([]);
  // Permite await direto na chain (para queries sem .offset)
  (chain as any)[Symbol.toStringTag] = "Promise";
  (chain as any).then = (resolve: (v: unknown[]) => void) => resolve([]);

  return {
    getDb: vi.fn().mockResolvedValue({
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
      }),
      select: vi.fn().mockReturnValue(chain),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    }),
  };
});

// Mock da notificação
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("leads.criar", () => {
  it("deve criar um lead com dados válidos", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.criar({
      nome: "João Silva",
      email: "joao@example.com",
      telefone: "11999999999",
      deficiencia: "Autismo/TEA",
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("id");
  });

  it("deve rejeitar email inválido", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.leads.criar({
        nome: "João Silva",
        email: "email-invalido",
        telefone: "11999999999",
        deficiencia: "Autismo/TEA",
      })
    ).rejects.toThrow();
  });

  it("deve rejeitar nome muito curto", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.leads.criar({
        nome: "J",
        email: "joao@example.com",
        telefone: "11999999999",
        deficiencia: "Autismo/TEA",
      })
    ).rejects.toThrow();
  });
});

describe("admin.listarLeads - controle de acesso", () => {
  it("deve bloquear acesso de usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.listarLeads({ pagina: 1, porPagina: 20 })
    ).rejects.toThrow();
  });

  it("deve bloquear acesso de usuário comum", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.listarLeads({ pagina: 1, porPagina: 20 })
    ).rejects.toThrow("Acesso restrito a administradores");
  });

  it("deve permitir acesso de admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.listarLeads({ pagina: 1, porPagina: 20 });
    expect(result).toHaveProperty("leads");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("paginas");
    expect(Array.isArray(result.leads)).toBe(true);
  });
});

describe("admin.estatisticas - controle de acesso", () => {
  it("deve bloquear acesso de usuário comum", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.estatisticas()).rejects.toThrow();
  });

  it("deve retornar estrutura correta para admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.estatisticas();
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("elegiveis");
    expect(result).toHaveProperty("naoContatados");
    expect(result).toHaveProperty("porDeficiencia");
    expect(result).toHaveProperty("porEstado");
    expect(result).toHaveProperty("ultimosLeads");
    expect(typeof result.total).toBe("number");
  });
});
