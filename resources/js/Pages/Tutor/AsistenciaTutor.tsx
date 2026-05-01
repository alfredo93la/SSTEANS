import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../Components/ui/table";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { CheckCircle2, XCircle, Clock, Calendar, BookOpen, History } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";
import { AlumnoInfoCard } from "../../Components/AlumnoInfoCard";

interface CicloData { id: number; nombre: string; activo: boolean; cerrado: boolean; }
interface AsistData { id: number; materiaId: number; materia: string | null; fecha: string; diaSemana: string; estado: string; }

interface AsistenciaTutorProps {
  alumnoId: number;
}

export function AsistenciaTutor({ alumnoId }: AsistenciaTutorProps) {
  const [ciclos, setCiclos] = useState<CicloData[]>([]);
  const [cicloSeleccionado, setCicloSeleccionado] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<string>("todas");
  const [asistenciasAlumno, setAsistenciasAlumno] = useState<AsistData[]>([]);

  // Cargar ciclos y seleccionar el activo
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

  // Recargar asistencias cuando cambia el ciclo; resetear filtros
  useEffect(() => {
    if (!alumnoId || !cicloSeleccionado) return;
    setFechaInicio("");
    setFechaFin("");
    setMateriaSeleccionada("todas");
    axios.get(`/api/tutor/asistencias/${alumnoId}`, { params: { ciclo_id: cicloSeleccionado } })
      .then(({ data }) => setAsistenciasAlumno(data.asistencias ?? []))
      .catch(() => {});
  }, [alumnoId, cicloSeleccionado]);

  const cicloActivo = ciclos.find((c) => c.activo);
  const esHistorico = cicloSeleccionado && cicloSeleccionado !== cicloActivo?.id.toString();

  // Materias únicas derivadas de los registros
  const materiasUnicas = Array.from(
    new Map(asistenciasAlumno.map(a => [a.materiaId, { id: a.materiaId, nombre: a.materia ?? "" }])).values()
  );

  // Filtrar por materia y por rango de fechas (filtro en cliente)
  const asistenciasPorMateria = materiaSeleccionada === "todas"
    ? asistenciasAlumno
    : asistenciasAlumno.filter((a) => a.materiaId === parseInt(materiaSeleccionada));

  const asistenciasFiltradas = asistenciasPorMateria.filter((asistencia) => {
    if (!fechaInicio && !fechaFin) return true;
    const [dia, mes, anio] = asistencia.fecha.split("/").map(Number);
    const fechaAsistencia = new Date(anio, mes - 1, dia);
    let cumpleFechaInicio = true;
    let cumpleFechaFin = true;
    if (fechaInicio) {
      const [anioI, mesI, diaI] = fechaInicio.split("-").map(Number);
      cumpleFechaInicio = fechaAsistencia >= new Date(anioI, mesI - 1, diaI);
    }
    if (fechaFin) {
      const [anioF, mesF, diaF] = fechaFin.split("-").map(Number);
      cumpleFechaFin = fechaAsistencia <= new Date(anioF, mesF - 1, diaF);
    }
    return cumpleFechaInicio && cumpleFechaFin;
  }).sort((a, b) => {
    const [dA, mA, yA] = a.fecha.split("/").map(Number);
    const [dB, mB, yB] = b.fecha.split("/").map(Number);
    return new Date(yB, mB - 1, dB).getTime() - new Date(yA, mA - 1, dA).getTime();
  });

  // Estadísticas
  const totalRegistros = asistenciasFiltradas.length;
  const presentes = asistenciasFiltradas.filter((a) => a.estado === "Presente").length;
  const faltas = asistenciasFiltradas.filter((a) => a.estado === "Falta").length;
  const retardos = asistenciasFiltradas.filter((a) => a.estado === "Retardo").length;
  const porcentajeAsistencia = totalRegistros > 0 ? Math.round((presentes / totalRegistros) * 100) : 0;

  const estadisticasPorMateria = materiasUnicas.map((materia) => {
    const asistenciasMateria = asistenciasFiltradas.filter((a) => a.materiaId === materia.id);
    const totalMateria = asistenciasMateria.length;
    const presentesMateria = asistenciasMateria.filter((a) => a.estado === "Presente").length;
    const faltasMateria = asistenciasMateria.filter((a) => a.estado === "Falta").length;
    const retardosMateria = asistenciasMateria.filter((a) => a.estado === "Retardo").length;
    const porcentaje = totalMateria > 0 ? Math.round((presentesMateria / totalMateria) * 100) : 0;
    return { materia: materia.nombre, total: totalMateria, presentes: presentesMateria, faltas: faltasMateria, retardos: retardosMateria, porcentaje };
  }).filter((stat) => stat.total > 0);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Presente": return { icon: CheckCircle2, className: "bg-[#059669] text-white", text: "Presente" };
      case "Falta":    return { icon: XCircle,      className: "bg-[#E11D48] text-white", text: "Falta" };
      case "Retardo":  return { icon: Clock,         className: "bg-[#D97706] text-white", text: "Retardo" };
      default:         return { icon: CheckCircle2, className: "bg-[#6B7280] text-white", text: estado };
    }
  };

  const limpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    setMateriaSeleccionada("todas");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <AlumnoInfoCard alumnoId={alumnoId} />
      <PageTitle
        icon={CheckCircle2}
        title="Asistencia"
        description="Registro de asistencia por materia, faltas y retardos"
        color="bg-[#059669]"
      >
        <div className="flex items-center gap-2">
          {esHistorico ? (
            <Badge className="bg-amber-100 text-amber-700 border-0 gap-1 shrink-0">
              <History className="h-3 w-3" />
              Historial
            </Badge>
          ) : (
            <Badge className="bg-green-100 text-green-700 border-0 shrink-0">Ciclo actual</Badge>
          )}
          <div className="w-44">
            <Select value={cicloSeleccionado} onValueChange={setCicloSeleccionado}>
              <SelectTrigger className="rounded-lg">
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

      {/* Porcentaje general
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
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-[#111827]">Porcentaje de Asistencia</h3>
                {!esHistorico && (
                  <Badge className="bg-green-100 text-green-700 border-0 text-xs">Ciclo actual</Badge>
                )}
              </div>
              <p className="text-sm text-[#6B7280] mt-1">
                {presentes} presentes · {faltas} faltas · {retardos} retardos de {totalRegistros} registros
              </p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Materia</label>
              <Select value={materiaSeleccionada} onValueChange={setMateriaSeleccionada}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las materias</SelectItem>
                  {materiasUnicas.map((materia) => (
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

      {/* Estadísticas por materia */}
      {materiaSeleccionada === "todas" && estadisticasPorMateria.length > 0 && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#1D4ED8]" />
              Asistencia por Materia
            </CardTitle>
            <CardDescription>Desglose de asistencia en cada materia</CardDescription>
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
                        <span className="font-semibold text-[#111827]">{stat.porcentaje}%</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de registros */}
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
                    return (
                      <TableRow key={asistencia.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{asistencia.fecha}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {asistencia.materia || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#6B7280]">{asistencia.diaSemana}</TableCell>
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
