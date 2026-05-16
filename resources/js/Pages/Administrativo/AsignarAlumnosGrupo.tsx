import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { PageTitle } from "../../Layouts/PageTitle";
import { Users, Search, GraduationCap, Loader2, UserPlus, Trash2, SquareSigma } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../Components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { toast } from "sonner";

interface Grado { id: number; numero: number; descripcion: string; }
interface Ciclo { id: number; nombre: string; activo: boolean; cerrado: boolean; }
interface AlumnoAsignado { id: number; estado: string; alumno: { id: number; persona: { nombre: string; apellidos: string; curp: string } }; }
interface Grupo {
  id: number;
  ciclo_escolar_id: number;
  grado_id: number;
  nombre: string;
  turno: string;
  capacidad_maxima: number;
  asignaciones_count?: number;
  grado?: Grado;
  ciclo_escolar?: Ciclo;
}

export function AsignarAlumnosGrupo() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [cicloActualId, setCicloActualId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [asignando, setAsignando] = useState<number | null>(null);
  const [bajando, setBajando] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("todos");
  const [modalAlumnos, setModalAlumnos] = useState(false);
  const [grupoSel, setGrupoSel] = useState<Grupo | null>(null);
  const [asignaciones, setAsignaciones] = useState<AlumnoAsignado[]>([]);
  const [alumnosDisp, setAlumnosDisp] = useState<{ id: number; persona: { nombre: string; apellidos: string; curp: string }; asignaciones?: { id: number }[] }[]>([]);
  const [busquedaAlumno, setBusquedaAlumno] = useState("");

  const cargar = (cicloId?: number) => {
    setLoading(true);
    const params = cicloId ? { ciclo_id: cicloId } : {};
    axios.get("/api/administrativo/grupos", { params })
      .then(({ data }) => {
        setGrupos(data.grupos);
        setGrados(data.grados ?? []);
        setCiclos(data.ciclos ?? []);
        setCicloActualId(data.ciclo_actual_id ?? null);
      })
      .catch(() => toast.error("No se pudieron cargar los grupos."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const abrirAlumnos = (grupo: Grupo) => {
    setGrupoSel(grupo);
    setModalAlumnos(true);
    Promise.all([
      axios.get("/api/administrativo/asignaciones", { params: { grupo_id: grupo.id } }),
      axios.get("/api/administrativo/alumnos", { params: { estado: "Activo" } }),
    ]).then(([aRes, alRes]) => {
      setAsignaciones(aRes.data.asignaciones);
      setAlumnosDisp(alRes.data.alumnos);
    }).catch(() => toast.error("Error al cargar alumnos."));
  };

  const handleAsignarDirecto = (alumnoId: number) => {
    if (!grupoSel) return;
    setAsignando(alumnoId);
    axios.post("/api/administrativo/asignaciones", { alumno_id: alumnoId, grupo_id: grupoSel.id })
      .then(({ data }) => {
        setAsignaciones((prev) => [...prev, data.asignacion]);
        setAlumnosDisp((prev) => prev.filter((a) => a.id !== alumnoId));
        setGrupos((prev) => prev.map((g) => g.id === grupoSel.id ? { ...g, asignaciones_count: (g.asignaciones_count ?? 0) + 1 } : g));
        setBusquedaAlumno("");
        toast.success("Alumno asignado al grupo.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al asignar."))
      .finally(() => setAsignando(null));
  };

  const handleDarBaja = (asignacionId: number) => {
    setBajando(asignacionId);
    axios.delete(`/api/administrativo/asignaciones/${asignacionId}`)
      .then(() => {
        setAsignaciones((prev) => prev.filter((a) => a.id !== asignacionId));
        if (grupoSel) setGrupos((prev) => prev.map((g) => g.id === grupoSel.id ? { ...g, asignaciones_count: Math.max(0, (g.asignaciones_count ?? 1) - 1) } : g));
        toast.success("Alumno dado de baja del grupo.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error."))
      .finally(() => setBajando(null));
  };

  const filtered = grupos.filter((g) => {
    const label = `${g.grado?.numero ?? ""}°${g.nombre}`.toLowerCase();
    const coincideBusqueda = !busqueda || label.includes(busqueda.toLowerCase());
    const coincideGrado = filtroGrado === "todos" || g.grado_id.toString() === filtroGrado;
    return coincideBusqueda && coincideGrado;
  });

  const cicloActivo = ciclos.find((c) => c.activo);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={UserPlus} title="Asignar Alumnos a Grupos" description="Asigna alumnos a los grupos del ciclo escolar activo" color="bg-[#EA580C]" />

      {/* Selector de ciclo */}
      {ciclos.length > 0 && (
        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Label className="shrink-0">Ver ciclo:</Label>
              <Select value={cicloActualId?.toString() ?? ""} onValueChange={(v) => { setCicloActualId(Number(v)); cargar(Number(v)); }}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Seleccionar ciclo" />
                </SelectTrigger>
                <SelectContent>
                  {ciclos.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nombre}{c.activo ? " (activo)" : c.cerrado ? " (cerrado)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!cicloActivo && (
                <p className="text-xs text-amber-600">No hay ciclo activo.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total grupos", value: grupos.length, color: "text-[#7C3AED]", from: "from-purple-50", to: "to-purple-100", Icon: Users },
          { label: "Total alumnos", value: grupos.reduce((s, g) => s + Number(g.asignaciones_count ?? 0), 0), color: "text-[#1D4ED8]", from: "from-blue-50", to: "to-blue-100", Icon: GraduationCap },
          { label: "Capacidad total", value: grupos.reduce((s, g) => s + Number(g.capacidad_maxima), 0), color: "text-[#059669]", from: "from-green-50", to: "to-green-100", Icon: SquareSigma },
        ].map(({ label, value, color, from, to, Icon }) => (
          <Card key={label} className={`border-[#E5E7EB] bg-linear-to-br ${from} ${to}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl"><Icon className={`h-6 w-6 ${color}`} /></div>
                <div><p className="text-sm text-[#6B7280]">{label}</p><p className={`text-2xl font-bold ${color}`}>{value}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-[#6B7280] mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input placeholder="Buscar grupo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <label className="text-sm text-[#6B7280] mb-2 block">Grado</label>
              <Select value={filtroGrado} onValueChange={setFiltroGrado}>
                <SelectTrigger>
                  <SelectValue placeholder="Grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los grados</SelectItem>
                  {grados.map((g) => <SelectItem key={g.id} value={g.id.toString()}>{g.numero}° — {g.descripcion}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#1D4ED8]" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[#6B7280] text-center py-10">No hay grupos en este ciclo.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((grupo) => (
            <Card key={grupo.id} className="border-[#E5E7EB] hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Users className="h-5 w-5 text-[#7C3AED]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{grupo.grado?.numero ?? ""}°{grupo.nombre}</CardTitle>
                      <p className="text-xs text-[#6B7280]">{grupo.grado?.descripcion}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={grupo.turno === "matutino" ? "text-blue-700 border-blue-300" : "text-orange-700 border-orange-300"}>
                    {grupo.turno === "matutino" ? "Matutino" : "Vespertino"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Alumnos:</span>
                  <span className="font-semibold">{grupo.asignaciones_count ?? 0} / {grupo.capacidad_maxima}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => abrirAlumnos(grupo)}>
                  <UserPlus className="h-3.5 w-3.5 mr-1" />Asignar Alumnos
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal asignación de alumnos */}
      <Dialog open={modalAlumnos} onOpenChange={(open) => { setModalAlumnos(open); if (!open) { setGrupoSel(null); setAsignaciones([]); setBusquedaAlumno(""); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Alumnos — {grupoSel?.grado?.numero ?? ""}°{grupoSel?.nombre}</DialogTitle>
            <DialogDescription>Busca y asigna alumnos al grupo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
              <div className="relative border-b border-[#E5E7EB]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Buscar alumno por nombre o CURP..."
                  value={busquedaAlumno}
                  onChange={(e) => setBusquedaAlumno(e.target.value)}
                  className="border-0 pl-9 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {(() => {
                  const q = busquedaAlumno.trim().toLowerCase();
                  const disponibles = alumnosDisp.filter((a) => {
                    if (asignaciones.some((as) => as.alumno.id === a.id)) return false;
                    if (a.asignaciones && a.asignaciones.length > 0) return false;
                    if (!q) return true;
                    const n1 = `${a.persona.nombre} ${a.persona.apellidos}`.toLowerCase();
                    const n2 = `${a.persona.apellidos} ${a.persona.nombre}`.toLowerCase();
                    return n1.includes(q) || n2.includes(q) || (a.persona.curp ?? "").toLowerCase().includes(q);
                  }).sort((a, b) => {
                    const ap = a.persona.apellidos.localeCompare(b.persona.apellidos, "es");
                    return ap !== 0 ? ap : a.persona.nombre.localeCompare(b.persona.nombre, "es");
                  });
                  if (disponibles.length === 0) return (
                    <p className="text-sm text-[#6B7280] text-center py-4">
                      {q ? "Sin resultados." : "No hay alumnos disponibles."}
                    </p>
                  );
                  return disponibles.map((a) => (
                    <div key={a.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 border-b border-[#F3F4F6] last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{a.persona.apellidos} {a.persona.nombre}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{a.persona.curp ?? "Sin CURP"}</p>
                      </div>
                      <Button size="sm" variant="outline" disabled={asignando === a.id} className="h-7 text-xs shrink-0" onClick={() => handleAsignarDirecto(a.id)}>
                        {asignando === a.id ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <UserPlus className="h-3.5 w-3.5 mr-1" />}Asignar
                      </Button>
                    </div>
                  ));
                })()}
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {asignaciones.length === 0 ? (
                <p className="text-sm text-[#6B7280] text-center py-4">Sin alumnos asignados.</p>
              ) : (
                [...asignaciones].sort((a, b) => {
                  const ap = a.alumno.persona.apellidos.localeCompare(b.alumno.persona.apellidos, "es");
                  return ap !== 0 ? ap : a.alumno.persona.nombre.localeCompare(b.alumno.persona.nombre, "es");
                }).map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded-lg border border-[#E5E7EB]">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#7C3AED]" />
                      <div>
                        <p className="text-sm font-medium">{a.alumno.persona.apellidos} {a.alumno.persona.nombre}</p>
                        <p className="text-xs text-[#6B7280]">{a.alumno.persona.curp ?? "Sin CURP"}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" disabled={bajando === a.id} className="text-red-500 hover:bg-red-50" onClick={() => handleDarBaja(a.id)}>
                      {bajando === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAlumnos(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
