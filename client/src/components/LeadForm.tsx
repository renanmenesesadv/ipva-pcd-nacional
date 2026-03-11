import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ArrowRight, Shield, Users, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface LeadData {
  nome: string;
  email: string;
  telefone: string;
  deficiencia: string;
}

interface LeadFormProps {
  onLeadCapturado: (dados: LeadData) => void;
}

const deficiencias = [
  { value: "Autismo/TEA", label: "🧩 Autismo / TEA" },
  { value: "Física Motora", label: "♿ Física Motora" },
  { value: "Visual", label: "👁️ Visual" },
  { value: "Mental Severa/Profunda", label: "🧠 Mental Severa ou Profunda" },
  { value: "Auditiva", label: "👂 Auditiva" },
  { value: "Síndrome de Down", label: "💛 Síndrome de Down" },
  { value: "Múltipla", label: "🔷 Múltipla" },
];

export default function LeadForm({ onLeadCapturado }: LeadFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    deficiencia: "",
  });
  const [erros, setErros] = useState<Record<string, string>>({});

  const salvarLead = trpc.leads.criar.useMutation({
    onSuccess: () => {
      onLeadCapturado(formData);
    },
    onError: (error: unknown) => {
      console.error("Erro ao salvar lead:", error);
      // Mesmo com erro, deixar o usuário continuar
      onLeadCapturado(formData);
    },
  });

  const validar = () => {
    const novosErros: Record<string, string> = {};
    if (!formData.nome.trim()) novosErros.nome = "Informe seu nome";
    if (!formData.email.trim() || !formData.email.includes("@"))
      novosErros.email = "Informe um email válido";
    if (!formData.telefone.trim() || formData.telefone.length < 10)
      novosErros.telefone = "Informe um telefone válido";
    if (!formData.deficiencia)
      novosErros.deficiencia = "Selecione o tipo de deficiência";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    salvarLead.mutate({
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      deficiencia: formData.deficiencia,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid lg:grid-cols-5 gap-8 items-start">
        {/* Coluna esquerda - Benefícios */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-blue-900 mb-3">
              Quase lá — só mais um passo
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Informe seus dados para receber o relatório personalizado e ficar por dentro dos seus direitos como família PCD.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Relatório em PDF</p>
                <p className="text-sm text-gray-600">Receba seu relatório personalizado por email</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Dados Protegidos</p>
                <p className="text-sm text-gray-600">Seus dados são protegidos pela LGPD</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Comunidade PCD</p>
                <p className="text-sm text-gray-600">Fique por dentro de novos direitos e benefícios</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Ações contra Plano de Saúde</p>
                <p className="text-sm text-gray-600">Seu plano nega cobertura de TEA? Saiba como agir</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-semibold mb-1">🔒 Privacidade garantida</p>
            <p className="text-xs text-blue-700">
              Seus dados nunca serão vendidos. Usamos apenas para enviar informações relevantes sobre direitos PCD.
            </p>
          </div>
        </div>

        {/* Coluna direita - Formulário */}
        <Card className="lg:col-span-3 p-8 border-2 border-blue-100 shadow-lg">
          <h3 className="text-xl font-bold text-blue-900 mb-2">
            Seus dados para o relatório
          </h3>
          <p className="text-sm text-gray-500 mb-6">Gratuito · Resultado imediato · Sem compromisso</p>

          <div className="space-y-5">
            {/* Nome */}
            <div>
              <Label htmlFor="lead-nome" className="text-base font-semibold">
                Nome Completo *
              </Label>
              <Input
                id="lead-nome"
                placeholder="Seu nome completo"
                value={formData.nome}
                onChange={(e) => {
                  setFormData({ ...formData, nome: e.target.value });
                  if (erros.nome) setErros({ ...erros, nome: "" });
                }}
                className={`mt-2 h-12 text-base ${erros.nome ? "border-red-500" : ""}`}
              />
              {erros.nome && <p className="text-red-600 text-sm mt-1">{erros.nome}</p>}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="lead-email" className="text-base font-semibold">
                Email *
              </Label>
              <Input
                id="lead-email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (erros.email) setErros({ ...erros, email: "" });
                }}
                className={`mt-2 h-12 text-base ${erros.email ? "border-red-500" : ""}`}
              />
              {erros.email && <p className="text-red-600 text-sm mt-1">{erros.email}</p>}
            </div>

            {/* Telefone / WhatsApp */}
            <div>
              <Label htmlFor="lead-telefone" className="text-base font-semibold">
                WhatsApp *
              </Label>
              <Input
                id="lead-telefone"
                placeholder="(XX) XXXXX-XXXX"
                value={formData.telefone}
                onChange={(e) => {
                  setFormData({ ...formData, telefone: e.target.value });
                  if (erros.telefone) setErros({ ...erros, telefone: "" });
                }}
                className={`mt-2 h-12 text-base ${erros.telefone ? "border-red-500" : ""}`}
              />
              {erros.telefone && <p className="text-red-600 text-sm mt-1">{erros.telefone}</p>}
            </div>

            {/* Tipo de Deficiência */}
            <div>
              <Label htmlFor="lead-deficiencia" className="text-base font-semibold">
                Tipo de Deficiência *
              </Label>
              <Select
                value={formData.deficiencia}
                onValueChange={(value) => {
                  setFormData({ ...formData, deficiencia: value });
                  if (erros.deficiencia) setErros({ ...erros, deficiencia: "" });
                }}
              >
                <SelectTrigger
                  id="lead-deficiencia"
                  className={`mt-2 h-12 text-base ${erros.deficiencia ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Selecione o tipo de deficiência..." />
                </SelectTrigger>
                <SelectContent>
                  {deficiencias.map((def) => (
                    <SelectItem key={def.value} value={def.value}>
                      {def.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {erros.deficiencia && <p className="text-red-600 text-sm mt-1">{erros.deficiencia}</p>}
            </div>

            {/* Botão */}
            <Button
              onClick={handleSubmit}
              disabled={salvarLead.isPending}
              className="w-full h-14 text-base font-semibold bg-green-600 hover:bg-green-700 text-white mt-2"
            >
              {salvarLead.isPending ? (
                "Salvando..."
              ) : (
                <>
                  Verificar Meu Direito Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              Ao continuar, você concorda com nossa{" "}
              <a href="#" className="underline">Política de Privacidade</a>.
              Seus dados são protegidos pela LGPD.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
