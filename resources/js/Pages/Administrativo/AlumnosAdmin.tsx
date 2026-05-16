import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import {
  GraduationCap,
  Link as LinkIcon,
  Unlink,
  Search,
  Eye,
  Edit,
  Plus,
  Users,
  Phone,
  Loader2,
  UserCheck,
  UserMinus,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldUser,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../../Components/ui/dialog";
import { PageTitle } from "../../Layouts/PageTitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "../../Components/ui/pagination";
import { toast } from "sonner";

interface Persona { id: number; nombre: string; apellidos: string; curp: string; telefono: string | null; direccion: string | null; }
interface AsignacionGrupo { estado: string; grupo?: { id: number; nombre: string; turno: string; grado?: { numero: number } }; }
interface TutorPivot { id: number; persona: { nombre: string; apellidos: string }; pivot: { parentesco: string | null } }
interface Alumno {
  id: number;
  estado: string;
  fecha_nacimiento: string;
  sexo: string;
  persona: Persona;
  asignaciones?: AsignacionGrupo[];
  tutores?: TutorPivot[];
}


const formVacio = { nombre: "", apellidos: "", curp: "", fecha_nacimiento: "", sexo: "Masculino", telefono: "", direccion: "", estado: "Activo" };

type AlumnoForm = typeof formVacio;

const PARENTESCO_OPCIONES = ["Madre", "Padre", "Tutor", "Tutora"];

interface TutorSimple { id: number; nombre: string; apellidos: string; }

function FormAlumno({ form, setForm }: { form: AlumnoForm; setForm: (f: AlumnoForm) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nombre(s) *</Label>
          <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Apellidos *</Label>
          <Input value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>CURP *</Label>
          <Input value={form.curp} onChange={(e) => setForm({ ...form, curp: e.target.value.toUpperCase() })} maxLength={18} placeholder="18 caracteres" />
        </div>
        <div className="space-y-2">
          <Label>Fecha de nacimiento *</Label>
          <Input type="date" value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Sexo *</Label>
          <Select value={form.sexo} onValueChange={(v) => setForm({ ...form, sexo: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Masculino">Masculino</SelectItem>
              <SelectItem value="Femenino">Femenino</SelectItem>
              <SelectItem value="No especificado">No especificado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Teléfono</Label>
          <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Dirección</Label>
          <Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

interface AlumnosAdminProps { userRole?: string; permissions?: string[]; }

export function AlumnosAdmin({ permissions = [] }: AlumnosAdminProps) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroGrupo, setFiltroGrupo] = useState<"todos" | "con" | "sin">("todos");
  const [filtroTutor, setFiltroTutor] = useState<"todos" | "con" | "sin">("todos");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [alumnoSel, setAlumnoSel] = useState<Alumno | null>(null);
  const [form, setForm] = useState(formVacio);
  const [saving, setSaving] = useState(false);
  const [vincularEnabled, setVincularEnabled] = useState(false);
  const [tutoresList, setTutoresList] = useState<TutorSimple[]>([]);
  const [loadingTutores, setLoadingTutores] = useState(false);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [tutorBusq, setTutorBusq] = useState("");
  const [tutorSelId, setTutorSelId] = useState<number | null>(null);
  const [parentescoNuevo, setParentescoNuevo] = useState("");

  const [modalTutor, setModalTutor] = useState(false);
  const [tutorVincBusq, setTutorVincBusq] = useState("");
  const [tutorVincSelId, setTutorVincSelId] = useState<number | null>(null);
  const [parentescoVinc, setParentescoVinc] = useState("");
  const [savingTutor, setSavingTutor] = useState(false);

  const [modalBaja, setModalBaja] = useState(false);
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 10;
  const [pendingBaja, setPendingBaja] = useState<Alumno | null>(null);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthError, setReauthError] = useState("");

  const cargar = (q?: string) => {
    setLoading(true);
    axios.get("/api/administrativo/alumnos", { params: { q: (q ?? busqueda) || undefined } })
      .then(({ data }) => setAlumnos(data.alumnos))
      .catch(() => toast.error("No se pudieron cargar los alumnos."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const resetVincular = () => {
    setVincularEnabled(false);
    setTutorBusq("");
    setTutorSelId(null);
    setParentescoNuevo("");
  };

  const toggleVincular = () => {
    if (!vincularEnabled && tutoresList.length === 0) {
      setLoadingTutores(true);
      axios.get("/api/administrativo/tutores")
        .then(({ data }) => setTutoresList(
          data.tutores.map((t: { id: number; persona: { nombre: string; apellidos: string } }) => ({
            id: t.id,
            nombre: t.persona.nombre,
            apellidos: t.persona.apellidos,
          }))
        ))
        .catch(() => toast.error("No se pudieron cargar los tutores."))
        .finally(() => setLoadingTutores(false));
    }
    if (vincularEnabled) {
      resetVincular();
    } else {
      setVincularEnabled(true);
    }
  };

  const handleGuardar = async () => {
    if (!form.nombre || !form.apellidos || !form.curp || !form.fecha_nacimiento) {
      toast.error("Nombre, apellidos, CURP y fecha de nacimiento son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await axios.post("/api/administrativo/alumnos", form);
      const nuevoAlumno = data.alumno;
      if (vincularEnabled && tutorSelId) {
        try {
          await axios.post(`/api/administrativo/tutores/${tutorSelId}/vincular`, {
            alumno_id: nuevoAlumno.id,
            parentesco: parentescoNuevo || undefined,
          });
          const { data: refreshed } = await axios.get("/api/administrativo/alumnos");
          setAlumnos(refreshed.alumnos);
          toast.success("Alumno registrado y vinculado al tutor.");
        } catch (linkErr: unknown) {
          setAlumnos((prev) => [...prev, nuevoAlumno]);
          const msg = (linkErr as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Error al vincular";
          toast.warning(`Alumno creado, pero no se pudo vincular: ${msg}`);
        }
      } else {
        setAlumnos((prev) => [...prev, nuevoAlumno]);
        toast.success("Alumno registrado correctamente.");
      }
      setModalNuevo(false);
      setForm(formVacio);
      resetVincular();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      const errors = e.response?.data?.errors;
      const msg = errors ? (Object.values(errors).flat() as string[]).join(" ") : (e.response?.data?.message ?? "Error al registrar.");
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEditar = () => {
    if (!alumnoSel) return;
    setSaving(true);
    axios.put(`/api/administrativo/alumnos/${alumnoSel.id}`, form)
      .then(({ data }) => {
        setAlumnos((prev) => prev.map((a) => a.id === data.alumno.id ? data.alumno : a));
        setModalEditar(false);
        setAlumnoSel(null);
        toast.success("Alumno actualizado.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al actualizar."))
      .finally(() => setSaving(false));
  };

  const handleAprobar = (alumno: Alumno) => {
    if (!confirm(`¿Aprobar a ${alumno.persona.nombre} ${alumno.persona.apellidos}?`)) return;
    axios.post(`/api/administrativo/alumnos/${alumno.id}/aprobar`)
      .then(({ data }) => {
        setAlumnos((prev) => prev.map((a) => a.id === data.alumno.id ? data.alumno : a));
        toast.success("Alumno aprobado correctamente.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "No se pudo aprobar."));
  };

  const handleRechazar = (alumno: Alumno) => {
    if (!confirm(`¿Rechazar y eliminar la solicitud de ${alumno.persona.nombre} ${alumno.persona.apellidos}?`)) return;
    axios.post(`/api/administrativo/alumnos/${alumno.id}/rechazar`)
      .then(() => {
        setAlumnos((prev) => prev.filter((a) => a.id !== alumno.id));
        toast.success("Solicitud rechazada.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "No se pudo rechazar."));
  };

  const handleEliminar = (alumno: Alumno) => {
    setPendingBaja(alumno);
    setReauthPassword("");
    setReauthError("");
    setModalBaja(true);
  };

  const handleConfirmarBaja = () => {
    if (!pendingBaja) return;
    setEliminando(pendingBaja.id);
    setReauthError("");
    axios.post(`/api/administrativo/alumnos/${pendingBaja.id}/baja`, { password: reauthPassword })
      .then(({ data }) => {
        setAlumnos((prev) => prev.map((a) => a.id === data.alumno.id ? data.alumno : a));
        setModalBaja(false);
        setPendingBaja(null);
        toast.success("Alumno dado de baja.");
      })
      .catch((err) => {
        const msg = err.response?.data?.message ?? "No se pudo dar de baja.";
        if (err.response?.status === 403) {
          setReauthError(msg);
        } else {
          toast.error(msg);
          setModalBaja(false);
        }
      })
      .finally(() => setEliminando(null));
  };

  const abrirEditar = (alumno: Alumno) => {
    setAlumnoSel(alumno);
    setForm({
      nombre: alumno.persona.nombre,
      apellidos: alumno.persona.apellidos,
      curp: alumno.persona.curp,
      fecha_nacimiento: alumno.fecha_nacimiento,
      sexo: alumno.sexo,
      telefono: alumno.persona.telefono ?? "",
      direccion: alumno.persona.direccion ?? "",
      estado: alumno.estado,
    });
    setModalEditar(true);
  };

  const abrirDetalle = (alumno: Alumno) => { setAlumnoSel(alumno); setModalDetalle(true); };

  const cargarTutores = () => {
    if (tutoresList.length > 0) return;
    setLoadingTutores(true);
    axios.get("/api/administrativo/tutores")
      .then(({ data }) => setTutoresList(
        data.tutores.map((t: { id: number; persona: { nombre: string; apellidos: string } }) => ({
          id: t.id, nombre: t.persona.nombre, apellidos: t.persona.apellidos,
        }))
      ))
      .catch(() => toast.error("No se pudieron cargar los tutores."))
      .finally(() => setLoadingTutores(false));
  };

  const abrirModalTutor = (alumno: Alumno) => {
    setAlumnoSel(alumno);
    setModalTutor(true);
    cargarTutores();
  };

  const handleVincularTutor = () => {
    if (!alumnoSel || !tutorVincSelId) return;
    setSavingTutor(true);
    axios.post(`/api/administrativo/tutores/${tutorVincSelId}/vincular`, {
      alumno_id: alumnoSel.id,
      parentesco: parentescoVinc || undefined,
    })
      .then(() => {
        cargar();
        setModalTutor(false);
        setTutorVincBusq(""); setTutorVincSelId(null); setParentescoVinc("");
        toast.success("Tutor vinculado correctamente.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al vincular."))
      .finally(() => setSavingTutor(false));
  };

  const handleDesvincularTutor = (tutorId: number) => {
    if (!alumnoSel || !confirm("¿Desvincular el tutor de este alumno?")) return;
    axios.delete(`/api/administrativo/tutores/${tutorId}/desvincular`, { data: { alumno_id: alumnoSel.id } })
      .then(() => {
        cargar();
        setAlumnoSel((prev) => prev ? { ...prev, tutores: [] } : prev);
        toast.success("Tutor desvinculado.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al desvincular."));
  };

  const grupoActual = (alumno: Alumno) => {
    const a = alumno.asignaciones?.find((x) => x.estado === "activo");
    if (!a?.grupo) return null;
    return `${a.grupo.grado?.numero ?? ""}°${a.grupo.nombre}`;
  };

  const getEstadoColor = (estado: string) => {
    if (estado === "Activo")    return "bg-green-100 text-green-700 border-green-200";
    if (estado === "Baja")      return "bg-red-100 text-red-700 border-red-200";
    if (estado === "Pendiente") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  useEffect(() => { setPagina(1); }, [busqueda, filtroEstado, filtroGrupo, filtroTutor]);

  const filtered = alumnos.filter((a) => {
    const nombre = `${a.persona.nombre} ${a.persona.apellidos}`.toLowerCase();
    const coincideBusqueda = !busqueda || nombre.includes(busqueda.toLowerCase()) || a.persona.curp?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === "todos" || a.estado.toLowerCase() === filtroEstado.toLowerCase();
    const tieneGrupo = !!a.asignaciones?.find((x) => x.estado === "activo" && x.grupo);
    const coincideGrupo = filtroGrupo === "todos" || (filtroGrupo === "con" ? tieneGrupo : !tieneGrupo);
    const tieneTutor = (a.tutores?.length ?? 0) > 0;
    const coincideTutor = filtroTutor === "todos" || (filtroTutor === "con" ? tieneTutor : !tieneTutor);
    return coincideBusqueda && coincideEstado && coincideGrupo && coincideTutor;
  }).sort((a, b) => {
    const nom = a.persona.nombre.localeCompare(b.persona.nombre, "es");
    return nom !== 0 ? nom : a.persona.apellidos.localeCompare(b.persona.apellidos, "es");
  });

  const totalPaginas = Math.ceil(filtered.length / POR_PAGINA);
  const paginados = filtered.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={GraduationCap} title="Gestión de Alumnos" description="Administra el catálogo completo de alumnos" color="bg-[#1D4ED8]">
        <Dialog open={modalNuevo} onOpenChange={(open) => { setModalNuevo(open); if (!open) { setForm(formVacio); resetVincular(); } }}>
          <DialogTrigger asChild>
            <Button className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Plus className="h-4 w-4 mr-2" />Nuevo Alumno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Alumno</DialogTitle>
              <DialogDescription>Llena los campos para dar de alta un nuevo alumno.</DialogDescription>
            </DialogHeader>
            <FormAlumno form={form} setForm={setForm} />
            <div className="border-t pt-4">
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-[#1D4ED8] hover:underline"
                onClick={toggleVincular}
              >
                <LinkIcon className="h-4 w-4" />
                {vincularEnabled ? "Cancelar vinculación" : "Vincular con un tutor (opcional)"}
              </button>
              {vincularEnabled && (
                <div className="mt-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label>Buscar tutor</Label>
                    {loadingTutores ? (
                      <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin text-[#1D4ED8]" /></div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                          <Input
                            placeholder="Nombre del tutor..."
                            value={tutorBusq}
                            onChange={(e) => { setTutorBusq(e.target.value); setTutorSelId(null); setParentescoNuevo(""); }}
                            className="pl-10"
                          />
                        </div>
                        {tutorBusq.length >= 2 && (
                          <div className="border rounded-md max-h-40 overflow-y-auto">
                            {(() => {
                              const resultados = tutoresList.filter((t) =>
                                `${t.nombre} ${t.apellidos}`.toLowerCase().includes(tutorBusq.toLowerCase())
                              );
                              return resultados.length === 0 ? (
                                <p className="text-sm text-[#6B7280] px-3 py-2">Sin resultados.</p>
                              ) : resultados.slice(0, 8).map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${tutorSelId === t.id ? "bg-blue-100 font-medium" : ""}`}
                                  onClick={() => { setTutorSelId(t.id); setTutorBusq(`${t.nombre} ${t.apellidos}`); }}
                                >
                                  {t.nombre} {t.apellidos}
                                </button>
                              ));
                            })()}
                          </div>
                        )}
                        {tutorSelId && (
                          <p className="text-xs text-green-700 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Tutor seleccionado
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  {tutorSelId && (
                    <div className="space-y-1.5">
                      <Label>Parentesco (del tutor al alumno)</Label>
                      <Select value={parentescoNuevo} onValueChange={setParentescoNuevo}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar parentesco" /></SelectTrigger>
                        <SelectContent>
                          {PARENTESCO_OPCIONES.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalNuevo(false)}>Cancelar</Button>
              <Button onClick={handleGuardar} disabled={saving} className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar Alumno"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTitle>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl"><GraduationCap className="h-6 w-6 text-[#7C3AED]" /></div>
              <div>
                <p className="text-sm text-[#6B7280]">Total Alumnos</p>
                <p className="text-2xl font-bold text-[#7C3AED]">{alumnos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl"><UserCheck className="h-6 w-6 text-[#059669]" /></div>
              <div>
                <p className="text-sm text-[#6B7280]">Activos</p>
                <p className="text-2xl font-bold text-[#059669]">{alumnos.filter((a) => a.estado === "Activo").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB] bg-linear-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl"><UserMinus className="h-6 w-6 text-[#DC2626]" /></div>
              <div>
                <p className="text-sm text-[#6B7280]">Bajas</p>
                <p className="text-2xl font-bold text-[#DC2626]">{alumnos.filter((a) => a.estado === "Baja").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl"><Clock className="h-6 w-6 text-[#D97706]" /></div>
              <div>
                <p className="text-sm text-[#6B7280]">Pendientes</p>
                <p className="text-2xl font-bold text-[#D97706]">{alumnos.filter((a) => a.estado === "Pendiente").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-[#6B7280] mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Buscar por nombre o CURP..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full lg:w-48">
              <label className="text-sm text-[#6B7280] mb-2 block">Estado</label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Activo">Activos</SelectItem>
                  <SelectItem value="Baja">Bajas</SelectItem>
                  <SelectItem value="Pendiente">Pendientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full lg:w-48">
              <label className="text-sm text-[#6B7280] mb-2 block">Grupo</label>
              <Select value={filtroGrupo} onValueChange={(v) => setFiltroGrupo(v as "todos" | "con" | "sin")}>
                <SelectTrigger>
                  <SelectValue placeholder="Grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="con">Con grupo</SelectItem>
                  <SelectItem value="sin">Sin grupo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full lg:w-48">
              <label className="text-sm text-[#6B7280] mb-2 block">Tutor</label>
              <Select value={filtroTutor} onValueChange={(v) => setFiltroTutor(v as "todos" | "con" | "sin")}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="con">Con tutor</SelectItem>
                  <SelectItem value="sin">Sin tutor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Lista de Alumnos</CardTitle>
          <CardDescription>Gestiona el registro de alumnos del plantel</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#1D4ED8]" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-[#6B7280] text-center py-8">No hay alumnos registrados.</p>
          ) : (
            <div className="space-y-3">
              {paginados.map((alumno) => {
                const grupo = grupoActual(alumno);
                return (
                  <div key={alumno.id} className="p-4 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-linear-to-br from-[#1D4ED8] to-[#7C3AED] rounded-lg shrink-0">
                            <GraduationCap className="h-4 w-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-[#111827] truncate">{alumno.persona.nombre} {alumno.persona.apellidos}</h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {grupo && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{grupo}</Badge>
                              )}
                              <Badge variant="outline" className="text-xs font-mono">{alumno.persona.curp}</Badge>
                              <Badge className={getEstadoColor(alumno.estado)}>{alumno.estado}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-[#6B7280] ml-12">
                          {alumno.persona.telefono && (
                            <div className="flex items-center gap-1 min-w-0">
                              <Phone className="h-3 w-3 shrink-0" /><span className="truncate">{alumno.persona.telefono}</span>
                            </div>
                          )}
                          <div>{alumno.sexo} · {alumno.fecha_nacimiento}</div>
                          {alumno.tutores?.[0] && (
                            <div className="flex items-center gap-1 min-w-0 sm:col-span-2">
                              <Users className="h-3 w-3 shrink-0" />
                              <span className="truncate">{alumno.tutores[0].persona.nombre} {alumno.tutores[0].persona.apellidos}{alumno.tutores[0].pivot.parentesco ? ` · ${alumno.tutores[0].pivot.parentesco}` : ""}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {alumno.estado === "Pendiente" ? (
                          <>
                            <Button variant="outline" size="sm" className="hover:bg-green-50 hover:text-green-700" onClick={() => handleAprobar(alumno)}>
                              <CheckCircle2 className="h-4 w-4" />
                              Aprobar
                            </Button>
                            <Button variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600" onClick={() => handleRechazar(alumno)}>
                              <XCircle className="h-4 w-4" />
                              Rechazar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="outline" size="sm" onClick={() => abrirDetalle(alumno)}>
                              <Eye className="h-4 w-4" />
                              Ver detalle
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {totalPaginas > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-[#6B7280]">
              <span>Mostrando {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, filtered.length)} de {filtered.length}</span>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPagina((p) => Math.max(1, p - 1)); }}
                      className={pagina === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === totalPaginas || Math.abs(n - pagina) <= 1)
                    .reduce<(number | "ellipsis")[]>((acc, n, idx, arr) => {
                      if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "ellipsis" ? (
                        <PaginationItem key={`e-${idx}`}><PaginationEllipsis /></PaginationItem>
                      ) : (
                        <PaginationItem key={item}>
                          <PaginationLink
                            href="#"
                            isActive={pagina === item}
                            onClick={(e) => { e.preventDefault(); setPagina(item as number); }}
                          >
                            {item}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPagina((p) => Math.min(totalPaginas, p + 1)); }}
                      className={pagina === totalPaginas ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal detalle */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Alumno</DialogTitle>
            <DialogDescription>Información completa del alumno.</DialogDescription>
          </DialogHeader>
          {alumnoSel && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-linear-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="p-3 bg-linear-to-br from-[#1D4ED8] to-[#7C3AED] rounded-xl">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{alumnoSel.persona.nombre} {alumnoSel.persona.apellidos}</h3>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {grupoActual(alumnoSel) && <Badge variant="outline">{grupoActual(alumnoSel)}</Badge>}
                    <Badge className={getEstadoColor(alumnoSel.estado)}>{alumnoSel.estado}</Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-[#6B7280]">CURP</p><p className="font-mono font-medium">{alumnoSel.persona.curp}</p></div>
                <div><p className="text-[#6B7280]">Sexo</p><p className="font-medium">{alumnoSel.sexo}</p></div>
                <div><p className="text-[#6B7280]">Fecha de nacimiento</p><p className="font-medium">{alumnoSel.fecha_nacimiento}</p></div>
                {alumnoSel.persona.telefono && <div><p className="text-[#6B7280]">Teléfono</p><p className="font-medium">{alumnoSel.persona.telefono}</p></div>}
                {alumnoSel.persona.direccion && <div className="col-span-2"><p className="text-[#6B7280]">Dirección</p><p className="font-medium">{alumnoSel.persona.direccion}</p></div>}
              </div>

              <div className="border-t pt-3 space-y-2">
                <p className="text-sm font-semibold text-[#111827]">Tutor responsable</p>
                {alumnoSel.tutores && alumnoSel.tutores.length > 0 ? (
                  alumnoSel.tutores.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                          <ShieldUser className="h-4 w-4 text-[#7C3AED]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{t.persona.nombre} {t.persona.apellidos}</p>
                          {t.pivot.parentesco && <p className="text-xs text-[#6B7280]">{t.pivot.parentesco}</p>}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600" title="Desvincular"
                        onClick={() => handleDesvincularTutor(t.id)}>
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#6B7280]">Sin tutor asignado.</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2">
            <div>
              {permissions.includes("alumnos.manage") && alumnoSel?.estado !== "Baja" && (
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto"
                  onClick={() => { setModalDetalle(false); handleEliminar(alumnoSel!); }}
                >
                  <UserMinus className="h-4 w-4 mr-2" />Dar de baja
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setModalDetalle(false); abrirEditar(alumnoSel!); }}>
                <Edit className="h-4 w-4 mr-2" />Editar
              </Button>
              <Button onClick={() => { setModalDetalle(false); setModalTutor(true); cargarTutores(); }}
                className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
                <LinkIcon className="h-4 w-4 mr-2" />
                {alumnoSel?.tutores && alumnoSel.tutores.length > 0 ? "Cambiar tutor" : "Vincular tutor"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal gestión de tutor */}
      <Dialog open={modalTutor} onOpenChange={(open) => { setModalTutor(open); if (!open) { setTutorVincBusq(""); setTutorVincSelId(null); setParentescoVinc(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tutor de {alumnoSel?.persona.nombre} {alumnoSel?.persona.apellidos}</DialogTitle>
            <DialogDescription>Vincula o desvincula el tutor responsable de este alumno.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            {alumnoSel?.tutores && alumnoSel.tutores.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#374151]">Tutor actual</p>
                {alumnoSel.tutores.map((t) => (
                  <div key={t.persona.nombre} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-2">
                      <ShieldUser className="h-4 w-4 text-[#7C3AED]" />
                      <div>
                        <p className="text-sm font-semibold">{t.persona.nombre} {t.persona.apellidos}</p>
                        {t.pivot.parentesco && <p className="text-xs text-[#6B7280]">{t.pivot.parentesco}</p>}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleDesvincularTutor(t.id)}>
                      <Unlink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-[#6B7280]">O vincula un tutor diferente:</p>
              </div>
            ) : (
              <p className="text-sm text-[#6B7280]">Este alumno no tiene tutor asignado.</p>
            )}

            <div className="space-y-1.5">
              <Label>Buscar tutor</Label>
              {loadingTutores ? (
                <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin text-[#1D4ED8]" /></div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                    <Input
                      placeholder="Nombre del tutor..."
                      value={tutorVincBusq}
                      onChange={(e) => { setTutorVincBusq(e.target.value); setTutorVincSelId(null); setParentescoVinc(""); }}
                      className="pl-10"
                    />
                  </div>
                  {tutorVincBusq.length >= 2 && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {(() => {
                        const resultados = tutoresList.filter((t) =>
                          `${t.nombre} ${t.apellidos}`.toLowerCase().includes(tutorVincBusq.toLowerCase())
                        );
                        return resultados.length === 0 ? (
                          <p className="text-sm text-[#6B7280] px-3 py-2">Sin resultados.</p>
                        ) : resultados.slice(0, 8).map((t) => (
                          <button key={t.id} type="button"
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${tutorVincSelId === t.id ? "bg-blue-100 font-medium" : ""}`}
                            onClick={() => { setTutorVincSelId(t.id); setTutorVincBusq(`${t.nombre} ${t.apellidos}`); }}>
                            {t.nombre} {t.apellidos}
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                  {tutorVincSelId && (
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Tutor seleccionado
                    </p>
                  )}
                </>
              )}
            </div>

            {tutorVincSelId && (
              <div className="space-y-1.5">
                <Label>Parentesco</Label>
                <Select value={parentescoVinc} onValueChange={setParentescoVinc}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar parentesco" /></SelectTrigger>
                  <SelectContent>
                    {PARENTESCO_OPCIONES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalTutor(false)}>Cerrar</Button>
            <Button onClick={handleVincularTutor} disabled={savingTutor || !tutorVincSelId} className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
              {savingTutor ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vincular"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal confirmación de baja */}
      <Dialog open={modalBaja} onOpenChange={(open) => { setModalBaja(open); if (!open) { setPendingBaja(null); setReauthPassword(""); setReauthError(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar baja</DialogTitle>
            <DialogDescription>
              Esta acción dará de baja a{" "}
              <span className="font-semibold text-[#111827]">
                {pendingBaja?.persona.nombre} {pendingBaja?.persona.apellidos}
              </span>
              . Ingresa tu contraseña para confirmar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Contraseña</Label>
              <Input
                type="password"
                placeholder="Tu contraseña actual"
                value={reauthPassword}
                onChange={(e) => { setReauthPassword(e.target.value); setReauthError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter" && reauthPassword) handleConfirmarBaja(); }}
                autoFocus
              />
              {reauthError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="h-4 w-4 shrink-0" />{reauthError}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalBaja(false)}>Cancelar</Button>
            <Button
              disabled={!reauthPassword || eliminando === pendingBaja?.id}
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmarBaja}
            >
              {eliminando === pendingBaja?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dar de baja"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal editar */}
      <Dialog open={modalEditar} onOpenChange={(open) => { setModalEditar(open); if (!open) { setAlumnoSel(null); setForm(formVacio); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Alumno</DialogTitle>
            <DialogDescription>Modifica los datos del alumno.</DialogDescription>
          </DialogHeader>
          <FormAlumno form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEditar(false)}>Cancelar</Button>
            <Button onClick={handleEditar} disabled={saving} className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
