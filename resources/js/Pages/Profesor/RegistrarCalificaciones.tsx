import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../Components/ui/table";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { toast } from "sonner";
import { Save, AlertCircle, CheckCircle } from "lucide-react";
import { PageTitle } from "../../Components/PageTitle";
import { alumnos, grupos, materias, calificaciones as calificacionesIniciales } from "../../data/mockData";

export function RegistrarCalificaciones() {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("2");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("1");
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("Trimestre 1");
  const [calificaciones, setCalificaciones] = useState(calificacionesIniciales);
  const [cambiosPendientes, setCambiosPendientes] = useState<Set<number>>(new Set());

  const grupo = grupos.find(g => g.id === parseInt(grupoSeleccionado));
  const alumnosDelGrupo = alumnos.filter(a => a.grupo === grupo?.nombre);
  const materia = materias.find(m => m.id === parseInt(materiaSeleccionada));

  const handleCalificacionChange = (alumnoId: number, campo: 'parcial' | 'proyecto' | 'examen', valor: string) => {
    const valorNum = parseFloat(valor) || 0;
    
    // Validar rango 0-10
    if (valorNum < 0 || valorNum > 10) {
      toast.error("La calificación debe estar entre 0 y 10");
      return;
    }

    setCalificaciones(prev => {
      const nuevasCalificaciones = [...prev];
      const indice = nuevasCalificaciones.findIndex(
        c => c.alumnoId === alumnoId && 
             c.materiaId === parseInt(materiaSeleccionada) && 
             c.periodo === periodoSeleccionado
      );

      if (indice >= 0) {
        // Actualizar existente
        const calActual = { ...nuevasCalificaciones[indice] };
        calActual[campo] = valorNum;
        
        // Recalcular promedio
        calActual.promedio = parseFloat(
          ((calActual.parcial + calActual.proyecto + calActual.examen) / 3).toFixed(2)
        );
        
        nuevasCalificaciones[indice] = calActual;
      } else {
        // Crear nueva
        const nuevaCal = {
          id: Math.max(...nuevasCalificaciones.map(c => c.id), 0) + 1,
          alumnoId,
          materiaId: parseInt(materiaSeleccionada),
          periodo: periodoSeleccionado,
          parcial: campo === 'parcial' ? valorNum : 0,
          proyecto: campo === 'proyecto' ? valorNum : 0,
          examen: campo === 'examen' ? valorNum : 0,
          promedio: 0
        };
        nuevaCal.promedio = parseFloat(
          ((nuevaCal.parcial + nuevaCal.proyecto + nuevaCal.examen) / 3).toFixed(2)
        );
        nuevasCalificaciones.push(nuevaCal);
      }

      return nuevasCalificaciones;
    });

    // Marcar como pendiente de guardar
    setCambiosPendientes(prev => new Set([...prev, alumnoId]));
  };

  const getCalificacion = (alumnoId: number) => {
    return calificaciones.find(
      c => c.alumnoId === alumnoId && 
           c.materiaId === parseInt(materiaSeleccionada) && 
           c.periodo === periodoSeleccionado
    ) || {
      parcial: 0,
      proyecto: 0,
      examen: 0,
      promedio: 0
    };
  };

  const guardarCalificaciones = () => {
    toast.success(`Calificaciones guardadas exitosamente para ${materia?.nombre} - ${grupo?.nombre}`);
    setCambiosPendientes(new Set());
  };

  const getPromedioColor = (promedio: number) => {
    if (promedio >= 9) return "text-[#059669]";
    if (promedio >= 7) return "text-[#D97706]";
    return "text-[#E11D48]";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={Save} title="Registrar Calificaciones" description="Captura las evaluaciones de tus alumnos" color="bg-[#059669]" />

      {/* Selectores */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Seleccionar Grupo y Periodo</CardTitle>
          <CardDescription>Elige el grupo y periodo a evaluar</CardDescription>
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

            {/*<div>
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
            </div>*/}

            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Periodo</label>
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
          </div>

          {cambiosPendientes.size > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[#D97706]" />
              <span className="text-sm text-[#D97706]">
                Tienes {cambiosPendientes.size} cambio(s) sin guardar
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de calificaciones */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calificaciones - {materia?.nombre}</CardTitle>
              <CardDescription>
                {grupo?.nombre} • {periodoSeleccionado} • {alumnosDelGrupo.length} alumnos
              </CardDescription>
            </div>
            <Button
              onClick={guardarCalificaciones}
              disabled={cambiosPendientes.size === 0}
              className="bg-[#1D4ED8] hover:bg-[#1E40AF]"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Alumno</TableHead>
                  <TableHead className="text-center w-28">Parcial (0-10)</TableHead>
                  <TableHead className="text-center w-28">Proyecto (0-10)</TableHead>
                  <TableHead className="text-center w-28">Examen (0-10)</TableHead>
                  <TableHead className="text-center w-24">Promedio</TableHead>
                  <TableHead className="text-center w-32">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumnosDelGrupo.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-[#6B7280] py-8">
                      No hay alumnos en este grupo
                    </TableCell>
                  </TableRow>
                ) : (
                  alumnosDelGrupo.map((alumno, index) => {
                    const cal = getCalificacion(alumno.id);
                    const tieneCambios = cambiosPendientes.has(alumno.id);
                    
                    return (
                      <TableRow 
                        key={alumno.id} 
                        className={tieneCambios ? "bg-amber-50" : "hover:bg-gray-50"}
                      >
                        <TableCell className="font-medium text-[#6B7280]">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{alumno.nombre}</TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={cal.parcial || ''}
                            onChange={(e) => handleCalificacionChange(alumno.id, 'parcial', e.target.value)}
                            className="w-20 text-center mx-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={cal.proyecto || ''}
                            onChange={(e) => handleCalificacionChange(alumno.id, 'proyecto', e.target.value)}
                            className="w-20 text-center mx-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={cal.examen || ''}
                            onChange={(e) => handleCalificacionChange(alumno.id, 'examen', e.target.value)}
                            className="w-20 text-center mx-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${getPromedioColor(cal.promedio)}`}>
                            {cal.promedio.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {tieneCambios ? (
                            <Badge className="bg-amber-100 text-[#D97706]">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Sin guardar
                            </Badge>
                          ) : cal.promedio > 0 ? (
                            <Badge className="bg-green-100 text-[#059669]">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Guardado
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pendiente</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Resumen estadístico */}
          {alumnosDelGrupo.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-[#6B7280]">Promedio General</p>
                <p className="text-2xl font-bold text-[#1D4ED8] mt-1">
                  {(alumnosDelGrupo.reduce((sum, a) => {
                    const cal = getCalificacion(a.id);
                    return sum + cal.promedio;
                  }, 0) / alumnosDelGrupo.length).toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-[#6B7280]">Aprobados (≥6)</p>
                <p className="text-2xl font-bold text-[#059669] mt-1">
                  {alumnosDelGrupo.filter(a => getCalificacion(a.id).promedio >= 6).length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-[#6B7280]">Reprobados (&lt;6)</p>
                <p className="text-2xl font-bold text-[#E11D48] mt-1">
                  {alumnosDelGrupo.filter(a => {
                    const prom = getCalificacion(a.id).promedio;
                    return prom > 0 && prom < 6;
                  }).length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-[#6B7280]">Sin Calificar</p>
                <p className="text-2xl font-bold text-[#6B7280] mt-1">
                  {alumnosDelGrupo.filter(a => getCalificacion(a.id).promedio === 0).length}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
