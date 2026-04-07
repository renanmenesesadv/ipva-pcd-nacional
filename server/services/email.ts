// Serviço de email via Resend API (sem dependência extra)
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = "IPVA Zero <comercial@ipvazero.com.br>";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[Email] Failed:", response.status, err);
      return false;
    }

    console.log("[Email] Sent to:", options.to, "Subject:", options.subject);
    return true;
  } catch (error) {
    console.error("[Email] Error:", error);
    return false;
  }
}

// ===== Templates de Email =====

export async function sendWelcomeEmail(to: string, nome: string, plano: string) {
  const planoLabel = plano === "consultoria" ? "Consultoria Juridica"
    : plano === "plano_anual" ? "Plano Anual"
    : "Relatorio Avulso";

  return sendEmail({
    to,
    subject: `Bem-vindo(a) ao IPVA Zero, ${nome.split(" ")[0]}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1e40af;">
          <h1 style="color: #1e40af; margin: 0;">IPVA Zero</h1>
        </div>

        <div style="padding: 30px 0;">
          <h2 style="color: #111;">Ola, ${nome.split(" ")[0]}!</h2>
          <p style="color: #444; font-size: 16px; line-height: 1.6;">
            Seu acesso ao <strong>${planoLabel}</strong> foi ativado com sucesso.
          </p>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #166534; font-weight: bold; margin: 0 0 10px 0;">O que voce pode fazer agora:</p>
            <ul style="color: #166534; margin: 0; padding-left: 20px;">
              <li>Gerar seu relatorio de isencao personalizado</li>
              <li>Ver documentacao necessaria para o seu estado</li>
              <li>Acessar o passo a passo de protocolo</li>
              ${plano === "consultoria" ? "<li>Agendar sua consultoria juridica via WhatsApp</li>" : ""}
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ipvazero.com.br/plataforma" style="display: inline-block; background: #16a34a; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              ACESSAR MINHA PLATAFORMA
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            Use o email <strong>${to}</strong> para fazer login na plataforma.
          </p>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>IPVA Zero — Isencao de IPVA para Pessoas com Deficiencia</p>
          <p>Em caso de duvidas, responda este email.</p>
        </div>
      </div>
    `,
  });
}

export async function sendExpirationWarningEmail(to: string, nome: string, diasRestantes: number) {
  return sendEmail({
    to,
    subject: `${nome.split(" ")[0]}, seu plano expira em ${diasRestantes} dias`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1e40af;">
          <h1 style="color: #1e40af; margin: 0;">IPVA Zero</h1>
        </div>

        <div style="padding: 30px 0;">
          <h2 style="color: #111;">Ola, ${nome.split(" ")[0]}!</h2>

          <div style="background: #fefce8; border: 2px solid #facc15; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #854d0e; font-weight: bold; font-size: 18px; margin: 0;">
              Seu plano anual expira em ${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""}.
            </p>
            <p style="color: #854d0e; margin: 10px 0 0 0;">
              Renove agora para continuar gerando relatorios e ter acesso as atualizacoes.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://pay.kiwify.com.br/yser9l3" style="display: inline-block; background: #eab308; color: #111; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              RENOVAR MEU PLANO — R$37/ano
            </a>
          </div>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>IPVA Zero — Isencao de IPVA para Pessoas com Deficiencia</p>
        </div>
      </div>
    `,
  });
}
