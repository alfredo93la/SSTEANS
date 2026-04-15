import { useState } from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { ClipboardList, Calendar, BookOpen, Plus, Search, Filter, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";
interface TareaData { id: number; titulo: string; descripcion: string; materia: string | null; grupo: string | null; fechaEntrega: string; estadoEntrega: string; fechaEntregaAlumno: string | null; }

interface EntregasViewProps {
  userRole: string;
  hijoSeleccionado?: number | null;
  onNavigate: (route: string) => void;
}

export function EntregasView({ userRole }: EntregasViewProps) {
  const [filtroEstado, setFiltroEstado] = useState<string>("Todas");
  const [filtroMateria, setFiltroMateria] = useState<string>("Todas");
  const [busqueda, setBusqueda] = useState("");

  const tareasConEstado: TareaData[] = [];

  const tareasFiltradas = tareasConEstado
    .filter(tarea => {
      const cumpleFiltroEstado = filtroEstado === "Todas" || tarea.estadoEntrega === filtroEstado;
      const cumpleFiltroMateria = filtroMateria === "Todas" || tarea.materia === filtroMateria;
      const cumpleBusqueda = busqueda === "" ||
        tarea.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        tarea.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        (tarea.materia ?? "").toLowerCase().includes(busqueda.toLowerCase());
      return cumpleFiltroEstado && cumpleFiltroMateria && cumpleBusqueda;
    })
    .sort((a, b) => {
      const dateA = a.fechaEntrega.split('/').reverse().join('');
      const dateB = b.fechaEntrega.split('/').reverse().join('');
      return dateA.localeCompare(dateB);
    });

  const materiasUnicas = ["Todas", ...new Set(tareasConEstado.map(t => t.materia).filter(Boolean))] as string[];

  const estadosPosibles = ["Todas", "Pendiente", "Entregada"];

  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case "Entregada":
        return { color: "bg-green-100 text-[#059669]", icon: CheckCircle2 };
      case "Pendiente":
        return { color: "bg-amber-100 text-[#D97706]", icon: Clock };
      default:
        return { color: "bg-gray-100 text-gray-700", icon: AlertCircle };
    }
  };

  // Calcular estadísticas
  const totalTareas = tareasFiltradas.length;
  const tareasEntregadas = tareasFiltradas.filter(t => t.estadoEntrega === "Entregada").length;
  const tareasPendientes = tareasFiltradas.filter(t => t.estadoEntrega === "Pendiente").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageTitle icon={ClipboardList} title="Entregas de Tareas" description="Seguimiento de tareas y trabajos pendientes" color="bg-[#1D4ED8]">
        {userRole === "Profesor" && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </Button>
        )}
      </PageTitle>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <ClipboardList className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total Tareas</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{totalTareas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Clock className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Pendientes</p>
                <p className="text-2xl font-bold text-[#D97706]">{tareasPendientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-[#059669]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Entregadas</p>
                <p className="text-2xl font-bold text-[#059669]">{tareasEntregadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Buscar tareas..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-[#6B7280]" />
              
              {/* Filtro por estado */}
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent"
              >
                {estadosPosibles.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>

              {/* Filtro por materia */}
              <select
                value={filtroMateria}
                onChange={(e) => setFiltroMateria(e.target.value)}
                className="px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent"
              >
                {materiasUnicas.map((materia) => (
                  <option key={materia} value={materia}>
                    {materia}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tareas */}
      <div className="grid grid-cols-1 gap-4">
        {tareasFiltradas.length > 0 ? (
          tareasFiltradas.map((tarea) => {
            const badgeInfo = getBadgeEstado(tarea.estadoEntrega);
            const EstadoIcon = badgeInfo.icon;
            
            return (
              <Card key={tarea.id} className="border-[#E5E7EB] hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Fecha de entrega */}
                    <div className="w-16 h-16 rounded-xl bg-linear-to-br from-blue-100 to-blue-200 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs text-[#1D4ED8]">
                        {tarea.fechaEntrega.split('/')[1] === "11" ? "Nov" : "Dic"}
                      </span>
                      <span className="text-xl font-bold text-[#1D4ED8]">
                        {tarea.fechaEntrega.split('/')[0]}
                      </span>
                    </div>

                    {/* Detalles */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#111827] text-lg">{tarea.titulo}</h3>
                            <Badge variant="outline" className="text-xs">
                              {tarea.materia}
                            </Badge>
                          </div>
                          <p className="text-sm text-[#6B7280]">{tarea.descripcion}</p>
                        </div>
                        <Badge variant="secondary" className={badgeInfo.color}>
                          <EstadoIcon className="h-3 w-3 mr-1" />
                          {tarea.estadoEntrega}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#6B7280]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Entrega: {tarea.fechaEntrega}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{tarea.grupo}</span>
                        </div>
                        {tarea.fechaEntregaAlumno && (
                          <div className="flex items-center gap-2 text-[#059669]">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Entregado: {tarea.fechaEntregaAlumno}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="border-[#E5E7EB]">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-[#6B7280] mx-auto mb-3" />
                <p className="text-[#6B7280]">No se encontraron tareas</p>
                <p className="text-sm text-[#9CA3AF] mt-1">
                  {busqueda ? "Intenta con otros términos de búsqueda" : "No hay tareas pendientes"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
