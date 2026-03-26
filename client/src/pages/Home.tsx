import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import IPVAForm from "@/components/IPVAForm";
import ResultPage from "./ResultPage";
import {
  CheckCircle2, FileText, Zap, Shield, ChevronRight, Crown, Star, Lock,
  AlertTriangle, Clock, TrendingDown, Users, ArrowRight, ChevronDown,
  DollarSign, Eye, ShieldCheck, Target, MessageCircle
} from "lucide-react";
import type { DadosDocumento } from "@/lib/documentGenerator";
import LeadForm from "@/components/LeadForm";

const CASOS_ELEGIVEIS = [
  "Transtorno do Espectro Autista (TEA)",
  "Deficiencia fisica",
  "Deficiencia visual",
  "Deficiencia auditiva",
  "Sindrome de Down",
  "Paralisia cerebral",
  "Deficiencia intelectual severa",
  "Mobilidade reduzida",
  "Amputacao ou ausencia de membro",
  "Outras hipoteses previstas na legislacao estadual",
];

const DEPOIMENTOS = [
  { texto: "Eu nem imaginava que meu filho com TEA poderia dar esse direito. Descobri rapido e finalmente entendi o caminho.", nome: "Mariana", estado: "PE" },
  { texto: "Eu ja tinha pesquisado antes e so me confundia. Aqui ficou muito mais claro.", nome: "Carlos", estado: "GO" },
  { texto: "Se eu tivesse verificado antes, teria economizado muito tempo.", nome: "Fernanda", estado: "SP" },
];

const FAQ_ITEMS = [
  { q: "Quem pode ter direito a isencao?", a: "Pessoas com deficiencia, TEA, mobilidade reduzida e outros casos previstos na legislacao estadual." },
  { q: "A pessoa precisa dirigir?", a: "Nem sempre. Em muitos casos, vale a pena verificar mesmo quando a propria pessoa nao conduz o veiculo." },
  { q: "Serve para qualquer estado?", a: "Sim. A analise considera a variacao das regras estaduais nos 27 estados." },
  { q: "Quanto tempo leva?", a: "Poucos minutos." },
  { q: "Posso verificar para meu filho ou outro familiar?", a: "Sim." },
  { q: "Veiculo usado pode entrar?", a: "Dependendo do estado e da situacao, sim." },
  { q: "Ja paguei IPVA antes. Ainda assim devo verificar?", a: "Sim. O importante e entender se voce pode parar de pagar daqui para frente." },
];

