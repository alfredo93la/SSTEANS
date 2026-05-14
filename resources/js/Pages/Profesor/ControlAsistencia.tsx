import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../Components/ui/table";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { toast } from "sonner";
import { Save, CheckCircle2, XCircle, Clock, Calendar, Loader2 } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";

interface GrupoData { id: number; nombre: string; }
interface AlumnoData { id: number; nombre: string; grupo: string; }
interface MateriaData { id: number; nombre: string; diasSemana: string[]; }

const DIA_SEMANA_JS: Record<number, string> = {
  0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles',
  4: 'jueves',  5: 'viernes', 6: 'sabado',
};

const NOMBRE_DIA: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

type EstadoAsistencia = "Presente" | "Falta" | "Retardo";

export function ControlAsistencia() {
  const { cicloActivo } = usePage().props;
  const [grupos, setGrupos] = useState<GrupoData[]>([]);
  const [materias, setMaterias] = useState<MateriaData[]>([]);
  const [alumnosDelGrupo, setAlumnosDelGrupo] = useState<AlumnoData[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const hoyLocal = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyLocal);
  const [asistencias, setAsistencias] = useState<Record<number, EstadoAsistencia>>({});
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const grupo = grupos.find(g => g.id.toString() === grupoSeleccionado);
  const materia = materias.find(m => m.id.toString() === materiaSeleccionada);

  // Días válidos de la materia seleccionada
  const diasValidos: string[] = materia?.diasSemana ?? [];
  const fechaEsValida = diasValidos.length === 0
    ? false
    : diasValidos.includes(DIA_SEMANA_JS[new Date(fechaSeleccionada + 'T00:00:00').getDay()]);
  const nombresValidos = diasValidos.map(d => NOMBRE_DIA[d] ?? d).join(', ');

  // Convertir fecha ISO a formato dd/mm/aaaa
  const formatearFecha = (fechaISO: string) => {
    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${anio}`;
  };

  const fechaFormateada = formatearFecha(fechaSeleccionada);

  useEffect(() => {
    axios.get("/api/profesor/grupos")
      .then(({ data }) => {
        const lista: GrupoData[] = data.grupos ?? [];
        setGrupos(lista);
        if (lista.length > 0) setGrupoSeleccionado(lista[0].id.toString());
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!grupoSeleccionado) return;
    setMateriaSeleccionada("");
    setMaterias([]);
    axios.get("/api/profesor/materias", { params: { grupo_id: grupoSeleccionado } })
      .then(({ data }) => {
        const lista: MateriaData[] = data.materias ?? [];
        setMaterias(lista);
        if (lista.length > 0) setMateriaSeleccionada(lista[0].id.toString());
      })
      .catch(() => {});
    axios.get("/api/profesor/alumnos", { params: { grupo_id: grupoSeleccionado } })
      .then(({ data }) => setAlumnosDelGrupo((data.alumnos ?? []).sort((a: AlumnoData, b: AlumnoData) => a.nombre.localeCompare(b.nombre, "es"))))
      .catch(() => {});
  }, [grupoSeleccionado]);

  // Cargar asistencias existentes para la fecha y materia seleccionadas
  useEffect(() => {
    if (!grupoSeleccionado || !materiaSeleccionada || !fechaEsValida) {
      setAsistencias({});
      setGuardado(false);
      return;
    }
    axios.get("/api/asistencias", {
      params: { grupo_id: grupoSeleccionado, materia_id: materiaSeleccionada, fecha: fechaSeleccionada }
    })
      .then(({ data }) => {
        const asistenciasDelDia: Record<number, EstadoAsistencia> = {};
        (data.asistencias ?? []).forEach((a: { alumnoId: number; estado: string }) => {
          asistenciasDelDia[a.alumnoId] = a.estado as EstadoAsistencia;
        });
        setAsistencias(asistenciasDelDia);
        setGuardado(Object.keys(asistenciasDelDia).length > 0);
      })
      .catch(() => {});
  }, [grupoSeleccionado, materiaSeleccionada, fechaSeleccionada, fechaEsValida]);

  const marcarTodos = (estado: EstadoAsistencia) => {
    const nuevas: Record<number, EstadoAsistencia> = {};
    alumnosDelGrupo.forEach(a => { nuevas[a.id] = estado; });
    setAsistencias(nuevas);
    setGuardado(false);
  };

  const marcarAsistencia = (alumnoId: number, estado: EstadoAsistencia) => {
    setAsistencias(prev => ({
      ...prev,
      [alumnoId]: estado
    }));
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

    setGuardando(true);
    axios.post("/api/asistencias/bulk", {
      grupo_id: parseInt(grupoSeleccionado),
      materia_id: parseInt(materiaSeleccionada),
      fecha: fechaSeleccionada,
      asistencias: Object.entries(asistencias).map(([alumnoId, estado]) => ({
        alumnoId: parseInt(alumnoId),
        estado,
      })),
    })
      .then(() => {
        toast.success(`Asistencia guardada: ${materia?.nombre} - ${grupo?.nombre} - ${fechaFormateada}`);
        setGuardado(true);
      })
      .catch(() => toast.error("Error al guardar asistencia"))
      .finally(() => setGuardando(false));
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

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={Calendar} title="Control de Asistencia" description="Registra la asistencia de tus alumnos por clase" color="bg-[#4F46E5]" />

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
                min={cicloActivo?.fecha_inicio ?? undefined}
                max={hoyLocal()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const hoy = hoyLocal();
                  const minFecha = cicloActivo?.fecha_inicio;
                  if (val > hoy) return;
                  if (minFecha && val < minFecha) return;
                  setFechaSeleccionada(val);
                }}
                className="rounded-lg"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => marcarTodos("Presente")}
              disabled={!fechaEsValida || alumnosDelGrupo.length === 0}
              className="text-[#059669] border-[#059669] hover:bg-green-50"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Todos presentes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => marcarTodos("Retardo")}
              disabled={!fechaEsValida || alumnosDelGrupo.length === 0}
              className="text-[#D97706] border-[#D97706] hover:bg-amber-50"
            >
              <Clock className="h-4 w-4 mr-2" />
              Todos retardo
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => marcarTodos("Falta")}
              disabled={!fechaEsValida || alumnosDelGrupo.length === 0}
              className="text-[#E11D48] border-[#E11D48] hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Todos falta
            </Button>
          </div>

          {materiaSeleccionada && !fechaEsValida && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#E11D48]" />
              <span className="text-sm text-[#E11D48]">
                Esta clase solo se imparte los días: <strong>{nombresValidos}</strong>. Selecciona una fecha válida.
              </span>
            </div>
          )}

          {!guardado && Object.keys(asistencias).length > 0 && fechaEsValida && (
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
              disabled={guardando || guardado || Object.keys(asistencias).length === 0 || !fechaEsValida}
              className="bg-[#1D4ED8] hover:bg-[#1E40AF]"
            >
              {guardando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {guardando ? "Guardando..." : "Guardar Asistencia"}
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
                              disabled={!fechaEsValida}
                              className={estado === "Presente" ? "bg-[#059669] hover:bg-[#047857]" : ""}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={estado === "Retardo" ? "default" : "outline"}
                              onClick={() => marcarAsistencia(alumno.id, "Retardo")}
                              disabled={!fechaEsValida}
                              className={estado === "Retardo" ? "bg-[#D97706] hover:bg-[#B45309]" : ""}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={estado === "Falta" ? "default" : "outline"}
                              onClick={() => marcarAsistencia(alumno.id, "Falta")}
                              disabled={!fechaEsValida}
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
      {/* Leyenda de iconos */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Referencias de asistencia</p>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#059669] shrink-0">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-[#374151]">Presente — alumno asistió a clase</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#D97706] shrink-0">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-[#374151]">Retardo — llegó tarde a clase</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#E11D48] shrink-0">
                <XCircle className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-[#374151]">Falta — no asistió a clase</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}