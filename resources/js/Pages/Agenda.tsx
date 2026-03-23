import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../Components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../Components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { ResponsiveTable } from "../Components/ResponsiveTable";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin, Users, Edit2, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../Components/ui/dialog";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Textarea } from "../Components/ui/textarea";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../Components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../Components/ui/alert-dialog";
import { PageTitle } from "../Components/PageTitle";

interface AgendaProps {
  permissions: string[];
}

interface Evento {
  id: number;
  fecha: string;
  titulo: string;
  descripcion?: string;
  horaInicio?: string;
  horaFin?: string;
  grupo: string;
  materia: string;
  tipo: string;
}


const tipoColors: Record<string, string> = {
  Examen: "bg-[#FEE2E2] text-[#E11D48] border-[#FCA5A5]",
  Entrega: "bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD]",
  Junta: "bg-[#F3E8FF] text-[#7C3AED] border-[#C4B5FD]",
  Suspensión: "bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]",
  "Día Cívico": "bg-[#ECFDF5] text-[#059669] border-[#6EE7B7]"
};

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function Agenda({ permissions }: AgendaProps) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventoDetalleOpen, setEventoDetalleOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [eventoEliminar, setEventoEliminar] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<"calendario" | "lista">("lista");
  
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
    tipo: "",
    grupo: "",
    materia: ""
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
    return eventos.filter(e => e.fecha === dateStr);
  };

  const cambiarMes = (direction: number) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1));
  };

  const handleCrearEvento = async () => {
    if (!nuevoEvento.titulo || !nuevoEvento.fecha || !nuevoEvento.tipo) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    const payload = {
      fecha: nuevoEvento.fecha,
      titulo: nuevoEvento.titulo,
      descripcion: nuevoEvento.descripcion,
      horaInicio: nuevoEvento.horaInicio || undefined,
      horaFin: nuevoEvento.horaFin || undefined,
      grupo: nuevoEvento.grupo || "General",
      materia: nuevoEvento.materia || "-",
      tipo: nuevoEvento.tipo,
    };

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
      setNuevoEvento({
        titulo: "",
        descripcion: "",
        fecha: "",
        horaInicio: "",
        horaFin: "",
        tipo: "",
        grupo: "",
        materia: ""
      });
    } catch (error) {
      toast.error("No se pudo guardar el evento");
    }
  };

  const handleEditarEvento = (evento: Evento) => {
    setNuevoEvento({
      titulo: evento.titulo,
      descripcion: evento.descripcion || "",
      fecha: evento.fecha,
      horaInicio: evento.horaInicio || "",
      horaFin: evento.horaFin || "",
      tipo: evento.tipo,
      grupo: evento.grupo,
      materia: evento.materia
    });
    setEventoSeleccionado(evento);
    setEditMode(true);
    setDialogOpen(true);
    setEventoDetalleOpen(false);
  };

  const handleEliminarEvento = async (id: number) => {
    try {
      await axios.delete(`/api/agenda/eventos/${id}`);
      await cargarEventos();
      setEventoEliminar(null);
      setEventoDetalleOpen(false);
      toast.success("Evento eliminado exitosamente");
    } catch (error) {
      toast.error("No se pudo eliminar el evento");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageTitle
          icon={CalendarDays}
          title="Agenda Escolar"
          description="Calendario de eventos"
          color="bg-[#1D4ED8]"
        ></PageTitle>
      </div>
    );
  }

  const eventosFiltrados = filterTipo === "todos" 
    ? eventos 
    : eventos.filter(e => e.tipo === filterTipo);

  const eventosOrdenados = [...eventosFiltrados].sort((a, b) => {
    const dateCompare = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    if (dateCompare !== 0) return dateCompare;
    if (a.horaInicio && b.horaInicio) {
      return a.horaInicio.localeCompare(b.horaInicio);
    }
    return 0;
  });

  const formatearFecha = (fecha: string) => {
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle
        icon={CalendarDays}
        title="Agenda Escolar"
        description="Calendario de eventos"
        color="bg-[#1D4ED8]"
      ></PageTitle>

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
                  <SelectItem value="Entrega">Entregas</SelectItem>
                  <SelectItem value="Junta">Juntas</SelectItem>
                  <SelectItem value="Suspensión">Suspensiones</SelectItem>
                </SelectContent>
              </Select>

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
                          <SelectItem value="Examen">Examen</SelectItem>
                          <SelectItem value="Entrega">Entrega</SelectItem>
                          <SelectItem value="Junta">Junta</SelectItem>
                          <SelectItem value="Suspensión">Suspensión</SelectItem>
                          <SelectItem value="Día Cívico">Día Cívico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha">Fecha *</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={nuevoEvento.fecha}
                        onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha: e.target.value })}
                        className="rounded-lg"
                      />
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
                      <Label htmlFor="grupo">Grupo</Label>
                      <Input
                        id="grupo"
                        placeholder="Ej: 1°A, 2°B, General"
                        value={nuevoEvento.grupo}
                        onChange={(e) => setNuevoEvento({ ...nuevoEvento, grupo: e.target.value })}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="materia">Materia</Label>
                      <Input
                        id="materia"
                        placeholder="Nombre de la materia"
                        value={nuevoEvento.materia}
                        onChange={(e) => setNuevoEvento({ ...nuevoEvento, materia: e.target.value })}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        placeholder="Detalles adicionales del evento..."
                        value={nuevoEvento.descripcion}
                        onChange={(e) => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })}
                        className="rounded-lg min-h-[80px]"
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
                          horaInicio: "",
                          horaFin: "",
                          tipo: "",
                          grupo: "",
                          materia: ""
                        });
                      }} 
                      className="w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleCrearEvento} className="w-full sm:w-auto bg-[#1D4ED8] hover:bg-[#1E40AF]">
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
      <div className="hidden sm:grid sm:grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario mensual - Desktop/Tablet */}
        <Card className="border-[#E5E7EB] lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {meses[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cambiarMes(-1)}
                  className="rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                  className="rounded-lg"
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cambiarMes(1)}
                  className="rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Encabezados de días */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {diasSemana.map((dia) => (
                <div key={dia} className="text-center text-xs font-semibold text-[#6B7280] py-2">
                  {dia}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-2">
              {/* Espacios vacíos antes del primer día */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Días del mes */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dia = i + 1;
                const eventosDelDia = getEventosDelDia(dia);
                const esHoy = 
                  selectedDate.getMonth() === new Date().getMonth() &&
                  selectedDate.getFullYear() === new Date().getFullYear() &&
                  dia === new Date().getDate();

                return (
                  <button
                    key={dia}
                    onClick={() => {
                      const primerEvento = eventosDelDia[0];
                      if (primerEvento) {
                        setEventoSeleccionado(primerEvento);
                        setEventoDetalleOpen(true);
                      }
                    }}
                    className={`aspect-square p-2 rounded-lg text-sm transition-all hover:shadow-md ${
                      esHoy
                        ? "bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] text-white font-bold"
                        : eventosDelDia.length > 0
                        ? "bg-blue-50 border border-blue-200 hover:bg-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={esHoy ? "text-white" : "text-[#111827]"}>{dia}</span>
                      {eventosDelDia.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap justify-center">
                          {eventosDelDia.slice(0, 3).map((evento, idx) => (
                            <div
                              key={idx}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor: evento.tipo === "Examen" ? "#E11D48" :
                                  evento.tipo === "Entrega" ? "#1D4ED8" :
                                  evento.tipo === "Junta" ? "#7C3AED" :
                                  evento.tipo === "Suspensión" ? "#D97706" : "#059669"
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Lista de próximos eventos - Desktop/Tablet */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>{eventosOrdenados.length} eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {eventosOrdenados.slice(0, 10).map((evento) => (
                <button
                  key={evento.id}
                  onClick={() => {
                    setEventoSeleccionado(evento);
                    setEventoDetalleOpen(true);
                  }}
                  className="w-full text-left p-3 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center justify-center">
                      <span className="text-xs text-[#6B7280]">
                        {formatearFecha(evento.fecha).split('/')[1]}
                      </span>
                      <span className="text-lg font-bold text-[#1D4ED8]">
                        {formatearFecha(evento.fecha).split('/')[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#111827] truncate">{evento.titulo}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={tipoColors[evento.tipo] + " text-xs"}>
                          {evento.tipo}
                        </Badge>
                      </div>
                      {evento.horaInicio && (
                        <p className="text-xs text-[#6B7280] mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {evento.horaInicio}
                          {evento.horaFin && ` - ${evento.horaFin}`}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {eventosOrdenados.length === 0 && (
                <div className="text-center py-8 text-[#6B7280]">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay eventos próximos</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vista Móvil */}
      <div className="sm:hidden space-y-4">
        {viewMode === "lista" ? (
          /* Lista de eventos - Móvil */
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>{eventosOrdenados.length} eventos programados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveTable
                columns={[
                  { key: "titulo", label: "Evento" },
                  { key: "fecha", label: "Fecha" },
                  { key: "tipo", label: "Tipo" }
                ]}
                data={eventosOrdenados}
                renderRow={() => <></>}
                renderMobileCard={(evento) => (
                  <button
                    onClick={() => {
                      setEventoSeleccionado(evento);
                      setEventoDetalleOpen(true);
                    }}
                    className="w-full text-left space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#111827]">{evento.titulo}</h4>
                        <p className="text-sm text-[#6B7280] mt-1">{evento.grupo} • {evento.materia}</p>
                      </div>
                      <Badge className={tipoColors[evento.tipo]}>
                        {evento.tipo}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#6B7280] pt-2 border-t border-gray-100">
                      <span>
                        <CalendarIcon className="h-3 w-3 inline mr-1" />
                        {formatearFecha(evento.fecha)}
                      </span>
                      {evento.horaInicio && (
                        <span>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {evento.horaInicio}
                        </span>
                      )}
                    </div>
                  </button>
                )}
                emptyMessage="No hay eventos programados"
              />
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
                    onClick={() => cambiarMes(-1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cambiarMes(1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Encabezados de días */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {diasSemana.map((dia) => (
                  <div key={dia} className="text-center text-xs font-semibold text-[#6B7280] py-1">
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

                  return (
                    <button
                      key={dia}
                      onClick={() => {
                        const primerEvento = eventosDelDia[0];
                        if (primerEvento) {
                          setEventoSeleccionado(primerEvento);
                          setEventoDetalleOpen(true);
                        }
                      }}
                      className={`aspect-square p-1 rounded-lg text-xs transition-all ${
                        esHoy
                          ? "bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] text-white font-bold"
                          : eventosDelDia.length > 0
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span>{dia}</span>
                        {eventosDelDia.length > 0 && !esHoy && (
                          <div className="w-1 h-1 bg-[#1D4ED8] rounded-full mt-0.5" />
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

      {/* Sheet de detalle de evento */}
      {eventoSeleccionado && (
        <Sheet open={eventoDetalleOpen} onOpenChange={setEventoDetalleOpen}>
          <SheetContent className="w-full sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>{eventoSeleccionado.titulo}</SheetTitle>
              <SheetDescription>
                Tipo: {eventoSeleccionado.tipo}
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-4">
              <Badge className={tipoColors[eventoSeleccionado.tipo]}>
                {eventoSeleccionado.tipo}
              </Badge>
              
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-[#1D4ED8]" />
                  <span className="font-medium text-[#111827]">{formatearFecha(eventoSeleccionado.fecha)}</span>
                </div>
                {eventoSeleccionado.horaInicio && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-[#7C3AED]" />
                    <span className="text-[#6B7280]">
                      {eventoSeleccionado.horaInicio}
                      {eventoSeleccionado.horaFin && ` - ${eventoSeleccionado.horaFin}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-[#059669]" />
                  <span className="text-[#6B7280]">{eventoSeleccionado.grupo}</span>
                </div>
                {eventoSeleccionado.materia !== "-" && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-[#D97706]" />
                    <span className="text-[#6B7280]">{eventoSeleccionado.materia}</span>
                  </div>
                )}
              </div>

              {eventoSeleccionado.descripcion && (
                <div>
                  <Label className="text-sm text-[#6B7280]">Descripción</Label>
                  <p className="mt-2 p-3 bg-gray-50 rounded-lg text-[#111827]">
                    {eventoSeleccionado.descripcion}
                  </p>
                </div>
              )}

              {puedeCrearEventos && (
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEditarEvento(eventoSeleccionado)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-[#E11D48] hover:bg-red-50 hover:text-[#E11D48] border-red-200"
                    onClick={() => setEventoEliminar(eventoSeleccionado.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
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
              className="bg-[#E11D48] hover:bg-[#BE123C]"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
