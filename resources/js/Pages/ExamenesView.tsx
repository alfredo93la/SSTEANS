import { useEffect, useState } from "react";
import { useSubmit } from "../hooks/useSubmit";
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
import { FileText, Clock, BookOpen, Plus, Search, Filter, Edit2, Trash2, ClipboardCheck, Loader2, CalendarIcon } from "lucide-react";
import { Calendar } from "../Components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../Components/ui/popover";
import { PageTitle } from "../Layouts/PageTitle";
import { AlumnoInfoCard } from "../Components/AlumnoInfoCard";
import { toast } from "sonner";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "../Components/ui/pagination";

const POR_PAGINA = 10;

interface ExamenData {
  id: number;
  titulo: string;
  descripcion: string;
  grupoId: number | null;
  grupoNombre: string | null;
  materiaId: number | null;
  materiaNombre: string | null;
  fecha: string;
  horaInicio: string | null;
  horaFin: string | null;
  tipo: string;
  destinatarios: string[];
}

interface ExamenesViewProps {
  permissions: string[];
  alumnoId?: number;
}

const TIPOS_EXAMEN = ["Parcial", "Final", "Extraordinario", "Examen"];

interface GrupoOption { id: number; nombre: string; }
interface HorarioClase { dia_semana: string; hora_inicio: string | null; hora_fin: string | null; }
interface MateriaOption { id: number; nombre: string; diasSemana: string[]; horarios: HorarioClase[]; }

// Mapeo JS getDay() → nombre del enum en BD
const JS_DIA_MAP: Record<number, string> = {
  1: "lunes", 2: "martes", 3: "miercoles", 4: "jueves", 5: "viernes",
};

const DIAS_ES: Record<string, string> = {
  lunes: "Lunes", martes: "Martes", miercoles: "Miércoles",
  jueves: "Jueves", viernes: "Viernes",
};

