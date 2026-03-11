import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import IPVAForm from "@/components/IPVAForm";
import ResultPage from "./ResultPage";
import { CheckCircle2, FileText, Zap, Shield, ChevronRight } from "lucide-react";
import type { DadosDocumento } from "@/lib/documentGenerator";
import LeadForm from "@/components/LeadForm";

// Tabela de deficiências elegíveis com exemplos reais
const DEFICIENCIAS_ELEGIVEIS = [
  { nome: "Transtorno do Espectro Autista (TEA)", destaque: true, estados: "27 estados" },
  { nome: "Síndrome de Down", destaque: false, estados: "27 estados" },
  { nome: "Paralisia Cerebral", destaque: false, estados: "27 estados" },
  { nome: "Deficiência Física Motora", destaque: false, estados: "27 estados" },
  { nome: "Deficiência Visual (cegueira ou baixa visão)", destaque: false, estados: "27 estados" },
  { nome: "Deficiência Mental Severa ou Profunda", destaque: false, estados: "27 estados" },
  { nome: "Paraplegia / Tetraplegia / Hemiplegia", destaque: false, estados: "27 estados" },
  { nome: "Amputação ou ausência de membro", destaque: false, estados: "27 estados" },
  { nome: "Deficiência Auditiva (em alguns estados)", destaque: false, estados: "Varia por estado" },
  { nome: "TDAH severo (em alguns estados)", destaque: false, estados: "Varia por estado" },
];

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [documentoGerado, setDocumentoGerado] = useState<DadosDocumento | null>(null);
  const [leadCapturado, setLeadCapturado] = useState(false);

  useEffect(() => {
    (window as any).__onDocumentoGerado = (dados: DadosDocumento) => {
      setDocumentoGerado(dados);
    };
  }, []);

  const handleLeadCapturado = () => {
    setLeadCapturado(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-700" />
            <h1 className="text-2xl font-bold text-blue-900">IPVA Zero PCD</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden sm:block text-sm text-gray-600">Isenção de IPVA para Pessoas com Deficiência</p>
            <a href="/admin" className="text-xs text-gray-400 hover:text-gray-600">Admin</a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!showForm && !documentoGerado && (
        <section className="relative overflow-hidden">
          <div className="container py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Conteúdo */}
              <div className="space-y-8">
                <div>
                  {/* Título Principal */}
                  <div className="inline-block bg-red-100 text-red-800 text-sm font-bold px-4 py-2 rounded-full mb-6 border border-red-200">
                    ⚠️ Você pode estar pagando IPVA indevidamente
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold text-blue-900 leading-tight mb-6">
                    Se você tem um filho com{" "}
                    <span className="text-green-600 underline decoration-wavy decoration-green-400">autismo</span>
                    {" "}— o carro da sua família pode ser isento de IPVA
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    A lei federal garante isenção de IPVA para veículos de famílias PCD em todos os 27 estados.
                    Mas cada estado tem suas próprias regras — e a maioria das famílias <strong>nunca soube que tinha esse direito</strong>.
                  </p>
                </div>

                {/* Benefícios */}
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">O autismo (TEA) é reconhecido como deficiência elegível em <strong>todos os estados</strong></p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Mesmo que a criança <strong>não dirija</strong>, o veículo dos pais pode ser isento</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Descubra em 2 minutos e receba o <strong>guia completo para solicitar</strong></p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => setShowForm(true)}
                    className="h-14 px-8 text-lg font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                  >
                    Verificar Meu Direito Agora
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Gratuito · Sem cadastro obrigatório · Resultado imediato
                  </p>
                </div>
              </div>

              {/* Imagem Hero */}
              <div className="relative">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310419663028378501/7ZncGsv2hGnaUj393SZoUY/hero-banner-ipva-je3KnTjBqfNSGnFqr2gcPa.webp"
                  alt="Família com criança com autismo"
                  className="rounded-xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-4 -left-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
                  <p className="text-sm font-bold">✓ TEA reconhecido em todos os estados</p>
                  <p className="text-xs opacity-90">Laudo com prazo indeterminado</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Barra de urgência */}
      {!showForm && !documentoGerado && (
        <div className="bg-yellow-400 py-3">
          <div className="container text-center">
            <p className="text-yellow-900 font-semibold text-sm">
              ⚠️ O prazo para solicitar isenção varia por estado — verifique agora antes de pagar o IPVA deste ano
            </p>
          </div>
        </div>
      )}

      {/* Seção: Quem tem direito */}
      {!showForm && !documentoGerado && (
        <section className="bg-white py-16 lg:py-20">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-4 text-center">
                Sua família pode estar entre as que têm direito
              </h2>
              <p className="text-center text-gray-600 mb-12 text-lg">
                As seguintes condições são reconhecidas pela legislação estadual de IPVA em todo o Brasil:
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mb-10">
                {DEFICIENCIAS_ELEGIVEIS.map((def, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
                      def.destaque
                        ? "border-green-400 bg-green-50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-5 h-5 flex-shrink-0 ${
                        def.destaque ? "text-green-600" : "text-blue-400"
                      }`}
                    />
                    <div>
                      <p className={`font-medium text-sm ${def.destaque ? "text-green-900" : "text-gray-800"}`}>
                        {def.nome}
                        {def.destaque && (
                          <span className="ml-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                            Destaque
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{def.estados}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                <p className="text-blue-900 font-semibold text-lg mb-2">
                  Sua condição não está na lista?
                </p>
                <p className="text-blue-700 text-sm mb-4">
                  A legislação é ampla e pode abranger outras situações. Faça o teste e descubra as regras específicas do seu estado.
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-700 hover:bg-blue-800 text-white"
                >
                  Fazer o Teste Gratuito
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Como Funciona */}
      {!showForm && !documentoGerado && (
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center text-blue-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Em menos de 2 minutos você descobre se tem direito e recebe o guia completo para solicitar
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 border-2 border-blue-100 hover:border-blue-300 transition-colors text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-6 mx-auto">
                  <span className="text-2xl font-bold text-blue-700">1</span>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">Informe seus dados</h3>
                <p className="text-gray-600">
                  Estado, tipo de deficiência, veículo e valor. Leva menos de 2 minutos.
                </p>
              </Card>

              <Card className="p-8 border-2 border-green-100 hover:border-green-300 transition-colors text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-6 mx-auto">
                  <Zap className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-3">Análise Instantânea</h3>
                <p className="text-gray-600">
                  Cruzamos com a legislação específica do seu estado e verificamos sua elegibilidade.
                </p>
              </Card>

              <Card className="p-8 border-2 border-blue-100 hover:border-blue-300 transition-colors text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-6 mx-auto">
                  <FileText className="w-7 h-7 text-blue-700" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">Relatório Completo</h3>
                <p className="text-gray-600">
                  Documentação necessária, passo a passo exato e link oficial do seu estado.
                </p>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {!showForm && !documentoGerado && (
        <section className="py-16 lg:py-20 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-center text-blue-900 mb-4">
              Dúvidas Frequentes
            </h2>
            <p className="text-center text-gray-600 mb-12">As perguntas que mais recebemos de pais e responsáveis</p>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="p-6 border-2 border-gray-100 hover:border-green-200 transition-colors">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  🧩 Autismo (TEA) dá direito à isenção?
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Sim! O Transtorno do Espectro Autista é reconhecido em <strong>todos os 27 estados</strong> como deficiência elegível. Mesmo que a criança não dirija, o veículo dos pais pode ser isento — com laudo de prazo indeterminado na maioria dos estados.
                </p>
              </Card>

              <Card className="p-6 border-2 border-gray-100 hover:border-green-200 transition-colors">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  🚗 A criança não dirige — ainda assim tenho direito?
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Na grande maioria dos estados, sim. O benefício é para o <strong>veículo usado no transporte da pessoa com deficiência</strong>, não necessariamente para o condutor. Nosso sistema verifica as regras específicas do seu estado.
                </p>
              </Card>

              <Card className="p-6 border-2 border-gray-100 hover:border-green-200 transition-colors">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  💰 Qual é o limite de valor do veículo?
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Varia por estado: de R$ 70 mil (Acre) até <strong>sem limite</strong> (São Paulo, Rio de Janeiro e outros). Nosso sistema mostra o teto exato do seu estado e se seu veículo se enquadra.
                </p>
              </Card>

              <Card className="p-6 border-2 border-gray-100 hover:border-green-200 transition-colors">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  📋 Preciso de laudo médico?
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Sim, todos os estados exigem laudo médico. Para TEA, o laudo tem <strong>prazo indeterminado</strong> na maioria dos estados. Nosso relatório mostra exatamente qual tipo de laudo é necessário e onde obter.
                </p>
              </Card>

              <Card className="p-6 border-2 border-gray-100 hover:border-green-200 transition-colors">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  🔄 Posso pedir isenção de veículo usado?
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Sim! A maioria dos estados aceita veículos novos e usados. Alguns têm tetos diferentes para cada categoria. Informe o tipo do seu veículo no teste e veja as regras do seu estado.
                </p>
              </Card>

              <Card className="p-6 border-2 border-gray-100 hover:border-green-200 transition-colors">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  📅 Posso pedir isenção de anos anteriores?
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Depende do estado. Alguns permitem restituição de valores pagos indevidamente. Nosso relatório inclui informações sobre retroatividade e prazos para o seu estado.
                </p>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Button
                onClick={() => setShowForm(true)}
                className="h-14 px-10 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg"
              >
                Verificar Meu Direito Agora →
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                Já ajudamos mais de 3.000 famílias a economizar com IPVA
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Formulário com Captura de Lead */}
      {showForm && !documentoGerado && (
        <section className="py-12 lg:py-20">
          <div className="container">
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              className="mb-8"
            >
              ← Voltar
            </Button>
            {!leadCapturado ? (
              <LeadForm onLeadCapturado={handleLeadCapturado} />
            ) : (
              <IPVAForm />
            )}
          </div>
        </section>
      )}

      {/* Página de Resultado */}
      {documentoGerado && (
        <ResultPage
          dados={documentoGerado}
          onVoltar={() => {
            setDocumentoGerado(null);
            setShowForm(false);
            setLeadCapturado(false);
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-10 mt-0">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-6 h-6 text-blue-300" />
                <h4 className="font-bold text-lg">IPVA Zero PCD</h4>
              </div>
              <p className="text-blue-200 text-sm leading-relaxed">
                Plataforma gratuita de análise de isenção de IPVA para Pessoas com Deficiência em todos os 27 estados brasileiros.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-blue-100">Informações</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors">Sobre IPVA PCD</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Legislação por Estado</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-blue-100">Legal</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-6 text-center text-blue-300 text-sm">
            <p>© 2026 IPVA Zero PCD. Todos os direitos reservados.</p>
            <p className="mt-1 text-xs text-blue-400">
              As informações desta plataforma são de caráter orientativo. Consulte sempre a SEFAZ do seu estado para confirmação.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
