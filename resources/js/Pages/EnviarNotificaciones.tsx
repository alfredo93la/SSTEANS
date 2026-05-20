import { useEffect, useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { Input } from "../Components/ui/input";
import { Textarea } from "../Components/ui/textarea";
import { Label } from "../Components/ui/label";
import {
  Bell, Send, Search, Filter, AlertCircle, CheckCircle,
  Clock, User, Loader2, Users, X, Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../Components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../Components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { PageTitle } from "../Layouts/PageTitle";
import { toast } from "sonner";

interface NotificacionEnviada {
  id: number;
  categoria: string;
  titulo: string;
  mensaje: string;
  destinatario: string;
  totalDestinatarios: number;
  leidasCount: number;
  alumno: string | null;
  fecha: string;
  estado: string;
  prioridad: string;
}

interface TutorDestinatario {
  userId: number;
  nombre: string;
}

interface DestinatarioSeleccionado {
  nombre: string;
  alumnoId?: number;
  alumnoNombre?: string;
  grupoId?: number;
}

interface AlumnoItem {
  id: number;
  nombre: string;
  grupo: string | null;
  grupoId: number | null;
  tutores: TutorDestinatario[];
}

interface GrupoItem {
  id: number;
  nombre: string;
  numAlumnos: number;
  tutores: TutorDestinatario[];
}

const CATEGORIAS_POR_ROL: Record<string, string[]> = {
  "Profesor": ["Académico", "Asistencia", "Conducta", "Citatorio", "Aviso"],
  "Trabajador Social": ["Asistencia", "Conducta", "Citatorio", "Administrativo", "Aviso", "Orientación"],
};

const TODAS_CATEGORIAS = ["Académico", "Asistencia", "Conducta", "Citatorio", "Administrativo", "Aviso", "Orientación"];

export function Notificaciones() {
  const { auth } = usePage().props as any;
  const rol: string = auth?.user?.role ?? "";
  const categoriasDisponibles = CATEGORIAS_POR_ROL[rol] ?? TODAS_CATEGORIAS;

  const [notificaciones, setNotificaciones] = useState<NotificacionEnviada[]>([]);
  const [alumnos, setAlumnos] = useState<AlumnoItem[]>([]);
  const [grupos, setGrupos] = useState<GrupoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todas");
  const [modalEnviar, setModalEnviar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [notifSeleccionada, setNotifSeleccionada] = useState<NotificacionEnviada | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState<NotificacionEnviada | null>(null);

  // Selector de destinatarios
  const [tabSelector, setTabSelector] = useState<"alumno" | "grupo">("alumno");
  const [busquedaAlumno, setBusquedaAlumno] = useState("");

  // Tutores seleccionados: Map userId → { nombre, alumnoId?, alumnoNombre? }
  const [seleccionados, setSeleccionados] = useState<Map<number, DestinatarioSeleccionado>>(new Map());

  // Form
  const [categoria, setCategoria] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    axios
      .get("/api/notificaciones/destinatarios")
      .then((res) => {
        setAlumnos(res.data.alumnos ?? []);
        setGrupos(res.data.grupos ?? []);
      })
      .catch(() => {});

    axios
      .get("/api/notificaciones/enviadas")
      .then((res) => setNotificaciones(res.data.notificaciones ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setSeleccionados(new Map());
    setBusquedaAlumno("");
    setCategoria("");
    setPrioridad("");
    setTitulo("");
    setMensaje("");
  };

  const addTutores = (
    tutores: TutorDestinatario[],
    alumnoId?: number,
    alumnoNombre?: string,
    grupoId?: number,
  ) => {
    setSeleccionados((prev) => {
      const next = new Map(prev);
      tutores.forEach((t) =>
        next.set(t.userId, { nombre: t.nombre, alumnoId, alumnoNombre, grupoId })
      );
      return next;
    });
  };

  const removeTutor = (userId: number) => {
    setSeleccionados((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  };

  const alumnosFiltrados = useMemo(() =>
    alumnos.filter((a) =>
      !busquedaAlumno ||
      a.nombre.toLowerCase().includes(busquedaAlumno.toLowerCase()) ||
      (a.grupo ?? "").toLowerCase().includes(busquedaAlumno.toLowerCase())
    ).sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
    [alumnos, busquedaAlumno]
  );

  const handleEnviar = () => {
    if (seleccionados.size === 0 || !categoria || !prioridad || !titulo || !mensaje) {
      toast.error("Completa todos los campos y selecciona al menos un destinatario.");
      return;
    }

    setEnviando(true);
    axios
      .post("/api/notificaciones", {
        destinatarios: Array.from(seleccionados.entries()).map(([userId, d]) => ({
          userId,
          alumnoId: d.alumnoId ?? null,
          grupoId: d.grupoId ?? null,
        })),
        titulo,
        mensaje,
        categoria,
        prioridad,
      })
      .then((res) => {
        toast.success(res.data.message ?? "Notificación enviada.");
        setModalEnviar(false);
        resetForm();
        return axios.get("/api/notificaciones/enviadas");
      })
      .then((res) => { if (res) setNotificaciones(res.data.notificaciones ?? []); })
      .catch(() => toast.error("Error al enviar la notificación."))
      .finally(() => setEnviando(false));
  };

  const eliminarNotificacion = async (notif: NotificacionEnviada) => {
    try {
      await axios.delete(`/api/notificaciones/${notif.id}`);
      toast.success("Notificación eliminada.");
      setConfirmarEliminar(null);
      setModalDetalle(false);
      setNotificaciones((prev) => prev.filter((n) => n.id !== notif.id));
    } catch {
      toast.error("No se pudo eliminar la notificación.");
    }
  };

  const notificacionesFiltradas = notificaciones.filter((n) => {
    const coincideBusqueda =
      !busqueda ||
      n.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.destinatario.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = filtroTipo === "todas" || n.categoria === filtroTipo;
    return coincideBusqueda && coincideCategoria;
  });

  const enviadas   = notificaciones.length;
  const leidas     = notificaciones.filter((n) => n.estado === "leída").length;
  const pendientes = notificaciones.filter((n) => n.estado !== "leída").length;

  const getBadgeColor = (prioridad: string) => {
    switch (prioridad) {
      case "Alta":  return "bg-orange-100 text-orange-700";
      case "Media": return "bg-yellow-100 text-yellow-700";
      case "Baja":  return "bg-green-100 text-green-700";
      default:      return "bg-gray-100 text-gray-700";
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "leída":   return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "enviada": return <Clock className="h-4 w-4 text-blue-600" />;
      default:        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={Send} title="Enviar Notificaciones" description="Gestiona las notificaciones enviadas a tutores" color="bg-[#7C3AED]">
        <Dialog open={modalEnviar} onOpenChange={(open) => { setModalEnviar(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Send className="h-4 w-4 mr-2" />
              Nueva Notificación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Enviar Notificación</DialogTitle>
              <DialogDescription>
                Busca por alumno o selecciona un grupo completo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">

              {/* ── Selector de destinatarios ── */}
              <div>
                <Label>Destinatarios</Label>

                {/* Tabs */}
                <div className="flex gap-1 mt-2 mb-3 bg-gray-100 rounded-lg p-1 w-fit">
                  <button
                    type="button"
                    onClick={() => setTabSelector("alumno")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      tabSelector === "alumno"
                        ? "bg-white text-[#1D4ED8] shadow-sm"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    Por alumno
                  </button>
                  <button
                    type="button"
                    onClick={() => setTabSelector("grupo")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      tabSelector === "grupo"
                        ? "bg-white text-[#1D4ED8] shadow-sm"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Por grupo
                  </button>
                </div>

                {/* Tab: Por alumno */}
                {tabSelector === "alumno" && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                      <Input
                        placeholder="Buscar alumno por nombre o grupo..."
                        value={busquedaAlumno}
                        onChange={(e) => setBusquedaAlumno(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="max-h-44 overflow-y-auto border border-[#E5E7EB] rounded-lg divide-y divide-[#F3F4F6]">
                      {alumnosFiltrados.length === 0 ? (
                        <p className="text-sm text-[#6B7280] text-center py-4">Sin resultados</p>
                      ) : (
                        alumnosFiltrados.map((alumno) => (
                          <div
                            key={alumno.id}
                            className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                          >
                            <div>
                              <p className="text-sm font-medium text-[#111827]">{alumno.nombre}</p>
                              <p className="text-xs text-[#6B7280]">
                                {alumno.grupo ?? "Sin grupo"} ·{" "}
                                {alumno.tutores.map((t) => t.nombre).join(", ")}
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => addTutores(alumno.tutores, alumno.id, alumno.nombre)}
                            >
                              Agregar tutor
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Por grupo */}
                {tabSelector === "grupo" && (
                  <div className="max-h-44 overflow-y-auto border border-[#E5E7EB] rounded-lg divide-y divide-[#F3F4F6]">
                    {grupos.length === 0 ? (
                      <p className="text-sm text-[#6B7280] text-center py-4">Sin grupos con tutores registrados</p>
                    ) : (
                      grupos.map((grupo) => (
                        <div
                          key={grupo.id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                        >
                          <div>
                            <p className="text-sm font-medium text-[#111827]">{grupo.nombre}</p>
                            <p className="text-xs text-[#6B7280]">
                              {grupo.numAlumnos} alumno(s) · {grupo.tutores.length} tutor(es)
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => addTutores(grupo.tutores, undefined, undefined, grupo.id)}
                          >
                            Agregar todos
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Chips de seleccionados */}
                {seleccionados.size > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-[#6B7280] mb-2">
                      {seleccionados.size} tutor(es) seleccionado(s):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(seleccionados.entries()).map(([userId, dest]) => (
                        <span
                          key={userId}
                          className="inline-flex items-center gap-1 bg-blue-100 text-[#1D4ED8] text-xs font-medium px-2 py-1 rounded-full"
                        >
                          {dest.nombre}
                          {dest.alumnoNombre && (
                            <span className="text-[#6B7280] font-normal">
                              · {dest.alumnoNombre}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeTutor(userId)}
                            className="hover:text-red-500 transition-colors ml-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Campos del mensaje ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriasDisponibles.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridad</Label>
                  <Select value={prioridad} onValueChange={setPrioridad}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="asunto">Asunto</Label>
                <Input
                  id="asunto"
                  className="mt-1"
                  placeholder="Escribe el asunto de la notificación"
                  maxLength={255}
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="mensaje">Mensaje</Label>
                <Textarea
                  id="mensaje"
                  className="mt-1"
                  placeholder="Escribe el contenido de la notificación"
                  rows={4}
                  maxLength={2000}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setModalEnviar(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button
                  className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]"
                  onClick={handleEnviar}
                  disabled={enviando}
                >
                  {enviando
                    ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    : <Send className="h-4 w-4 mr-2" />}
                  Enviar Notificación
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageTitle>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Send className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Enviadas</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{enviadas}</p>
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
                <p className="text-sm text-[#6B7280]">Leídas</p>
                <p className="text-2xl font-bold text-[#059669]">{leidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <AlertCircle className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">No leídas</p>
                <p className="text-2xl font-bold text-[#D97706]">{pendientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Buscar por asunto, destinatario..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="Académico">Académico</SelectItem>
                <SelectItem value="Asistencia">Asistencia</SelectItem>
                <SelectItem value="Conducta">Conducta</SelectItem>
                <SelectItem value="Citatorio">Citatorio</SelectItem>
                <SelectItem value="Administrativo">Administrativo</SelectItem>
                <SelectItem value="Aviso">Aviso</SelectItem>
                <SelectItem value="Orientación">Orientación</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Historial de Notificaciones</CardTitle>
          <CardDescription>Últimas notificaciones enviadas</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B7280]" />
            </div>
          ) : notificacionesFiltradas.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
              <p className="text-[#6B7280]">No hay notificaciones enviadas aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notificacionesFiltradas.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all cursor-pointer"
                  onClick={() => { setNotifSeleccionada(notif); setModalDetalle(true); }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getEstadoIcon(notif.estado)}
                        <h4 className="font-semibold text-[#111827]">{notif.titulo}</h4>
                        <Badge className={getBadgeColor(notif.prioridad)}>
                          {notif.prioridad}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#6B7280] mb-2 line-clamp-2">{notif.mensaje}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{notif.destinatario}</span>
                        </div>
                        {notif.alumno && notif.totalDestinatarios === 1 && (
                          <span className="bg-blue-50 text-[#1D4ED8] px-1.5 py-0.5 rounded font-medium">
                            Alumno: {notif.alumno}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <Bell className="h-3 w-3" />
                          <span>{notif.categoria}</span>
                        </div>
                        <span>{notif.fecha}</span>
                        {notif.totalDestinatarios > 1 && (
                          <span className="text-[#6B7280]">
                            · {notif.leidasCount}/{notif.totalDestinatarios} leídas
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={notif.estado === "leída"
                          ? "text-green-600 border-green-300"
                          : "text-blue-600 border-blue-300"}
                      >
                        {notif.estado}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:text-red-600 hover:bg-red-50"
                        title="Eliminar notificación"
                        onClick={(e) => { e.stopPropagation(); setConfirmarEliminar(notif); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmarEliminar} onOpenChange={(open) => { if (!open) setConfirmarEliminar(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar notificación?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la notificación "<strong>{confirmarEliminar?.titulo}</strong>" para todos los destinatarios. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => { if (confirmarEliminar) eliminarNotificacion(confirmarEliminar); }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog detalle de notificación */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {notifSeleccionada && getEstadoIcon(notifSeleccionada.estado)}
              {notifSeleccionada?.titulo}
            </DialogTitle>
            <DialogDescription>Detalle de la notificación enviada</DialogDescription>
          </DialogHeader>
          {notifSeleccionada && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getBadgeColor(notifSeleccionada.prioridad)}>{notifSeleccionada.prioridad}</Badge>
                  <Badge variant="outline" className={notifSeleccionada.estado === "leída" ? "text-green-600 border-green-300" : "text-blue-600 border-blue-300"}>
                    {notifSeleccionada.estado}
                  </Badge>
                  <Badge variant="secondary">{notifSeleccionada.categoria}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => setConfirmarEliminar(notifSeleccionada)}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Eliminar
                </Button>
              </div>

              <div>
                <Label className="text-[#6B7280]">Mensaje</Label>
                <p className="mt-1 text-sm text-[#111827] whitespace-pre-wrap">{notifSeleccionada.mensaje}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#E5E7EB]">
                <div>
                  <Label className="text-[#6B7280]">Destinatario</Label>
                  <p className="mt-1 text-sm text-[#111827]">{notifSeleccionada.destinatario}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Fecha</Label>
                  <p className="mt-1 text-sm text-[#111827]">{notifSeleccionada.fecha}</p>
                </div>
                {notifSeleccionada.alumno && (
                  <div>
                    <Label className="text-[#6B7280]">Alumno</Label>
                    <p className="mt-1 text-sm text-[#111827]">{notifSeleccionada.alumno}</p>
                  </div>
                )}
                {notifSeleccionada.totalDestinatarios > 1 && (
                  <div>
                    <Label className="text-[#6B7280]">Lecturas</Label>
                    <p className="mt-1 text-sm text-[#111827]">{notifSeleccionada.leidasCount} / {notifSeleccionada.totalDestinatarios} leídas</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
