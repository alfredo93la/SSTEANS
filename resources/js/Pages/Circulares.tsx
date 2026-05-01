import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import { Textarea } from "../Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../Components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../Components/ui/alert-dialog";
import { Checkbox } from "../Components/ui/checkbox";
import { Switch } from "../Components/ui/switch";
import { FileText, Download, AlertCircle, Info, CheckCircle, Filter, Calendar, Tag, Plus, Edit, Trash2, Send, Eye, X, CalendarDays, TriangleAlert } from "lucide-react";
import { PageTitle } from "../Layouts/PageTitle";
import { ScrollText } from "lucide-react";
import { toast } from "sonner";

interface CircularesProps {
  permissions: string[];
}

interface EventoVinculado {
  id: number;
  fecha: string;
  fechaFin?: string;
  horaInicio?: string;
  horaFin?: string;
  tipo: string;
}

interface CircularItem {
  id: number;
  titulo: string;
  descripcion: string;
  fechaPublicacion: string;
  prioridad: string;
  categoria: string;
  destinatarios: string[];
  adjuntos: string[];
  publicadoPor: number | null;
  publicadoPorNombre: string;
  leida: boolean;
  evento: EventoVinculado | null;
}

const prioridadColors: Record<string, { bg: string; text: string; icon: any }> = {
  "Alta": { bg: "bg-[#FEE2E2]", text: "text-[#E11D48]", icon: AlertCircle },
  "Media": { bg: "bg-[#FEF3C7]", text: "text-[#D97706]", icon: Info },
  "Baja": { bg: "bg-[#DBEAFE]", text: "text-[#1D4ED8]", icon: CheckCircle },
};

const categoriaColors: Record<string, string> = {
  "Académico": "bg-[#DBEAFE] text-[#1D4ED8]",
  "Administrativo": "bg-[#F3E8FF] text-[#7C3AED]",
  "Becas y Apoyos": "bg-yellow-100 text-yellow-700",
  "Eventos y Actividades": "bg-[#ECFDF5] text-[#059669]",
  "Salud y Bienestar": "bg-pink-100 text-pink-700",
  "Seguridad y Convivencia": "bg-[#FEE2E2] text-[#E11D48]",
  "General": "bg-[#F3F4F6] text-[#6B7280]",
};

const ROLES_DESTINATARIOS = ["Tutor", "Profesor", "Trabajador Social"];

const TIPOS_EVENTO = ["Junta", "Suspensión", "Día Cívico / Festivo", "Actividad Cultural", "Actividad Deportiva", "Campaña", "Concurso", "Convocatoria"];

const circularVacia = {
  titulo: "",
  descripcion: "",
  categoria: "",
  prioridad: "",
  destinatarios: [] as string[],
};

const eventoVacio = {
  fecha: "",
  fechaFin: "",
  horaInicio: "",
  horaFin: "",
  tipo: "",
};

/** Extrae solo el nombre de archivo de una ruta tipo "circulares/abc123.pdf" */
function nombreArchivo(path: string): string {
  return path.split("/").pop() ?? path;
}

