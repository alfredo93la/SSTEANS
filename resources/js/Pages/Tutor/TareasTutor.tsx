import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Badge } from "../../Components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, Calendar, FileText, ClipboardList, Download, Paperclip } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";
import { AlumnoInfoCard } from "../../Components/AlumnoInfoCard";

interface TareaData { id: number; titulo: string; descripcion: string; materiaId: number; materia: string | null; fechaEntrega: string; estadoEntrega: string; fechaEntregaAlumno: string | null; archivos: string[]; }

function nombreArchivo(path: string): string {
  return path.split("/").pop() ?? path;
}

interface TareasTutorProps {
  alumnoId: number;
}

export function TareasTutor({ alumnoId }: TareasTutorProps) {
  const [materiaFiltro, setMateriaFiltro] = useState("todas");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [tareasConEstado, setTareasConEstado] = useState<TareaData[]>([]);

  useEffect(() => {
    if (!alumnoId) return;
    axios.get(`/api/tutor/tareas/${alumnoId}`)
      .then(({ data }) => setTareasConEstado(data.tareas ?? []))
      .catch(() => { });
  }, [alumnoId]);

  // Filtrar tareas
  const tareasFiltradas = tareasConEstado.filter((tarea) => {
    const cumpleMateriaFiltro = materiaFiltro === "todas" || tarea.materiaId === parseInt(materiaFiltro);
    const cumpleEstadoFiltro = estadoFiltro === "todos" || tarea.estadoEntrega === estadoFiltro;
    return cumpleMateriaFiltro && cumpleEstadoFiltro;
  });

  // Estadísticas
  const totalTareas = tareasConEstado.length;
  const tareasEntregadas = tareasConEstado.filter((t) => t.estadoEntrega === "Entregada" || t.estadoEntrega === "Tarde").length;
  const tareasPendientes = tareasConEstado.filter((t) => t.estadoEntrega === "Pendiente").length;

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Entregada":
        return { icon: CheckCircle2, className: "bg-[#059669] text-white", text: "Entregada", color: "text-[#059669]", bg: "bg-green-100" };
      case "Tarde":
        return { icon: Clock, className: "bg-[#D97706] text-white", text: "Entregada tarde", color: "text-[#D97706]", bg: "bg-amber-100" };
      case "No Entregada":
        return { icon: AlertCircle, className: "bg-[#E11D48] text-white", text: "No entregada", color: "text-[#E11D48]", bg: "bg-red-100" };
      default: // Pendiente
        return { icon: Clock, className: "bg-[#6B7280] text-white", text: "Pendiente", color: "text-[#6B7280]", bg: "bg-gray-100" };
    }
  };

  const calcularDiasRestantes = (fechaEntrega: string) => {
    const hoy = new Date();
    const [dia, mes, anio] = fechaEntrega.split("/").map(Number);
    const fechaLimite = new Date(anio, mes - 1, dia);
    const diferencia = Math.ceil((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diferencia;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <AlumnoInfoCard alumnoId={alumnoId} />
      {/* Header */}
      <PageTitle
        icon={ClipboardList}
        title="Tareas"
        description="Consulta las tareas asignadas"
        color="bg-[#D97706]"
      />



      {/* Resumen estadístico */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <FileText className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{totalTareas}</p>
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
      </div>

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#6B7280] mb-2 block">Filtrar por materia</label>
                <Select value={materiaFiltro} onValueChange={setMateriaFiltro}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las materias</SelectItem>
                    {Array.from(new Map(tareasConEstado.map(t => [t.materiaId, t.materia])).entries()).map(([id, nombre]) => (
                      <SelectItem key={id} value={id.toString()}>{nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-[#6B7280] mb-2 block">Filtrar por estado</label>
                <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="Pendiente">Pendientes</SelectItem>
                    <SelectItem value="Entregada">Entregadas</SelectItem>
                    <SelectItem value="Tarde">Entregadas tarde</SelectItem>
                    <SelectItem value="No Entregada">No entregadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Lista de tareas */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Lista de Tareas</CardTitle>
          <CardDescription>Últimas tareas asignadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tareasFiltradas.length === 0 ? (
              <Card className="border-[#E5E7EB]">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
                  <p className="text-[#6B7280]">No hay tareas que coincidan con los filtros seleccionados</p>
                </CardContent>
              </Card>
            ) : (
              tareasFiltradas.map((tarea) => {
                const badge = getEstadoBadge(tarea.estadoEntrega);
                const IconEstado = badge.icon;
                const diasRestantes = calcularDiasRestantes(tarea.fechaEntrega);

                return (
                  <Card key={tarea.id} className="border-[#E5E7EB] hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Indicador de estado */}
                        <div className="shrink-0">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${badge.bg}`}>
                            <IconEstado className={`h-6 w-6 ${badge.color}`} />
                          </div>
                        </div>

                        {/* Información de la tarea */}
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-[#111827] text-lg">{tarea.titulo}</h3>
                              <p className="text-sm text-[#6B7280] mt-1">{tarea.descripcion}</p>
                            </div>
                            <Badge className={badge.className}>
                              {badge.text}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-[#7C3AED]" />
                              <span className="text-[#6B7280]">{tarea.materia}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-[#1D4ED8]" />
                              <span className="text-[#6B7280]">Fecha límite: {tarea.fechaEntrega}</span>
                            </div>
                          </div>

                          {tarea.archivos?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                                <Paperclip className="h-3 w-3" />Adjuntos:
                              </span>
                              {tarea.archivos.map((path) => (
                                <a
                                  key={path}
                                  href={`/api/tareas/${tarea.id}/adjuntos/${nombreArchivo(path)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] transition-colors"
                                >
                                  <Download className="h-3 w-3" />
                                  {nombreArchivo(path)}
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Información adicional según el estado */}
                          {tarea.estadoEntrega === "Pendiente" && diasRestantes >= 0 && (
                            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <Clock className="h-4 w-4 text-[#D97706]" />
                              <span className="text-sm text-[#D97706] font-medium">
                                {diasRestantes === 0
                                  ? "¡Vence hoy!"
                                  : diasRestantes === 1
                                    ? "Vence mañana"
                                    : `Faltan ${diasRestantes} días`}
                              </span>
                            </div>
                          )}

                          {tarea.estadoEntrega === "Pendiente" && diasRestantes < 0 && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                              <AlertCircle className="h-4 w-4 text-[#E11D48]" />
                              <span className="text-sm text-[#E11D48] font-medium">
                                Tarea vencida hace {Math.abs(diasRestantes)} días
                              </span>
                            </div>
                          )}

                          {tarea.estadoEntrega === "Entregada" && tarea.fechaEntregaAlumno && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                              <CheckCircle2 className="h-4 w-4 text-[#059669]" />
                              <span className="text-sm text-[#059669] font-medium">
                                Entregada el {tarea.fechaEntregaAlumno}
                              </span>
                            </div>
                          )}

                          {tarea.estadoEntrega === "Tarde" && (
                            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <Clock className="h-4 w-4 text-[#D97706]" />
                              <span className="text-sm text-[#D97706] font-medium">
                                Entregada fuera de tiempo{tarea.fechaEntregaAlumno ? ` el ${tarea.fechaEntregaAlumno}` : ""}
                              </span>
                            </div>
                          )}

                          {tarea.estadoEntrega === "No Entregada" && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                              <AlertCircle className="h-4 w-4 text-[#E11D48]" />
                              <span className="text-sm text-[#E11D48] font-medium">
                                Tarea no entregada
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
