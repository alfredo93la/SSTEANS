import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../Components/ui/table";
import { GraduationCap } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";

interface PeriodoData { id: number; nombre: string; capturaAbierta: boolean; }
interface RubroDetalle { nombre: string; ponderacion: number; valor: number; }
interface CalData {
  id: number;
  materiaId: number;
  materia: string | null;
  clave: string;
  periodo: string;
  promedio: number;
  rubros: RubroDetalle[];
}

interface CalificacionesTutorProps {
  alumnoId: number;
}

export function CalificacionesTutor({ alumnoId }: CalificacionesTutorProps) {
  const [periodos, setPeriodos] = useState<PeriodoData[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("");
  const [calificacionesAlumno, setCalificacionesAlumno] = useState<CalData[]>([]);

  useEffect(() => {
    axios.get("/api/periodos/ciclo-activo")
      .then(({ data }) => {
        const lista: PeriodoData[] = data.periodos ?? [];
        setPeriodos(lista);
        if (lista.length > 0) setPeriodoSeleccionado(lista[0].id.toString());
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!alumnoId || !periodoSeleccionado) return;
    axios.get(`/api/tutor/calificaciones/${alumnoId}`, { params: { periodo_id: periodoSeleccionado } })
      .then(({ data }) => setCalificacionesAlumno(data.calificaciones ?? []))
      .catch(() => {});
  }, [alumnoId, periodoSeleccionado]);

  const promedio = calificacionesAlumno.length > 0
    ? calificacionesAlumno.reduce((sum, cal) => sum + cal.promedio, 0) / calificacionesAlumno.length
    : 0;

  // Colectar todos los nombres de rubros únicos para los encabezados
  const rubrosUnicos = Array.from(
    new Set(calificacionesAlumno.flatMap(c => c.rubros.map(r => r.nombre)))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle
        icon={GraduationCap}
        title="Calificaciones"
        description="Consulta el rendimiento académico por materia"
        color="bg-[#1D4ED8]"
      >
        <div className="sm:w-64">
          <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
            <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent>
              {periodos.map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageTitle>

      {/* Resumen general */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-[#1D4ED8] to-[#7C3AED] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{promedio.toFixed(1)}</p>
                  <p className="text-xs text-white/80">Promedio</p>
                </div>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-[#111827] mb-1">Promedio General</h3>
              <p className="text-sm text-[#6B7280]">
                {periodos.find(p => p.id.toString() === periodoSeleccionado)?.nombre} · {calificacionesAlumno.length} materias evaluadas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  {calificacionesAlumno.length > 0 && calificacionesAlumno[0].rubros.map(r => (
                    <TableHead key={r.nombre} className="text-center">
                      <div>{r.nombre}</div>
                      <div className="text-xs font-normal text-[#6B7280]">{r.ponderacion}%</div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Promedio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calificacionesAlumno.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={rubrosUnicos.length + 2} className="text-center text-[#6B7280] py-8">
                      No hay calificaciones registradas para este periodo
                    </TableCell>
                  </TableRow>
                ) : (
                  calificacionesAlumno.map((cal) => (
                    <TableRow key={cal.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{cal.materia}</TableCell>
                      {cal.rubros.map(r => (
                        <TableCell key={r.nombre} className="text-center">{r.valor.toFixed(1)}</TableCell>
                      ))}
                      <TableCell className="text-center font-bold">{cal.promedio.toFixed(1)}</TableCell>
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
