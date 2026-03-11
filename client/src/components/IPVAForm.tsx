"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { listaEstados, estadosIPVAPCD, type EstadoIPVAPCD } from "@/lib/estadosIPVAPCD";
import { CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import type { DadosDocumento } from "@/lib/documentGenerator";

interface FormData extends Omit<DadosDocumento, 'elegivel'> {
  laudoMedico: string;
}

interface ElegibilidadeResult {
  elegivel: boolean;
  motivo: string;
  motivoTipo: 'teto' | 'deficiencia' | 'condutor' | 'elegivel';
  tetoAplicavel: string;
  deficienciasAceitas: string;
  observacoes: string;
}

interface DadosLead {
  nome: string;
  email: string;
  telefone: string;
  deficiencia: string;
}

interface IPVAFormProps {
  dadosLead?: DadosLead | null;
}

export default function IPVAForm({ dadosLead }: IPVAFormProps = {}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    estado: "",
    deficiencia: dadosLead?.deficiencia || "",
    condutor: "",
    tipoVeiculo: "",
    valorVeiculo: "",
    laudoMedico: "",
    nome: dadosLead?.nome || "",
    email: dadosLead?.email || "",
    telefone: dadosLead?.telefone || "",
  });

  const [elegibilidade, setElegibilidade] = useState<ElegibilidadeResult | null>(
    null
  );
  const [erros, setErros] = useState<Record<string, string>>({});

  const deficiencias = [
    "Física Motora",
    "Visual",
    "Mental Severa/Profunda",
    "Autismo/TEA",
    "Auditiva",
    "Síndrome de Down",
    "Múltipla",
  ];

  const analisarElegibilidade = () => {
    console.log("Iniciando análise com dados:", formData);
    
    const novosErros: Record<string, string> = {};

    if (!formData.estado) novosErros.estado = "Selecione um estado";
    if (!formData.deficiencia) novosErros.deficiencia = "Selecione a deficiência";
    if (!formData.condutor)
      novosErros.condutor = "Indique se é condutor ou não";
    if (!formData.tipoVeiculo) novosErros.tipoVeiculo = "Selecione o tipo";
    if (!formData.valorVeiculo) novosErros.valorVeiculo = "Informe o valor";
    if (!formData.laudoMedico)
      novosErros.laudoMedico = "Indique se possui laudo";

    if (Object.keys(novosErros).length > 0) {
      console.log("Erros de validação:", novosErros);
      setErros(novosErros);
      return;
    }

    setErros({});

    // Buscar dados do estado
    const dadosEstado = estadosIPVAPCD[formData.estado as keyof typeof estadosIPVAPCD];
    console.log("Dados do estado encontrados:", dadosEstado);
    
    if (!dadosEstado) {
      setElegibilidade({
        elegivel: false,
        motivoTipo: 'deficiencia',
        motivo: "Estado não encontrado",
        tetoAplicavel: "",
        deficienciasAceitas: "",
        observacoes: "",
      });
      return;
    }

    // Validar deficiência
    const deficienciasAceitasStr = dadosEstado.deficiencias_aceitas.toLowerCase();
    const defSelecionada = formData.deficiencia.toLowerCase();
    const deficienciaValida =
      deficienciasAceitasStr.includes(defSelecionada) ||
      (formData.deficiencia === "Autismo/TEA" &&
        (deficienciasAceitasStr.includes("autismo") ||
          deficienciasAceitasStr.includes("tea"))) ||
      deficienciasAceitasStr.includes("todas") ||
      deficienciasAceitasStr.includes("qualquer");

    // Validar se é não-condutor
    const aceitaNaoCondutor =
      dadosEstado.aceita_nao_condutor.toLowerCase().startsWith("sim");

    if (formData.condutor === "nao" && !aceitaNaoCondutor) {
      setElegibilidade({
        elegivel: false,
        motivoTipo: 'condutor',
        motivo: `${dadosEstado.nome} exige que o próprio beneficiário seja o condutor do veículo`,
        tetoAplicavel: "",
        deficienciasAceitas: dadosEstado.deficiencias_aceitas,
        observacoes: dadosEstado.observacoes,
      });
      setStep(2);
      return;
    }

    if (!deficienciaValida) {
      setElegibilidade({
        elegivel: false,
        motivoTipo: 'deficiencia',
        motivo: `A condição "${formData.deficiencia}" pode não estar expressamente listada em ${dadosEstado.nome}. Verifique com a SEFAZ local.`,
        tetoAplicavel: "",
        deficienciasAceitas: dadosEstado.deficiencias_aceitas,
        observacoes: dadosEstado.observacoes,
      });
      setStep(2);
      return;
    }

    // Validar valor do veículo
    const teto =
      formData.tipoVeiculo === "novo"
        ? dadosEstado.teto_veiculo_novo
        : dadosEstado.teto_veiculo_usado;

    const semLimite = teto.toLowerCase().includes("sem limite") || teto.toLowerCase().includes("ilimitado");
    const tetoNumerico = semLimite ? Infinity : parseFloat(teto.replace(/[^\d]/g, "")) / 100;
    const valorNumerico = parseFloat(formData.valorVeiculo);

    const elegivel = semLimite || valorNumerico <= tetoNumerico;

    const resultado: ElegibilidadeResult = {
      elegivel,
      motivoTipo: elegivel ? 'elegivel' : 'teto',
      motivo: elegivel
        ? "Você pode ter direito à isenção de IPVA!"
        : `Valor do veículo acima do teto permitido em ${dadosEstado.nome}`,
      tetoAplicavel: teto,
      deficienciasAceitas: dadosEstado.deficiencias_aceitas,
      observacoes: dadosEstado.observacoes,
    };

    setElegibilidade(resultado);
    setStep(2);
  };

  const validarDadosPessoais = () => {
    const novosErros: Record<string, string> = {};

    if (!formData.nome.trim()) novosErros.nome = "Nome é obrigatório";
    if (!formData.email.trim()) novosErros.email = "Email é obrigatório";
    if (!formData.telefone.trim()) novosErros.telefone = "Telefone é obrigatório";

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return false;
    }

    setErros({});
    return true;
  };

  const handleGerarDocumento = () => {
    if (!validarDadosPessoais()) return;

    // Passar para a página de resultado
    const onDocumentoGerado = (window as any).__onDocumentoGerado;
    if (onDocumentoGerado) {
      onDocumentoGerado({
        ...formData,
        elegivel: elegibilidade?.elegivel || false,
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Indicador de Progresso */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                step >= 1 ? "bg-blue-700" : "bg-gray-300"
              }`}
            >
              1
            </div>
            <div
              className={`flex-1 h-1 mx-2 ${
                step >= 2 ? "bg-blue-700" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                step >= 2 ? "bg-blue-700" : "bg-gray-300"
              }`}
            >
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="font-semibold text-gray-700">Elegibilidade</span>
            <span className="font-semibold text-gray-700">Dados Pessoais</span>
          </div>
        </div>
      </div>

      {/* Etapa 1: Análise de Elegibilidade */}
      {step === 1 && (
        <Card className="p-8 border-2 border-blue-100">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">
            Análise de Elegibilidade
          </h2>

          <div className="space-y-6">
            {/* Estado */}
            <div>
              <Label htmlFor="estado" className="text-base font-semibold">
                Em qual estado o veículo está registrado?
              </Label>
              <Select value={formData.estado} onValueChange={(value) => {
                setFormData({ ...formData, estado: value });
                setErros({ ...erros, estado: "" });
              }}>
                <SelectTrigger
                  id="estado"
                  className={`mt-2 h-12 text-base ${
                    erros.estado ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Selecione o estado..." />
                </SelectTrigger>
                <SelectContent>
                  {listaEstados.map((estado) => (
                    <SelectItem key={estado.uf} value={estado.uf}>
                      {estado.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {erros.estado && (
                <p className="text-red-600 text-sm mt-1">{erros.estado}</p>
              )}
            </div>

            {/* Deficiência */}
            <div>
              <Label htmlFor="deficiencia" className="text-base font-semibold">
                Qual é a condição do beneficiário?
              </Label>
              <Select value={formData.deficiencia} onValueChange={(value) => {
                setFormData({ ...formData, deficiencia: value });
                setErros({ ...erros, deficiencia: "" });
              }}>
                <SelectTrigger
                  id="deficiencia"
                  className={`mt-2 h-12 text-base ${
                    erros.deficiencia ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Selecione a deficiência..." />
                </SelectTrigger>
                <SelectContent>
                  {deficiencias.map((def) => (
                    <SelectItem key={def} value={def}>
                      {def}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {erros.deficiencia && (
                <p className="text-red-600 text-sm mt-1">{erros.deficiencia}</p>
              )}
            </div>

            {/* Condutor */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                O beneficiário será o condutor do veículo?
              </Label>
              <RadioGroup
                value={formData.condutor}
                onValueChange={(value) => {
                  setFormData({ ...formData, condutor: value });
                  setErros({ ...erros, condutor: "" });
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sim" id="condutor-sim" />
                  <Label htmlFor="condutor-sim" className="font-normal cursor-pointer">
                    Sim, será o condutor
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao" id="condutor-nao" />
                  <Label htmlFor="condutor-nao" className="font-normal cursor-pointer">
                    Não, será conduzido por terceiros
                  </Label>
                </div>
              </RadioGroup>
              {erros.condutor && (
                <p className="text-red-600 text-sm mt-1">{erros.condutor}</p>
              )}
            </div>

            {/* Tipo de Veículo */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                O veículo é novo ou usado?
              </Label>
              <RadioGroup
                value={formData.tipoVeiculo}
                onValueChange={(value) => {
                  setFormData({ ...formData, tipoVeiculo: value });
                  setErros({ ...erros, tipoVeiculo: "" });
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="novo" id="tipo-novo" />
                  <Label htmlFor="tipo-novo" className="font-normal cursor-pointer">
                    Novo (0km)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="usado" id="tipo-usado" />
                  <Label htmlFor="tipo-usado" className="font-normal cursor-pointer">
                    Usado
                  </Label>
                </div>
              </RadioGroup>
              {erros.tipoVeiculo && (
                <p className="text-red-600 text-sm mt-1">{erros.tipoVeiculo}</p>
              )}
            </div>

            {/* Valor do Veículo */}
            <div>
              <Label htmlFor="valor" className="text-base font-semibold">
                Qual o valor aproximado do veículo (R$)?
              </Label>
              <Input
                id="valor"
                type="number"
                placeholder="Ex: 85000"
                value={formData.valorVeiculo}
                onChange={(e) => {
                  setFormData({ ...formData, valorVeiculo: e.target.value });
                  setErros({ ...erros, valorVeiculo: "" });
                }}
                className={`mt-2 h-12 text-base ${
                  erros.valorVeiculo ? "border-red-500" : ""
                }`}
              />
              {erros.valorVeiculo && (
                <p className="text-red-600 text-sm mt-1">{erros.valorVeiculo}</p>
              )}
            </div>

            {/* Laudo Médico */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Você já possui o Laudo Médico pericial?
              </Label>
              <RadioGroup
                value={formData.laudoMedico}
                onValueChange={(value) => {
                  setFormData({ ...formData, laudoMedico: value });
                  setErros({ ...erros, laudoMedico: "" });
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sim" id="laudo-sim" />
                  <Label htmlFor="laudo-sim" className="font-normal cursor-pointer">
                    Sim, já possuo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao" id="laudo-nao" />
                  <Label htmlFor="laudo-nao" className="font-normal cursor-pointer">
                    Não, preciso obter
                  </Label>
                </div>
              </RadioGroup>
              {erros.laudoMedico && (
                <p className="text-red-600 text-sm mt-1">{erros.laudoMedico}</p>
              )}
            </div>

            {/* Botão Analisar */}
            <Button
              onClick={analisarElegibilidade}
              className="w-full h-12 text-base font-semibold bg-blue-700 hover:bg-blue-800 text-white mt-8"
            >
              Analisar Elegibilidade
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </Card>
      )}

      {/* Etapa 2: Resultado e Dados Pessoais */}
      {step === 2 && elegibilidade && (
        <div className="space-y-6">
          {/* Card de Resultado Principal */}
          <Card
            className={`p-8 border-2 ${
              elegibilidade.elegivel
                ? "border-green-200 bg-green-50"
                : elegibilidade.motivoTipo === 'teto'
                ? "border-amber-200 bg-amber-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-4">
              {elegibilidade.elegivel ? (
                <CheckCircle2 className="w-10 h-10 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <AlertCircle className={`w-10 h-10 flex-shrink-0 mt-1 ${
                  elegibilidade.motivoTipo === 'teto' ? 'text-amber-600' : 'text-red-600'
                }`} />
              )}
              <div className="flex-1">
                <h3
                  className={`text-xl font-bold mb-2 ${
                    elegibilidade.elegivel
                      ? "text-green-900"
                      : elegibilidade.motivoTipo === 'teto'
                      ? "text-amber-900"
                      : "text-red-900"
                  }`}
                >
                  {elegibilidade.motivo}
                </h3>

                {/* Bloco especial para inelegibilidade por TETO */}
                {elegibilidade.motivoTipo === 'teto' && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
                      <span className="text-amber-700 font-bold text-sm w-32 flex-shrink-0">Teto do estado:</span>
                      <span className="text-gray-800 font-semibold">{elegibilidade.tetoAplicavel}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
                      <span className="text-amber-700 font-bold text-sm w-32 flex-shrink-0">Valor informado:</span>
                      <span className="text-gray-800 font-semibold">
                        R$ {parseFloat(formData.valorVeiculo).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-lg border border-amber-300">
                      <p className="text-amber-900 text-sm font-medium">
                        💡 <strong>Dica:</strong> Verifique o valor FIPE do seu veículo. Se estiver dentro do teto, você pode ser elegível. Volte e informe o valor correto.
                      </p>
                    </div>
                  </div>
                )}

                {/* Bloco para inelegibilidade por DEFICIÊNCIA */}
                {elegibilidade.motivoTipo === 'deficiencia' && elegibilidade.deficienciasAceitas && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Deficiências aceitas neste estado:</p>
                    <p className="text-sm text-gray-600">{elegibilidade.deficienciasAceitas}</p>
                  </div>
                )}

                {/* Bloco para inelegibilidade por CONDUTOR */}
                {elegibilidade.motivoTipo === 'condutor' && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
                    <p className="text-sm text-gray-700">
                      Neste estado, o beneficiário com deficiência precisa ser o próprio condutor do veículo para ter direito à isenção.
                    </p>
                  </div>
                )}

                {elegibilidade.tetoAplicavel && elegibilidade.motivoTipo !== 'teto' && (
                  <p className="text-sm text-gray-600 mt-2">
                    Teto aplicável: <strong>{elegibilidade.tetoAplicavel}</strong>
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Dados Pessoais — só exibe se não vieram do lead */}
          {!dadosLead ? (
            <Card className="p-8 border-2 border-blue-100">
              <h3 className="text-xl font-bold text-blue-900 mb-6">
                Dados Pessoais
              </h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="nome" className="text-base font-semibold">Nome Completo</Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome completo"
                    value={formData.nome}
                    onChange={(e) => { setFormData({ ...formData, nome: e.target.value }); setErros({ ...erros, nome: "" }); }}
                    className={`mt-2 h-12 text-base ${erros.nome ? "border-red-500" : ""}`}
                  />
                  {erros.nome && <p className="text-red-600 text-sm mt-1">{erros.nome}</p>}
                </div>
                <div>
                  <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErros({ ...erros, email: "" }); }}
                    className={`mt-2 h-12 text-base ${erros.email ? "border-red-500" : ""}`}
                  />
                  {erros.email && <p className="text-red-600 text-sm mt-1">{erros.email}</p>}
                </div>
                <div>
                  <Label htmlFor="telefone" className="text-base font-semibold">Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="(XX) XXXXX-XXXX"
                    value={formData.telefone}
                    onChange={(e) => { setFormData({ ...formData, telefone: e.target.value }); setErros({ ...erros, telefone: "" }); }}
                    className={`mt-2 h-12 text-base ${erros.telefone ? "border-red-500" : ""}`}
                  />
                  {erros.telefone && <p className="text-red-600 text-sm mt-1">{erros.telefone}</p>}
                </div>
              </div>
            </Card>
          ) : (
            /* Confirmação dos dados já preenchidos */
            <Card className="p-6 border-2 border-green-100 bg-green-50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Dados já registrados</p>
                  <p className="text-sm text-green-700">{dadosLead.nome} • {dadosLead.email} • {dadosLead.telefone}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="flex-1 h-12 text-base font-semibold"
            >
              ← Voltar
            </Button>
            <Button
              onClick={handleGerarDocumento}
              className="flex-1 h-12 text-base font-semibold bg-green-700 hover:bg-green-800 text-white"
            >
              Gerar Relatório
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
