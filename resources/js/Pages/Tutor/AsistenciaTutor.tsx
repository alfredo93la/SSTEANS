import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../Components/ui/table";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { CheckCircle2, XCircle, Clock, Calendar, TrendingUp, BookOpen } from "lucide-react";
import { asistencias, materias, getMateriaById } from "../../data/mockData";
import { PageTitle } from "../../Layouts/PageTitle";

interface AsistenciaTutorProps {
  alumnoId: number;
}

export function AsistenciaTutor({ alumnoId }: AsistenciaTutorProps) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<string>("todas");

  // Obtener asistencias del alumno
  const asistenciasAlumno = asistencias.filter((a) => a.alumnoId === alumnoId);

  // Filtrar por materia si se seleccionó una específica
  const asistenciasPorMateria = materiaSeleccionada === "todas" 
    ? asistenciasAlumno 
    : asistenciasAlumno.filter((a) => a.materiaId === parseInt(materiaSeleccionada));

  // Filtrar por rango de fechas
  const asistenciasFiltradas = asistenciasPorMateria.filter((asistencia) => {
    if (!fechaInicio && !fechaFin) return true;

    const [dia, mes, anio] = asistencia.fecha.split("/").map(Number);
    const fechaAsistencia = new Date(anio, mes - 1, dia);

    let cumpleFechaInicio = true;
    let cumpleFechaFin = true;

    if (fechaInicio) {
      const [anioI, mesI, diaI] = fechaInicio.split("-").map(Number);
      const fechaInicioDate = new Date(anioI, mesI - 1, diaI);
      cumpleFechaInicio = fechaAsistencia >= fechaInicioDate;
    }

    if (fechaFin) {
      const [anioF, mesF, diaF] = fechaFin.split("-").map(Number);
      const fechaFinDate = new Date(anioF, mesF - 1, diaF);
      cumpleFechaFin = fechaAsistencia <= fechaFinDate;
    }

    return cumpleFechaInicio && cumpleFechaFin;
  });

  // Calcular estadísticas
  const totalRegistros = asistenciasFiltradas.length;
  const presentes = asistenciasFiltradas.filter((a) => a.estado === "Presente").length;
  const faltas = asistenciasFiltradas.filter((a) => a.estado === "Falta").length;
  const retardos = asistenciasFiltradas.filter((a) => a.estado === "Retardo").length;
  const porcentajeAsistencia = totalRegistros > 0 ? Math.round((presentes / totalRegistros) * 100) : 0;

  // Calcular estadísticas por materia
  const estadisticasPorMateria = materias.map((materia) => {
    const asistenciasMateria = asistenciasFiltradas.filter((a) => a.materiaId === materia.id);
    const totalMateria = asistenciasMateria.length;
    const presentesMateria = asistenciasMateria.filter((a) => a.estado === "Presente").length;
    const faltasMateria = asistenciasMateria.filter((a) => a.estado === "Falta").length;
    const retardosMateria = asistenciasMateria.filter((a) => a.estado === "Retardo").length;
    const porcentaje = totalMateria > 0 ? Math.round((presentesMateria / totalMateria) * 100) : 0;
    
    return {
      materia: materia.nombre,
      total: totalMateria,
      presentes: presentesMateria,
      faltas: faltasMateria,
      retardos: retardosMateria,
      porcentaje
    };
  }).filter((stat) => stat.total > 0);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Presente":
        return { icon: CheckCircle2, className: "bg-[#059669] text-white", text: "Presente" };
      case "Falta":
        return { icon: XCircle, className: "bg-[#E11D48] text-white", text: "Falta" };
      case "Retardo":
        return { icon: Clock, className: "bg-[#D97706] text-white", text: "Retardo" };
      default:
        return { icon: CheckCircle2, className: "bg-[#6B7280] text-white", text: estado };
    }
  };

  const limpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    setMateriaSeleccionada("todas");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageTitle
        icon={CheckCircle2}
        title="Asistencia"
        description="Registro de asistencia por materia, faltas y retardos"
        color="bg-[#059669]"
      />

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Filtros de Consulta</CardTitle>
          <CardDescription>Filtra por materia y rango de fechas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Materia</label>
              <Select value={materiaSeleccionada} onValueChange={setMateriaSeleccionada}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las materias</SelectItem>
                  {materias.map((materia) => (
                    <SelectItem key={materia.id} value={materia.id.toString()}>
                      {materia.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Fecha inicio</label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Fecha fin</label>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>
          {(fechaInicio || fechaFin || materiaSeleccionada !== "todas") && (
            <Button variant="outline" onClick={limpiarFiltros} className="mt-4">
              Limpiar filtros
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Calendar className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total Días</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{totalRegistros}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-[#059669]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Presentes</p>
                <p className="text-2xl font-bold text-[#059669]">{presentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Clock className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Retardos</p>
                <p className="text-2xl font-bold text-[#D97706]">{retardos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <XCircle className="h-6 w-6 text-[#E11D48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Faltas</p>
                <p className="text-2xl font-bold text-[#E11D48]">{faltas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de porcentaje */}
      <Card className="border-[#E5E7EB] bg-linear-to-br from-purple-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-[#1D4ED8] to-[#7C3AED] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{porcentajeAsistencia}%</p>
                  <p className="text-xs text-white/80">Asistencia</p>
                </div>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <h3 className="font-semibold text-[#111827]">Porcentaje de Asistencia</h3>
                {porcentajeAsistencia >= 90 && <TrendingUp className="h-5 w-5 text-[#059669]" />}
              </div>
              <p className="text-sm text-[#6B7280] mb-3">
                {presentes} asistencias de {totalRegistros} registros de clase
              </p>
              <Badge className={
                porcentajeAsistencia >= 90 ? "bg-[#059669]" :
                porcentajeAsistencia >= 80 ? "bg-[#D97706]" :
                "bg-[#E11D48]"
              }>
                {porcentajeAsistencia >= 90 ? "Excelente" :
                 porcentajeAsistencia >= 80 ? "Bueno" :
                 "Requiere atención"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas por materia */}
      {materiaSeleccionada === "todas" && estadisticasPorMateria.length > 0 && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#1D4ED8]" />
              Asistencia por Materia
            </CardTitle>
            <CardDescription>
              Desglose de asistencia en cada materia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Materia</TableHead>
                    <TableHead className="text-center">Total Clases</TableHead>
                    <TableHead className="text-center">Presentes</TableHead>
                    <TableHead className="text-center">Retardos</TableHead>
                    <TableHead className="text-center">Faltas</TableHead>
                    <TableHead className="text-center">% Asistencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estadisticasPorMateria.map((stat, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{stat.materia}</TableCell>
                      <TableCell className="text-center text-[#6B7280]">{stat.total}</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-[#059669] text-white">{stat.presentes}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-[#D97706] text-white">{stat.retardos}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-[#E11D48] text-white">{stat.faltas}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`font-semibold ${
                            stat.porcentaje >= 90 ? "text-[#059669]" :
                            stat.porcentaje >= 80 ? "text-[#D97706]" :
                            "text-[#E11D48]"
                          }`}>
                            {stat.porcentaje}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de asistencias */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Registro de Asistencia</CardTitle>
          <CardDescription>
            {asistenciasFiltradas.length === asistenciasAlumno.length
              ? "Mostrando todos los registros"
              : `Mostrando ${asistenciasFiltradas.length} de ${asistenciasAlumno.length} registros`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead>Día de la Semana</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asistenciasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-[#6B7280] py-8">
                      No hay registros de asistencia para el periodo seleccionado
                    </TableCell>
                  </TableRow>
                ) : (
                  asistenciasFiltradas.map((asistencia) => {
                    const badge = getEstadoBadge(asistencia.estado);
                    const IconEstado = badge.icon;
                    const materia = getMateriaById(asistencia.materiaId);
                    
                    // Calcular día de la semana
                    const [dia, mes, anio] = asistencia.fecha.split("/").map(Number);
                    const fecha = new Date(anio, mes - 1, dia);
                    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
                    const diaSemana = diasSemana[fecha.getDay()];

                    return (
                      <TableRow key={asistencia.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{asistencia.fecha}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {materia?.nombre || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#6B7280]">{diaSemana}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Badge className={badge.className}>
                              <IconEstado className="h-3 w-3 mr-1" />
                              {badge.text}
                            </Badge>
                          </div>
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
    </div>
  );
}