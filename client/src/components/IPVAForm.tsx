import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  tetoAplicavel: string;
  deficienciasAceitas: string;
  observacoes: string;
}

export default function IPVAForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    estado: "",
    deficiencia: "",
    condutor: "",
    tipoVeiculo: "",
    valorVeiculo: "",
    laudoMedico: "",
    nome: "",
    email: "",
    telefone: "",
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
      setErros(novosErros);
      return;
    }

    setErros({});

    // Buscar dados do estado
    const dadosEstado = estadosIPVAPCD[formData.estado as keyof typeof estadosIPVAPCD];
    if (!dadosEstado) {
      setElegibilidade({
        elegivel: false,
        motivo: "Estado não encontrado",
        tetoAplicavel: "",
        deficienciasAceitas: "",
        observacoes: "",
      });
      return;
    }

    // Validar deficiência
    const deficienciasAceitasStr = dadosEstado.deficiencias_aceitas.toLowerCase();
    const deficienciaValida = deficiencias.some(
      (d) =>
        deficienciasAceitasStr.includes(d.toLowerCase()) ||
        (d === "Autismo/TEA" &&
          (deficienciasAceitasStr.includes("autismo") ||
            deficienciasAceitasStr.includes("tea")))
    );

    // Validar se é não-condutor
    const aceitaNaoCondutor =
      formData.condutor === "nao" &&
      dadosEstado.aceita_nao_condutor.toLowerCase() === "sim";

    if (
      !deficienciaValida ||
      (formData.condutor === "nao" && !aceitaNaoCondutor)
    ) {
      setElegibilidade({
        elegivel: false,
        motivo:
          formData.condutor === "nao" && !aceitaNaoCondutor
            ? "Este estado não aceita não-condutores"
            : "Esta deficiência não está coberta neste estado",
        tetoAplicavel: "",
        deficienciasAceitas: dadosEstado.deficiencias_aceitas,
        observacoes: dadosEstado.observacoes,
      });
      return;
    }

    // Validar valor do veículo
    const teto =
      formData.tipoVeiculo === "novo"
        ? dadosEstado.teto_veiculo_novo
        : dadosEstado.teto_veiculo_usado;

    const tetoNumerico = parseFloat(teto.replace(/[^\d,]/g, "").replace(",", "."));
    const valorNumerico = parseFloat(formData.valorVeiculo);

    const elegivel = valorNumerico <= tetoNumerico || teto.includes("Sem limite");

    setElegibilidade({
      elegivel,
      motivo: elegivel
        ? "Você pode ter direito à isenção de IPVA!"
        : `O valor do veículo (R$ ${valorNumerico.toLocaleString("pt-BR")}) ultrapassa o teto permitido (${teto})`,
      tetoAplicavel: teto,
      deficienciasAceitas: dadosEstado.deficiencias_aceitas,
      observacoes: dadosEstado.observacoes,
    });

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
          <div
            className={`h-2 rounded-full transition-all ${
              step >= 1 ? "bg-blue-700" : "bg-gray-300"
            }`}
            style={{ width: step >= 1 ? "100%" : "0%" }}
          />
        </div>
        <div className="mx-2 text-sm font-medium text-gray-600">
          Etapa {step} de 2
        </div>
        <div className="flex-1">
          <div
            className={`h-2 rounded-full transition-all ${
              step >= 2 ? "bg-green-600" : "bg-gray-300"
            }`}
            style={{ width: step >= 2 ? "100%" : "0%" }}
          />
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
          {/* Card de Resultado */}
          <Card
            className={`p-8 border-2 ${
              elegibilidade.elegivel
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-4">
              {elegibilidade.elegivel ? (
                <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h3
                  className={`text-xl font-bold mb-2 ${
                    elegibilidade.elegivel
                      ? "text-green-900"
                      : "text-red-900"
                  }`}
                >
                  {elegibilidade.motivo}
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Teto aplicável:</strong> {elegibilidade.tetoAplicavel}
                  </p>
                  <p>
                    <strong>Deficiências aceitas:</strong>{" "}
                    {elegibilidade.deficienciasAceitas}
                  </p>
                  {elegibilidade.observacoes && (
                    <p>
                      <strong>Observações:</strong> {elegibilidade.observacoes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {elegibilidade.elegivel && (
            <>
              {/* Formulário de Dados Pessoais */}
              <Card className="p-8 border-2 border-green-100">
                <h2 className="text-2xl font-bold text-green-900 mb-6">
                  Seus Dados Pessoais
                </h2>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="nome" className="text-base font-semibold">
                      Nome Completo
                    </Label>
                    <Input
                      id="nome"
                      placeholder="Seu nome completo"
                      value={formData.nome}
                      onChange={(e) => {
                        setFormData({ ...formData, nome: e.target.value });
                        setErros({ ...erros, nome: "" });
                      }}
                      className={`mt-2 h-12 text-base ${
                        erros.nome ? "border-red-500" : ""
                      }`}
                    />
                    {erros.nome && (
                      <p className="text-red-600 text-sm mt-1">{erros.nome}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-base font-semibold">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setErros({ ...erros, email: "" });
                      }}
                      className={`mt-2 h-12 text-base ${
                        erros.email ? "border-red-500" : ""
                      }`}
                    />
                    {erros.email && (
                      <p className="text-red-600 text-sm mt-1">{erros.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="telefone" className="text-base font-semibold">
                      Telefone
                    </Label>
                    <Input
                      id="telefone"
                      placeholder="(XX) XXXXX-XXXX"
                      value={formData.telefone}
                      onChange={(e) => {
                        setFormData({ ...formData, telefone: e.target.value });
                        setErros({ ...erros, telefone: "" });
                      }}
                      className={`mt-2 h-12 text-base ${
                        erros.telefone ? "border-red-500" : ""
                      }`}
                    />
                    {erros.telefone && (
                      <p className="text-red-600 text-sm mt-1">{erros.telefone}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                    <Checkbox id="termos" />
                    <Label
                      htmlFor="termos"
                      className="font-normal cursor-pointer text-sm"
                    >
                      Concordo em receber informações sobre meu pedido de isenção
                    </Label>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 h-12 text-base font-semibold"
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={handleGerarDocumento}
                      className="flex-1 h-12 text-base font-semibold bg-green-600 hover:bg-green-700 text-white"
                    >
                      Gerar Documento
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}

          {!elegibilidade.elegivel && (
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="w-full h-12 text-base font-semibold"
            >
              Voltar e Tentar Novamente
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
