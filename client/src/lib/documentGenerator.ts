// Gerador de documentos para solicitação de isenção IPVA
// Este módulo cria templates de documentos que podem ser exportados como PDF ou DOCX

import { estadosIPVAPCD } from "./estadosIPVAPCD";

export interface DadosDocumento {
  nome: string;
  email: string;
  telefone: string;
  estado: string;
  deficiencia: string;
  condutor: string;
  tipoVeiculo: string;
  valorVeiculo: string;
  laudoMedico: string;
  elegivel: boolean;
}

export function gerarConteudoDocumento(dados: DadosDocumento): string {
  const estadoDados = estadosIPVAPCD[dados.estado as keyof typeof estadosIPVAPCD];
  if (!estadoDados) return "";

  const data = new Date().toLocaleDateString("pt-BR");
  const tetoAplicavel =
    dados.tipoVeiculo === "novo"
      ? estadoDados.teto_veiculo_novo
      : estadoDados.teto_veiculo_usado;

  const conteudo = `
RELATÓRIO DE ELEGIBILIDADE - ISENÇÃO DE IPVA PARA PESSOA COM DEFICIÊNCIA (PCD)
================================================================================

Data do Relatório: ${data}
Beneficiário: ${dados.nome}
Email: ${dados.email}
Telefone: ${dados.telefone}

================================================================================
1. ANÁLISE DE ELEGIBILIDADE
================================================================================

Estado: ${estadoDados.nome}
Deficiência: ${dados.deficiencia}
Tipo de Veículo: ${dados.tipoVeiculo === "novo" ? "Novo (0km)" : "Usado"}
Valor do Veículo: R$ ${parseFloat(dados.valorVeiculo).toLocaleString("pt-BR")}
Condutor: ${dados.condutor === "sim" ? "Sim, será o condutor" : "Não, será conduzido por terceiros"}
Laudo Médico: ${dados.laudoMedico === "sim" ? "Já possui" : "Precisa obter"}

RESULTADO: ${dados.elegivel ? "✓ ELEGÍVEL PARA ISENÇÃO" : "✗ NÃO ELEGÍVEL"}

================================================================================
2. INFORMAÇÕES LEGAIS DO ESTADO
================================================================================

Legislação Aplicável:
${estadoDados.legislacao}

Teto de Valor do Veículo:
${tetoAplicavel}

Deficiências Aceitas:
${estadoDados.deficiencias_aceitas}

Aceita Não-Condutor:
${estadoDados.aceita_nao_condutor}

Órgão Responsável:
${estadoDados.orgao_responsavel}

Prazo de Renovação:
${estadoDados.prazo_renovacao}

Observações Especiais:
${estadoDados.observacoes}

================================================================================
3. DOCUMENTOS NECESSÁRIOS
================================================================================

Para solicitar a isenção de IPVA neste estado, você precisará dos seguintes documentos:

${estadoDados.documentos_exigidos
  .split("|")
  .map((doc, i) => `${i + 1}. ${doc.trim()}`)
  .join("\n")}

================================================================================
4. PASSO A PASSO PARA SOLICITAR
================================================================================

${estadoDados.passo_a_passo
  .split("|")
  .map((passo, i) => `Etapa ${i + 1}: ${passo.trim()}`)
  .join("\n\n")}

================================================================================
5. LINK OFICIAL
================================================================================

Acesse o portal oficial do estado para mais informações:
${estadoDados.link_oficial}

================================================================================
6. PRÓXIMOS PASSOS RECOMENDADOS
================================================================================

1. Obtenha o laudo médico pericial junto ao DETRAN do seu estado ou profissional credenciado
2. Reúna todos os documentos listados acima
3. Acesse o link oficial do estado ou dirija-se pessoalmente ao órgão responsável
4. Preencha o requerimento de isenção com os dados corretos
5. Anexe todos os documentos solicitados
6. Protocole o pedido e guarde o comprovante de protocolo

================================================================================
7. AVISO IMPORTANTE
================================================================================

Este relatório é apenas informativo e baseado nas legislações estaduais pesquisadas.
Para garantir a precisão das informações, consulte sempre os portais oficiais do estado.

Fontes Consultadas:
${estadoDados.fonte_consultada}

================================================================================

Gerado em: ${new Date().toLocaleString("pt-BR")}
Plataforma: IPVA Zero PCD Nacional
  `;

  return conteudo;
}