interface LeadData {
  nome: string;
  email: string;
  telefone: string;
  deficiencia: string;
}

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [documentoGerado, setDocumentoGerado] = useState<DadosDocumento | null>(null);
  const [leadCapturado, setLeadCapturado] = useState(false);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    (window as any).__onDocumentoGerado = (dados: DadosDocumento) => {
      setDocumentoGerado(dados);
    };
  }, []);

  const handleLeadCapturado = (dados: LeadData) => {
    setLeadData(dados);
    setLeadCapturado(true);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const CTAButton = ({ text = "QUERO VER SE TENHO DIREITO", className = "" }: { text?: string; className?: string }) => (
    <Button
      onClick={() => { setShowForm(true); scrollToTop(); }}
      className={`h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all w-full sm:w-auto active:scale-95 ${className}`}
    >
      {text}
      <ArrowRight className="w-5 h-5 ml-2" />
    </Button>
  );

  const landing = !showForm && !documentoGerado;

  return (
    <div className="min-h-screen bg-white">
      {/* BARRA DE ALERTA */}
      {landing && (
        <div className="bg-red-600 py-2.5 px-4">
          <p className="text-white text-center text-xs sm:text-sm font-semibold">
            <AlertTriangle className="w-4 h-4 inline mr-1 -mt-0.5" />
            ATENCAO: voce pode estar pagando IPVA sem precisar — verifique agora antes do proximo vencimento
          </p>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-700" />
            <span className="text-xl font-bold text-blue-900">IPVA Zero</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${import.meta.env.BASE_URL}plataforma`.replace("//", "/")}
              className="text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-900 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Ja sou cliente
            </a>
            <a href="/admin" className="text-xs text-gray-300 hover:text-gray-500 hidden">Admin</a>
          </div>
        </div>
      </header>

      {/* ========== HERO ========== */}
      {landing && (
        <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
          <div className="container py-12 sm:py-20 lg:py-24">
            <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 text-xs sm:text-sm font-bold px-4 py-2 rounded-full">
                <DollarSign className="w-4 h-4" />
                Pode existir direito no seu caso
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                Seu carro pode estar pagando IPVA{" "}
                <span className="text-yellow-400">a toa</span>{" "}
                — descubra agora se voce tem direito a isencao
              </h1>

              <p className="text-base sm:text-lg text-blue-100 leading-relaxed max-w-2xl mx-auto">
                Se voce, seu filho ou alguem da sua familia tem TEA, deficiencia, mobilidade reduzida ou outra condicao prevista em lei, pode existir direito a isencao de IPVA no seu estado.
              </p>

              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-400" /> Descubra em poucos minutos
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-400" /> Verificacao simples e online
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-400" /> Regras por estado
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-400" /> Saiba se vale a pena pedir
                </span>
              </div>

              <div className="pt-2">
                <CTAButton />
                <p className="text-blue-300 text-xs sm:text-sm mt-3">
                  Leva menos de 2 minutos • Acesso imediato • 100% online
                </p>
              </div>

              <p className="text-blue-200/70 text-sm italic pt-2">
                Milhares de familias pagam esse imposto sem necessidade simplesmente porque nunca verificaram.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ========== DOR / IMPACTO ========== */}
      {landing && (
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <TrendingDown className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
                Voce pode estar perdendo dinheiro todos os anos <span className="text-red-600">sem saber</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">Muita gente continua pagando IPVA porque:</p>

              <div className="grid sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto">
                {[
                  "Nunca foi informada do proprio direito",
                  "Acha que isso e so para poucos casos",
                  "Pensa que o processo e complicado demais",
                  "Nao sabe por onde comecar",
                  "Desiste antes mesmo de verificar",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-red-100">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mt-4">
                <p className="text-red-900 font-bold text-lg sm:text-xl">
                  Se existe a chance de voce nao precisar pagar, o erro e continuar ignorando isso.
                </p>
              </div>

              <CTAButton text="VERIFICAR MEU DIREITO AGORA" />
            </div>
          </div>
        </section>
      )}

      {/* ========== CASOS ELEGIVEIS ========== */}
      {landing && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Veja alguns casos que podem ter direito a isencao
              </h2>
              <p className="text-gray-500">A elegibilidade depende das regras do estado, mas estes sao alguns dos casos mais comuns:</p>

              <div className="grid sm:grid-cols-2 gap-2 text-left">
                {CASOS_ELEGIVEIS.map((caso, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-800 text-sm font-medium">{caso}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <p className="text-blue-900 font-semibold">
                  Mesmo que a pessoa nao dirija, em muitos casos ainda vale a pena verificar.
                </p>
              </div>

              <CTAButton text="QUERO SABER SE MEU CASO ENTRA" />
            </div>
          </div>
        </section>
      )}

      {/* ========== O QUE VOCE RECEBE ========== */}
      {landing && (
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Eye className="w-10 h-10 text-blue-600 mx-auto" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Em vez de pesquisar sozinho, receba uma analise clara do seu caso
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 text-left">
                {[
                  { icon: Target, text: "Se existe chance de isencao no seu caso" },
                  { icon: FileText, text: "Quais criterios podem se aplicar" },
                  { icon: Shield, text: "Quais documentos normalmente entram" },
                  { icon: ArrowRight, text: "O que voce deve fazer depois" },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{text}</span>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <p className="text-green-900 font-semibold">
                  Voce nao precisa ficar perdido em regra, video solto ou informacao confusa.
                </p>
              </div>

              <CTAButton text="COMECAR MINHA ANALISE" />
            </div>
          </div>
        </section>
      )}

      {/* ========== COMO FUNCIONA ========== */}
      {landing && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                E rapido, simples e direto
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { num: "1", title: "Preencha suas informacoes", desc: "Informe estado, condicao e dados basicos do caso." },
                  { num: "2", title: "Receba sua analise", desc: "A plataforma cruza suas respostas com as regras aplicaveis." },
                  { num: "3", title: "Veja o proximo passo", desc: "Voce entende se vale a pena avancar e o que observar." },
                ].map((step, i) => (
                  <Card key={i} className="p-6 border-2 border-blue-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-green-500" />
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                      {step.num}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.desc}</p>
                  </Card>
                ))}
              </div>

              <p className="text-gray-500 text-sm font-medium">
                Sem burocracia inicial. Sem enrolacao. Sem linguagem dificil.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ========== BENEFICIOS ========== */}
      {landing && (
        <section className="py-12 sm:py-16 bg-blue-950 text-white">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold">Por que verificar agora</h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: DollarSign, title: "Pare de pagar sem necessidade", desc: "Se houver possibilidade no seu caso, voce pode evitar continuar perdendo dinheiro." },
                  { icon: Zap, title: "Ganhe clareza em minutos", desc: "Sem precisar interpretar lei, decreto ou regra confusa sozinho." },
                  { icon: ShieldCheck, title: "Evite erro e perda de tempo", desc: "Saiba se o seu caso faz sentido antes de sair juntando documento a toa." },
                  { icon: Target, title: "Entenda a regra do seu estado", desc: "Porque isencao de IPVA nao funciona igual no Brasil inteiro." },
                  { icon: Eye, title: "Tome decisao com mais seguranca", desc: "Voce para de agir no escuro e passa a enxergar o caminho." },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <Card key={i} className="p-5 bg-white/5 border-white/10 text-left">
                    <Icon className="w-8 h-8 text-green-400 mb-3" />
                    <h3 className="font-bold text-white mb-1 text-sm">{title}</h3>
                    <p className="text-blue-200 text-xs leading-relaxed">{desc}</p>
                  </Card>
                ))}
              </div>

              <CTAButton text="VERIFICAR AGORA" className="bg-green-500 hover:bg-green-600" />
            </div>
          </div>
        </section>
      )}

      {/* ========== PROVA SOCIAL ========== */}
      {landing && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Quem verifica antes, economiza antes
              </h2>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-2xl sm:text-3xl font-extrabold text-green-700">+3.000</p>
                  <p className="text-xs sm:text-sm text-green-800 font-medium">analises realizadas</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-2xl sm:text-3xl font-extrabold text-blue-700">27</p>
                  <p className="text-xs sm:text-sm text-blue-800 font-medium">estados contemplados</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-2xl sm:text-3xl font-extrabold text-purple-700">1000+</p>
                  <p className="text-xs sm:text-sm text-purple-800 font-medium">familias atendidas</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {DEPOIMENTOS.map((dep, i) => (
                  <Card key={i} className="p-5 border-2 border-gray-100 text-left">
                    <div className="flex gap-1 mb-3">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm italic mb-3">"{dep.texto}"</p>
                    <p className="text-gray-500 text-xs font-semibold">— {dep.nome}, {dep.estado}</p>
                  </Card>
                ))}
              </div>

              <CTAButton text="QUERO FAZER MINHA VERIFICACAO" />
            </div>
          </div>
        </section>
      )}

      {/* ========== OBJECOES ========== */}
      {landing && (
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="container">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center">
                Ainda acha que talvez nao seja para voce?
              </h2>

              <div className="space-y-3">
                {[
                  { obj: '"Mas a pessoa nem dirige."', resp: "Em muitos casos, isso nao impede a analise. O que importa e entender a condicao e a regra aplicavel." },
                  { obj: '"Meu caso parece diferente."', resp: "Justamente por isso vale verificar. Ha situacoes que muita gente desconhece." },
                  { obj: '"Nao sei quais documentos preciso."', resp: "A analise ajuda voce a entender o cenario antes de sair fazendo tudo no escuro." },
                  { obj: '"Ja paguei IPVA antes."', resp: "Mesmo assim, vale entender sua situacao atual para nao continuar pagando sem necessidade." },
                  { obj: '"Tenho medo de perder tempo."', resp: "Voce leva poucos minutos para descobrir se faz sentido avancar." },
                ].map(({ obj, resp }, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-gray-200">
                    <p className="font-bold text-gray-900 mb-1">{obj}</p>
                    <p className="text-gray-600 text-sm">{resp}</p>
                  </div>
                ))}
              </div>

              <div className="text-center pt-2">
                <CTAButton text="DESCOBRIR MEU DIREITO AGORA" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== PRICING ========== */}
      {landing && (
        <section className="py-12 sm:py-16 bg-white" id="planos">
          <div className="container">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Escolha seu plano</h2>
              <p className="text-gray-500">Acesso a plataforma com relatorio personalizado, documentacao e passo a passo</p>

              <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                {/* Avulso */}
                <Card className="p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="mb-4">
                    <FileText className="w-6 h-6 text-blue-600 mb-2" />
                    <h3 className="text-lg font-bold text-gray-900">Relatorio Avulso</h3>
                    <p className="text-xs text-gray-500">Ideal para quem quer testar</p>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-extrabold text-gray-900">R$ 17</span>
                    <span className="text-gray-400 ml-1 text-sm">unico</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> 1 relatorio completo</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Documentacao necessaria</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Passo a passo da SEFAZ</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Link oficial do estado</li>
                    <li className="flex items-center gap-2 text-gray-400"><Lock className="w-4 h-4" /> Relatorios ilimitados</li>
                  </ul>
                  <a href="https://pay.kiwify.com.br/K9D0GGL" target="_blank" rel="noopener noreferrer"
                    className="block w-full text-center py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors text-sm">
                    Gerar meu relatorio
                  </a>
                </Card>

                {/* Anual */}
                <Card className="p-6 border-2 border-green-500 hover:border-green-600 transition-colors relative shadow-xl scale-[1.03]">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Mais popular
                  </div>
                  <div className="mb-4">
                    <Star className="w-6 h-6 text-green-600 mb-2" />
                    <h3 className="text-lg font-bold text-gray-900">Plano Anual</h3>
                    <p className="text-xs text-gray-500">Acesso completo por 12 meses</p>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-extrabold text-gray-900">R$ 37</span>
                    <span className="text-gray-400 ml-1 text-sm">/ano</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Relatorios ilimitados</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Todos os 27 estados</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Documentacao completa</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Guia de restituicao retroativa</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Atualizacoes por 12 meses</li>
                  </ul>
                  <a href="https://pay.kiwify.com.br/LvHpEUd" target="_blank" rel="noopener noreferrer"
                    className="block w-full text-center py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm">
                    Assinar agora
                  </a>
                  <p className="text-center text-xs text-gray-400 mt-2">7 dias de garantia</p>
                </Card>

                {/* Consultoria */}
                <Card className="p-6 border-2 border-purple-200 hover:border-purple-400 transition-colors">
                  <div className="mb-4">
                    <Crown className="w-6 h-6 text-purple-600 mb-2" />
                    <h3 className="text-lg font-bold text-gray-900">Consultoria Juridica</h3>
                    <p className="text-xs text-gray-500">Acompanhamento profissional</p>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-extrabold text-gray-900">R$ 297</span>
                    <span className="text-gray-400 ml-1 text-sm">unico</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Tudo do Plano Anual</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Consultoria com advogado</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Modelo de peticao pronta</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Suporte via WhatsApp</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Acompanhamento do processo</li>
                  </ul>
                  <a href="https://pay.kiwify.com.br/CDOzVHV" target="_blank" rel="noopener noreferrer"
                    className="block w-full text-center py-3 bg-purple-700 text-white font-bold rounded-xl hover:bg-purple-800 transition-colors text-sm">
                    Contratar consultoria
                  </a>
                </Card>
              </div>

              <a href={`${import.meta.env.BASE_URL}plataforma`.replace("//", "/")}
                className="text-blue-700 font-semibold hover:underline text-sm">
                Ja comprou? Acesse a plataforma aqui →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ========== URGENCIA ========== */}
      {landing && (
        <section className="py-12 sm:py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Clock className="w-12 h-12 mx-auto text-yellow-300" />
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Quanto mais voce demora, mais tempo pode continuar pagando sem precisar
              </h2>
              <p className="text-red-100 text-base sm:text-lg">
                Se existe a possibilidade de isencao no seu caso, adiar a verificacao so faz voce perder tempo e dinheiro. Alem disso, regras, exigencias e prazos podem variar conforme o estado.
              </p>
              <div className="bg-white/10 border border-white/20 rounded-xl p-5">
                <p className="font-extrabold text-xl sm:text-2xl text-yellow-300">A melhor hora para verificar e agora.</p>
              </div>
              <CTAButton text="VERIFICAR AGORA MESMO" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900" />
            </div>
          </div>
        </section>
      )}

      {/* ========== FAQ ========== */}
      {landing && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="container">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center">Perguntas frequentes</h2>

              <div className="space-y-2">
                {FAQ_ITEMS.map((item, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 text-sm pr-4">{item.q}</span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${faqOpen === i ? "rotate-180" : ""}`} />
                    </button>
                    {faqOpen === i && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-600 text-sm">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== CTA FINAL ========== */}
      {landing && (
        <section className="py-12 sm:py-20 bg-blue-950 text-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-2xl sm:text-4xl font-extrabold">
                Nao continue pagando IPVA no escuro
              </h2>
              <p className="text-blue-200 text-base sm:text-lg">
                Verifique agora se existe possibilidade de isencao para voce ou sua familia.
              </p>
              <CTAButton text="COMECAR VERIFICACAO AGORA" className="bg-green-500 hover:bg-green-600" />
              <p className="text-blue-400 text-xs">Menos de 2 minutos • Resultado imediato</p>
            </div>
          </div>
        </section>
      )}

      {/* ========== FORMULARIO ========== */}
      {showForm && !documentoGerado && (
        <section className="py-8 sm:py-12 bg-gray-50 min-h-[60vh]">
          <div className="container">
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              className="mb-6"
            >
              ← Voltar
            </Button>
            {!leadCapturado ? (
              <LeadForm onLeadCapturado={handleLeadCapturado} />
            ) : (
              <IPVAForm dadosLead={leadData} />
            )}
          </div>
        </section>
      )}

      {/* ========== RESULTADO ========== */}
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

      {/* ========== FOOTER ========== */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="font-bold">IPVA Zero</span>
            </div>
            <p className="text-gray-400 text-xs text-center">
              As informacoes desta plataforma sao de carater orientativo. Consulte sempre a SEFAZ do seu estado.
            </p>
            <p className="text-gray-500 text-xs">© 2026 IPVA Zero</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