function formatFecha(fechaStr: string): string {
  const [y, m, d] = fechaStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const formaVacia = {
  titulo: "",
  grupoId: null as number | null,
  materiaId: null as number | null,
  tipo: "",
  fecha: "",
  horaInicio: "",
  horaFin: "",
  descripcion: "",
};

export function ExamenesView({ permissions, alumnoId }: ExamenesViewProps) {
  const puedeGestionar =
    permissions.includes("examenes.manage") ||
    permissions.includes("agenda.manage");

  const [examenes, setExamenes] = useState<ExamenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroMateria, setFiltroMateria] = useState<string>("Todas las materias");
  const [busqueda, setBusqueda] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [forma, setForma] = useState(formaVacia);
  const [eliminarId, setEliminarId] = useState<number | null>(null);
  const [guardando, submitGuardar] = useSubmit();
  const [eliminando, setEliminando] = useState(false);
  const [vistaExamenes, setVistaExamenes] = useState<"proximos" | "pasados">("proximos");
  const [pagina, setPagina] = useState(1);
  useEffect(() => { setPagina(1); }, [busqueda, filtroMateria, vistaExamenes]);
  const [examenSeleccionado, setExamenSeleccionado] = useState<ExamenData | null>(null);
  const [modalDetalle, setModalDetalle] = useState(false);

  // Opciones del formulario (grupos/materias asignados al profesor)
  const [grupos, setGrupos] = useState<GrupoOption[]>([]);
  const [materias, setMaterias] = useState<MateriaOption[]>([]);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [horariosClase, setHorariosClase] = useState<HorarioClase[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const cargarExamenes = async () => {
    try {
      const { data } = await axios.get<{ eventos: any[] }>("/api/agenda/eventos", {
        params: alumnoId ? { alumno_id: alumnoId } : undefined,
      });
      const soloExamenes = (data.eventos || []).filter((e) =>
        TIPOS_EXAMEN.includes(e.tipo)
      );
      setExamenes(
        soloExamenes.map((e) => ({
          id: e.id,
          titulo: e.titulo,
          descripcion: e.descripcion || "",
          grupoId: e.grupoId ?? null,
          grupoNombre: e.grupoNombre ?? null,
          materiaId: e.materiaId ?? null,
          materiaNombre: e.materiaNombre ?? null,
          fecha: e.fecha,
          horaInicio: e.horaInicio || null,
          horaFin: e.horaFin || null,
          tipo: e.tipo,
          destinatarios: e.destinatarios || [],
        }))
      );
    } catch {
      toast.error("No se pudieron cargar los exámenes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarExamenes();
  }, [alumnoId]);

  // Cargar grupos asignados al profesor cuando abre el dialog
  useEffect(() => {
    if (!dialogOpen || !puedeGestionar) return;
    axios
      .get<{ grupos: GrupoOption[] }>("/api/profesor/grupos")
      .then(({ data }) => {
        setGrupos(data.grupos ?? []);
      })
      .catch(() => toast.error("No se pudieron cargar los grupos"));
  }, [dialogOpen]);

  // Cargar materias del grupo seleccionado
  useEffect(() => {
    if (!forma.grupoId) {
      setMaterias([]);
      return;
    }
    setLoadingMaterias(true);
    axios
      .get<{ materias: MateriaOption[] }>(`/api/profesor/materias?grupo_id=${forma.grupoId}`)
      .then(({ data }) => {
        const lista = data.materias ?? [];
        setMaterias(lista);
      })
      .catch(() => toast.error("No se pudieron cargar las materias"))
      .finally(() => setLoadingMaterias(false));
  }, [forma.grupoId]);

  // Actualizar horarios cuando cambia la materia seleccionada
  useEffect(() => {
    if (!forma.materiaId) { setHorariosClase([]); return; }
    const m = materias.find((x) => x.id === forma.materiaId);
    setHorariosClase(m?.horarios ?? []);
  }, [forma.materiaId, materias]);

  const materiasUnicas = [
    "Todas las materias",
    ...new Set(examenes.map((e) => e.materiaNombre).filter(Boolean)),
  ] as string[];

  const hoy = new Date().toISOString().split("T")[0]!;

  const examenesFiltrados = examenes
    .filter((e) => vistaExamenes === "proximos" ? e.fecha >= hoy : e.fecha < hoy)
    .filter((e) => filtroMateria === "Todas las materias" || e.materiaNombre === filtroMateria)
    .filter(
      (e) =>
        busqueda === "" ||
        e.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        (e.materiaNombre ?? "").toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) =>
      vistaExamenes === "proximos"
        ? a.fecha.localeCompare(b.fecha)
        : b.fecha.localeCompare(a.fecha)
    );
  const totalPaginas = Math.ceil(examenesFiltrados.length / POR_PAGINA);
  const examenesPaginados = examenesFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const getBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "Parcial":
        return "bg-red-100 text-[#E11D48]";
      case "Final":
        return "bg-orange-100 text-orange-700";
      case "Extraordinario":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getMesAbrev = (fecha: string) => {
    const meses = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];
    const month = parseInt(fecha.split("-")[1] ?? "1") - 1;
    return meses[month] ?? "";
  };

  const getDia = (fecha: string) => fecha.split("-")[2] ?? "";

  const abrirNuevo = () => {
    setForma(formaVacia);
    setMaterias([]);
    setEditMode(false);
    setEditId(null);
    setDialogOpen(true);
  };

  const abrirEditar = (examen: ExamenData) => {
    setForma({
      titulo: examen.titulo,
      grupoId: examen.grupoId,
      materiaId: examen.materiaId,
      tipo: examen.tipo,
      fecha: examen.fecha,
      horaInicio: examen.horaInicio ?? "",
      horaFin: examen.horaFin ?? "",
      descripcion: examen.descripcion,
    });
    setMaterias([]);
    setEditId(examen.id);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleGuardar = () => {
    if (!forma.titulo.trim() || forma.titulo.trim().length < 3) {
      toast.error("El título debe tener al menos 3 caracteres."); return;
    }
    if (!forma.tipo || !forma.fecha || !forma.grupoId || !forma.materiaId) {
      toast.error("Completa todos los campos obligatorios."); return;
    }
    if (forma.horaInicio && forma.horaFin && forma.horaInicio >= forma.horaFin) {
      toast.error("La hora de fin debe ser mayor que la hora de inicio."); return;
    }
    const payload = {
      titulo: forma.titulo,
      tipo: forma.tipo,
      fecha: forma.fecha,
      materiaId: forma.materiaId,
      grupoId: forma.grupoId,
      horaInicio: forma.horaInicio || undefined,
      horaFin: forma.horaFin || undefined,
      descripcion: forma.descripcion || undefined,
      destinatarios: ["Tutor", "Profesor"],
    };
    submitGuardar(async () => {
      if (editMode && editId !== null) {
        await axios.put(`/api/agenda/eventos/${editId}`, payload);
        toast.success("Examen actualizado");
      } else {
        await axios.post("/api/agenda/eventos", payload);
        toast.success("Examen programado exitosamente");
      }
      await cargarExamenes();
      setDialogOpen(false);
      setForma(formaVacia);
    });
  };

  const handleEliminar = async () => {
    if (eliminarId === null) return;
    setEliminando(true);
    try {
      await axios.delete(`/api/agenda/eventos/${eliminarId}`);
      await cargarExamenes();
      toast.success("Examen eliminado");
      setEliminarId(null);
    } catch {
      toast.error("No se pudo eliminar el examen");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {alumnoId && <AlumnoInfoCard alumnoId={alumnoId} />}
      <PageTitle
        icon={ClipboardCheck}
        title="Exámenes Programados"
        description="Calendario de evaluaciones y fechas de exámenes"
        color="bg-[#E11D48]"
      >
        {puedeGestionar && (
          <Button
            onClick={abrirNuevo}
            className="gap-2 bg-[#E11D48] hover:bg-[#BE123C]"
          >
            <Plus className="h-4 w-4" />
            Programar Examen
          </Button>
        )}
      </PageTitle>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <FileText className="h-6 w-6 text-[#E11D48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total Exámenes</p>
                <p className="text-2xl font-bold text-[#E11D48]">
                  {examenesFiltrados.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                {vistaExamenes === "proximos" ? (
                  <>
                    <p className="text-sm text-[#6B7280]">Próximos 30 días</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {examenesFiltrados.filter((e) => {
                        const fecha = new Date(e.fecha + "T00:00:00");
                        const hoyDate = new Date();
                        hoyDate.setHours(0, 0, 0, 0);
                        const fin = new Date(hoyDate);
                        fin.setDate(hoyDate.getDate() + 30);
                        return fecha >= hoyDate && fecha <= fin;
                      }).length}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-[#6B7280]">Último mes</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {examenesFiltrados.filter((e) => {
                        const fecha = new Date(e.fecha + "T00:00:00");
                        const hace30 = new Date();
                        hace30.setDate(hace30.getDate() - 30);
                        return fecha >= hace30;
                      }).length}
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <BookOpen className="h-6 w-6 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Materias</p>
                <p className="text-2xl font-bold text-[#7C3AED]">
                  {materiasUnicas.length - 1}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-[#6B7280] mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input
                  type="text"
                  placeholder="Buscar por título, materia o descripción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9 rounded-lg"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#6B7280] block">Materia</label>
              <Select value={filtroMateria} onValueChange={setFiltroMateria}>
                <SelectTrigger className="rounded-lg w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {materiasUnicas.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#6B7280] block">Vista</label>
              <Select value={vistaExamenes} onValueChange={(v) => setVistaExamenes(v as "proximos" | "pasados")}>
                <SelectTrigger className="rounded-lg w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="proximos">Próximos</SelectItem>
                  <SelectItem value="pasados">Pasados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de exámenes */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Lista de Exámenes Programados</CardTitle>
          <CardDescription>Selecciona un examen para ver sus detalles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <Card className="border-[#E5E7EB]">
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-[#6B7280]">
                    Cargando exámenes...
                  </div>
                </CardContent>
              </Card>
            ) : examenesFiltrados.length > 0 ? (
              examenesPaginados.map((examen) => (
                <Card
                  key={examen.id}
                  className="border-[#E5E7EB] hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => { setExamenSeleccionado(examen); setModalDetalle(true); }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {/* Fecha */}
                      <div className="w-16 h-16 rounded-xl bg-linear-to-br from-red-100 to-red-200 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs text-[#E11D48]">
                          {getMesAbrev(examen.fecha)}
                        </span>
                        <span className="text-xl font-bold text-[#E11D48]">
                          {getDia(examen.fecha)}
                        </span>
                      </div>

                      {/* Detalles */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-[#111827] text-lg">
                                {examen.materiaNombre ?? examen.titulo}
                              </h3>
                              {examen.grupoNombre && (
                                <Badge variant="outline" className="text-xs">
                                  {examen.grupoNombre}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-[#6B7280]">{examen.titulo}</p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Badge
                              variant="secondary"
                              className={getBadgeColor(examen.tipo)}
                            >
                              {examen.tipo}
                            </Badge>
                            {puedeGestionar && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-[#1D4ED8] hover:text-[#1E40AF]"
                                  onClick={(e) => { e.stopPropagation(); abrirEditar(examen); }}
                                  title="Editar"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-[#E11D48] hover:text-[#BE123C]"
                                  onClick={(e) => { e.stopPropagation(); setEliminarId(examen.id); }}
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#6B7280]">
                          {examen.horaInicio && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {examen.horaInicio}
                                {examen.horaFin && ` - ${examen.horaFin}`}
                              </span>
                            </div>
                          )}
                          {examen.descripcion && (
                            <span className="truncate">{examen.descripcion}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-[#E5E7EB]">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-[#6B7280] mx-auto mb-3" />
                    <p className="text-[#6B7280]">No se encontraron exámenes</p>
                    <p className="text-sm text-[#9CA3AF] mt-1">
                      {busqueda
                        ? "Intenta con otros términos de búsqueda"
                        : vistaExamenes === "proximos"
                          ? "No hay exámenes programados próximamente"
                          : "No hay exámenes pasados registrados"}
                    </p>
                    {puedeGestionar && !busqueda && (
                      <Button
                        onClick={abrirNuevo}
                        className="mt-4 bg-[#E11D48] hover:bg-[#BE123C] gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Programar primer examen
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {totalPaginas > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-[#6B7280]">
              <span>Mostrando {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, examenesFiltrados.length)} de {examenesFiltrados.length}</span>
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


      {/* Dialog detalle */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-[#E11D48]" />
              {examenSeleccionado?.materiaNombre ?? examenSeleccionado?.titulo}
            </DialogTitle>
            <DialogDescription>Detalle del examen programado</DialogDescription>
          </DialogHeader>
          {examenSeleccionado && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={getBadgeColor(examenSeleccionado.tipo)}>{examenSeleccionado.tipo}</Badge>
                {examenSeleccionado.grupoNombre && (
                  <Badge variant="outline">{examenSeleccionado.grupoNombre}</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#6B7280]">Título</Label>
                  <p className="mt-1 text-sm text-[#111827]">{examenSeleccionado.titulo}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Materia</Label>
                  <p className="mt-1 text-sm text-[#111827]">{examenSeleccionado.materiaNombre ?? "—"}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Fecha</Label>
                  <p className="mt-1 text-sm text-[#111827]">{formatFecha(examenSeleccionado.fecha)}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Horario</Label>
                  <p className="mt-1 text-sm text-[#111827]">
                    {examenSeleccionado.horaInicio
                      ? `${examenSeleccionado.horaInicio}${examenSeleccionado.horaFin ? ` - ${examenSeleccionado.horaFin}` : ""}`
                      : "Sin horario"}
                  </p>
                </div>
              </div>

              {examenSeleccionado.descripcion && (
                <div>
                  <Label className="text-[#6B7280]">Descripción</Label>
                  <p className="mt-1 text-sm text-[#111827] whitespace-pre-wrap">{examenSeleccionado.descripcion}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4 border-t border-[#E5E7EB]">
                <Button variant="outline" onClick={() => setModalDetalle(false)}>Cerrar</Button>
                {puedeGestionar && (
                  <Button
                    className="bg-[#E11D48] hover:bg-[#BE123C]"
                    onClick={() => { setModalDetalle(false); abrirEditar(examenSeleccionado); }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog crear / editar */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setForma(formaVacia);
        }}
      >
        <DialogContent className="rounded-3xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#E11D48]" />
              {editMode ? "Editar Examen" : "Programar Examen"}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? "Actualiza la información del examen."
                : "Registra la fecha y detalles del examen."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={forma.titulo}
                onChange={(e) => setForma({ ...forma, titulo: e.target.value })}
                placeholder="Ej. Examen Parcial 1"
                className="rounded-lg"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label>Grupo *</Label>
              <Select
                value={forma.grupoId?.toString() ?? ""}
                onValueChange={(v) => {
                  const g = grupos.find((x) => x.id.toString() === v);
                  setForma({
                    ...forma,
                    grupoId: g?.id ?? null,
                    materiaId: null,
                  });
                }}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder={grupos.length === 0 ? "Cargando grupos..." : "Seleccionar grupo"} />
                </SelectTrigger>
                <SelectContent>
                  {grupos.map((g) => (
                    <SelectItem key={g.id} value={g.id.toString()}>
                      {g.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Materia *</Label>
              <Select
                value={forma.materiaId?.toString() ?? ""}
                onValueChange={(v) => {
                  const m = materias.find((x) => x.id.toString() === v);
                  setForma({ ...forma, materiaId: m?.id ?? null, fecha: "", horaInicio: "", horaFin: "" });
                }}
                disabled={!forma.grupoId}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue
                    placeholder={
                      !forma.grupoId
                        ? "Selecciona un grupo primero"
                        : loadingMaterias
                          ? "Cargando materias..."
                          : "Seleccionar materia"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {materias.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de examen *</Label>
              <Select
                value={forma.tipo}
                onValueChange={(v) => setForma({ ...forma, tipo: v })}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Parcial">Parcial</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                  <SelectItem value="Extraordinario">Extraordinario</SelectItem>
                  <SelectItem value="Examen">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={horariosClase.length === 0 && puedeGestionar && !!forma.materiaId}
                    className="w-full justify-start rounded-lg font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {forma.fecha ? formatFecha(forma.fecha) : <span className="text-muted-foreground">Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={forma.fecha ? new Date(forma.fecha + "T12:00:00") : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      const diaNombre = JS_DIA_MAP[date.getDay()];
                      const horario = horariosClase.find((h) => h.dia_semana === diaNombre);
                      const y = date.getFullYear();
                      const m = String(date.getMonth() + 1).padStart(2, "0");
                      const d = String(date.getDate()).padStart(2, "0");
                      setForma((prev) => ({
                        ...prev,
                        fecha: `${y}-${m}-${d}`,
                        horaInicio: horario?.hora_inicio ?? prev.horaInicio,
                        horaFin: horario?.hora_fin ?? prev.horaFin,
                      }));
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => {
                      if (horariosClase.length === 0) return false;
                      const diaNombre = JS_DIA_MAP[date.getDay()];
                      return !diaNombre || !horariosClase.some((h) => h.dia_semana === diaNombre);
                    }}
                    initialFocus
                  />
                  {horariosClase.length > 0 && (
                    <p className="px-3 pb-3 text-xs text-muted-foreground">
                      Días disponibles: {horariosClase.map((h) => DIAS_ES[h.dia_semana] ?? h.dia_semana).join(", ")}
                    </p>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horaInicio">Hora inicio</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={forma.horaInicio}
                  readOnly={horariosClase.length > 0}
                  onChange={(e) => { if (horariosClase.length === 0) setForma({ ...forma, horaInicio: e.target.value }); }}
                  className={`rounded-lg ${horariosClase.length > 0 ? "bg-muted cursor-not-allowed" : ""}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaFin">Hora fin</Label>
                <Input
                  id="horaFin"
                  type="time"
                  value={forma.horaFin}
                  readOnly={horariosClase.length > 0}
                  onChange={(e) => { if (horariosClase.length === 0) setForma({ ...forma, horaFin: e.target.value }); }}
                  className={`rounded-lg ${horariosClase.length > 0 ? "bg-muted cursor-not-allowed" : ""}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={forma.descripcion}
                onChange={(e) => setForma({ ...forma, descripcion: e.target.value })}
                placeholder="Temas a evaluar, instrucciones adicionales..."
                className="rounded-lg min-h-20"
                maxLength={2000}
              />
            </div>

          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setForma(formaVacia);
              }}
              className="rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              disabled={guardando}
              className="bg-[#E11D48] hover:bg-[#BE123C] rounded-lg"
            >
              {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : (editMode ? "Guardar cambios" : "Programar examen")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminar */}
      <AlertDialog
        open={eliminarId !== null}
        onOpenChange={(open) => {
          if (!open) setEliminarId(null);
        }}
      >
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Examen</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar este examen del calendario? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              disabled={eliminando}
              className="bg-[#E11D48] hover:bg-[#BE123C] rounded-lg"
            >
              {eliminando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
