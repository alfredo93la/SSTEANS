import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Save, CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";
import { alumnos, grupos, materias, asistencias as asistenciasIniciales } from "../../data/mockData";

type EstadoAsistencia = "Presente" | "Falta" | "Retardo";

export function ControlAsistencia() {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("2");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("1");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [asistencias, setAsistencias] = useState<Record<number, EstadoAsistencia>>({});
  const [guardado, setGuardado] = useState(false);

  const grupo = grupos.find(g => g.id === parseInt(grupoSeleccionado));
  const materia = materias.find(m => m.id === parseInt(materiaSeleccionada));
  const alumnosDelGrupo = alumnos.filter(a => a.grupo === grupo?.nombre);

  // Convertir fecha ISO a formato dd/mm/aaaa
  const formatearFecha = (fechaISO: string) => {
    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${anio}`;
  };

  const fechaFormateada = formatearFecha(fechaSeleccionada);

  // Cargar asistencias existentes para la fecha y materia seleccionadas
  useEffect(() => {
    const asistenciasDelDia: Record<number, EstadoAsistencia> = {};
    
    alumnosDelGrupo.forEach(alumno => {
      const asistencia = asistenciasIniciales.find(
        a => a.alumnoId === alumno.id && 
             a.fecha === fechaFormateada && 
             a.materiaId === parseInt(materiaSeleccionada)
      );
      if (asistencia) {
        asistenciasDelDia[alumno.id] = asistencia.estado as EstadoAsistencia;
      }
    });

    setAsistencias(asistenciasDelDia);
    setGuardado(Object.keys(asistenciasDelDia).length > 0);
  }, [grupoSeleccionado, materiaSeleccionada, fechaSeleccionada, alumnosDelGrupo, fechaFormateada]);

  const marcarAsistencia = (alumnoId: number, estado: EstadoAsistencia) => {
    setAsistencias(prev => ({
      ...prev,
      [alumnoId]: estado
    }));
    setGuardado(false);
  };

  const marcarTodos = (estado: EstadoAsistencia) => {
    const nuevasAsistencias: Record<number, EstadoAsistencia> = {};
    alumnosDelGrupo.forEach(alumno => {
      nuevasAsistencias[alumno.id] = estado;
    });
    setAsistencias(nuevasAsistencias);
    setGuardado(false);
  };

  const guardarAsistencias = () => {
    const alumnosRegistrados = Object.keys(asistencias).length;
    
    if (alumnosRegistrados === 0) {
      toast.error("Debes marcar al menos un alumno antes de guardar");
      return;
    }

    if (alumnosRegistrados < alumnosDelGrupo.length) {
      const faltantes = alumnosDelGrupo.length - alumnosRegistrados;
      toast.warning(`Hay ${faltantes} alumno(s) sin marcar. Se guardarán los registros existentes.`);
    }

    toast.success(`Asistencia guardada: ${materia?.nombre} - ${grupo?.nombre} - ${fechaFormateada}`);
    setGuardado(true);
  };

  const getEstadoBadge = (estado?: EstadoAsistencia) => {
    switch (estado) {
      case "Presente":
        return { icon: CheckCircle2, className: "bg-[#059669] text-white hover:bg-[#059669]", text: "Presente" };
      case "Falta":
        return { icon: XCircle, className: "bg-[#E11D48] text-white hover:bg-[#E11D48]", text: "Falta" };
      case "Retardo":
        return { icon: Clock, className: "bg-[#D97706] text-white hover:bg-[#D97706]", text: "Retardo" };
      default:
        return { icon: null, className: "bg-gray-200 text-[#6B7280]", text: "Sin marcar" };
    }
  };

  // Estadísticas
  const presentes = Object.values(asistencias).filter(a => a === "Presente").length;
  const faltas = Object.values(asistencias).filter(a => a === "Falta").length;
  const retardos = Object.values(asistencias).filter(a => a === "Retardo").length;
  const sinMarcar = alumnosDelGrupo.length - Object.keys(asistencias).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-[#111827]">Control de Asistencia por Materia</h2>
        <p className="text-sm text-[#6B7280] mt-1">Registra la asistencia de tus alumnos por clase</p>
      </div>

      {/* Selectores */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Seleccionar Grupo, Materia y Fecha</CardTitle>
          <CardDescription>Elige el grupo, la materia y la fecha a registrar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Grupo</label>
              <Select value={grupoSeleccionado} onValueChange={setGrupoSeleccionado}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
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

            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Materia</label>
              <Select value={materiaSeleccionada} onValueChange={setMateriaSeleccionada}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
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

            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Fecha</label>
              <Input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>
{/*
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => marcarTodos("Presente")}
              className="text-[#059669] border-[#059669] hover:bg-green-50"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Marcar todos presentes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => marcarTodos("Falta")}
              className="text-[#E11D48] border-[#E11D48] hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Marcar todos falta
            </Button>
          </div> */}

          {!guardado && Object.keys(asistencias).length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#D97706]" />
              <span className="text-sm text-[#D97706]">
                Tienes cambios sin guardar
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB] bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-[#6B7280]">Presentes</p>
              <p className="text-3xl font-bold text-[#059669] mt-1">{presentes}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-[#6B7280]">Faltas</p>
              <p className="text-3xl font-bold text-[#E11D48] mt-1">{faltas}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-[#6B7280]">Retardos</p>
              <p className="text-3xl font-bold text-[#D97706] mt-1">{retardos}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-[#6B7280]">Sin Marcar</p>
              <p className="text-3xl font-bold text-[#6B7280] mt-1">{sinMarcar}</p>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Tabla de asistencia */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Asistencia - {grupo?.nombre} - {materia?.nombre}</CardTitle>
              <CardDescription>
                {fechaFormateada} • {alumnosDelGrupo.length} alumnos
              </CardDescription>
            </div>
            <Button
              onClick={guardarAsistencias}
              disabled={guardado || Object.keys(asistencias).length === 0}
              className="bg-[#1D4ED8] hover:bg-[#1E40AF]"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Asistencia
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Nombre del Alumno</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumnosDelGrupo.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-[#6B7280] py-8">
                      No hay alumnos en este grupo
                    </TableCell>
                  </TableRow>
                ) : (
                  alumnosDelGrupo.map((alumno, index) => {
                    const estado = asistencias[alumno.id];
                    const badge = getEstadoBadge(estado);
                    const IconEstado = badge.icon;
                    
                    return (
                      <TableRow key={alumno.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-[#6B7280]">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{alumno.nombre}</TableCell>
                        <TableCell className="text-[#6B7280]">{alumno.grupo}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={badge.className}>
                            {IconEstado && <IconEstado className="h-3 w-3 mr-1" />}
                            {badge.text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant={estado === "Presente" ? "default" : "outline"}
                              onClick={() => marcarAsistencia(alumno.id, "Presente")}
                              className={estado === "Presente" ? "bg-[#059669] hover:bg-[#047857]" : ""}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={estado === "Retardo" ? "default" : "outline"}
                              onClick={() => marcarAsistencia(alumno.id, "Retardo")}
                              className={estado === "Retardo" ? "bg-[#D97706] hover:bg-[#B45309]" : ""}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={estado === "Falta" ? "default" : "outline"}
                              onClick={() => marcarAsistencia(alumno.id, "Falta")}
                              className={estado === "Falta" ? "bg-[#E11D48] hover:bg-[#BE123C]" : ""}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
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