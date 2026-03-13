import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, GraduationCap } from "lucide-react";
import { calificaciones, materias, getMateriaById } from "../../data/mockData";
import { PageTitle } from "../PageTitle";

interface CalificacionesTutorProps {
  alumnoId: number;
}

export function CalificacionesTutor({ alumnoId }: CalificacionesTutorProps) {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("Trimestre 1");

  const calificacionesAlumno = calificaciones.filter(
    (c) => c.alumnoId === alumnoId && c.periodo === periodoSeleccionado
  );

  const promedio = calificacionesAlumno.length > 0
    ? (calificacionesAlumno.reduce((sum, cal) => sum + cal.promedio, 0) / calificacionesAlumno.length)
    : 0;

  const getTendenciaColor = (prom: number) => {
    if (prom >= 9) return "text-[#059669]";
    if (prom >= 7) return "text-[#D97706]";
    return "text-[#E11D48]";
  };

  const getTendenciaIcon = (prom: number) => {
    if (prom >= 9) return TrendingUp;
    if (prom >= 7) return Minus;
    return TrendingDown;
  };

  const getEstadoBadge = (prom: number) => {
    if (prom >= 9) return { variant: "default" as const, text: "Excelente", className: "bg-[#059669]" };
    if (prom >= 8) return { variant: "default" as const, text: "Muy bien", className: "bg-[#0891B2]" };
    if (prom >= 7) return { variant: "default" as const, text: "Bien", className: "bg-[#D97706]" };
    if (prom >= 6) return { variant: "default" as const, text: "Regular", className: "bg-[#F59E0B]" };
    return { variant: "default" as const, text: "Requiere apoyo", className: "bg-[#E11D48]" };
  };

  // Datos para el gráfico
  const datosGrafico = calificacionesAlumno.map((cal) => {
    const materia = getMateriaById(cal.materiaId);
    return {
      materia: materia?.clave || "",
      Parcial: cal.parcial,
      Proyecto: cal.proyecto,
      Examen: cal.examen,
      Promedio: cal.promedio,
    };
  });

  const TendenciaIcon = getTendenciaIcon(promedio);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header con selector de periodo */}
      <PageTitle
        icon={GraduationCap}
        title="Calificaciones"
        description="Consulta el rendimiento académico por materia"
        color="bg-[#1D4ED8]"
      >
        <div className="sm:w-64">
          <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Trimestre 1">Trimestre 1</SelectItem>
              <SelectItem value="Trimestre 2">Trimestre 2</SelectItem>
              <SelectItem value="Trimestre 3">Trimestre 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageTitle>

      {/* Resumen general */}
      <Card className="border-[#E5E7EB] bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{promedio.toFixed(1)}</p>
                  <p className="text-xs text-white/80">Promedio</p>
                </div>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <h3 className="font-semibold text-[#111827]">Promedio General</h3>
                <TendenciaIcon className={`h-5 w-5 ${getTendenciaColor(promedio)}`} />
              </div>
              <p className="text-sm text-[#6B7280] mb-3">
                {periodoSeleccionado} • {calificacionesAlumno.length} materias evaluadas
              </p>
              <Badge className={getEstadoBadge(promedio).className}>
                {getEstadoBadge(promedio).text}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de calificaciones */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Calificaciones por Materia</CardTitle>
          <CardDescription>Desglose de evaluaciones del {periodoSeleccionado.toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Materia</TableHead>
                  <TableHead className="text-center">Parcial</TableHead>
                  <TableHead className="text-center">Proyecto</TableHead>
                  <TableHead className="text-center">Examen</TableHead>
                  <TableHead className="text-center">Promedio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calificacionesAlumno.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-[#6B7280] py-8">
                      No hay calificaciones registradas para este periodo
                    </TableCell>
                  </TableRow>
                ) : (
                  calificacionesAlumno.map((cal) => {
                    const materia = getMateriaById(cal.materiaId);
                    const badge = getEstadoBadge(cal.promedio);
                    return (
                      <TableRow key={cal.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{materia?.nombre}</TableCell>
                        <TableCell className="text-center">{cal.parcial.toFixed(1)}</TableCell>
                        <TableCell className="text-center">{cal.proyecto.toFixed(1)}</TableCell>
                        <TableCell className="text-center">{cal.examen.toFixed(1)}</TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${getTendenciaColor(cal.promedio)}`}>
                            {cal.promedio.toFixed(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de calificaciones */}
      {datosGrafico.length > 0 && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Gráfico de Rendimiento</CardTitle>
            <CardDescription>Comparativa visual de evaluaciones por materia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ minHeight: '320px', height: '320px' }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={datosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="materia" stroke="#6B7280" />
                  <YAxis domain={[0, 10]} stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Parcial" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Proyecto" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Examen" fill="#0891B2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
