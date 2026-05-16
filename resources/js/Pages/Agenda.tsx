import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, CalendarDays, Clock, Edit2, Trash2, ChevronDown, Sun, Loader2 } from "lucide-react";
import { useSubmit } from "../hooks/useSubmit";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../Components/ui/dialog";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Textarea } from "../Components/ui/textarea";
import { Checkbox } from "../Components/ui/checkbox";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../Components/ui/alert-dialog";
import { PageTitle } from "../Layouts/PageTitle";

interface AgendaProps {
  permissions: string[];
}

interface Evento {
  id: number;
  fecha: string;
  fechaFin?: string;
  titulo: string;
  descripcion?: string;
  horaInicio?: string;
  horaFin?: string;
  tipo: string;
  grupoId?: number | null;
  grupoNombre?: string | null;
  materiaId?: number | null;
  materiaNombre?: string | null;
  destinatarios: string[];
}


const tipoColors: Record<string, string> = {
  // Exámenes — gestionados desde página de profesor, solo se muestran
  Examen: "bg-[#FEE2E2] text-[#E11D48] border-[#FCA5A5]",
  Parcial: "bg-[#FEE2E2] text-[#E11D48] border-[#FCA5A5]",
  Final: "bg-orange-100 text-orange-700 border-orange-300",
  Extraordinario: "bg-yellow-100 text-yellow-700 border-yellow-300",
  // Tipos gestionables desde agenda
  Junta: "bg-[#F3E8FF] text-[#7C3AED] border-[#C4B5FD]",
  Suspensión: "bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]",
  "Día Cívico / Festivo": "bg-[#ECFDF5] text-[#059669] border-[#6EE7B7]",
  "Actividad Cultural": "bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD]",
  "Actividad Deportiva": "bg-orange-100 text-orange-700 border-orange-300",
  Campaña: "bg-[#F3E8FF] text-[#7C3AED] border-[#C4B5FD]",
  Concurso: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Convocatoria: "bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD]",
  Plática: "bg-teal-100 text-teal-700 border-teal-300",
};

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

interface EventoItemProps {
  evento: Evento;
  formatearRango: (evento: Evento) => string;
  tipoColors: Record<string, string>;
  pasado?: boolean;
  onClick: () => void;
}

