import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users, TrendingUp, Phone, Download, Search, Filter,
  CheckCircle2, XCircle, Shield, ArrowLeft, RefreshCw,
  BarChart2, FileSpreadsheet
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

const DEFICIENCIAS = [
  "Autismo/TEA", "Física Motora", "Visual",
  "Mental Severa/Profunda", "Auditiva", "Síndrome de Down", "Múltipla"
];

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

export default function AdminDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [busca, setBusca] = useState("");
  const [filtroDeficiencia, setFiltroDeficiencia] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroElegivel, setFiltroElegivel] = useState("todos");
  const [filtroContatado, setFiltroContatado] = useState("todos");
  const [pagina, setPagina] = useState(1);

  const utils = trpc.useUtils();

  const { data: stats, isLoading: statsLoading } = trpc.admin.estatisticas.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: leadsData, isLoading: leadsLoading } = trpc.admin.listarLeads.useQuery(
    {
      pagina,
      porPagina: 20,
      busca: busca || undefined,
      deficiencia: filtroDeficiencia !== "todos" ? filtroDeficiencia : undefined,
      estado: filtroEstado !== "todos" ? filtroEstado : undefined,
      elegivel: filtroElegivel === "sim" ? true : filtroElegivel === "nao" ? false : undefined,
      contatado: filtroContatado === "sim" ? true : filtroContatado === "nao" ? false : undefined,
    },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const { data: csvData, refetch: gerarCSV } = trpc.admin.exportarCSV.useQuery(
    {
      deficiencia: filtroDeficiencia !== "todos" ? filtroDeficiencia : undefined,
      estado: filtroEstado !== "todos" ? filtroEstado : undefined,
      elegivel: filtroElegivel === "sim" ? true : filtroElegivel === "nao" ? false : undefined,
    },
    { enabled: false }
  );

  const marcarContatado = trpc.admin.marcarContatado.useMutation({
    onSuccess: () => {
      utils.admin.listarLeads.invalidate();
      utils.admin.estatisticas.invalidate();
      toast.success("Status atualizado!");
    },
  });

  const handleExportarCSV = async () => {
    const result = await gerarCSV();
    if (result.data?.csv) {
      const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-ipva-pcd-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${result.data.total} leads exportados!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md w-full text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Área Restrita</h2>
          <p className="text-gray-600 mb-6">Faça login para acessar o painel administrativo.</p>
          <Button onClick={() => window.location.href = getLoginUrl()} className="w-full">
            Fazer Login
          </Button>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">Você não tem permissão para acessar esta área.</p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> Site
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <Shield className="w-6 h-6 text-blue-700" />
            <h1 className="text-xl font-bold text-blue-900">Dashboard de Leads</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Olá, {user?.name}</span>
            <Button onClick={handleExportarCSV} size="sm" className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Cards de Estatísticas */}
        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </Card>
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Leads</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <Users className="w-10 h-10 text-blue-200" />
              </div>
            </Card>
            <Card className="p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Elegíveis</p>
                  <p className="text-3xl font-bold text-green-700">{stats.elegiveis}</p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-green-200" />
              </div>
            </Card>
            <Card className="p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Não Contatados</p>
                  <p className="text-3xl font-bold text-yellow-700">{stats.naoContatados}</p>
                </div>
                <Phone className="w-10 h-10 text-yellow-200" />
              </div>
            </Card>
            <Card className="p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Últimos 7 dias</p>
                  <p className="text-3xl font-bold text-purple-700">{stats.recentes}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-200" />
              </div>
            </Card>
          </div>
        )}

        {/* Gráfico por Deficiência */}
        {stats && Object.keys(stats.porDeficiencia).length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                Leads por Deficiência
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.porDeficiencia)
                  .sort(([,a], [,b]) => b - a)
                  .map(([def, count]) => (
                    <div key={def} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-40 truncate">{def}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                Leads por Estado (Top 10)
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.porEstado)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 10)
                  .map(([estado, count]) => (
                    <div key={estado} className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700 w-8">{estado || "—"}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
                className="pl-9"
              />
            </div>
            <Select value={filtroDeficiencia} onValueChange={(v) => { setFiltroDeficiencia(v); setPagina(1); }}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Deficiência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas deficiências</SelectItem>
                {DEFICIENCIAS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={(v) => { setFiltroEstado(v); setPagina(1); }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos estados</SelectItem>
                {ESTADOS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroElegivel} onValueChange={(v) => { setFiltroElegivel(v); setPagina(1); }}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Elegível?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="sim">Elegíveis</SelectItem>
                <SelectItem value="nao">Não elegíveis</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroContatado} onValueChange={(v) => { setFiltroContatado(v); setPagina(1); }}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Contatado?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="nao">Não contatados</SelectItem>
                <SelectItem value="sim">Contatados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Tabela de Leads */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-bold text-gray-900">
              {leadsData ? `${leadsData.total} leads encontrados` : "Carregando..."}
            </h3>
            <Button variant="outline" size="sm" onClick={() => utils.admin.listarLeads.invalidate()}>
              <RefreshCw className="w-4 h-4 mr-1" /> Atualizar
            </Button>
          </div>

          {leadsLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-gray-600">Carregando leads...</p>
            </div>
          ) : leadsData?.leads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum lead encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Nome</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Contato</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Deficiência</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Elegível</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Contatado</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Data</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leadsData?.leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{lead.nome}</td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700">{lead.email}</div>
                        <div className="text-gray-500 text-xs">{lead.telefone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={lead.deficiencia?.includes("Autismo") ? "default" : "secondary"}>
                          {lead.deficiencia || "—"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{lead.estadoNome || lead.estado || "—"}</td>
                      <td className="px-4 py-3">
                        {lead.elegivel ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">✓ Sim</Badge>
                        ) : lead.estado ? (
                          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">✗ Não</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">Pendente</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => marcarContatado.mutate({ id: lead.id, contatado: !lead.contatado })}
                          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                            lead.contatado
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          }`}
                        >
                          {lead.contatado ? (
                            <><CheckCircle2 className="w-3 h-3" /> Contatado</>
                          ) : (
                            <><Phone className="w-3 h-3" /> Pendente</>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://wa.me/55${lead.telefone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 text-xs font-medium"
                        >
                          WhatsApp →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {leadsData && leadsData.paginas > 1 && (
            <div className="p-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Página {leadsData.paginaAtual} de {leadsData.paginas}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagina === 1}
                  onClick={() => setPagina(p => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagina === leadsData.paginas}
                  onClick={() => setPagina(p => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
