import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../Components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../Components/ui/dialog";
import { PageTitle } from "../../Layouts/PageTitle";
import {
  User, ArrowLeft, Phone, Loader2, Users, GraduationCap,
  AlertTriangle, FileText, Calendar, AlertCircle, CheckCircle,
  Paperclip, History, Clock, BookOpen,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AlumnoDetalle {
  id: number;
  nombre: string;
  grupo_id: number | null;
  grupo_nombre: string | null;
  estado: string;
  estado_asignacion: string | null;
  tutor: string | null;
  tutor_parentesco: string | null;
  tutor_telefono: string | null;
}

interface CicloData { id: number; nombre: string; activo: boolean; cerrado: boolean; }
interface PeriodoData { id: number; nombre: string; }

interface RubroDetalle { nombre: string; ponderacion: number; valor: number | null; }
interface CalData {
  id: number;
  materia: string | null;
  promedio: number | null;
  rubros: RubroDetalle[];
}

interface ReporteData {
  id: number;
  tipoReporte: string;
  gravedad: "Baja" | "Media" | "Alta";
  descripcion: string;
  observaciones: string;
  archivoAdjunto: string | null;
  fecha: string;
  estatus: string;
  reportadoPorNombre: string;
}

interface PerfilAlumnoTSProps {
  alumnoId: number;
  onNavigate?: (route: string) => void;
}

// ─── Helpers visuales ─────────────────────────────────────────────────────────

function getTipoColor(tipo: string) {
  switch (tipo) {
    case "Disciplina": return "text-[#E11D48] bg-red-100";
    case "Material":   return "text-[#D97706] bg-amber-100";
    case "Asistencia": return "text-[#1D4ED8] bg-blue-100";
    default:           return "text-[#6B7280] bg-gray-100";
  }
}

function getGravedadBadge(gravedad: string) {
  switch (gravedad) {
    case "Alta":  return { className: "bg-[#E11D48] text-white", text: "Alta" };
    case "Media": return { className: "bg-[#D97706] text-white", text: "Media" };
    case "Baja":  return { className: "bg-[#059669] text-white", text: "Baja" };
    default:      return { className: "bg-[#6B7280] text-white", text: gravedad };
  }
}

function getEstatusBadge(estatus: string) {
  switch (estatus) {
    case "En seguimiento": return { className: "bg-[#D97706] text-white", text: "En seguimiento" };
    case "Cerrado":        return { className: "bg-[#059669] text-white", text: "Cerrado" };
    default:               return { className: "bg-[#6B7280] text-white", text: estatus };
  }
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function PerfilAlumnoTS({ alumnoId, onNavigate }: PerfilAlumnoTSProps) {
  // Ciclos
  const [ciclos, setCiclos] = useState<CicloData[]>([]);
  const [cicloSeleccionado, setCicloSeleccionado] = useState("");

  // Datos del alumno (recarga con el ciclo)
  const [alumno, setAlumno] = useState<AlumnoDetalle | null>(null);
  const [loadingAlumno, setLoadingAlumno] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Calificaciones
  const [periodos, setPeriodos] = useState<PeriodoData[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("");
  const [calificaciones, setCalificaciones] = useState<CalData[]>([]);
  const [materiasEnProceso, setMateriasEnProceso] = useState<string[]>([]);
  const [loadingCals, setLoadingCals] = useState(false);

  // Reportes
  const [reportes, setReportes] = useState<ReporteData[]>([]);
  const [loadingReportes, setLoadingReportes] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteData | null>(null);
  const [dialogAbierto, setDialogAbierto] = useState(false);

  // ── 1. Cargar ciclos y seleccionar el activo ──────────────────────────────
  useEffect(() => {
    axios.get("/api/ciclos-escolares")
      .then(({ data }) => {
        const lista: CicloData[] = data.ciclos ?? [];
        setCiclos(lista);
        const activo = lista.find((c) => c.activo);
        if (activo) setCicloSeleccionado(activo.id.toString());
        else if (lista.length > 0) setCicloSeleccionado(lista[0].id.toString());
      })
      .catch(() => {});
  }, []);

  // ── 2. Cuando cambia el ciclo: recargar alumno, periodos y reportes ───────
  useEffect(() => {
    if (!cicloSeleccionado) return;

    // Datos del alumno para este ciclo (grupo histórico)
    setLoadingAlumno(true);
    axios.get(`/api/trabajador-social/alumnos/${alumnoId}`, {
      params: { ciclo_id: cicloSeleccionado },
    })
      .then(({ data }) => {
        setAlumno(data.alumno ?? null);
        if (!data.alumno) setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingAlumno(false));

    // Periodos del ciclo
    setPeriodos([]);
    setPeriodoSeleccionado("");
    setCalificaciones([]);
    axios.get("/api/periodos/ciclo-activo", { params: { ciclo_id: cicloSeleccionado } })
      .then(({ data }) => {
        const lista: PeriodoData[] = data.periodos ?? [];
        setPeriodos(lista);
        if (lista.length > 0) setPeriodoSeleccionado(lista[0].id.toString());
      })
      .catch(() => {});

    // Reportes del ciclo
    setLoadingReportes(true);
    axios.get(`/api/trabajador-social/reportes-conducta/${alumnoId}`, {
      params: { ciclo_id: cicloSeleccionado },
    })
      .then(({ data }) => setReportes(data.reportes ?? []))
      .catch(() => {})
      .finally(() => setLoadingReportes(false));
  }, [alumnoId, cicloSeleccionado]);

  // ── 3. Cargar calificaciones cuando cambia el periodo ─────────────────────
  useEffect(() => {
    if (!alumnoId || !periodoSeleccionado || !cicloSeleccionado) return;
    setLoadingCals(true);
    axios.get(`/api/trabajador-social/calificaciones/${alumnoId}`, {
      params: { periodo_id: periodoSeleccionado, ciclo_id: cicloSeleccionado },
    })
      .then(({ data }) => {
        setCalificaciones(data.calificaciones ?? []);
        setMateriasEnProceso(data.materiasEnProceso ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingCals(false));
  }, [alumnoId, periodoSeleccionado, cicloSeleccionado]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const cicloActivo = ciclos.find((c) => c.activo);
  const esHistorico = cicloSeleccionado && cicloSeleccionado !== cicloActivo?.id.toString();
  const cicloNombreActual = ciclos.find((c) => c.id.toString() === cicloSeleccionado)?.nombre ?? "";

  const promedioGeneral = calificaciones.filter((c) => c.promedio !== null).length > 0
    ? calificaciones.filter((c) => c.promedio !== null)
        .reduce((sum, c) => sum + (c.promedio ?? 0), 0) /
      calificaciones.filter((c) => c.promedio !== null).length
    : null;

  const initials = (nombre: string) => {
    const parts = nombre.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (parts[0]?.[0] ?? "?").toUpperCase();
  };

  const nombreArchivo = (url: string) => url.split("/").pop() ?? "archivo";

  // ─────────────────────────────────────────────────────────────────────────

  if (notFound) {
    return (
      <Card className="border-[#E5E7EB]">
        <CardContent className="py-12 text-center text-[#6B7280]">
          Alumno no encontrado.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera: botón volver + selector de ciclo */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate?.("#/alumnos")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>

        <div className="flex items-center gap-2">
          {esHistorico ? (
            <Badge className="bg-amber-100 text-amber-700 border-0 gap-1">
              <History className="h-3 w-3" />
              Historial
            </Badge>
          ) : (
            <Badge className="bg-green-100 text-green-700 border-0">Ciclo actual</Badge>
          )}
          <Select value={cicloSeleccionado} onValueChange={setCicloSeleccionado}>
            <SelectTrigger className="rounded-lg w-44 h-8 text-sm">
              <SelectValue placeholder="Ciclo escolar" />
            </SelectTrigger>
            <SelectContent>
              {ciclos.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.nombre}{c.activo && " (actual)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <PageTitle
        icon={User}
        title="Perfil del Alumno"
        description="Información general, calificaciones y reportes de conducta"
        color="bg-[#1D4ED8]"
      />

      {/* Datos básicos — recarga con el ciclo */}
      {loadingAlumno ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-[#6B7280]" />
        </div>
      ) : alumno && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Datos del alumno */}
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-base">Datos del Alumno</CardTitle>
              {esHistorico && (
                <p className="text-xs text-[#D97706] flex items-center gap-1 mt-0.5">
                  <History className="h-3 w-3" />
                  Información del ciclo {cicloNombreActual}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-linear-to-br from-[#7C3AED] to-[#1D4ED8] rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {initials(alumno.nombre)}
                </div>
                <div>
                  <p className="font-semibold text-[#111827] text-lg">{alumno.nombre}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {/* Grupo del ciclo seleccionado */}
                    {alumno.grupo_nombre ? (
                      <Badge variant="outline" className="gap-1">
                        <BookOpen className="h-3 w-3" />
                        {alumno.grupo_nombre}
                      </Badge>
                    ) : (
                      esHistorico && (
                        <Badge variant="outline" className="text-[#9CA3AF]">
                          Sin grupo en este ciclo
                        </Badge>
                      )
                    )}
                    {/* Estado en la asignación de este ciclo */}
                    {alumno.estado_asignacion ? (
                      alumno.estado_asignacion === "activo" ? (
                        <Badge className="bg-green-100 text-green-700">Activo</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700 capitalize">
                          {alumno.estado_asignacion}
                        </Badge>
                      )
                    ) : (
                      !esHistorico && (
                        alumno.estado === "activo"
                          ? <Badge className="bg-green-100 text-green-700">Activo</Badge>
                          : <Badge className="bg-yellow-100 text-yellow-700 capitalize">{alumno.estado}</Badge>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datos del tutor */}
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-base">Tutor / Familiar</CardTitle>
            </CardHeader>
            <CardContent>
              {alumno.tutor ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-[#374151]">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-4 w-4 text-[#7C3AED]" />
                    </div>
                    <div>
                      <span>{alumno.tutor}</span>
                      {alumno.tutor_parentesco && (
                        <span className="ml-2 text-xs text-[#6B7280]">({alumno.tutor_parentesco})</span>
                      )}
                    </div>
                  </div>
                  {alumno.tutor_telefono && (
                    <div className="flex items-center gap-3 text-sm text-[#374151]">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Phone className="h-4 w-4 text-[#1D4ED8]" />
                      </div>
                      <span>{alumno.tutor_telefono}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#6B7280]">Sin tutor registrado.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs: Calificaciones / Reportes */}
      <Tabs defaultValue="calificaciones">
        <TabsList className="rounded-xl">
          <TabsTrigger value="calificaciones" className="rounded-lg gap-2">
            <GraduationCap className="h-4 w-4" />
            Calificaciones
          </TabsTrigger>
          <TabsTrigger value="reportes" className="rounded-lg gap-2">
            <AlertTriangle className="h-4 w-4" />
            Reportes
            {reportes.length > 0 && (
              <Badge className="ml-1 h-4 px-1.5 text-xs bg-[#E11D48] text-white border-0">
                {reportes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Calificaciones ──────────────────────────────────────── */}
        <TabsContent value="calificaciones" className="space-y-4 mt-4">
          {/* Selector de periodo */}
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={periodoSeleccionado}
              onValueChange={setPeriodoSeleccionado}
              disabled={periodos.length === 0}
            >
              <SelectTrigger className="rounded-lg w-52">
                <SelectValue placeholder={periodos.length === 0 ? "Sin periodos" : "Selecciona periodo"} />
              </SelectTrigger>
              <SelectContent>
                {periodos.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Aviso de historial */}
          {esHistorico && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <History className="h-5 w-5 text-[#D97706] shrink-0" />
                  <p className="text-sm text-[#92400E]">
                    Mostrando historial del ciclo <span className="font-semibold">{cicloNombreActual}</span>.
                    Este ciclo ya está cerrado.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumen promedio */}
          <Card className="border-[#E5E7EB]">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="shrink-0">
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-[#1D4ED8] to-[#7C3AED] flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">
                        {promedioGeneral !== null ? promedioGeneral.toFixed(1) : "—"}
                      </p>
                      <p className="text-xs text-white/80">Promedio</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-[#111827]">Promedio General</h3>
                    {!esHistorico && (
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">Ciclo actual</Badge>
                    )}
                  </div>
                  <p className="text-sm text-[#6B7280] mt-1">
                    {periodos.find((p) => p.id.toString() === periodoSeleccionado)?.nombre} · {calificaciones.length} materias evaluadas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aviso de materias en proceso (solo ciclo activo) */}
          {!esHistorico && materiasEnProceso.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-[#D97706] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#D97706]">Calificaciones en proceso de captura</p>
                    <p className="text-sm text-[#92400E] mt-0.5">
                      El profesor aún no ha finalizado el registro de:{" "}
                      <span className="font-medium">{materiasEnProceso.join(", ")}</span>.
                      Se mostrarán cuando estén listas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabla */}
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-base">Calificaciones por Materia</CardTitle>
              <CardDescription>
                Desglose de evaluaciones de {periodos.find((p) => p.id.toString() === periodoSeleccionado)?.nombre?.toLowerCase()}
                {cicloNombreActual && ` — Ciclo ${cicloNombreActual}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCals ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-[#6B7280]" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Materia</TableHead>
                        <TableHead>Rubros de evaluación</TableHead>
                        <TableHead className="text-center">Promedio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calificaciones.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-[#6B7280] py-8">
                            No hay calificaciones publicadas para este periodo
                          </TableCell>
                        </TableRow>
                      ) : (
                        calificaciones.map((cal) => (
                          <TableRow key={cal.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium align-top whitespace-nowrap">{cal.materia}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {cal.rubros.map((r) => (
                                  <span key={r.nombre} className="text-sm">
                                    <span className="text-[#6B7280]">{r.nombre}</span>
                                    <span className="text-[#9CA3AF] text-xs ml-1">({r.ponderacion}%)</span>
                                    <span className="font-semibold ml-1">
                                      {r.valor !== null ? r.valor.toFixed(1) : "—"}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-bold align-top whitespace-nowrap">
                              {cal.promedio !== null ? cal.promedio.toFixed(1) : "—"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Reportes de Conducta ────────────────────────────────── */}
        <TabsContent value="reportes" className="space-y-4 mt-4">
          {esHistorico && (
            <div className="flex items-center gap-2 text-sm text-[#D97706]">
              <History className="h-4 w-4 shrink-0" />
              <span>Historial de reportes del ciclo <span className="font-semibold">{cicloNombreActual}</span></span>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#1D4ED8]" />
                  <div>
                    <p className="text-xs text-[#6B7280]">Total</p>
                    <p className="text-xl font-bold text-[#1D4ED8]">{reportes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#D97706]" />
                  <div>
                    <p className="text-xs text-[#6B7280]">Seguimiento</p>
                    <p className="text-xl font-bold text-[#D97706]">
                      {reportes.filter((r) => r.estatus === "En seguimiento").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-green-100">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#059669]" />
                  <div>
                    <p className="text-xs text-[#6B7280]">Cerrados</p>
                    <p className="text-xl font-bold text-[#059669]">
                      {reportes.filter((r) => r.estatus === "Cerrado").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista */}
          {loadingReportes ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#6B7280]" />
            </div>
          ) : reportes.length === 0 ? (
            <Card className="border-[#E5E7EB]">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
                <p className="text-[#6B7280]">
                  {esHistorico
                    ? `No hay reportes en el ciclo ${cicloNombreActual}`
                    : "No hay reportes registrados para este alumno"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reportes.map((reporte) => {
                const badge = getEstatusBadge(reporte.estatus);
                const tipoColor = getTipoColor(reporte.tipoReporte);
                const gravedadBadge = getGravedadBadge(reporte.gravedad);

                return (
                  <Card key={reporte.id} className="border-[#E5E7EB] hover:shadow-md transition-all">
                    <CardContent className="pt-5">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="shrink-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            reporte.estatus === "Cerrado" ? "bg-green-100" : "bg-red-100"
                          }`}>
                            <AlertTriangle className={`h-5 w-5 ${
                              reporte.estatus === "Cerrado" ? "text-[#059669]" : "text-[#E11D48]"
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="secondary" className={tipoColor}>{reporte.tipoReporte}</Badge>
                            <Badge className={gravedadBadge.className}>Gravedad: {gravedadBadge.text}</Badge>
                            <Badge className={badge.className}>{badge.text}</Badge>
                          </div>
                          <p className="font-semibold text-[#111827] text-sm">{reporte.descripcion}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-[#6B7280]">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />{reporte.fecha}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />Por: {reporte.reportadoPorNombre}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => { setReporteSeleccionado(reporte); setDialogAbierto(true); }}
                          >
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog detalle reporte */}
      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Reporte</DialogTitle>
            <DialogDescription>Información completa del reporte de conducta</DialogDescription>
          </DialogHeader>
          {reporteSeleccionado && (
            <div className="space-y-4 mt-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className={getTipoColor(reporteSeleccionado.tipoReporte)}>
                  {reporteSeleccionado.tipoReporte}
                </Badge>
                <Badge className={getGravedadBadge(reporteSeleccionado.gravedad).className}>
                  Gravedad: {reporteSeleccionado.gravedad}
                </Badge>
                <Badge className={getEstatusBadge(reporteSeleccionado.estatus).className}>
                  {reporteSeleccionado.estatus}
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Fecha</h4>
                  <p className="text-sm text-[#6B7280]">{reporteSeleccionado.fecha}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Descripción</h4>
                  <p className="text-sm text-[#6B7280]">{reporteSeleccionado.descripcion}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Observaciones</h4>
                  <p className="text-sm text-[#6B7280]">{reporteSeleccionado.observaciones || "Sin observaciones"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Reportado por</h4>
                  <p className="text-sm text-[#6B7280]">{reporteSeleccionado.reportadoPorNombre}</p>
                </div>
                {reporteSeleccionado.archivoAdjunto && (
                  <div>
                    <h4 className="font-semibold text-[#111827] mb-1">Archivo adjunto</h4>
                    <a
                      href={reporteSeleccionado.archivoAdjunto}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#1D4ED8] underline underline-offset-2"
                    >
                      <Paperclip className="h-4 w-4" />
                      {nombreArchivo(reporteSeleccionado.archivoAdjunto)}
                    </a>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Estatus</h4>
                  <div className="flex items-start gap-2 p-3 rounded-lg border border-[#E5E7EB] bg-gray-50">
                    {reporteSeleccionado.estatus === "Cerrado" ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-[#059669] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-[#059669]">Reporte cerrado</p>
                          <p className="text-xs text-[#6B7280] mt-1">El caso ha sido resuelto y cerrado.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-[#D97706] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-[#D97706]">En seguimiento</p>
                          <p className="text-xs text-[#6B7280] mt-1">El caso está siendo monitoreado activamente.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
