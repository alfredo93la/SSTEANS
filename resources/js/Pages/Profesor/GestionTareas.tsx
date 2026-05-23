import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSubmit } from "../../hooks/useSubmit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../Components/ui/dialog";
import { Input } from "../../Components/ui/input";
import { Textarea } from "../../Components/ui/textarea";
import { Label } from "../../Components/ui/label";
import { toast } from "sonner";
import { FileText, Calendar, Edit, Trash2, Users, CheckCircle, Clock, Plus, Save, X, BookOpen, ClipboardList, Paperclip, Download } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "../../Components/ui/pagination";

const POR_PAGINA = 10;

interface GrupoData { id: number; nombre: string; }
interface MateriaData { id: number; nombre: string; }
interface TareaData { id: number; titulo: string; descripcion: string; materiaId: number; materia: string | null; grupoId: number; grupo: string | null; fechaEntrega: string; entregadasCount: number; totalAlumnos: number; archivos: string[]; }
interface EntregaData { alumnoId: number; nombre: string; estado: "Pendiente" | "Entregada" | "Tarde" | "No Entregada"; fechaEntrega: string | null; }

function nombreArchivo(path: string): string {
  return path.split("/").pop() ?? path;
}

export function GestionTareas() {
  const [grupos, setGrupos] = useState<GrupoData[]>([]);
  const [tareas, setTareas] = useState<TareaData[]>([]);
  const [filtroGrupo, setFiltroGrupo] = useState("todos");
  const [tareaEditar, setTareaEditar] = useState<TareaData | null>(null);
  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false);
  const [dialogEliminarAbierto, setDialogEliminarAbierto] = useState(false);
  const [tareaEliminar, setTareaEliminar] = useState<number | null>(null);

  // Datos temporales para edición
  const [tituloEdit, setTituloEdit] = useState("");
  const [descripcionEdit, setDescripcionEdit] = useState("");
  const [fechaEntregaEdit, setFechaEntregaEdit] = useState("");
  const [archivosEdit, setArchivosEdit] = useState<File[]>([]);
  const [archivosExistentesEdit, setArchivosExistentesEdit] = useState<string[]>([]);
  const archivoEditRef = useRef<HTMLInputElement>(null);

  // Estado para entregas
  const [dialogEntregasAbierto, setDialogEntregasAbierto] = useState(false);
  const [tareaEntregas, setTareaEntregas] = useState<TareaData | null>(null);
  const [entregas, setEntregas] = useState<EntregaData[]>([]);
  const [cargandoEntregas, setCargandoEntregas] = useState(false);
  const [guardandoEntrega, setGuardandoEntrega] = useState<number | null>(null);
  const [guardandoTodos, setGuardandoTodos] = useState(false);

  // Estado para nueva tarea
  const [dialogNuevaTareaAbierto, setDialogNuevaTareaAbierto] = useState(false);
  const [materiasNueva, setMateriasNueva] = useState<MateriaData[]>([]);
  const [tituloNueva, setTituloNueva] = useState("");
  const [descripcionNueva, setDescripcionNueva] = useState("");
  const [grupoNueva, setGrupoNueva] = useState("");
  const [materiaNueva, setMateriaNueva] = useState("");
  const [fechaAsignacionNueva, setFechaAsignacionNueva] = useState(new Date().toISOString().split('T')[0]);
  const [fechaEntregaNueva, setFechaEntregaNueva] = useState("");
  const [archivosNueva, setArchivosNueva] = useState<File[]>([]);
  const archivoNuevaRef = useRef<HTMLInputElement>(null);
  const [guardandoNueva, submitNueva] = useSubmit();
  const [guardandoEdicion, submitEdicion] = useSubmit();
  const [eliminandoTarea, submitEliminar] = useSubmit();

  useEffect(() => {
    axios.get("/api/profesor/grupos")
      .then(({ data }) => setGrupos(data.grupos ?? []))
      .catch(() => { });
    axios.get("/api/tareas")
      .then(({ data }) => setTareas(data.tareas ?? []))
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!grupoNueva) {
      setMateriasNueva([]);
      setMateriaNueva("");
      return;
    }
    setMateriaNueva("");
    setMateriasNueva([]);
    axios.get("/api/profesor/materias", { params: { grupo_id: grupoNueva } })
      .then(({ data }) => setMateriasNueva(data.materias ?? []))
      .catch(() => { });
  }, [grupoNueva]);

  const limpiarFormularioNueva = () => {
    setTituloNueva("");
    setDescripcionNueva("");
    setGrupoNueva("");
    setMateriaNueva("");
    setFechaAsignacionNueva(new Date().toISOString().split('T')[0]);
    setFechaEntregaNueva("");
    setArchivosNueva([]);
    if (archivoNuevaRef.current) archivoNuevaRef.current.value = "";
  };

  const formatearFecha = (fechaISO: string) => {
    if (!fechaISO) return "";
    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${anio}`;
  };

  const validarNuevaTarea = () => {
    if (!tituloNueva.trim() || tituloNueva.trim().length < 3) {
      toast.error("El título debe tener al menos 3 caracteres."); return false;
    }
    if (!descripcionNueva.trim() || descripcionNueva.trim().length < 10) {
      toast.error("Las instrucciones deben tener al menos 10 caracteres."); return false;
    }
    if (!grupoNueva) { toast.error("Debes seleccionar un grupo."); return false; }
    if (!materiaNueva) { toast.error("Debes seleccionar una materia."); return false; }
    if (!fechaEntregaNueva) { toast.error("Debes establecer una fecha de entrega."); return false; }
    if (new Date(fechaEntregaNueva) <= new Date(fechaAsignacionNueva)) {
      toast.error("La fecha de entrega debe ser posterior a la fecha de asignación.");
      return false;
    }
    return true;
  };

  const crearTarea = () => {
    if (!validarNuevaTarea()) return;

    const grupo = grupos.find(g => g.id === parseInt(grupoNueva));
    const materia = materiasNueva.find(m => m.id === parseInt(materiaNueva));

    const fd = new FormData();
    fd.append("titulo", tituloNueva);
    fd.append("descripcion", descripcionNueva);
    fd.append("grupo_id", grupoNueva);
    fd.append("materia_id", materiaNueva);
    fd.append("fecha_asignacion", fechaAsignacionNueva);
    fd.append("fecha_entrega", fechaEntregaNueva);
    archivosNueva.forEach(f => fd.append("archivos[]", f));

    submitNueva(async () => {
      const { data } = await axios.post("/api/tareas", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const nuevaTarea: TareaData = data.tarea ?? {
        id: Date.now(),
        titulo: tituloNueva,
        descripcion: descripcionNueva,
        materiaId: parseInt(materiaNueva),
        materia: materia?.nombre ?? null,
        grupoId: parseInt(grupoNueva),
        grupo: grupo?.nombre ?? null,
        fechaEntrega: formatearFecha(fechaEntregaNueva),
        entregadasCount: 0,
        totalAlumnos: 0,
        archivos: [],
      };
      setTareas(prev => [...prev, nuevaTarea]);
      toast.success(`Tarea "${tituloNueva}" asignada a ${grupo?.nombre} - ${materia?.nombre}`);
      limpiarFormularioNueva();
      setDialogNuevaTareaAbierto(false);
    }).catch(() => toast.error("Error al asignar la tarea"));
  };

  const [pagina, setPagina] = useState(1);
  useEffect(() => { setPagina(1); }, [filtroGrupo]);

  const tareasFiltradas = tareas.filter(t =>
    filtroGrupo === "todos" || t.grupoId === parseInt(filtroGrupo)
  );
  const totalPaginas = Math.ceil(tareasFiltradas.length / POR_PAGINA);
  const tareasPaginadas = tareasFiltradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const abrirEditar = (tarea: TareaData) => {
    setTareaEditar(tarea);
    setTituloEdit(tarea.titulo);
    setDescripcionEdit(tarea.descripcion);
    setFechaEntregaEdit(convertirFechaAISO(tarea.fechaEntrega));
    setArchivosExistentesEdit(tarea.archivos ?? []);
    setArchivosEdit([]);
    if (archivoEditRef.current) archivoEditRef.current.value = "";
    setDialogEditarAbierto(true);
  };

  const convertirFechaAISO = (fecha: string) => {
    const [dia, mes, anio] = fecha.split('/');
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  };

  const convertirFechaAFormato = (fechaISO: string) => {
    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${anio}`;
  };

  const guardarEdicion = () => {
    if (!tareaEditar) return;

    if (!tituloEdit.trim() || tituloEdit.trim().length < 3) {
      toast.error("El título debe tener al menos 3 caracteres.");
      return;
    }
    if (!fechaEntregaEdit) {
      toast.error("La fecha de entrega es obligatoria.");
      return;
    }

    const fechaFormateada = convertirFechaAFormato(fechaEntregaEdit);

    const fd = new FormData();
    fd.append("_method", "PUT");
    fd.append("titulo", tituloEdit);
    fd.append("descripcion", descripcionEdit);
    fd.append("fecha_entrega", fechaEntregaEdit);
    fd.append("archivosExistentesSet", "1");
    archivosExistentesEdit.forEach(a => fd.append("archivosExistentes[]", a));
    archivosEdit.forEach(f => fd.append("archivos[]", f));

    submitEdicion(async () => {
      const { data } = await axios.post(`/api/tareas/${tareaEditar.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      const archivosActualizados: string[] = data.tarea?.archivos ?? archivosExistentesEdit;
      setTareas(prev => prev.map(t =>
        t.id === tareaEditar.id
          ? { ...t, titulo: tituloEdit, descripcion: descripcionEdit, fechaEntrega: fechaFormateada, archivos: archivosActualizados }
          : t
      ));
      toast.success("Tarea actualizada exitosamente");
      setDialogEditarAbierto(false);
      setTareaEditar(null);
    }).catch(() => toast.error("Error al actualizar la tarea"));
  };

  const abrirEntregas = (tarea: TareaData) => {
    setTareaEntregas(tarea);
    setEntregas([]);
    setCargandoEntregas(true);
    setDialogEntregasAbierto(true);
    axios.get(`/api/tareas/${tarea.id}/entregas`)
      .then(({ data }) => setEntregas(data.entregas ?? []))
      .catch(() => toast.error("Error al cargar las entregas"))
      .finally(() => setCargandoEntregas(false));
  };

  const parsearFechaLimite = (fechaDDMMYYYY: string): Date => {
    const [dia, mes, anio] = fechaDDMMYYYY.split("/").map(Number);
    return new Date(anio, mes - 1, dia, 23, 59, 59);
  };

  const fechaLimitePasada = tareaEntregas
    ? parsearFechaLimite(tareaEntregas.fechaEntrega) < new Date()
    : false;

  const cambiarEstadoEntrega = (alumnoId: number, nuevoEstado: EntregaData["estado"]) => {
    if (!tareaEntregas) return;

    // Determinar la fecha a enviar según el estado y si la fecha límite ya pasó
    const hoy = new Date().toISOString().split("T")[0];
    const [dia, mes, anio] = tareaEntregas.fechaEntrega.split("/");
    const fechaLimiteISO = `${anio}-${mes}-${dia}`;

    let fechaEntrega: string | null = null;
    if (nuevoEstado === "Entregada") {
      // Antes del límite → fecha actual; después → fecha límite
      fechaEntrega = fechaLimitePasada ? fechaLimiteISO : hoy;
    } else if (nuevoEstado === "Tarde") {
      fechaEntrega = hoy;
    } else if (nuevoEstado === "No Entregada") {
      fechaEntrega = fechaLimiteISO;
    }

    setGuardandoEntrega(alumnoId);
    axios.patch(`/api/tareas/${tareaEntregas.id}/entregas/${alumnoId}`, {
      estado: nuevoEstado,
      fecha_entrega: fechaEntrega,
    })
      .then(() => {
        const fechaMostrar = fechaEntrega
          ? fechaEntrega.split("-").reverse().join("/")
          : null;
        setEntregas(prev => prev.map(e =>
          e.alumnoId === alumnoId ? { ...e, estado: nuevoEstado, fechaEntrega: fechaMostrar } : e
        ));
        setTareas(prev => prev.map(t => {
          if (t.id !== tareaEntregas.id) return t;
          const delta = nuevoEstado !== "Pendiente" ? 1 : -1;
          return { ...t, entregadasCount: Math.max(0, Math.min(t.entregadasCount + delta, t.totalAlumnos)) };
        }));
      })
      .catch(() => toast.error("Error al actualizar la entrega"))
      .finally(() => setGuardandoEntrega(null));
  };

  const marcarTodosEntregas = async (nuevoEstado: EntregaData["estado"]) => {
    if (!tareaEntregas || entregas.length === 0) return;

    const hoy = new Date().toISOString().split("T")[0];
    const [dia, mes, anio] = tareaEntregas.fechaEntrega.split("/");
    const fechaLimiteISO = `${anio}-${mes}-${dia}`;

    let fechaEntrega: string | null = null;
    if (nuevoEstado === "Entregada") fechaEntrega = fechaLimitePasada ? fechaLimiteISO : hoy;
    else if (nuevoEstado === "Tarde") fechaEntrega = hoy;
    else if (nuevoEstado === "No Entregada") fechaEntrega = fechaLimiteISO;

    setGuardandoTodos(true);
    try {
      await Promise.all(
        entregas.map(e =>
          axios.patch(`/api/tareas/${tareaEntregas.id}/entregas/${e.alumnoId}`, {
            estado: nuevoEstado,
            fecha_entrega: fechaEntrega,
          })
        )
      );
      const fechaMostrar = fechaEntrega ? fechaEntrega.split("-").reverse().join("/") : null;
      setEntregas(prev => prev.map(e => ({ ...e, estado: nuevoEstado, fechaEntrega: fechaMostrar })));
      setTareas(prev => prev.map(t =>
        t.id === tareaEntregas.id ? { ...t, entregadasCount: entregas.length } : t
      ));
      toast.success(`Todos marcados como "${nuevoEstado}"`);
    } catch {
      toast.error("Error al actualizar las entregas");
    } finally {
      setGuardandoTodos(false);
    }
  };

  const abrirEliminar = (tareaId: number) => {
    setTareaEliminar(tareaId);
    setDialogEliminarAbierto(true);
  };

  const confirmarEliminar = () => {
    if (tareaEliminar === null) return;
    submitEliminar(async () => {
      await axios.delete(`/api/tareas/${tareaEliminar}`);
      setTareas(prev => prev.filter(t => t.id !== tareaEliminar));
      toast.success("Tarea eliminada exitosamente");
      setDialogEliminarAbierto(false);
      setTareaEliminar(null);
    }).catch(() => toast.error("Error al eliminar la tarea"));
  };

  const calcularPorcentajeEntrega = (tarea: TareaData) => {
    return tarea.totalAlumnos > 0 ? Math.round((tarea.entregadasCount / tarea.totalAlumnos) * 100) : 0;
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
      <PageTitle icon={FileText} title="Gestión de Tareas" description="Administra las tareas asignadas a tus grupos" color="bg-[#D97706]">
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => setDialogNuevaTareaAbierto(true)}
            className="bg-[#D97706] hover:bg-[#B45309]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
          <div className="sm:w-64">
            <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los grupos</SelectItem>
                {grupos.map((g) => (
                  <SelectItem key={g.id} value={g.id.toString()}>
                    {g.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PageTitle>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <FileText className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total de Tareas</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{tareasFiltradas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <CheckCircle className="h-6 w-6 text-[#059669]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Activas</p>
                <p className="text-2xl font-bold text-[#059669]">
                  {tareasFiltradas.filter(t => calcularDiasRestantes(t.fechaEntrega) >= 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-gray-50 to-gray-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Clock className="h-6 w-6 text-[#6B7280]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Vencidas</p>
                <p className="text-2xl font-bold text-[#6B7280]">
                  {tareasFiltradas.filter(t => calcularDiasRestantes(t.fechaEntrega) < 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <p className="text-[#6B7280]">No hay tareas para mostrar</p>
                </CardContent>
              </Card>
            ) : (
              tareasPaginadas.map((tarea) => {
                const porcentaje = calcularPorcentajeEntrega(tarea);
                const diasRestantes = calcularDiasRestantes(tarea.fechaEntrega);
                const revisadas = tarea.entregadasCount;
                const total = tarea.totalAlumnos;

                return (
                  <Card key={tarea.id} className="border-[#E5E7EB] hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Header de la tarea */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-2">
                              <FileText className="h-5 w-5 text-[#7C3AED] mt-1 shrink-0" />
                              <div className="flex-1">
                                <h3 className="font-semibold text-[#111827] text-lg">{tarea.titulo}</h3>
                                <p className="text-sm text-[#6B7280] mt-1">{tarea.descripcion}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
                              <Badge variant="secondary" className="bg-purple-100 text-[#7C3AED]">
                                {tarea.materia}
                              </Badge>
                              <Badge variant="secondary" className="bg-blue-100 text-[#1D4ED8]">
                                <Users className="h-3 w-3 mr-1" />
                                {tarea.grupo}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={
                                  diasRestantes < 0 ? "bg-gray-100 text-[#6B7280]" :
                                    diasRestantes <= 3 ? "bg-red-100 text-[#E11D48]" :
                                      "bg-green-100 text-[#059669]"
                                }
                              >
                                <Calendar className="h-3 w-3 mr-1" />
                                {tarea.fechaEntrega}
                              </Badge>
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirEntregas(tarea)}
                              className="text-[#059669] border-[#059669] hover:bg-green-50"
                            >
                              <ClipboardList className="h-4 w-4 mr-1" />
                              Entregas
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirEditar(tarea)}
                              className="text-[#1D4ED8] border-[#1D4ED8] hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirEliminar(tarea.id)}
                              className="text-[#E11D48] border-[#E11D48] hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </div>

                        {/* Progreso de revisión */}
                        <div className="space-y-2 pt-3 border-t border-[#E5E7EB]">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-[#6B7280]">
                              <ClipboardList className="h-4 w-4" />
                              <span>Revisadas: {revisadas} de {total}</span>
                            </div>
                            <Badge className={
                              porcentaje >= 80 ? "bg-[#059669]" :
                                porcentaje >= 50 ? "bg-[#D97706]" :
                                  "bg-[#E11D48]"
                            }>
                              {porcentaje}%
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${porcentaje >= 80 ? "bg-[#059669]" :
                                  porcentaje >= 50 ? "bg-[#D97706]" :
                                    "bg-[#E11D48]"
                                }`}
                              style={{ width: `${porcentaje}%` }}
                            />
                          </div>
                        </div>

                        {/* Adjuntos */}
                        {tarea.archivos?.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
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

                        {/* Estado de la tarea */}
                        {diasRestantes < 0 ? (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm text-[#6B7280]">
                            <Clock className="h-4 w-4" />
                            <span>Tarea vencida hace {Math.abs(diasRestantes)} días</span>
                          </div>
                        ) : diasRestantes <= 3 ? (
                          <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-sm text-[#E11D48]">
                            <Clock className="h-4 w-4" />
                            <span>
                              {diasRestantes === 0 ? "¡Vence hoy!" :
                                diasRestantes === 1 ? "Vence mañana" :
                                  `Vence en ${diasRestantes} días`}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
          {totalPaginas > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-[#6B7280]">
              <span>Mostrando {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, tareasFiltradas.length)} de {tareasFiltradas.length}</span>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPagina((p) => Math.max(1, p - 1)); }} className={pagina === 1 ? "pointer-events-none opacity-50" : ""} />
                  </PaginationItem>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === totalPaginas || Math.abs(n - pagina) <= 1)
                    .reduce<(number | "ellipsis")[]>((acc, n, idx, arr) => {
                      if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
                      acc.push(n); return acc;
                    }, [])
                    .map((item, idx) => item === "ellipsis" ? (
                      <PaginationItem key={`e-${idx}`}><PaginationEllipsis /></PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink href="#" isActive={pagina === item} onClick={(e) => { e.preventDefault(); setPagina(item as number); }}>{item}</PaginationLink>
                      </PaginationItem>
                    ))}
                  <PaginationItem>
                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPagina((p) => Math.min(totalPaginas, p + 1)); }} className={pagina === totalPaginas ? "pointer-events-none opacity-50" : ""} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Dialog Nueva Tarea */}
      <Dialog open={dialogNuevaTareaAbierto} onOpenChange={(open) => { if (guardandoNueva) return; setDialogNuevaTareaAbierto(open); if (!open) limpiarFormularioNueva(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Tarea</DialogTitle>
            <DialogDescription>Completa la información de la tarea a asignar</DialogDescription>
          </DialogHeader>

          <form className="space-y-5 my-2" onSubmit={(e) => { e.preventDefault(); crearTarea(); }}>
            <div className="space-y-2">
              <Label htmlFor="nueva-titulo" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#7C3AED]" />
                Título de la tarea *
              </Label>
              <Input
                id="nueva-titulo"
                placeholder="Ej: Resolver ejercicios del capítulo 3"
                value={tituloNueva}
                onChange={(e) => setTituloNueva(e.target.value)}
                className="rounded-lg"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nueva-descripcion" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#7C3AED]" />
                Instrucciones *
              </Label>
              <Textarea
                id="nueva-descripcion"
                placeholder="Describe detalladamente las instrucciones de la tarea..."
                value={descripcionNueva}
                onChange={(e) => setDescripcionNueva(e.target.value)}
                rows={4}
                className="rounded-lg resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-[#6B7280]">{descripcionNueva.length}/500 caracteres</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nueva-grupo" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#1D4ED8]" />
                  Grupo *
                </Label>
                <Select value={grupoNueva} onValueChange={setGrupoNueva}>
                  <SelectTrigger id="nueva-grupo" className="rounded-lg">
                    <SelectValue placeholder="Selecciona un grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {grupos.map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()}>{g.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nueva-materia" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#7C3AED]" />
                  Materia *
                </Label>
                <Select value={materiaNueva} onValueChange={setMateriaNueva} disabled={!grupoNueva}>
                  <SelectTrigger id="nueva-materia" className="rounded-lg">
                    <SelectValue placeholder="Selecciona una materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {materiasNueva.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>{m.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nueva-fechaAsignacion" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#059669]" />
                  Fecha de asignación *
                </Label>
                <Input
                  id="nueva-fechaAsignacion"
                  type="date"
                  value={fechaAsignacionNueva}
                  onChange={(e) => setFechaAsignacionNueva(e.target.value)}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nueva-fechaEntrega" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#E11D48]" />
                  Fecha de entrega *
                </Label>
                <Input
                  id="nueva-fechaEntrega"
                  type="date"
                  value={fechaEntregaNueva}
                  onChange={(e) => setFechaEntregaNueva(e.target.value)}
                  min={fechaAsignacionNueva}
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-[#6B7280]" />
                Archivos adjuntos <span className="text-[#9CA3AF] font-normal">(opcional)</span>
              </Label>
              <p className="text-xs text-[#6B7280]">PDF, Word, imágenes (jpg, png, gif, webp)</p>
              <input
                ref={archivoNuevaRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                onChange={(e) => setArchivosNueva(Array.from(e.target.files ?? []))}
                className="block w-full text-sm text-[#6B7280] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-[#F3F4F6] file:text-[#374151] hover:file:bg-[#E5E7EB] cursor-pointer"
              />
              {archivosNueva.length > 0 && (
                <ul className="text-xs text-[#6B7280] space-y-1 mt-1">
                  {archivosNueva.map((f, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />{f.name}
                      <button type="button" onClick={() => setArchivosNueva(prev => prev.filter((_, j) => j !== i))} className="ml-auto text-[#E11D48]"><X className="h-3 w-3" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" disabled={guardandoNueva} onClick={() => { limpiarFormularioNueva(); setDialogNuevaTareaAbierto(false); }}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={guardandoNueva} className="bg-[#1D4ED8] hover:bg-[#1E40AF]">
                {guardandoNueva ? (
                  <>
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent inline-block" />
                    Asignando…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Asignar Tarea
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Entregas */}
      <Dialog open={dialogEntregasAbierto} onOpenChange={setDialogEntregasAbierto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[#059669]" />
              Registro de Entregas
            </DialogTitle>
            <DialogDescription>
              {tareaEntregas?.titulo} — {tareaEntregas?.grupo}
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 space-y-3">
            {cargandoEntregas ? (
              <div className="py-10 text-center text-sm text-[#6B7280]">Cargando alumnos…</div>
            ) : entregas.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#6B7280]">No hay alumnos registrados</div>
            ) : (
              <>
                {/* Resumen */}
                <div className="flex flex-wrap gap-3 text-sm pb-2 border-b border-[#E5E7EB]">
                  <span className="flex items-center gap-1 text-[#059669]">
                    <CheckCircle className="h-4 w-4" />
                    {entregas.filter(e => e.estado === "Entregada").length} entregadas
                  </span>
                  <span className="flex items-center gap-1 text-[#D97706]">
                    <Clock className="h-4 w-4" />
                    {entregas.filter(e => e.estado === "Tarde").length} tarde
                  </span>
                  <span className="flex items-center gap-1 text-[#E11D48]">
                    <X className="h-4 w-4" />
                    {entregas.filter(e => e.estado === "No Entregada").length} no entregadas
                  </span>
                  <span className="flex items-center gap-1 text-[#6B7280]">
                    <Clock className="h-4 w-4" />
                    {entregas.filter(e => e.estado === "Pendiente").length} pendientes
                  </span>
                </div>

                {/* Marcar todos */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={guardandoTodos}
                    onClick={() => marcarTodosEntregas("Entregada")}
                    className="text-[#059669] border-[#059669] hover:bg-green-50"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Todos entregada
                  </Button>
                  {fechaLimitePasada && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={guardandoTodos}
                        onClick={() => marcarTodosEntregas("Tarde")}
                        className="text-[#D97706] border-[#D97706] hover:bg-amber-50"
                      >
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        Todos tarde
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={guardandoTodos}
                        onClick={() => marcarTodosEntregas("No Entregada")}
                        className="text-[#E11D48] border-[#E11D48] hover:bg-red-50"
                      >
                        <X className="h-3.5 w-3.5 mr-1.5" />
                        Todos no entregada
                      </Button>
                    </>
                  )}
                </div>

                {/* Aviso cuando la fecha aún no ha pasado */}
                {!fechaLimitePasada && (
                  <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200 text-xs text-[#D97706]">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    La fecha límite aún no ha pasado. Solo se puede marcar como <strong className="ml-1">Entregada</strong>.
                  </div>
                )}

                {/* Lista de alumnos */}
                <div className="space-y-2">
                  {entregas.map((e) => (
                    <div
                      key={e.alumnoId}
                      className="flex items-center justify-between p-3 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB]"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#111827] truncate">{e.nombre.replace(/,\s*/g, ' ')}</p>
                        {e.fechaEntrega && e.estado !== "Pendiente" && (
                          <p className="text-xs text-[#6B7280]">Fecha: {e.fechaEntrega}</p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-3 shrink-0">
                        {(["Entregada", "Tarde", "No Entregada"] as const).map((opcion) => {
                          const activo = e.estado === opcion;
                          const bloqueado = !fechaLimitePasada && opcion !== "Entregada";
                          const estilos: Record<string, string> = {
                            "Entregada": activo ? "bg-[#059669] text-white border-[#059669]" : "bg-white text-[#6B7280] border-[#D1D5DB] hover:border-[#059669] hover:text-[#059669]",
                            "Tarde": activo ? "bg-[#D97706] text-white border-[#D97706]" : "bg-white text-[#6B7280] border-[#D1D5DB] hover:border-[#D97706] hover:text-[#D97706]",
                            "No Entregada": activo ? "bg-[#E11D48] text-white border-[#E11D48]" : "bg-white text-[#6B7280] border-[#D1D5DB] hover:border-[#E11D48] hover:text-[#E11D48]",
                          };
                          return (
                            <Button
                              key={opcion}
                              size="sm"
                              variant="outline"
                              disabled={guardandoEntrega === e.alumnoId || bloqueado}
                              onClick={() => cambiarEstadoEntrega(e.alumnoId, activo ? "Pendiente" : opcion)}
                              className={`text-xs px-2 ${bloqueado ? "opacity-30 cursor-not-allowed" : estilos[opcion]}`}
                            >
                              {opcion}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEntregasAbierto(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar */}
      <Dialog open={dialogEditarAbierto} onOpenChange={(open) => { if (guardandoEdicion) return; setDialogEditarAbierto(open); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
            <DialogDescription>Modifica los detalles de la tarea</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="edit-titulo">Título</Label>
              <Input
                id="edit-titulo"
                value={tituloEdit}
                onChange={(e) => setTituloEdit(e.target.value)}
                className="rounded-lg"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-descripcion">Instrucciones</Label>
              <Textarea
                id="edit-descripcion"
                value={descripcionEdit}
                onChange={(e) => setDescripcionEdit(e.target.value)}
                rows={4}
                className="rounded-lg resize-none"
                maxLength={2000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fecha">Fecha de entrega</Label>
              <Input
                id="edit-fecha"
                type="date"
                value={fechaEntregaEdit}
                onChange={(e) => setFechaEntregaEdit(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-[#6B7280]" />
                Archivos adjuntos <span className="text-[#9CA3AF] font-normal">(opcional)</span>
              </Label>
              <p className="text-xs text-[#6B7280]">PDF, Word, imágenes (jpg, png, gif, webp)</p>

              {archivosExistentesEdit.length > 0 && (
                <div className="space-y-2">
                  <Label>Archivos actuales</Label>
                  <div className="space-y-1">
                    {archivosExistentesEdit.map((path) => (
                      <div key={path} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-[#E5E7EB]">
                        <div className="flex items-center gap-2 text-sm text-[#111827] min-w-0">
                          <FileText className="h-4 w-4 text-[#6B7280] shrink-0" />
                          <span className="truncate">{nombreArchivo(path)}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-[#6B7280] hover:text-[#E11D48] shrink-0"
                          onClick={() => setArchivosExistentesEdit(prev => prev.filter(a => a !== path))}
                          title="Quitar adjunto"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <input
                ref={archivoEditRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                onChange={(e) => setArchivosEdit(Array.from(e.target.files ?? []))}
                className="block w-full text-sm text-[#6B7280] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-[#F3F4F6] file:text-[#374151] hover:file:bg-[#E5E7EB] cursor-pointer"
              />
              {archivosEdit.length > 0 && (
                <ul className="text-xs text-[#6B7280] space-y-1 mt-1">
                  {archivosEdit.map((f, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />{f.name}
                      <button type="button" onClick={() => setArchivosEdit(prev => prev.filter((_, j) => j !== i))} className="ml-auto text-[#E11D48]"><X className="h-3 w-3" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" disabled={guardandoEdicion} onClick={() => setDialogEditarAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarEdicion} disabled={guardandoEdicion} className="bg-[#1D4ED8] hover:bg-[#1E40AF]">
              {guardandoEdicion ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent inline-block" />
                  Guardando…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar */}
      <Dialog open={dialogEliminarAbierto} onOpenChange={setDialogEliminarAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" disabled={eliminandoTarea} onClick={() => setDialogEliminarAbierto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmarEliminar}
              disabled={eliminandoTarea}
              className="bg-[#E11D48] hover:bg-[#BE123C]"
            >
              {eliminandoTarea ? (
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent inline-block" />
              ) : null}
              Eliminar Tarea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
