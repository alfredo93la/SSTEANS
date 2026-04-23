import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../Components/ui/table";
import { Badge } from "../../Components/ui/badge";
import { GraduationCap, Clock, History } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";
import { AlumnoInfoCard } from "../../Components/AlumnoInfoCard";

interface CicloData { id: number; nombre: string; activo: boolean; cerrado: boolean; }
interface PeriodoData { id: number; nombre: string; capturaAbierta: boolean; }
interface RubroDetalle { nombre: string; ponderacion: number; valor: number | null; }
interface CalData {
  id: number;
  materiaId: number;
  materia: string | null;
  clave: string;
  periodo: string;
  promedio: number | null;
  rubros: RubroDetalle[];
}

interface CalificacionesTutorProps {
  alumnoId: number;
}

export function CalificacionesTutor({ alumnoId }: CalificacionesTutorProps) {
  const [ciclos, setCiclos] = useState<CicloData[]>([]);
  const [cicloSeleccionado, setCicloSeleccionado] = useState("");
  const [periodos, setPeriodos] = useState<PeriodoData[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("");
  const [calificacionesAlumno, setCalificacionesAlumno] = useState<CalData[]>([]);
  const [materiasEnProceso, setMateriasEnProceso] = useState<string[]>([]);

  // Cargar todos los ciclos y seleccionar el activo por defecto
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

  // Recargar periodos cuando cambia el ciclo
  useEffect(() => {
    if (!cicloSeleccionado) return;
    setPeriodos([]);
    setPeriodoSeleccionado("");
    setCalificacionesAlumno([]);
    axios.get("/api/periodos/ciclo-activo", { params: { ciclo_id: cicloSeleccionado } })
      .then(({ data }) => {
        const lista: PeriodoData[] = data.periodos ?? [];
        setPeriodos(lista);
        if (lista.length > 0) setPeriodoSeleccionado(lista[0].id.toString());
      })
      .catch(() => {});
  }, [cicloSeleccionado]);

  // Recargar calificaciones cuando cambia el periodo o el ciclo
  useEffect(() => {
    if (!alumnoId || !periodoSeleccionado || !cicloSeleccionado) return;
    axios.get(`/api/tutor/calificaciones/${alumnoId}`, {
      params: { periodo_id: periodoSeleccionado, ciclo_id: cicloSeleccionado },
    })
      .then(({ data }) => {
        setCalificacionesAlumno(data.calificaciones ?? []);
        setMateriasEnProceso(data.materiasEnProceso ?? []);
      })
      .catch(() => {});
  }, [alumnoId, periodoSeleccionado, cicloSeleccionado]);

  const cicloActivo = ciclos.find((c) => c.activo);
  const esHistorico = cicloSeleccionado && cicloSeleccionado !== cicloActivo?.id.toString();

  const conPromedio = calificacionesAlumno.filter((cal): cal is CalData & { promedio: number } => cal.promedio !== null);
  const promedio = conPromedio.length > 0
    ? conPromedio.reduce((sum, cal) => sum + cal.promedio, 0) / conPromedio.length
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <AlumnoInfoCard alumnoId={alumnoId} />
      <PageTitle
        icon={GraduationCap}
        title="Calificaciones"
        description="Consulta el rendimiento académico por materia"
        color="bg-[#1D4ED8]"
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Badge ciclo */}
          {esHistorico ? (
            <Badge className="bg-amber-100 text-amber-700 border-0 gap-1 shrink-0">
              <History className="h-3 w-3" />
              Historial
            </Badge>
          ) : (
            <Badge className="bg-green-100 text-green-700 border-0 shrink-0">Ciclo actual</Badge>
          )}
          {/* Selector de ciclo */}
          <div className="sm:w-48">
            <Select value={cicloSeleccionado} onValueChange={setCicloSeleccionado}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Ciclo escolar" />
              </SelectTrigger>
              <SelectContent>
                {ciclos.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.nombre}
                    {c.activo && " (actual)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Selector de periodo */}
          <div className="sm:w-52">
            <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado} disabled={periodos.length === 0}>
              <SelectTrigger className="rounded-lg"><SelectValue placeholder="Periodo" /></SelectTrigger>
              <SelectContent>
                {periodos.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PageTitle>

      {/* Aviso de historial */}
      {esHistorico && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-[#D97706] shrink-0" />
              <p className="text-sm text-[#92400E]">
                Mostrando historial del ciclo <span className="font-semibold">{ciclos.find(c => c.id.toString() === cicloSeleccionado)?.nombre}</span>.
                Este ciclo ya está cerrado.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen general */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-[#1D4ED8] to-[#7C3AED] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{promedio !== null ? promedio.toFixed(1) : '—'}</p>
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
                {periodos.find(p => p.id.toString() === periodoSeleccionado)?.nombre} · {calificacionesAlumno.length} materias evaluadas
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

      {/* Tabla de calificaciones */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Calificaciones por Materia</CardTitle>
          <CardDescription>
            Desglose de evaluaciones de {periodos.find(p => p.id.toString() === periodoSeleccionado)?.nombre?.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                {calificacionesAlumno.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-[#6B7280] py-8">
                      No hay calificaciones registradas para este periodo
                    </TableCell>
                  </TableRow>
                ) : (
                  calificacionesAlumno.map((cal) => (
                    <TableRow key={cal.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium align-top whitespace-nowrap">{cal.materia}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {cal.rubros.map(r => (
                            <span key={r.nombre} className="text-sm">
                              <span className="text-[#6B7280]">{r.nombre}</span>
                              <span className="text-[#9CA3AF] text-xs ml-1">({r.ponderacion}%)</span>
                              <span className="font-semibold ml-1">
                                {r.valor !== null ? r.valor.toFixed(1) : '—'}
                              </span>
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold align-top whitespace-nowrap">
                        {cal.promedio !== null ? cal.promedio.toFixed(1) : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
