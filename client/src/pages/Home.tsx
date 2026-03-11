import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import IPVAForm from "@/components/IPVAForm";
import ResultPage from "./ResultPage";
import { CheckCircle2, FileText, Zap, Shield } from "lucide-react";
import type { DadosDocumento } from "@/lib/documentGenerator";
import LeadForm from "@/components/LeadForm";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [documentoGerado, setDocumentoGerado] = useState<DadosDocumento | null>(null);
  const [leadCapturado, setLeadCapturado] = useState(false);

  // Registrar callback global para quando o documento for gerado
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
                  <div className="inline-block bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                    🚨 Você pode estar pagando IPVA indevidamente
                  </div>
                  <h2 className="text-5xl lg:text-6xl font-bold text-blue-900 leading-tight mb-4">
                    Seu filho com autismo <span className="text-green-600">não precisa pagar IPVA</span>
                  </h2>
                  <p className="text-xl text-gray-700">
                    A lei garante isenção total ou parcial de IPVA para famílias de PCD em todos os estados. Descubra em 2 minutos se você tem direito — e como solicitar.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Análise por Estado</h3>
                      <p className="text-gray-600">Regras específicas dos 27 estados brasileiros</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Relatório Personalizado</h3>
                      <p className="text-gray-600">Documento pronto com documentação e passo a passo</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">100% Gratuito</h3>
                      <p className="text-gray-600">Sem custo, sem cadastro obrigatório</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setShowForm(true)}
                  className="h-14 px-8 text-lg font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Verificar Meu Direito Agora
                </Button>
                <p className="text-sm text-gray-500">
                  Já ajudamos mais de 3.000 famílias a economizar com IPVA
                </p>
              </div>

              {/* Imagem Hero */}
              <div className="relative">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310419663028378501/7ZncGsv2hGnaUj393SZoUY/hero-banner-ipva-je3KnTjBqfNSGnFqr2gcPa.webp"
                  alt="Família com criança com autismo"
                  className="rounded-xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-4 -left-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
                  <p className="text-sm font-bold">✓ TEA também tem direito!</p>
                  <p className="text-xs opacity-90">Autismo reconhecido em todos os estados</p>
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

      {/* Como Funciona */}
      {!showForm && !documentoGerado && (
        <section className="bg-white py-16 lg:py-24">
          <div className="container">
            <h2 className="text-4xl font-bold text-center text-blue-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
              Em menos de 2 minutos você descobre se tem direito e recebe o guia completo para solicitar
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-6">
                  <span className="text-2xl font-bold text-blue-700">1</span>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">Informe seus dados</h3>
                <p className="text-gray-700">
                  Estado, tipo de deficiência, veículo e valor. Leva menos de 2 minutos.
                </p>
              </Card>

              <Card className="p-8 border-2 border-green-100 hover:border-green-300 transition-colors">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-6">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-3">Análise Instantânea</h3>
                <p className="text-gray-700">
                  Cruzamos com a legislação do seu estado e verificamos sua elegibilidade.
                </p>
              </Card>

              <Card className="p-8 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-6">
                  <FileText className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">Relatório Completo</h3>
                <p className="text-gray-700">
                  Receba documentação necessária, passo a passo e link oficial do seu estado.
                </p>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {!showForm && !documentoGerado && (
        <section className="py-16 lg:py-24">
          <div className="container">
            <h2 className="text-4xl font-bold text-center text-blue-900 mb-4">
              Dúvidas Frequentes
            </h2>
            <p className="text-center text-gray-600 mb-16">As perguntas que mais recebemos</p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-6 border-2 border-gray-200 hover:border-blue-200 transition-colors">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  🧩 Autismo (TEA) dá direito à isenção?
                </h3>
                <p className="text-gray-700">
                  Sim! O Transtorno do Espectro Autista é reconhecido em todos os estados como deficiência elegível. Mesmo que a criança não dirija, o veículo dos pais pode ser isento.
                </p>
              </Card>

              <Card className="p-6 border-2 border-gray-200 hover:border-blue-200 transition-colors">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  🚗 Quem não dirige tem direito?
                </h3>
                <p className="text-gray-700">
                  Depende do estado. A maioria permite que o veículo seja conduzido pelos pais ou responsáveis. Nosso sistema verifica automaticamente para o seu estado.
                </p>
              </Card>

              <Card className="p-6 border-2 border-gray-200 hover:border-blue-200 transition-colors">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  💰 Qual é o limite de valor do veículo?
                </h3>
                <p className="text-gray-700">
                  Varia por estado, de R$ 70 mil até sem limite. Nosso sistema mostra o teto exato do seu estado e se seu veículo se enquadra.
                </p>
              </Card>

              <Card className="p-6 border-2 border-gray-200 hover:border-blue-200 transition-colors">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  📋 Preciso de laudo médico?
                </h3>
                <p className="text-gray-700">
                  Sim, todos os estados exigem laudo médico pericial. Nosso relatório mostra exatamente qual tipo de laudo é necessário e onde obter no seu estado.
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
      <footer className="bg-blue-900 text-white py-8 mt-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">IPVA Zero PCD</h4>
              <p className="text-blue-100 text-sm">
                Plataforma de análise de isenção de IPVA para Pessoas com Deficiência em todos os estados brasileiros.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Informações</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><a href="#" className="hover:text-white">Sobre IPVA PCD</a></li>
                <li><a href="#" className="hover:text-white">Legislação</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-8 text-center text-blue-100 text-sm">
            <p>© 2026 IPVA Zero PCD. Todos os direitos reservados. As informações são baseadas em pesquisa das legislações estaduais vigentes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