export function Circulares({ permissions }: CircularesProps) {
  const esPublicador = permissions.includes("circulares.manage");

  const [circulares, setCirculares] = useState<CircularItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [circularSeleccionada, setCircularSeleccionada] = useState<CircularItem | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");
  const [busqueda, setBusqueda] = useState("");

  // Estado del modal CRUD
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [circularEditandoId, setCircularEditandoId] = useState<number | null>(null);
  const [forma, setForma] = useState(circularVacia);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [adjuntosExistentes, setAdjuntosExistentes] = useState<string[]>([]);
  const archivoInputRef = useRef<HTMLInputElement>(null);

  // Estado del evento vinculado
  const [agregarAgenda, setAgregarAgenda] = useState(false);
  const [formaEvento, setFormaEvento] = useState(eventoVacio);

  // Estado de eliminar
  const [eliminarId, setEliminarId] = useState<number | null>(null);

  const cargarCirculares = async () => {
    try {
      const { data } = await axios.get<{ circulares: CircularItem[] }>("/api/circulares");
      setCirculares(data.circulares || []);
    } catch (error) {
      toast.error("No se pudieron cargar las circulares");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarCirculares();
  }, []);

  // Filtrar circulares
  const circularesFiltradas = circulares
    .filter(c => filtroCategoria === "todas" || c.categoria === filtroCategoria)
    .filter(c => filtroPrioridad === "todas" || c.prioridad === filtroPrioridad)
    .filter(c =>
      busqueda === "" ||
      c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );

  const circularesNoLeidas = circularesFiltradas.filter(c => !c.leida).length;

  const marcarComoLeida = async (id: number) => {
    setCirculares(prev => prev.map(c => c.id === id ? { ...c, leida: true } : c));
    try {
      await axios.patch(`/api/circulares/${id}/leer`);
    } catch {
      // No revertimos — no es crítico si falla
    }
  };

  // --- CRUD (solo PA) ---
  const resetDialog = () => {
    setForma(circularVacia);
    setArchivos([]);
    setAdjuntosExistentes([]);
    setAgregarAgenda(false);
    setFormaEvento(eventoVacio);
    if (archivoInputRef.current) archivoInputRef.current.value = "";
  };

  const abrirNueva = () => {
    resetDialog();
    setModoEdicion(false);
    setCircularEditandoId(null);
    setDialogOpen(true);
  };

  const abrirEditar = (circular: CircularItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setForma({
      titulo: circular.titulo,
      descripcion: circular.descripcion,
      categoria: circular.categoria,
      prioridad: circular.prioridad,
      destinatarios: [...circular.destinatarios],
    });
    setAdjuntosExistentes(circular.adjuntos ?? []);
    setArchivos([]);

    if (circular.evento) {
      setAgregarAgenda(true);
      setFormaEvento({
        fecha: circular.evento.fecha,
        fechaFin: circular.evento.fechaFin ?? "",
        horaInicio: circular.evento.horaInicio ?? "",
        horaFin: circular.evento.horaFin ?? "",
        tipo: circular.evento.tipo,
      });
    } else {
      setAgregarAgenda(false);
      setFormaEvento(eventoVacio);
    }

    setCircularEditandoId(circular.id);
    setModoEdicion(true);
    setDialogOpen(true);
  };

  const toggleDestinatario = (rol: string) => {
    setForma(prev => ({
      ...prev,
      destinatarios: prev.destinatarios.includes(rol)
        ? prev.destinatarios.filter(d => d !== rol)
        : [...prev.destinatarios, rol],
    }));
  };

  const handleGuardar = async () => {
    if (!forma.titulo || !forma.descripcion || !forma.categoria || !forma.prioridad) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }
    if (forma.destinatarios.length === 0) {
      toast.error("Selecciona al menos un destinatario");
      return;
    }
    if (agregarAgenda && (!formaEvento.fecha || !formaEvento.tipo)) {
      toast.error("Completa la fecha y el tipo de evento para agregarlo a la agenda");
      return;
    }

    const fd = new FormData();
    fd.append("titulo", forma.titulo);
    fd.append("descripcion", forma.descripcion);
    fd.append("categoria", forma.categoria);
    fd.append("prioridad", forma.prioridad);
    forma.destinatarios.forEach(d => fd.append("destinatarios[]", d));
    archivos.forEach(file => fd.append("archivos[]", file));

    if (agregarAgenda) {
      fd.append("eventoFecha", formaEvento.fecha);
      fd.append("eventoTipo", formaEvento.tipo);
      if (formaEvento.fechaFin) fd.append("eventoFechaFin", formaEvento.fechaFin);
      if (formaEvento.horaInicio) fd.append("eventoHoraInicio", formaEvento.horaInicio);
      if (formaEvento.horaFin) fd.append("eventoHoraFin", formaEvento.horaFin);
    }

    try {
      if (modoEdicion && circularEditandoId !== null) {
        adjuntosExistentes.forEach(adj => fd.append("adjuntosExistentes[]", adj));
        fd.append("_method", "PUT");
        await axios.post(`/api/circulares/${circularEditandoId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Circular actualizada exitosamente");
      } else {
        await axios.post("/api/circulares", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Circular publicada exitosamente");
      }

      await cargarCirculares();
      setDialogOpen(false);
      resetDialog();
    } catch (error) {
      toast.error("No se pudo guardar la circular");
    }
  };

  const handleEliminar = async () => {
    if (eliminarId !== null) {
      try {
        await axios.delete(`/api/circulares/${eliminarId}`);
        await cargarCirculares();
        toast.success("Circular eliminada exitosamente");
        setEliminarId(null);
      } catch (error) {
        toast.error("No se pudo eliminar la circular");
      }
    }
  };

  const categorias = ["Académico", "Administrativo", "Becas y Apoyos", "Eventos y Actividades", "Salud y Bienestar", "Seguridad y Convivencia", "General"];
  const prioridades = ["Alta", "Media", "Baja"];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageTitle
          icon={ScrollText}
          title="Circulares"
          description="Publica y administra las circulares oficiales de la institución"
          color="bg-[#1D4ED8]"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle
        icon={ScrollText}
        title="Circulares"
        description={
          esPublicador
            ? "Publica y administra las circulares oficiales de la institución"
            : "Información oficial y avisos de la escuela"
        }
        color="bg-[#1D4ED8]"
      >
        {esPublicador && (
          <Button
            className="bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg"
            onClick={abrirNueva}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Circular
          </Button>
        )}
      </PageTitle>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <ScrollText className="h-6 w-6 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">
                  {esPublicador ? "Circulares publicadas" : "Total de circulares"}
                </p>
                <p className="text-2xl font-bold text-[#7C3AED]">{circularesFiltradas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <AlertCircle className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">
                  {esPublicador ? "Pendientes de revisión" : "Sin leer"}
                </p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{circularesNoLeidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <TriangleAlert className="h-6 w-6 text-[#E11D48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Prioridad alta</p>
                <p className="text-2xl font-bold text-[#E11D48]">
                  {circularesFiltradas.filter(c => c.prioridad === "Alta").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Buscar</label>
              <Input
                placeholder="Buscar por título..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Categoría</label>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {categorias.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Prioridad</label>
              <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las prioridades</SelectItem>
                  {prioridades.map((pri) => <SelectItem key={pri} value={pri}>{pri}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => { setBusqueda(""); setFiltroCategoria("todas"); setFiltroPrioridad("todas"); }}
                className="w-full"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de circulares */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Historial de Circulares</CardTitle>
          <CardDescription>Últimas circulares publicadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {circularesFiltradas.length === 0 ? (
              <Card className="border-[#E5E7EB]">
                <CardContent className="py-12">
                  <div className="text-center text-[#6B7280]">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No se encontraron circulares con los filtros seleccionados</p>
                    {esPublicador && (
                      <Button className="mt-4 bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg" onClick={abrirNueva}>
                        <Plus className="h-4 w-4 mr-2" />
                        Publicar primera circular
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              circularesFiltradas.map((circular) => {
                const PrioridadIcon = prioridadColors[circular.prioridad].icon;

                return (
                  <Card
                    key={circular.id}
                    className={`border-[#E5E7EB] hover:shadow-md transition-all cursor-pointer ${!circular.leida && !esPublicador ? "border-l-4 border-l-[#1D4ED8]" : ""
                      }`}
                    onClick={() => {
                      setCircularSeleccionada(circular);
                      if (!esPublicador && !circular.leida) void marcarComoLeida(circular.id);
                    }}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Icono de prioridad */}
                        <div className="shrink-0">
                          <div className={`p-3 rounded-xl ${prioridadColors[circular.prioridad].bg}`}>
                            <PrioridadIcon className={`h-6 w-6 ${prioridadColors[circular.prioridad].text}`} />
                          </div>
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-[#111827] mb-1">
                                {circular.titulo}
                                {!circular.leida && !esPublicador && (
                                  <span className="ml-2 inline-block w-2 h-2 bg-[#1D4ED8] rounded-full" />
                                )}
                              </h3>
                              <p className="text-sm text-[#6B7280] line-clamp-2">{circular.descripcion}</p>
                            </div>

                            {/* Acciones para PA */}
                            {esPublicador && (
                              <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#6B7280] hover:text-[#111827] h-8 w-8 p-0"
                                  onClick={() => { setCircularSeleccionada(circular); }}
                                  title="Ver detalle"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#1D4ED8] hover:text-[#1E40AF] h-8 w-8 p-0"
                                  onClick={(e) => abrirEditar(circular, e)}
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#E11D48] hover:text-[#BE123C] h-8 w-8 p-0"
                                  onClick={(e) => { e.stopPropagation(); setEliminarId(circular.id); }}
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Metadatos */}
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <Badge className={categoriaColors[circular.categoria]}>
                              <Tag className="h-3 w-3 mr-1" />
                              {circular.categoria}
                            </Badge>
                            <Badge className={`${prioridadColors[circular.prioridad].bg} ${prioridadColors[circular.prioridad].text}`}>
                              Prioridad {circular.prioridad}
                            </Badge>
                            <div className="flex items-center text-xs text-[#6B7280] gap-1">
                              <Calendar className="h-3 w-3" />
                              {circular.fechaPublicacion}
                            </div>
                            {circular.adjuntos.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Download className="h-3 w-3 mr-1" />
                                {circular.adjuntos.length} adjunto{circular.adjuntos.length > 1 ? "s" : ""}
                              </Badge>
                            )}
                            {circular.evento && (
                              <Badge className="bg-[#ECFDF5] text-[#059669] text-xs">
                                <CalendarDays className="h-3 w-3 mr-1" />
                                En agenda · {circular.evento.fecha}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-[#6B7280]">
                              Publicado por: {circular.publicadoPorNombre || "Personal Administrativo"}
                            </p>
                            {esPublicador && (
                              <div className="flex flex-wrap gap-1">
                                {circular.destinatarios.map((dest, i) => (
                                  <Badge key={i} className="text-xs bg-gray-100 text-[#6B7280] border-0">
                                    {dest}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
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


      {/* Dialog detalle */}
      <Dialog open={!!circularSeleccionada} onOpenChange={() => setCircularSeleccionada(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#1D4ED8]" />
              {circularSeleccionada?.titulo}
            </DialogTitle>
            <DialogDescription>Detalles completos de la circular</DialogDescription>
          </DialogHeader>

          {circularSeleccionada && (
            <div className="space-y-4 mt-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={categoriaColors[circularSeleccionada.categoria]}>
                  <Tag className="h-3 w-3 mr-1" />
                  {circularSeleccionada.categoria}
                </Badge>
                <Badge className={`${prioridadColors[circularSeleccionada.prioridad].bg} ${prioridadColors[circularSeleccionada.prioridad].text}`}>
                  Prioridad: {circularSeleccionada.prioridad}
                </Badge>
                {circularSeleccionada.leida && (
                  <Badge className="bg-[#059669] text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Leída
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                {/* Publicado por */}
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Publicado por</h4>
                  <p className="text-sm text-[#6B7280]">
                    {circularSeleccionada.publicadoPorNombre || "Personal Administrativo"}
                  </p>
                </div>

                {/* Fecha */}
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Fecha de publicación</h4>
                  <p className="text-sm text-[#6B7280]">{circularSeleccionada.fechaPublicacion}</p>
                </div>

                {/* Descripción */}
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Descripción</h4>
                  <div className="p-4 bg-gray-50 rounded-lg border border-[#E5E7EB]">
                    <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-line">{circularSeleccionada.descripcion}</p>
                  </div>
                </div>

                {/* Evento vinculado */}
                {circularSeleccionada.evento && (
                  <div>
                    <h4 className="font-semibold text-[#111827] mb-1">Evento en agenda</h4>
                    <div className="p-3 bg-[#ECFDF5] rounded-lg border border-[#6EE7B7] flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-sm text-[#059669]">
                        <CalendarDays className="h-4 w-4 shrink-0" />
                        <span>{circularSeleccionada.evento.fecha}</span>
                      </div>
                      {circularSeleccionada.evento.horaInicio && (
                        <div className="text-sm text-[#059669]">
                          {circularSeleccionada.evento.horaInicio}
                          {circularSeleccionada.evento.horaFin && ` – ${circularSeleccionada.evento.horaFin}`}
                        </div>
                      )}
                      <Badge className="bg-white text-[#059669] border border-[#6EE7B7]">
                        {circularSeleccionada.evento.tipo}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Dirigido a */}
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Dirigido a</h4>
                  <div className="flex flex-wrap gap-2">
                    {circularSeleccionada.destinatarios.map((dest, index) => (
                      <Badge key={index} variant="outline">{dest}</Badge>
                    ))}
                  </div>
                </div>

                {/* Adjuntos */}
                {circularSeleccionada.adjuntos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#111827] mb-2">
                      Documentos adjuntos ({circularSeleccionada.adjuntos.length})
                    </h4>
                    <div className="space-y-2">
                      {circularSeleccionada.adjuntos.map((adjunto, index) => {
                        const nombre = nombreArchivo(adjunto);
                        const url = `/api/circulares/${circularSeleccionada.id}/adjuntos/${nombre}`;
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-[#E5E7EB]">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-50 rounded-lg">
                                <FileText className="h-4 w-4 text-[#E11D48]" />
                              </div>
                              <p className="text-sm font-medium text-[#111827] break-all">{nombre}</p>
                            </div>
                            <a href={url} download>
                              <Button size="sm" variant="outline" className="gap-2 shrink-0">
                                <Download className="h-4 w-4" />
                                Descargar
                              </Button>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Acciones PA */}
              {esPublicador && (
                <div className="flex gap-2 pt-2 border-t border-[#E5E7EB]">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-lg"
                    onClick={(e) => {
                      const c = circularSeleccionada;
                      setCircularSeleccionada(null);
                      abrirEditar(c, e as any);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar circular
                  </Button>
                  <Button
                    variant="outline"
                    className="text-[#E11D48] border-red-200 hover:bg-red-50 rounded-lg"
                    onClick={() => { const id = circularSeleccionada.id; setCircularSeleccionada(null); setEliminarId(id); }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog crear / editar circular (solo PA) */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetDialog(); }}>
        <DialogContent className="rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-[#1D4ED8]" />
              {modoEdicion ? "Editar Circular" : "Nueva Circular"}
            </DialogTitle>
            <DialogDescription>
              {modoEdicion
                ? "Modifica el contenido de la circular. Los cambios serán visibles para los destinatarios."
                : "Completa la información para publicar una nueva circular. Los campos marcados con * son obligatorios."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={forma.titulo}
                onChange={(e) => setForma({ ...forma, titulo: e.target.value })}
                placeholder="Ej. Calendario de Exámenes del Tercer Trimestre"
                className="rounded-lg"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                value={forma.descripcion}
                onChange={(e) => setForma({ ...forma, descripcion: e.target.value })}
                placeholder="Escribe el contenido de la circular..."
                className="rounded-lg min-h-30"
              />
            </div>

            {/* Categoría y prioridad en fila */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select value={forma.categoria} onValueChange={(v) => setForma({ ...forma, categoria: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder="Selecciona categoría" /></SelectTrigger>
                  <SelectContent>
                    {["Académico", "Administrativo", "Becas y Apoyos", "Eventos y Actividades", "Salud y Bienestar", "Seguridad y Convivencia", "General"].map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prioridad *</Label>
                <Select value={forma.prioridad} onValueChange={(v) => setForma({ ...forma, prioridad: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder="Selecciona prioridad" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Toggle: agregar a agenda */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-[#059669]" />
                <div>
                  <p className="text-sm font-medium text-[#111827]">Agregar a la agenda escolar</p>
                  <p className="text-xs text-[#6B7280]">Crea un evento en el calendario con los mismos destinatarios</p>
                </div>
              </div>
              <Switch
                checked={agregarAgenda}
                onCheckedChange={(v) => {
                  setAgregarAgenda(v);
                  if (!v) setFormaEvento(eventoVacio);
                }}
              />
            </div>

            {/* Campos del evento (solo si toggle activo) */}
            {agregarAgenda && (
              <div className="space-y-3 p-4 bg-[#ECFDF5] rounded-lg border border-[#6EE7B7]">
                <p className="text-xs font-medium text-[#059669]">Detalles del evento en agenda</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="eventoFecha">Fecha inicio *</Label>
                    <Input
                      id="eventoFecha"
                      type="date"
                      value={formaEvento.fecha}
                      onChange={(e) => setFormaEvento({ ...formaEvento, fecha: e.target.value })}
                      className="rounded-lg bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="eventoFechaFin">Fecha fin <span className="text-xs text-[#6B7280] font-normal">(opcional)</span></Label>
                    <Input
                      id="eventoFechaFin"
                      type="date"
                      value={formaEvento.fechaFin}
                      min={formaEvento.fecha}
                      onChange={(e) => setFormaEvento({ ...formaEvento, fechaFin: e.target.value })}
                      className="rounded-lg bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Tipo de evento *</Label>
                    <Select value={formaEvento.tipo} onValueChange={(v) => setFormaEvento({ ...formaEvento, tipo: v })}>
                      <SelectTrigger className="rounded-lg bg-white"><SelectValue placeholder="Selecciona tipo" /></SelectTrigger>
                      <SelectContent>
                        {TIPOS_EVENTO.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="eventoHoraInicio">Hora inicio</Label>
                    <Input
                      id="eventoHoraInicio"
                      type="time"
                      value={formaEvento.horaInicio}
                      onChange={(e) => setFormaEvento({ ...formaEvento, horaInicio: e.target.value })}
                      className="rounded-lg bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="eventoHoraFin">Hora fin</Label>
                    <Input
                      id="eventoHoraFin"
                      type="time"
                      value={formaEvento.horaFin}
                      onChange={(e) => setFormaEvento({ ...formaEvento, horaFin: e.target.value })}
                      className="rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Adjuntos existentes (solo en edición) */}
            {modoEdicion && adjuntosExistentes.length > 0 && (
              <div className="space-y-2">
                <Label>Archivos actuales</Label>
                <div className="space-y-1">
                  {adjuntosExistentes.map((adj) => (
                    <div key={adj} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-[#E5E7EB]">
                      <div className="flex items-center gap-2 text-sm text-[#111827] min-w-0">
                        <FileText className="h-4 w-4 text-[#E11D48] shrink-0" />
                        <span className="truncate">{nombreArchivo(adj)}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-[#6B7280] hover:text-[#E11D48] shrink-0"
                        onClick={() => setAdjuntosExistentes(prev => prev.filter(a => a !== adj))}
                        title="Quitar adjunto"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Archivo adjunto — nuevo(s) */}
            <div className="space-y-2">
              <Label htmlFor="archivo">
                {modoEdicion ? "Agregar archivos (.pdf, .doc, .docx)" : "Archivo adjunto (.pdf, .doc, .docx)"}
              </Label>
              <Input
                id="archivo"
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                ref={archivoInputRef}
                onChange={(e) => setArchivos(Array.from(e.target.files ?? []))}
                className="rounded-lg"
              />
              {archivos.length > 0 && (
                <p className="text-xs text-[#059669]">
                  {archivos.length} archivo{archivos.length > 1 ? "s" : ""} seleccionado{archivos.length > 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Destinatarios */}
            <div className="space-y-2">
              <Label>Destinatarios * <span className="text-xs text-[#6B7280] font-normal">(selecciona uno o más)</span></Label>
              <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-[#E5E7EB]">
                {ROLES_DESTINATARIOS.map((rol) => (
                  <label
                    key={rol}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <Checkbox
                      checked={forma.destinatarios.includes(rol)}
                      onCheckedChange={() => toggleDestinatario(rol)}
                      className="rounded"
                    />
                    <span className="text-sm text-[#111827]">{rol}</span>
                  </label>
                ))}
              </div>
              {forma.destinatarios.length > 0 && (
                <p className="text-xs text-[#059669]">
                  Se enviará a: {forma.destinatarios.join(", ")}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setDialogOpen(false); resetDialog(); }}
              className="rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              className="bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg"
            >
              <Send className="h-4 w-4 mr-2" />
              {modoEdicion ? "Guardar cambios" : "Publicar circular"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminar */}
      <AlertDialog open={eliminarId !== null} onOpenChange={(open) => { if (!open) setEliminarId(null); }}>
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Circular</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar esta circular? Dejará de ser visible para todos los destinatarios. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              className="bg-[#E11D48] hover:bg-[#BE123C] rounded-lg"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
