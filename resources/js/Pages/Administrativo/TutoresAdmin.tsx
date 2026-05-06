import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { PageTitle } from "../../Layouts/PageTitle";
import {
  Search,
  Eye,
  GraduationCap,
  Link as LinkIcon,
  Unlink,
  Loader2,
  UserCircle,
  Phone,
  Mail,
  ShieldUser,
  UserX,
  CheckCircle2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../Components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { toast } from "sonner";

interface UserInfo { id: number; email: string; status: string; }
interface Persona { id: number; nombre: string; apellidos: string; curp: string | null; telefono: string | null; direccion: string | null; user?: UserInfo; }
interface AlumnoVinculado { id: number; sexo: string | null; persona: Persona; pivot?: { parentesco: string | null } }
interface AlumnoListado { id: number; sexo: string | null; persona: Persona; tiene_tutor: boolean; }
interface Tutor {
  id: number;
  ocupacion: string | null;
  persona: Persona;
  alumnos: AlumnoVinculado[];
}

const PARENTESCO_OPCIONES = ["Padre", "Madre", "Abuelo", "Abuela", "Tío", "Tía", "Hermano", "Hermana", "Tutor legal", "Otro"];


export function TutoresAdmin() {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [alumnos, setAlumnos] = useState<AlumnoListado[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalVincular, setModalVincular] = useState(false);
  const [tutorSel, setTutorSel] = useState<Tutor | null>(null);
  const [alumnoVincularId, setAlumnoVincularId] = useState("");
  const [parentescoVincular, setParentescoVincular] = useState("");
  const [saving, setSaving] = useState(false);
  const [alumnoSearchText, setAlumnoSearchText] = useState("");
  const [editandoParentesco, setEditandoParentesco] = useState<{ alumnoId: number; valor: string } | null>(null);

  const cargar = () => {
    setLoading(true);
    Promise.all([
      axios.get("/api/administrativo/tutores"),
      axios.get("/api/administrativo/alumnos"),
    ])
      .then(([tRes, aRes]) => {
        setTutores(tRes.data.tutores);
        setAlumnos(aRes.data.alumnos);
      })
      .catch(() => toast.error("No se pudieron cargar los datos."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const handleVincular = () => {
    if (!tutorSel || !alumnoVincularId) { toast.error("Selecciona un alumno."); return; }
    setSaving(true);
    axios.post(`/api/administrativo/tutores/${tutorSel.id}/vincular`, {
      alumno_id: alumnoVincularId,
      parentesco: parentescoVincular || undefined,
    })
      .then(() => {
        // Refrescar tutores y alumnos desde el servidor para garantizar consistencia
        Promise.all([
          axios.get("/api/administrativo/tutores"),
          axios.get("/api/administrativo/alumnos"),
        ]).then(([tRes, aRes]) => {
          const tutoresActualizados = tRes.data.tutores as Tutor[];
          setTutores(tutoresActualizados);
          setAlumnos(aRes.data.alumnos);
          // Mantener tutorSel actualizado
          setTutorSel((prev) => prev ? (tutoresActualizados.find((t) => t.id === prev.id) ?? prev) : prev);
        });
        setModalVincular(false);
        setAlumnoVincularId("");
        setParentescoVincular("");
        toast.success("Alumno vinculado al tutor.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al vincular."))
      .finally(() => setSaving(false));
  };

  const handleActualizarParentesco = () => {
    if (!tutorSel || !editandoParentesco) return;
    setSaving(true);
    axios.patch(`/api/administrativo/tutores/${tutorSel.id}/parentesco`, {
      alumno_id: editandoParentesco.alumnoId,
      parentesco: editandoParentesco.valor,
    })
      .then(() => {
        const actualizar = (t: Tutor) => ({
          ...t,
          alumnos: t.alumnos.map((a) =>
            a.id === editandoParentesco.alumnoId
              ? { ...a, pivot: { ...a.pivot, parentesco: editandoParentesco.valor } }
              : a
          ),
        });
        setTutores((prev) => prev.map((t) => t.id === tutorSel.id ? actualizar(t) : t));
        setTutorSel((prev) => prev ? actualizar(prev) : prev);
        setEditandoParentesco(null);
        toast.success("Parentesco actualizado.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al actualizar."))
      .finally(() => setSaving(false));
  };

  const handleDesvincular = (tutor: Tutor, alumno: AlumnoVinculado) => {
    if (!confirm(`¿Desvincular a ${alumno.persona.nombre} ${alumno.persona.apellidos} de este tutor?`)) return;
    axios.delete(`/api/administrativo/tutores/${tutor.id}/desvincular`, { data: { alumno_id: alumno.id } })
      .then(() => {
        Promise.all([
          axios.get("/api/administrativo/tutores"),
          axios.get("/api/administrativo/alumnos"),
        ]).then(([tRes, aRes]) => {
          const tutoresActualizados = tRes.data.tutores as Tutor[];
          setTutores(tutoresActualizados);
          setAlumnos(aRes.data.alumnos);
          setTutorSel((prev) => prev ? (tutoresActualizados.find((t) => t.id === prev.id) ?? prev) : prev);
        });
        toast.success("Vínculo eliminado.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al desvincular."));
  };

  const filtered = tutores.filter((t) => {
    if (!busqueda) return true;
    const nombre = `${t.persona.nombre} ${t.persona.apellidos}`.toLowerCase();
    return nombre.includes(busqueda.toLowerCase());
  });

  const statusBadge = (status?: string) => {
    if (status === "Activo")    return <Badge className="bg-green-100 text-green-700 border-0 text-xs">Activo</Badge>;
    if (status === "Pendiente") return <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">Pendiente</Badge>;
    if (status === "Rechazado") return <Badge className="bg-red-100 text-red-700 border-0 text-xs">Rechazado</Badge>;
    if (status === "Inactivo")  return <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">Inactivo</Badge>;
    return <Badge variant="outline" className="text-xs">Sin cuenta</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={ShieldUser} title="Gestión de Tutores" description="Vincula tutores con alumnos" color="bg-[#7C3AED]" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl"><ShieldUser className="h-6 w-6 text-[#7C3AED]" /></div>
              <div><p className="text-sm text-[#6B7280]">Total Tutores</p><p className="text-2xl font-bold text-[#7C3AED]">{tutores.length}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl"><GraduationCap className="h-6 w-6 text-[#1D4ED8]" /></div>
              <div><p className="text-sm text-[#6B7280]">Alumnos vinculados</p><p className="text-2xl font-bold text-[#1D4ED8]">{tutores.reduce((s, t) => s + t.alumnos.length, 0)}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl"><UserX className="h-6 w-6 text-[#F59E0B]" /></div>
              <div><p className="text-sm text-[#6B7280]">Sin alumnos</p><p className="text-2xl font-bold text-[#F59E0B]">{tutores.filter((t) => t.alumnos.length === 0).length}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtro */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
            <Input placeholder="Buscar por nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Lista de Tutores</CardTitle>
          <CardDescription>Tutores y padres de familia registrados por el administrador</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#1D4ED8]" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-[#6B7280] text-center py-8">No hay tutores registrados.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((tutor) => (
                <div key={tutor.id} className="p-4 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <UserCircle className="h-4 w-4 text-[#7C3AED]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-[#111827]">{tutor.persona.nombre} {tutor.persona.apellidos}</h4>
                            {statusBadge(tutor.persona.user?.status)}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {tutor.ocupacion && <span className="text-xs text-[#6B7280]">{tutor.ocupacion}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="ml-11 space-y-1">
                        {tutor.persona.user?.email && (
                          <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                            <Mail className="h-3 w-3" />{tutor.persona.user.email}
                          </div>
                        )}
                        {tutor.persona.telefono && (
                          <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                            <Phone className="h-3 w-3" />{tutor.persona.telefono}
                          </div>
                        )}
                        {tutor.alumnos.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                            <GraduationCap className="h-3 w-3" />
                            {tutor.alumnos.map((a) => `${a.persona.nombre} ${a.persona.apellidos}`).join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" title="Ver detalle" onClick={() => { setTutorSel(tutor); setModalDetalle(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Vincular alumno" onClick={() => { setTutorSel(tutor); setModalVincular(true); }}>
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal detalle */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Detalle del Tutor</DialogTitle><DialogDescription>Información y alumnos vinculados.</DialogDescription></DialogHeader>
          {tutorSel && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg"><UserCircle className="h-6 w-6 text-[#7C3AED]" /></div>
                <div>
                  <p className="font-bold">{tutorSel.persona.nombre} {tutorSel.persona.apellidos}</p>
                  {statusBadge(tutorSel.persona.user?.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tutorSel.persona.user?.email && <div className="col-span-2"><p className="text-[#6B7280]">Correo</p><p>{tutorSel.persona.user.email}</p></div>}
                {tutorSel.persona.curp && <div><p className="text-[#6B7280]">CURP</p><p className="font-mono text-xs">{tutorSel.persona.curp}</p></div>}
                {tutorSel.persona.telefono && <div><p className="text-[#6B7280]">Teléfono</p><p>{tutorSel.persona.telefono}</p></div>}
                {tutorSel.ocupacion && <div><p className="text-[#6B7280]">Ocupación</p><p>{tutorSel.ocupacion}</p></div>}
                {tutorSel.persona.direccion && <div className="col-span-2"><p className="text-[#6B7280]">Dirección</p><p>{tutorSel.persona.direccion}</p></div>}
              </div>
              <div>
                <p className="font-semibold text-[#111827] mb-2">Alumnos vinculados</p>
                {tutorSel.alumnos.length === 0 ? (
                  <p className="text-xs text-[#6B7280]">Sin alumnos vinculados.</p>
                ) : (
                  tutorSel.alumnos.map((a) => {
                    const editando = editandoParentesco?.alumnoId === a.id;
                    return (
                      <div key={a.id} className="p-2 bg-blue-50 rounded-lg mb-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-[#1D4ED8] shrink-0" />
                            <span className="text-sm">{a.persona.nombre} {a.persona.apellidos}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {!editando && (
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-blue-100" title="Editar parentesco"
                                onClick={() => setEditandoParentesco({ alumnoId: a.id, valor: a.pivot?.parentesco ?? "" })}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600" title="Desvincular"
                              onClick={() => handleDesvincular(tutorSel, a)}>
                              <Unlink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {editando && (
                          <div className="flex items-center gap-2 mt-2">
                            <Select value={editandoParentesco.valor} onValueChange={(v) => setEditandoParentesco({ alumnoId: a.id, valor: v })}>
                              <SelectTrigger className="h-8 text-xs flex-1">
                                <SelectValue placeholder="Seleccionar…" />
                              </SelectTrigger>
                              <SelectContent>
                                {PARENTESCO_OPCIONES.map((op) => (
                                  <SelectItem key={op} value={op}>{op}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button size="sm" className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700" disabled={saving || !editandoParentesco.valor}
                              onClick={handleActualizarParentesco}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditandoParentesco(null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setModalDetalle(false); setTutorSel(null); }}>Cerrar</Button>
            <Button onClick={() => { setModalDetalle(false); setModalVincular(true); }} className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
              <LinkIcon className="h-4 w-4 mr-2" />Vincular alumno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal vincular alumno */}
      <Dialog open={modalVincular} onOpenChange={(open) => { setModalVincular(open); if (!open) { setAlumnoVincularId(""); setParentescoVincular(""); setAlumnoSearchText(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular Alumno</DialogTitle>
            <DialogDescription>Vincula un alumno a {tutorSel?.persona.nombre} {tutorSel?.persona.apellidos}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Buscar alumno</Label>
              {alumnos.filter((a) => !a.tiene_tutor).length === 0 ? (
                <p className="text-sm text-[#6B7280] py-2">Todos los alumnos ya tienen un tutor asignado.</p>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                    <Input
                      placeholder="Nombre o CURP del alumno..."
                      value={alumnoSearchText}
                      onChange={(e) => { setAlumnoSearchText(e.target.value); setAlumnoVincularId(""); setParentescoVincular(""); }}
                      className="pl-10"
                    />
                  </div>
                  {alumnoSearchText.length >= 2 && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {(() => {
                        const sinTutor = alumnos.filter((a) => !a.tiene_tutor);
                        const resultados = sinTutor.filter((a) => {
                          const nombre = `${a.persona.nombre} ${a.persona.apellidos}`.toLowerCase();
                          const curp = (a.persona.curp ?? "").toLowerCase();
                          const q = alumnoSearchText.toLowerCase();
                          return nombre.includes(q) || curp.includes(q);
                        });
                        return resultados.length === 0 ? (
                          <p className="text-sm text-[#6B7280] px-3 py-2">Sin resultados.</p>
                        ) : resultados.slice(0, 8).map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${alumnoVincularId === a.id.toString() ? "bg-blue-100 font-medium" : ""}`}
                            onClick={() => {
                              setAlumnoVincularId(a.id.toString());
                              setAlumnoSearchText(`${a.persona.nombre} ${a.persona.apellidos}`);
                              setParentescoVincular("");
                            }}
                          >
                            {a.persona.nombre} {a.persona.apellidos}
                            {a.persona.curp && <span className="ml-2 text-xs text-[#6B7280] font-mono">{a.persona.curp}</span>}
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                  {alumnoVincularId && (
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Alumno seleccionado
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Parentesco</Label>
              <Select
                value={parentescoVincular}
                onValueChange={setParentescoVincular}
                disabled={!alumnoVincularId}
              >
                <SelectTrigger><SelectValue placeholder={alumnoVincularId ? "Seleccionar parentesco" : "Primero selecciona un alumno"} /></SelectTrigger>
                <SelectContent>
                  {PARENTESCO_OPCIONES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalVincular(false)}>Cancelar</Button>
            <Button onClick={handleVincular} disabled={saving || !alumnoVincularId || alumnos.filter((a) => !a.tiene_tutor).length === 0} className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vincular"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
