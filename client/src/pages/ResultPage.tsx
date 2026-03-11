import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, FileText, Download, Printer } from "lucide-react";
import { estadosIPVAPCD } from "@/lib/estadosIPVAPCD";
import { abrirComoPDF, baixarDocumentoTXT, type DadosDocumento } from "@/lib/documentGenerator";

interface ResultPageProps {
  dados: DadosDocumento;
  onVoltar: () => void;
}

export default function ResultPage({ dados, onVoltar }: ResultPageProps) {
  const [downloadando, setDownloadando] = useState(false);

  const estadoDados = estadosIPVAPCD[dados.estado as keyof typeof estadosIPVAPCD];
  if (!estadoDados) return null;

  const tetoAplicavel =
    dados.tipoVeiculo === "novo"
      ? estadoDados.teto_veiculo_novo
      : estadoDados.teto_veiculo_usado;

  const handleBaixarPDF = () => {
    setDownloadando(true);
    setTimeout(() => {
      abrirComoPDF(dados);
      setDownloadando(false);
    }, 500);
  };

  const handleBaixarTXT = () => {
    setDownloadando(true);
    setTimeout(() => {
      baixarDocumentoTXT(dados);
      setDownloadando(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50 py-12">
      <div className="container max-w-4xl">
        {/* Botão Voltar */}
        <Button
          onClick={onVoltar}
          variant="outline"
          className="mb-8"
        >
          ← Voltar
        </Button>

        {/* Card de Resultado */}
        <Card
          className={`p-8 border-2 mb-8 ${
            dados.elegivel
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-start gap-4">
            {dados.elegivel ? (
              <CheckCircle2 className="w-10 h-10 text-green-600 flex-shrink-0 mt-1" />
            ) : (
              <AlertCircle className="w-10 h-10 text-red-600 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h2
                className={`text-3xl font-bold mb-3 ${
                  dados.elegivel ? "text-green-900" : "text-red-900"
                }`}
              >
                {dados.elegivel
                  ? "Você é elegível para isenção de IPVA!"
                  : "Infelizmente, você não é elegível"}
              </h2>
              <p
                className={`text-lg ${
                  dados.elegivel ? "text-green-800" : "text-red-800"
                }`}
              >
                {dados.elegivel
                  ? "Com base nas informações fornecidas e na legislação do estado de " +
                    estadoDados.nome +
                    ", você atende aos critérios para solicitar a isenção de IPVA."
                  : "Infelizmente, você não atende aos critérios de elegibilidade para isenção de IPVA neste estado."}
              </p>
            </div>
          </div>
        </Card>

        {/* Informações Resumidas */}
        <Card className="p-8 mb-8 border-2 border-blue-100">
          <h3 className="text-2xl font-bold text-blue-900 mb-6">
            Resumo da Análise
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase">
                  Estado
                </p>
                <p className="text-lg text-gray-900">{estadoDados.nome}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase">
                  Deficiência
                </p>
                <p className="text-lg text-gray-900">{dados.deficiencia}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase">
                  Tipo de Veículo
                </p>
                <p className="text-lg text-gray-900">
                  {dados.tipoVeiculo === "novo" ? "Novo (0km)" : "Usado"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase">
                  Valor do Veículo
                </p>
                <p className="text-lg text-gray-900">
                  R$ {parseFloat(dados.valorVeiculo).toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase">
                  Teto Aplicável
                </p>
                <p className="text-lg text-gray-900">{tetoAplicavel}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase">
                  Condutor
                </p>
                <p className="text-lg text-gray-900">
                  {dados.condutor === "sim"
                    ? "Sim, será o condutor"
                    : "Não, será conduzido por terceiros"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {dados.elegivel && (
          <>
            {/* Próximos Passos */}
            <Card className="p-8 mb-8 border-2 border-green-100">
              <h3 className="text-2xl font-bold text-green-900 mb-6">
                Próximos Passos
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-700 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Obtenha o Laudo Médico
                    </h4>
                    <p className="text-gray-700">
                      Se ainda não possui, procure o DETRAN do seu estado ou um
                      profissional credenciado para obter o laudo pericial.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-700 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Reúna a Documentação
                    </h4>
                    <p className="text-gray-700">
                      Prepare todos os documentos listados no relatório abaixo.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-700 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Protocole o Pedido
                    </h4>
                    <p className="text-gray-700">
                      Acesse o portal oficial ou dirija-se ao órgão responsável
                      para protocolar sua solicitação.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-700 font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Acompanhe o Processo
                    </h4>
                    <p className="text-gray-700">
                      Guarde o comprovante de protocolo e acompanhe o andamento
                      do seu pedido.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Informações do Estado */}
            <Card className="p-8 mb-8 border-2 border-blue-100">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">
                Informações do Estado
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Legislação Aplicável
                  </h4>
                  <p className="text-gray-700">{estadoDados.legislacao}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Deficiências Aceitas
                  </h4>
                  <p className="text-gray-700">
                    {estadoDados.deficiencias_aceitas}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Órgão Responsável
                  </h4>
                  <p className="text-gray-700">{estadoDados.orgao_responsavel}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Prazo de Renovação
                  </h4>
                  <p className="text-gray-700">{estadoDados.prazo_renovacao}</p>
                </div>
                {estadoDados.observacoes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Observações Importantes
                    </h4>
                    <p className="text-gray-700">{estadoDados.observacoes}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Documentos Necessários */}
            <Card className="p-8 mb-8 border-2 border-blue-100">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">
                Documentos Necessários
              </h3>
              <div className="space-y-3">
                {estadoDados.documentos_exigidos.split("|").map((doc, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-blue-700 font-bold flex-shrink-0">
                      •
                    </span>
                    <p className="text-gray-700">{doc.trim()}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Passo a Passo */}
            <Card className="p-8 mb-8 border-2 border-green-100">
              <h3 className="text-2xl font-bold text-green-900 mb-6">
                Passo a Passo para Solicitar
              </h3>
              <div className="space-y-4">
                {estadoDados.passo_a_passo.split("|").map((passo, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-700 font-bold text-sm">
                        {i + 1}
                      </span>
                    </div>
                    <p className="text-gray-700 pt-1">{passo.trim()}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Link Oficial */}
            <Card className="p-8 mb-8 border-2 border-blue-100 bg-blue-50">
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                Portal Oficial do Estado
              </h3>
              <p className="text-gray-700 mb-4">
                Acesse o portal oficial para mais informações e para protocolar
                sua solicitação:
              </p>
              <a
                href={estadoDados.link_oficial}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
              >
                Acessar Portal Oficial
              </a>
            </Card>
          </>
        )}

        {/* Botões de Download */}
        <Card className="p-8 border-2 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Baixar Relatório
          </h3>
          <p className="text-gray-700 mb-6">
            Salve seu relatório personalizado para consultar posteriormente ou
            imprimir:
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleBaixarPDF}
              disabled={downloadando}
              className="flex-1 h-12 text-base font-semibold bg-blue-700 hover:bg-blue-800 text-white"
            >
              <FileText className="w-5 h-5 mr-2" />
              {downloadando ? "Preparando..." : "Abrir como PDF"}
            </Button>
            <Button
              onClick={handleBaixarTXT}
              disabled={downloadando}
              variant="outline"
              className="flex-1 h-12 text-base font-semibold"
            >
              <Download className="w-5 h-5 mr-2" />
              {downloadando ? "Preparando..." : "Baixar como TXT"}
            </Button>
            <Button
              onClick={handleBaixarPDF}
              disabled={downloadando}
              variant="outline"
              className="flex-1 h-12 text-base font-semibold"
            >
              <Printer className="w-5 h-5 mr-2" />
              Imprimir
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