function EventoItem({ evento, formatearRango, tipoColors, pasado = false, onClick }: EventoItemProps) {
  const esMultiDia = evento.fechaFin && evento.fechaFin !== evento.fecha;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all hover:shadow-sm ${
        pasado ? "opacity-60 bg-gray-50 border-gray-200" : "bg-white border-[#E5E7EB] hover:border-blue-200 hover:bg-blue-50/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm truncate ${pasado ? "text-[#6B7280]" : "text-[#111827]"}`}>
            {evento.titulo}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-[#6B7280]">
            <span>
              <CalendarIcon className="h-3 w-3 inline mr-0.5" />
              {formatearRango(evento)}
              {esMultiDia && <span className="ml-1 text-[#7C3AED] font-medium">(varios días)</span>}
            </span>
            {!esMultiDia && evento.horaInicio && (
              <span>
                <Clock className="h-3 w-3 inline mr-0.5" />
                {evento.horaInicio}{evento.horaFin && ` - ${evento.horaFin}`}
              </span>
            )}
          </div>
          {(evento.grupoNombre) || (evento.materiaNombre) ? (
            <div className="flex items-center gap-2 mt-1 text-xs text-[#6B7280]">
              {evento.grupoNombre && (
                <span className="rounded bg-purple-50 px-1.5 py-0.5 font-medium text-[#7C3AED]">{evento.grupoNombre}</span>
              )}
              {evento.materiaNombre && (
                <span>{evento.materiaNombre}</span>
              )}
            </div>
          ) : null}
        </div>
        <Badge className={`${tipoColors[evento.tipo] ?? ""} text-xs shrink-0`}>
          {evento.tipo}
        </Badge>
      </div>
    </button>
  );
}

const diasSemana = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];
const ROLES_DESTINATARIOS = ["Tutor", "Profesor", "Trabajador Social"];

export function Agenda({ permissions }: AgendaProps) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [filterDestinatario, setFilterDestinatario] = useState<string>("todos");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventoDetalleOpen, setEventoDetalleOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [eventoEliminar, setEventoEliminar] = useState<number | null>(null);
  const [guardandoEvento, submitEvento] = useSubmit();
  const [eliminandoEvento, setEliminandoEvento] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<"calendario" | "lista">("lista");
  const [fechaFiltro, setFechaFiltro] = useState<string | null>(null);
  const [mostrarPasados, setMostrarPasados] = useState(false);
  
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    fechaFin: "",
    horaInicio: "",
    horaFin: "",
    tipo: "",
    destinatarios: [] as string[],
  });

  const puedeCrearEventos = permissions.includes("agenda.manage");

  const cargarEventos = async () => {
    try {
      const { data } = await axios.get<{ eventos: Evento[] }>("/api/agenda/eventos");
      setEventos(data.eventos || []);
    } catch (error) {
      toast.error("No se pudieron cargar los eventos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarEventos();
  }, []);

  // Funciones del calendario
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEventosDelDia = (dia: number) => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return eventos.filter(e => e.fecha <= dateStr && (e.fechaFin ? e.fechaFin >= dateStr : e.fecha === dateStr));
  };

  const seleccionarDia = (dia: number) => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    setFechaFiltro(dateStr);
    setViewMode("lista");
  };

  const cambiarMes = (direction: number) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1));
  };

  const handleCrearEvento = () => {
    if (!nuevoEvento.titulo || !nuevoEvento.fecha || !nuevoEvento.tipo) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }
    if (nuevoEvento.destinatarios.length === 0) {
      toast.error("Selecciona al menos un destinatario");
      return;
    }

    const payload = {
      fecha: nuevoEvento.fecha,
      fechaFin: nuevoEvento.fechaFin || undefined,
      titulo: nuevoEvento.titulo,
      descripcion: nuevoEvento.descripcion,
      horaInicio: nuevoEvento.horaInicio || undefined,
      horaFin: nuevoEvento.horaFin || undefined,
      tipo: nuevoEvento.tipo,
      destinatarios: nuevoEvento.destinatarios,
    };

    submitEvento(async () => {
      try {
        if (editMode && eventoSeleccionado) {
          await axios.put(`/api/agenda/eventos/${eventoSeleccionado.id}`, payload);
          toast.success("Evento actualizado exitosamente");
        } else {
          await axios.post("/api/agenda/eventos", payload);
          toast.success("Evento creado exitosamente");
        }

        await cargarEventos();
        setDialogOpen(false);
        setEditMode(false);
        setNuevoEvento({ titulo: "", descripcion: "", fecha: "", fechaFin: "", horaInicio: "", horaFin: "", tipo: "", destinatarios: [] });
      } catch (error: any) {
        if (error?.response?.status === 422) {
          const errors = error.response.data?.errors;
          if (errors) {
            const primer = Object.values(errors)[0] as string[];
            toast.error(primer[0]);
          } else {
            toast.error("Datos inválidos, revisa el formulario");
          }
        } else {
          toast.error("No se pudo guardar el evento");
        }
        throw error;
      }
    });
  };

  const handleEditarEvento = (evento: Evento) => {
    setNuevoEvento({
      titulo: evento.titulo,
      descripcion: evento.descripcion || "",
      fecha: evento.fecha,
      fechaFin: evento.fechaFin || "",
      horaInicio: evento.horaInicio || "",
      horaFin: evento.horaFin || "",
      tipo: evento.tipo,
      destinatarios: evento.destinatarios ?? [],
    });
    setEventoSeleccionado(evento);
    setEditMode(true);
    setDialogOpen(true);
    setEventoDetalleOpen(false);
  };

  const handleEliminarEvento = async (id: number) => {
    setEliminandoEvento(true);
    try {
      await axios.delete(`/api/agenda/eventos/${id}`);
      await cargarEventos();
      setEventoEliminar(null);
      setEventoDetalleOpen(false);
      toast.success("Evento eliminado exitosamente");
    } catch (error) {
      toast.error("No se pudo eliminar el evento");
    } finally {
      setEliminandoEvento(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageTitle
          icon={CalendarDays}
          title="Agenda Escolar"
          description="Calendario de eventos"
          color="bg-[#4F46E5]"
        ></PageTitle>
      </div>
    );
  }

  const eventosFiltrados = eventos
    .filter(e => filterTipo === "todos" || e.tipo === filterTipo)
    .filter(e => filterDestinatario === "todos" || e.destinatarios.includes(filterDestinatario))
    .filter(e => !fechaFiltro || (e.fecha <= fechaFiltro && (e.fechaFin ? e.fechaFin >= fechaFiltro : e.fecha === fechaFiltro)));

  const ordenar = (lista: Evento[]) =>
    [...lista].sort((a, b) => {
      const d = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      if (d !== 0) return d;
      return (a.horaInicio ?? "").localeCompare(b.horaInicio ?? "");
    });

  const hoyStr = new Date().toISOString().split("T")[0]!;

  // Un evento es "hoy" si está activo hoy (fecha <= hoy <= fechaFin)
  const eventosHoy      = ordenar(eventosFiltrados.filter(e => e.fecha <= hoyStr && (e.fechaFin ? e.fechaFin >= hoyStr : e.fecha === hoyStr)));
  // Próximo: aún no ha comenzado
  const eventosProximos = ordenar(eventosFiltrados.filter(e => e.fecha >  hoyStr));
  // Pasado: terminó antes de hoy
  const eventosPasados  = ordenar(eventosFiltrados.filter(e => (e.fechaFin ?? e.fecha) < hoyStr)).reverse();

  // Para el calendario y la vista móvil seguimos usando una lista plana
  const eventosOrdenados = ordenar(eventosFiltrados);

  const formatearFecha = (fecha: string) => {
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatearRango = (evento: Evento) => {
    if (!evento.fechaFin || evento.fechaFin === evento.fecha) return formatearFecha(evento.fecha);
    return `${formatearFecha(evento.fecha)} – ${formatearFecha(evento.fechaFin)}`;
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle
        icon={CalendarDays}
        title="Agenda Escolar"
        description="Calendario de eventos"
        color="bg-[#1D4ED8]"
      />

      {/* Controles superiores */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Filtro y vista */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-full sm:w-48 rounded-lg">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="Examen">Exámenes</SelectItem>
                  <SelectItem value="Junta">Juntas</SelectItem>
                  <SelectItem value="Suspensión">Suspensiones</SelectItem>
                  <SelectItem value="Día Cívico / Festivo">Días Cívicos / Festivos</SelectItem>
                  <SelectItem value="Actividad Cultural">Actividad Cultural</SelectItem>
                  <SelectItem value="Actividad Deportiva">Actividad Deportiva</SelectItem>
                  <SelectItem value="Campaña">Campaña</SelectItem>
                  <SelectItem value="Concurso">Concurso</SelectItem>
                  <SelectItem value="Convocatoria">Convocatoria</SelectItem>
                  <SelectItem value="Plática">Plática</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro destinatario — solo para quien gestiona */}
              {puedeCrearEventos && (
                <Select value={filterDestinatario} onValueChange={setFilterDestinatario}>
                  <SelectTrigger className="w-full sm:w-48 rounded-lg">
                    <SelectValue placeholder="Todos los destinatarios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los destinatarios</SelectItem>
                    {ROLES_DESTINATARIOS.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Toggle vista - Solo en móvil */}
              <div className="flex gap-2 sm:hidden">
                <Button
                  variant={viewMode === "lista" ? "default" : "outline"}
                  onClick={() => setViewMode("lista")}
                  className="flex-1"
                  size="sm"
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Lista
                </Button>
                <Button
                  variant={viewMode === "calendario" ? "default" : "outline"}
                  onClick={() => setViewMode("calendario")}
                  className="flex-1"
                  size="sm"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Mes
                </Button>
              </div>
            </div>

            {/* Botón crear evento */}
            {puedeCrearEventos && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto bg-[#1D4ED8] hover:bg-[#1E40AF]">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editMode ? "Editar Evento" : "Nuevo Evento"}</DialogTitle>
                    <DialogDescription>
                      {editMode ? "Actualiza la información del evento" : "Registra un nuevo evento en el calendario"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título *</Label>
                      <Input
                        id="titulo"
                        placeholder="Nombre del evento"
                        value={nuevoEvento.titulo}
                        onChange={(e) => setNuevoEvento({ ...nuevoEvento, titulo: e.target.value })}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo *</Label>
                      <Select
                        value={nuevoEvento.tipo}
                        onValueChange={(v) => setNuevoEvento({ ...nuevoEvento, tipo: v })}
                      >
                        <SelectTrigger id="tipo" className="rounded-lg">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Junta">Junta</SelectItem>
                          <SelectItem value="Suspensión">Suspensión</SelectItem>
                          <SelectItem value="Día Cívico / Festivo">Día Cívico / Festivo</SelectItem>
                          <SelectItem value="Actividad Cultural">Actividad Cultural</SelectItem>
                          <SelectItem value="Actividad Deportiva">Actividad Deportiva</SelectItem>
                          <SelectItem value="Campaña">Campaña</SelectItem>
                          <SelectItem value="Concurso">Concurso</SelectItem>
                          <SelectItem value="Convocatoria">Convocatoria</SelectItem>
                          <SelectItem value="Plática">Plática</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="fecha">Fecha inicio *</Label>
                        <Input
                          id="fecha"
                          type="date"
                          value={nuevoEvento.fecha}
                          onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha: e.target.value })}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fechaFin">Fecha fin</Label>
                        <Input
                          id="fechaFin"
                          type="date"
                          min={nuevoEvento.fecha || undefined}
                          value={nuevoEvento.fechaFin}
                          onChange={(e) => setNuevoEvento({ ...nuevoEvento, fechaFin: e.target.value })}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="horaInicio">Hora inicio</Label>
                        <Input
                          id="horaInicio"
                          type="time"
                          value={nuevoEvento.horaInicio}
                          onChange={(e) => setNuevoEvento({ ...nuevoEvento, horaInicio: e.target.value })}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="horaFin">Hora fin</Label>
                        <Input
                          id="horaFin"
                          type="time"
                          value={nuevoEvento.horaFin}
                          onChange={(e) => setNuevoEvento({ ...nuevoEvento, horaFin: e.target.value })}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Destinatarios *</Label>
                      <div className="grid grid-cols-1 gap-2 rounded-lg border p-3">
                        {ROLES_DESTINATARIOS.map((rol) => (
                          <label key={rol} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={nuevoEvento.destinatarios.includes(rol)}
                              onCheckedChange={(checked) => {
                                setNuevoEvento((prev) => ({
                                  ...prev,
                                  destinatarios: checked
                                    ? [...prev.destinatarios, rol]
                                    : prev.destinatarios.filter((d) => d !== rol),
                                }));
                              }}
                            />
                            {rol}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        placeholder="Detalles adicionales del evento..."
                        value={nuevoEvento.descripcion}
                        onChange={(e) => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })}
                        className="rounded-lg min-h-20"
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setDialogOpen(false);
                        setEditMode(false);
                        setNuevoEvento({
                          titulo: "",
                          descripcion: "",
                          fecha: "",
                          fechaFin: "",
                          horaInicio: "",
                          horaFin: "",
                          tipo: "",
                          destinatarios: [],
                        });
                      }} 
                      className="w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleCrearEvento} disabled={guardandoEvento} className="w-full sm:w-auto bg-[#1D4ED8] hover:bg-[#1E40AF]">
                      {guardandoEvento ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      {editMode ? "Actualizar" : "Crear"} evento
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vista Desktop/Tablet: Calendario + Lista lado a lado */}
      <div className="hidden sm:grid sm:grid-cols-1 lg:grid-cols-2 gap-6 lg:h-125">
        {/* Calendario mensual - Desktop/Tablet */}
        <Card className="border-[#E5E7EB] flex flex-col h-full overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {meses[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    cambiarMes(-1);
                    setFechaFiltro(null);
                  }}
                  className="rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDate(new Date());
                    setFechaFiltro(null);
                  }}
                  className="rounded-lg"
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    cambiarMes(1);
                    setFechaFiltro(null);
                  }}
                  className="rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Encabezados de días */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {diasSemana.map((dia) => (
                <div key={dia} className="text-center text-[10px] font-semibold text-[#6B7280] py-1">
                  {dia}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-1">
              {/* Espacios vacíos antes del primer día */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-14" />
              ))}

              {/* Días del mes */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dia = i + 1;
                const eventosDelDia = getEventosDelDia(dia);
                const esHoy =
                  selectedDate.getMonth() === new Date().getMonth() &&
                  selectedDate.getFullYear() === new Date().getFullYear() &&
                  dia === new Date().getDate();

                const badgeColor = esHoy ? "rgba(255,255,255,0.5)"
                  : eventosDelDia.some(e => ["Examen","Parcial","Final","Extraordinario"].includes(e.tipo)) ? "#E11D48"
                  : eventosDelDia.some(e => ["Junta","Campaña"].includes(e.tipo)) ? "#7C3AED"
                  : eventosDelDia.some(e => ["Suspensión","Actividad Deportiva","Concurso"].includes(e.tipo)) ? "#D97706"
                  : eventosDelDia.some(e => ["Día Cívico / Festivo","Actividad Cultural"].includes(e.tipo)) ? "#059669"
                  : "#1D4ED8";

                return (
                  <button
                    key={dia}
                    onClick={() => seleccionarDia(dia)}
                    className={`h-14 p-0.5 rounded-md text-xs transition-all hover:shadow-md ${
                      esHoy
                        ? "bg-linear-to-br from-[#1D4ED8] to-[#7C3AED] text-white font-bold"
                        : eventosDelDia.length > 0
                        ? "bg-blue-50 border border-blue-200 hover:bg-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full gap-0.5">
                      <span className={`text-[11px] leading-none ${esHoy ? "text-white" : "text-[#111827]"}`}>{dia}</span>
                      {eventosDelDia.length > 0 && (
                        <span
                          className="min-w-3.5 h-3.5 rounded-full text-[9px] font-bold flex items-center justify-center px-0.5 leading-none text-white"
                          style={{ backgroundColor: badgeColor }}
                        >
                          {eventosDelDia.length}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Panel derecho — hoy + próximos + pasados */}
        <Card className="border-[#E5E7EB] flex flex-col h-full overflow-hidden">
          <CardHeader className="shrink-0">
            <CardTitle>Eventos</CardTitle>
            <CardDescription>
              {fechaFiltro ? `Mostrando: ${formatearFecha(fechaFiltro)}` : `${eventosOrdenados.length} en total`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-4">

            {/* Banner — Hoy */}
            {eventosHoy.length > 0 && (
              <div className="rounded-xl bg-linear-to-br from-[#1D4ED8] to-[#7C3AED] p-3 text-white space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sun className="h-4 w-4" />
                  Hoy · {eventosHoy.length} evento{eventosHoy.length > 1 ? "s" : ""}
                </div>
                {eventosHoy.map(evento => (
                  <button
                    key={evento.id}
                    onClick={() => { setEventoSeleccionado(evento); setEventoDetalleOpen(true); }}
                    className="w-full text-left bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-all"
                  >
                    <p className="font-medium text-sm truncate">{evento.titulo}</p>
                    {evento.horaInicio && (
                      <p className="text-xs text-white/80">
                        <Clock className="h-3 w-3 inline mr-1" />{evento.horaInicio}{evento.horaFin && ` - ${evento.horaFin}`}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Próximos */}
            {eventosProximos.length > 0 ? (
              <div className="space-y-2">
                {!fechaFiltro && (
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                    Próximos
                  </p>
                )}
                {eventosProximos.map(evento => (
                  <EventoItem key={evento.id} evento={evento} formatearRango={formatearRango} tipoColors={tipoColors}
                    onClick={() => { setEventoSeleccionado(evento); setEventoDetalleOpen(true); }} />
                ))}
              </div>
            ) : (
              eventosHoy.length === 0 && (
                <div className="text-center py-8 text-[#6B7280]">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay eventos próximos</p>
                </div>
              )
            )}

            {/* Pasados — colapsables */}
            {eventosPasados.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setMostrarPasados(p => !p)}
                  className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wide hover:text-[#111827] transition-colors"
                >
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${mostrarPasados ? "rotate-180" : ""}`} />
                  Pasados ({eventosPasados.length})
                </button>
                {mostrarPasados && eventosPasados.map(evento => (
                  <EventoItem key={evento.id} evento={evento} formatearRango={formatearRango} tipoColors={tipoColors}
                    pasado onClick={() => { setEventoSeleccionado(evento); setEventoDetalleOpen(true); }} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vista Móvil */}
      <div className="sm:hidden space-y-4">
        {viewMode === "lista" ? (
          /* Lista de eventos - Móvil */
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle>Eventos</CardTitle>
              <CardDescription>
                {fechaFiltro ? `Mostrando: ${formatearFecha(fechaFiltro)}` : `${eventosOrdenados.length} en total`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Banner hoy - móvil */}
              {eventosHoy.length > 0 && (
                <div className="rounded-xl bg-linear-to-br from-[#1D4ED8] to-[#7C3AED] p-3 text-white space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Sun className="h-4 w-4" />
                    Hoy · {eventosHoy.length} evento{eventosHoy.length > 1 ? "s" : ""}
                  </div>
                  {eventosHoy.map(evento => (
                    <button
                      key={evento.id}
                      onClick={() => { setEventoSeleccionado(evento); setEventoDetalleOpen(true); }}
                      className="w-full text-left bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-all"
                    >
                      <p className="font-medium text-sm truncate">{evento.titulo}</p>
                      {evento.horaInicio && (
                        <p className="text-xs text-white/80">
                          <Clock className="h-3 w-3 inline mr-1" />{evento.horaInicio}{evento.horaFin && ` - ${evento.horaFin}`}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Próximos - móvil */}
              {eventosProximos.length > 0 ? (
                <div className="space-y-2">
                  {!fechaFiltro && (
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Próximos</p>
                  )}
                  {eventosProximos.map(evento => (
                    <EventoItem key={evento.id} evento={evento} formatearRango={formatearRango} tipoColors={tipoColors}
                      onClick={() => { setEventoSeleccionado(evento); setEventoDetalleOpen(true); }} />
                  ))}
                </div>
              ) : (
                eventosHoy.length === 0 && (
                  <div className="text-center py-8 text-[#6B7280]">
                    <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay eventos próximos</p>
                  </div>
                )
              )}

              {/* Pasados - móvil */}
              {eventosPasados.length > 0 && (
                <div className="space-y-2">
                  <button
                    onClick={() => setMostrarPasados(p => !p)}
                    className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wide hover:text-[#111827] transition-colors"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${mostrarPasados ? "rotate-180" : ""}`} />
                    Pasados ({eventosPasados.length})
                  </button>
                  {mostrarPasados && eventosPasados.map(evento => (
                    <EventoItem key={evento.id} evento={evento} formatearRango={formatearRango} tipoColors={tipoColors}
                      pasado onClick={() => { setEventoSeleccionado(evento); setEventoDetalleOpen(true); }} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Mini calendario - Móvil */
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {meses[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                    cambiarMes(-1);
                    setFechaFiltro(null);
                  }}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                    cambiarMes(1);
                    setFechaFiltro(null);
                  }}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Encabezados de días */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {diasSemana.map((dia) => (
                  <div key={dia} className="text-center text-[10px] font-semibold text-[#6B7280] py-1">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-1">
                {/* Espacios vacíos */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Días */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dia = i + 1;
                  const eventosDelDia = getEventosDelDia(dia);
                  const esHoy =
                    selectedDate.getMonth() === new Date().getMonth() &&
                    selectedDate.getFullYear() === new Date().getFullYear() &&
                    dia === new Date().getDate();

                  const badgeColor = esHoy ? "rgba(255,255,255,0.5)"
                    : eventosDelDia.some(e => ["Examen","Parcial","Final","Extraordinario"].includes(e.tipo)) ? "#E11D48"
                    : eventosDelDia.some(e => ["Junta","Campaña"].includes(e.tipo)) ? "#7C3AED"
                    : eventosDelDia.some(e => ["Suspensión","Actividad Deportiva","Concurso"].includes(e.tipo)) ? "#D97706"
                    : eventosDelDia.some(e => ["Día Cívico / Festivo","Actividad Cultural"].includes(e.tipo)) ? "#059669"
                    : "#1D4ED8";

                  return (
                    <button
                      key={dia}
                      onClick={() => seleccionarDia(dia)}
                      className={`aspect-square p-0.5 rounded-md text-xs transition-all ${
                        esHoy
                          ? "bg-linear-to-br from-[#1D4ED8] to-[#7C3AED] text-white font-bold"
                          : eventosDelDia.length > 0
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full gap-0.5">
                        <span className="text-[11px] leading-none">{dia}</span>
                        {eventosDelDia.length > 0 && (
                          <span
                            className="min-w-3.5 h-3.5 rounded-full text-[9px] font-bold flex items-center justify-center px-0.5 leading-none text-white"
                            style={{ backgroundColor: badgeColor }}
                          >
                            {eventosDelDia.length}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Eventos del mes - Lista debajo del calendario */}
              {eventosOrdenados.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <h4 className="text-sm font-semibold text-[#111827] mb-2">Eventos este mes</h4>
                  {eventosOrdenados.slice(0, 5).map((evento) => (
                    <button
                      key={evento.id}
                      onClick={() => {
                        setEventoSeleccionado(evento);
                        setEventoDetalleOpen(true);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#1D4ED8]">
                          {formatearFecha(evento.fecha).split('/')[0]}
                        </span>
                        <span className="text-sm font-medium text-[#111827] flex-1 truncate">
                          {evento.titulo}
                        </span>
                        <Badge className={tipoColors[evento.tipo] + " text-xs"}>
                          {evento.tipo}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Leyenda del calendario */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Referencias del calendario</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-linear-to-br from-[#1D4ED8] to-[#7C3AED] shrink-0" />
              <span className="text-xs text-[#374151]">Día actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-blue-50 border border-blue-200 shrink-0" />
              <span className="text-xs text-[#374151]">Día con eventos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#E11D48] shrink-0" />
              <span className="text-xs text-[#374151]">Exámenes (Parcial, Final, Extraordinario)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#7C3AED] shrink-0" />
              <span className="text-xs text-[#374151]">Juntas / Campañas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
              <span className="text-xs text-[#374151]">Suspensiones / Actividades Deportivas / Concursos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#059669] shrink-0" />
              <span className="text-xs text-[#374151]">Días Cívicos / Actividades Culturales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1D4ED8] shrink-0" />
              <span className="text-xs text-[#374151]">Convocatorias</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de detalle de evento */}
      {eventoSeleccionado && (
        <Dialog open={eventoDetalleOpen} onOpenChange={setEventoDetalleOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-[#1D4ED8]" />
                {eventoSeleccionado.titulo}
              </DialogTitle>
              <DialogDescription>Detalles del evento</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={tipoColors[eventoSeleccionado.tipo] ?? ""}>
                  {eventoSeleccionado.tipo}
                </Badge>
                {eventoSeleccionado.fechaFin && eventoSeleccionado.fechaFin !== eventoSeleccionado.fecha && (
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">Varios días</Badge>
                )}
              </div>

              {/* Fecha */}
              <div>
                <h4 className="font-semibold text-[#111827] mb-1">Fecha</h4>
                <div className="p-3 bg-gray-50 rounded-lg border border-[#E5E7EB] flex items-center gap-2 text-sm text-[#374151]">
                  <CalendarIcon className="h-4 w-4 text-[#1D4ED8] shrink-0" />
                  <span>{formatearRango(eventoSeleccionado)}</span>
                </div>
              </div>

              {/* Horario */}
              {(!eventoSeleccionado.fechaFin || eventoSeleccionado.fechaFin === eventoSeleccionado.fecha) && eventoSeleccionado.horaInicio && (
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Horario</h4>
                  <div className="p-3 bg-gray-50 rounded-lg border border-[#E5E7EB] flex items-center gap-2 text-sm text-[#374151]">
                    <Clock className="h-4 w-4 text-[#7C3AED] shrink-0" />
                    <span>
                      {eventoSeleccionado.horaInicio}
                      {eventoSeleccionado.horaFin && ` - ${eventoSeleccionado.horaFin}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Descripción */}
              {eventoSeleccionado.descripcion && (
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Descripción</h4>
                  <div className="p-4 bg-gray-50 rounded-lg border border-[#E5E7EB]">
                    <p className="text-sm text-[#374151] leading-relaxed">{eventoSeleccionado.descripcion}</p>
                  </div>
                </div>
              )}

              {/* Grupo y materia */}
              {(eventoSeleccionado.grupoNombre || eventoSeleccionado.materiaNombre) ? (
                <div className="flex flex-wrap gap-2">
                  {eventoSeleccionado.grupoNombre && (
                    <Badge className="bg-purple-50 text-[#7C3AED] border-purple-200">{eventoSeleccionado.grupoNombre}</Badge>
                  )}
                  {eventoSeleccionado.materiaNombre && (
                    <Badge variant="outline">{eventoSeleccionado.materiaNombre}</Badge>
                  )}
                </div>
              ) : null}

              {/* Dirigido a */}
              <div>
                <h4 className="font-semibold text-[#111827] mb-1">Dirigido a</h4>
                <div className="flex flex-wrap gap-2">
                  {(eventoSeleccionado.destinatarios ?? []).map((rol, index) => (
                    <Badge key={`${rol}-${index}`} variant="outline">{rol}</Badge>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              {puedeCrearEventos && (
                <div className="flex gap-2 pt-2 border-t border-[#E5E7EB]">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-lg"
                    onClick={() => handleEditarEvento(eventoSeleccionado)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar evento
                  </Button>
                  <Button
                    variant="outline"
                    className="text-[#E11D48] border-red-200 hover:bg-red-50 rounded-lg"
                    onClick={() => setEventoEliminar(eventoSeleccionado.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={!!eventoEliminar} onOpenChange={() => setEventoEliminar(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El evento será eliminado permanentemente del calendario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => eventoEliminar && handleEliminarEvento(eventoEliminar)}
              disabled={eliminandoEvento}
              className="bg-[#E11D48] hover:bg-[#BE123C]"
            >
              {eliminandoEvento ? <Loader2 className="h-4 w-4 mr-2 animate-spin inline" /> : null}Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
