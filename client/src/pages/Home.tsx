import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import IPVAForm from "@/components/IPVAForm";
import ResultPage from "./ResultPage";
import { CheckCircle2, FileText, Zap, Shield } from "lucide-react";
import type { DadosDocumento } from "@/lib/documentGenerator";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [documentoGerado, setDocumentoGerado] = useState<DadosDocumento | null>(null);

  // Registrar callback global para quando o documento for gerado
  useEffect(() => {
    (window as any).__onDocumentoGerado = (dados: DadosDocumento) => {
      setDocumentoGerado(dados);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-700" />
            <h1 className="text-2xl font-bold text-blue-900">IPVA Zero PCD</h1>
          </div>
          <p className="text-sm text-gray-600">Isenção de IPVA para Pessoas com Deficiência</p>
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
                  <h2 className="text-5xl lg:text-6xl font-bold text-blue-900 leading-tight mb-4">
                    Você pode ter direito a <span className="text-green-600">NÃO pagar IPVA</span>
                  </h2>
                  <p className="text-xl text-gray-700">
                    Milhares de pessoas com deficiência e seus familiares pagam IPVA indevidamente todos os anos. Descubra agora se você tem direito à isenção no seu estado.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Análise Automática</h3>
                      <p className="text-gray-600">Sistema cruza seus dados com as regras do seu estado</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Documento Pronto</h3>
                      <p className="text-gray-600">Receba seu relatório personalizado em PDF/DOCX</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Passo a Passo</h3>
                      <p className="text-gray-600">Instruções exatas para protocolar sua solicitação</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setShowForm(true)}
                  className="h-14 px-8 text-lg font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Fazer o Teste de Isenção
                </Button>
              </div>

              {/* Imagem Hero */}
              <div className="relative">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310419663028378501/7ZncGsv2hGnaUj393SZoUY/hero-banner-ipva-je3KnTjBqfNSGnFqr2gcPa.webp"
                  alt="Pessoas com deficiência em situações positivas"
                  className="rounded-xl shadow-2xl w-full"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Como Funciona */}
      {!showForm && !documentoGerado && (
        <section className="bg-white py-16 lg:py-24">
          <div className="container">
            <h2 className="text-4xl font-bold text-center text-blue-900 mb-16">
              Como Funciona
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Passo 1 */}
              <Card className="p-8 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-6">
                  <span className="text-2xl font-bold text-blue-700">1</span>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">Responda o Questionário</h3>
                <p className="text-gray-700">
                  Preencha informações sobre seu estado, deficiência, tipo de veículo e valor.
                </p>
              </Card>

              {/* Passo 2 */}
              <Card className="p-8 border-2 border-green-100 hover:border-green-300 transition-colors">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-6">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-3">Análise Automática</h3>
                <p className="text-gray-700">
                  Nosso sistema analisa a legislação do seu estado e verifica sua elegibilidade.
                </p>
              </Card>

              {/* Passo 3 */}
              <Card className="p-8 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-6">
                  <FileText className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">Receba seu Relatório</h3>
                <p className="text-gray-700">
                  Baixe seu relatório com elegibilidade e passo a passo exato para solicitar.
                </p>
              </Card>
            </div>

            {/* Ilustração do Processo */}
            <div className="mt-16">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310419663028378501/7ZncGsv2hGnaUj393SZoUY/illustration-process-CP4uqws45Q5XrDcrUcKKCN.webp"
                alt="Processo de 3 etapas"
                className="w-full rounded-xl shadow-lg"
              />
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {!showForm && !documentoGerado && (
        <section className="py-16 lg:py-24">
          <div className="container">
            <h2 className="text-4xl font-bold text-center text-blue-900 mb-16">
              Dúvidas Frequentes
            </h2>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  Quem não dirige tem direito?
                </h3>
                <p className="text-gray-700">
                  Depende do estado. Alguns estados permitem que o veículo seja conduzido por terceiros. Nosso sistema verifica isso automaticamente.
                </p>
              </Card>

              <Card className="p-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  Autismo dá direito?
                </h3>
                <p className="text-gray-700">
                  Sim, a maioria dos estados reconhece o Transtorno do Espectro Autista (TEA) como deficiência elegível para isenção.
                </p>
              </Card>

              <Card className="p-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  Qual é o teto de valor do veículo?
                </h3>
                <p className="text-gray-700">
                  Varia por estado. Pode ser desde R$ 70 mil até sem limite. Nosso sistema mostra o teto específico do seu estado.
                </p>
              </Card>

              <Card className="p-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  Preciso de laudo médico?
                </h3>
                <p className="text-gray-700">
                  Sim, todos os estados exigem laudo médico. Nosso relatório mostra exatamente qual tipo de laudo é necessário.
                </p>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Formulário */}
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
            <IPVAForm />
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
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 mt-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Sobre</h4>
              <p className="text-blue-100 text-sm">
                Plataforma de isenção de IPVA para Pessoas com Deficiência em todos os estados brasileiros.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Informações</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><a href="#" className="hover:text-white">Sobre IPVA</a></li>
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
            <p>© 2026 IPVA Zero PCD. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
