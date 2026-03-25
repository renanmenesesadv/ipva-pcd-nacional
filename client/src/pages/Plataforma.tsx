import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Shield, CheckCircle2, FileText, Lock, Phone, MessageCircle,
  Crown, Zap, ChevronRight, AlertCircle, Star
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import IPVAForm from "@/components/IPVAForm";
import ResultPage from "./ResultPage";
import LeadForm from "@/components/LeadForm";
import type { DadosDocumento } from "@/lib/documentGenerator";

const WHATSAPP_ADVOGADO = "5584999128126";

interface LeadData {
  nome: string;
  email: string;
  telefone: string;
  deficiencia: string;
}

export default function Plataforma() {
  const [email, setEmail] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [customerData, setCustomerData] = useState<{
    melhorPlano: string;
    nome: string;
    planos: string[];
  } | null>(null);
  const [error, setError] = useState("");

  // Fluxo do formulário
  const [showForm, setShowForm] = useState(false);
  const [documentoGerado, setDocumentoGerado] = useState<DadosDocumento | null>(null);
  const [leadCapturado, setLeadCapturado] = useState(false);
  const [leadData, setLeadData] = useState<LeadData | null>(null);

  const verificarQuery = trpc.customers.verificarAcesso.useQuery(
    { email },
    { enabled: false }
  );
  const registrarUso = trpc.customers.registrarUso.useMutation();

  const handleVerificar = async () => {
    if (!email || !email.includes("@")) {
      setError("Digite um email válido");
      return;
    }
    setError("");

    const result = await verificarQuery.refetch();
    if (result.data?.hasAccess) {
      setCustomerData({
        melhorPlano: result.data.melhorPlano!,
        nome: result.data.nome!,
        planos: result.data.planos,
      });
      setAuthenticated(true);
    } else {
      setError("Email não encontrado. Verifique se usou o mesmo email da compra na Kiwify.");
    }
  };

  // Quando gera documento, registra uso
  const handleDocumentoGerado = (dados: DadosDocumento) => {
    setDocumentoGerado(dados);
    registrarUso.mutate({ email });
  };

  // Callback do window para ResultPage
  if (typeof window !== "undefined") {
    (window as any).__onDocumentoGerado = handleDocumentoGerado;
  }

  const handleLeadCapturado = (dados: LeadData) => {
    setLeadData(dados);
    setLeadCapturado(true);
  };

  const temConsultoria = customerData?.planos.includes("consultoria");
  const temAnual = customerData?.planos.includes("plano_anual");
  const temAvulso = customerData?.planos.includes("relatorio_avulso");

  // ======== TELA DE LOGIN ========
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="container py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-700" />
              <h1 className="text-2xl font-bold text-blue-900">IPVA Zero PCD</h1>
            </div>
            <span className="text-sm text-gray-500">Area do Cliente</span>
          </div>
        </header>

        <div className="container py-16 lg:py-24">
          <div className="max-w-md mx-auto">
            <Card className="p-8 border-2 border-blue-200">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-blue-700" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Acessar Plataforma</h2>
                <p className="text-gray-600">
                  Digite o email que você usou na compra para acessar seu plano.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerificar()}
                  className="h-12 text-base"
                />

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={handleVerificar}
                  className="w-full h-12 text-base font-semibold bg-blue-700 hover:bg-blue-800"
                  disabled={verificarQuery.isFetching}
                >
                  {verificarQuery.isFetching ? "Verificando..." : "Acessar Meu Plano"}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-500 mb-3">Ainda nao tem acesso?</p>
                <a
                  href="/"
                  className="text-blue-700 font-semibold text-sm hover:underline"
                >
                  Ver planos disponiveis
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ======== TELA DO RESULTADO ========
  if (documentoGerado) {
    return (
      <div>
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="container py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-700" />
              <h1 className="text-2xl font-bold text-blue-900">IPVA Zero PCD</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{customerData?.nome}</span>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                {temConsultoria ? "Consultoria" : temAnual ? "Anual" : "Avulso"}
              </span>
            </div>
          </div>
        </header>
        <ResultPage
          dados={documentoGerado}
          onVoltar={() => {
            setDocumentoGerado(null);
            setShowForm(false);
            setLeadCapturado(false);
          }}
        />

        {/* Card de consultoria após resultado */}
        {temConsultoria && (
          <div className="container max-w-4xl pb-12">
            <Card className="p-8 border-2 border-purple-200 bg-purple-50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-purple-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-purple-900 mb-2">
                    Consultoria Juridica Incluida
                  </h3>
                  <p className="text-purple-800 mb-4">
                    Voce tem direito a consultoria juridica personalizada. Entre em contato diretamente
                    com nosso advogado especialista para analisar seu caso e agendar uma reuniao.
                  </p>
                  <a
                    href={`https://wa.me/${WHATSAPP_ADVOGADO}?text=${encodeURIComponent(
                      `Olá! Sou cliente do plano Consultoria Jurídica IPVA Zero PCD. Meu nome é ${customerData?.nome}. Gostaria de agendar uma reunião para análise do meu caso.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Falar com Advogado via WhatsApp
                  </a>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // ======== DASHBOARD DO CLIENTE ========
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-700" />
            <h1 className="text-2xl font-bold text-blue-900">IPVA Zero PCD</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{customerData?.nome}</span>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
              {temConsultoria ? "Consultoria" : temAnual ? "Anual" : "Avulso"}
            </span>
          </div>
        </div>
      </header>

      <div className="container py-12">
        {/* Boas-vindas */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-blue-900 mb-2">
            Bem-vindo(a), {customerData?.nome?.split(" ")[0]}!
          </h2>
          <p className="text-gray-600 text-lg">
            Sua plataforma de analise de isencao de IPVA para PCD.
          </p>
        </div>

        {/* Cards de funcionalidades */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* Card: Gerar Relatorio */}
          <Card
            className="p-6 border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => setShowForm(true)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-lg font-bold text-blue-900">Gerar Relatorio</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Faca a analise completa de elegibilidade e receba seu relatorio personalizado com documentacao e passo a passo.
            </p>
            <div className="flex items-center text-blue-700 font-semibold text-sm">
              {temAnual || temConsultoria ? (
                <>
                  <Zap className="w-4 h-4 mr-1" />
                  Relatorios ilimitados
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-1" />
                  1 relatorio disponivel
                </>
              )}
            </div>
          </Card>

          {/* Card: Restituicao Retroativa */}
          {(temAnual || temConsultoria) && (
            <Card className="p-6 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-green-700" />
                </div>
                <h3 className="text-lg font-bold text-green-900">Restituicao Retroativa</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Se voce pagou IPVA nos ultimos anos mesmo tendo direito a isencao, pode ser possivel solicitar a restituicao dos valores pagos indevidamente.
              </p>
              <p className="text-green-700 text-sm font-semibold">
                Incluso no seu plano
              </p>
            </Card>
          )}

          {/* Card: Consultoria Juridica */}
          <Card
            className={`p-6 border-2 ${
              temConsultoria
                ? "border-purple-200 hover:border-purple-400"
                : "border-gray-200 opacity-75"
            } transition-colors`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                temConsultoria ? "bg-purple-100" : "bg-gray-100"
              }`}>
                {temConsultoria ? (
                  <Crown className="w-5 h-5 text-purple-700" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <h3 className={`text-lg font-bold ${temConsultoria ? "text-purple-900" : "text-gray-400"}`}>
                Consultoria Juridica
              </h3>
            </div>
            <p className={`text-sm mb-4 ${temConsultoria ? "text-gray-600" : "text-gray-400"}`}>
              Analise personalizada do seu caso por advogado especialista, com modelo de peticao pronta e acompanhamento.
            </p>
            {temConsultoria ? (
              <a
                href={`https://wa.me/${WHATSAPP_ADVOGADO}?text=${encodeURIComponent(
                  `Olá! Sou cliente do plano Consultoria Jurídica IPVA Zero PCD. Meu nome é ${customerData?.nome}. Gostaria de agendar uma reunião.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                Falar com Advogado
              </a>
            ) : (
              <a
                href="https://pay.kiwify.com.br/CDOzVHV"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-700 font-semibold text-sm hover:underline"
              >
                <Lock className="w-4 h-4" />
                Fazer upgrade — R$297
              </a>
            )}
          </Card>
        </div>

        {/* Formulario inline */}
        {showForm && (
          <div className="mb-10">
            <Button
              onClick={() => {
                setShowForm(false);
                setLeadCapturado(false);
              }}
              variant="outline"
              className="mb-6"
            >
              ← Voltar ao painel
            </Button>
            {!leadCapturado ? (
              <LeadForm onLeadCapturado={handleLeadCapturado} />
            ) : (
              <IPVAForm dadosLead={leadData} />
            )}
          </div>
        )}

        {/* Info dos planos ativos */}
        <Card className="p-6 border border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-900 mb-3">Seus Planos Ativos</h3>
          <div className="space-y-2">
            {customerData?.planos.map((plano) => (
              <div key={plano} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-gray-700 text-sm">
                  {plano === "consultoria" && "Consultoria Juridica (R$297)"}
                  {plano === "plano_anual" && "Plano Anual — acesso por 12 meses"}
                  {plano === "relatorio_avulso" && "Relatorio Avulso (1 uso)"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 mt-10">
        <div className="container text-center">
          <p className="text-blue-300 text-sm">
            © 2026 IPVA Zero PCD. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