// Função para gerar HTML que pode ser impresso como PDF
export function gerarHTMLDocumento(dados: DadosDocumento): string {
  const estadoDados = estadosIPVAPCD[dados.estado as keyof typeof estadosIPVAPCD];
  if (!estadoDados) return "";

  const data = new Date().toLocaleDateString("pt-BR");
  const tetoAplicavel =
    dados.tipoVeiculo === "novo"
      ? estadoDados.teto_veiculo_novo
      : estadoDados.teto_veiculo_usado;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Elegibilidade - Isenção IPVA PCD</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #1F2937;
            background: white;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #1E40AF;
        }
        .header h1 {
            color: #1E40AF;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .header p {
            color: #6B7280;
            font-size: 14px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            background: #F3F4F6;
            padding: 12px 16px;
            border-left: 4px solid #1E40AF;
            font-size: 16px;
            font-weight: bold;
            color: #1E40AF;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
        }
        .info-item {
            padding: 12px;
            background: #F9FAFB;
            border-radius: 6px;
        }
        .info-label {
            font-weight: bold;
            color: #1E40AF;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .info-value {
            color: #1F2937;
            font-size: 14px;
        }
        .result-box {
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid;
        }
        .result-box.elegivel {
            background: #ECFDF5;
            border-color: #059669;
        }
        .result-box.nao-elegivel {
            background: #FEF2F2;
            border-color: #DC2626;
        }
        .result-title {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 8px;
        }
        .result-box.elegivel .result-title {
            color: #059669;
        }
        .result-box.nao-elegivel .result-title {
            color: #DC2626;
        }
        .list-item {
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
        }
        .list-item:before {
            content: "▸";
            position: absolute;
            left: 0;
            color: #1E40AF;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            font-size: 12px;
            color: #6B7280;
            text-align: center;
        }
        @media print {
            body {
                background: white;
            }
            .container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Relatório de Elegibilidade</h1>
            <p>Isenção de IPVA para Pessoa com Deficiência (PCD)</p>
        </div>

        <div class="section">
            <div class="section-title">Dados do Beneficiário</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Nome</div>
                    <div class="info-value">${dados.nome}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${dados.email}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Telefone</div>
                    <div class="info-value">${dados.telefone}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Data do Relatório</div>
                    <div class="info-value">${data}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Análise de Elegibilidade</div>
            <div class="result-box ${dados.elegivel ? "elegivel" : "nao-elegivel"}">
                <div class="result-title">
                    ${dados.elegivel ? "✓ ELEGÍVEL PARA ISENÇÃO" : "✗ NÃO ELEGÍVEL"}
                </div>
                <div>
                    ${dados.elegivel ? "Você pode ter direito à isenção de IPVA neste estado." : "Infelizmente, você não atende aos critérios para isenção neste estado."}
                </div>
            </div>

            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Estado</div>
                    <div class="info-value">${estadoDados.nome}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Deficiência</div>
                    <div class="info-value">${dados.deficiencia}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Tipo de Veículo</div>
                    <div class="info-value">${dados.tipoVeiculo === "novo" ? "Novo (0km)" : "Usado"}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Valor do Veículo</div>
                    <div class="info-value">R$ ${parseFloat(dados.valorVeiculo).toLocaleString("pt-BR")}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Informações Legais do Estado</div>
            <div class="info-item">
                <div class="info-label">Legislação</div>
                <div class="info-value">${estadoDados.legislacao}</div>
            </div>
            <div class="info-item" style="margin-top: 10px;">
                <div class="info-label">Teto de Valor do Veículo</div>
                <div class="info-value">${tetoAplicavel}</div>
            </div>
            <div class="info-item" style="margin-top: 10px;">
                <div class="info-label">Deficiências Aceitas</div>
                <div class="info-value">${estadoDados.deficiencias_aceitas}</div>
            </div>
            <div class="info-item" style="margin-top: 10px;">
                <div class="info-label">Órgão Responsável</div>
                <div class="info-value">${estadoDados.orgao_responsavel}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Documentos Necessários</div>
            ${estadoDados.documentos_exigidos
              .split("|")
              .map((doc) => `<div class="list-item">${doc.trim()}</div>`)
              .join("")}
        </div>

        <div class="section">
            <div class="section-title">Passo a Passo para Solicitar</div>
            ${estadoDados.passo_a_passo
              .split("|")
              .map((passo, i) => `<div class="list-item"><strong>Etapa ${i + 1}:</strong> ${passo.trim()}</div>`)
              .join("")}
        </div>

        <div class="section">
            <div class="section-title">Link Oficial</div>
            <div class="info-item">
                <div class="info-value">
                    <a href="${estadoDados.link_oficial}" target="_blank" style="color: #1E40AF; text-decoration: none;">
                        ${estadoDados.link_oficial}
                    </a>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Este relatório foi gerado automaticamente pela plataforma IPVA Zero PCD Nacional.</p>
            <p>As informações aqui contidas são baseadas em pesquisa das legislações estaduais vigentes.</p>
            <p>Para garantir a precisão, sempre consulte os portais oficiais do seu estado.</p>
        </div>
    </div>
</body>
</html>
  `;

  return html;
}

// Função para baixar como texto
export function baixarDocumentoTXT(dados: DadosDocumento) {
  const conteudo = gerarConteudoDocumento(dados);
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(conteudo)
  );
  element.setAttribute(
    "download",
    `IPVA-PCD-${dados.estado}-${new Date().getTime()}.txt`
  );
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Função para abrir como PDF (usando print)
export function abrirComoPDF(dados: DadosDocumento) {
  const html = gerarHTMLDocumento(dados);
  const janela = window.open("", "_blank");
  if (janela) {
    janela.document.write(html);
    janela.document.close();
    // Esperar o conteúdo carregar antes de imprimir
    setTimeout(() => {
      janela.print();
    }, 250);
  }
}
