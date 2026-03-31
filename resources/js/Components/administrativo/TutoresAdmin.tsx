import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PageTitle } from "../PageTitle";
import {
  Users,
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  UserCircle,
  Phone,
  GraduationCap,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";

interface Persona { id: number; nombre: string; apellidos: string; curp: string | null; telefono: string | null; direccion: string | null; }
interface AlumnoVinculado { id: number; persona: Persona; }
interface Tutor {
  id: number;
  parentesco: string | null;
  ocupacion: string | null;
  persona: Persona;
  alumnos: AlumnoVinculado[];
}

const formVacio = { nombre: "", apellidos: "", curp: "", telefono: "", direccion: "", parentesco: "", ocupacion: "" };

type TutorForm = typeof formVacio;

function FormTutor({ form, setForm }: { form: TutorForm; setForm: (f: TutorForm) => void }) {
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
          <Label>CURP</Label>
          <Input value={form.curp} onChange={(e) => setForm({ ...form, curp: e.target.value.toUpperCase() })} maxLength={18} />
        </div>
        <div className="space-y-2">
          <Label>Teléfono</Label>
          <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Parentesco</Label>
          <Select value={form.parentesco} onValueChange={(v) => setForm({ ...form, parentesco: v })}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Padre">Padre</SelectItem>
              <SelectItem value="Madre">Madre</SelectItem>
              <SelectItem value="Tutor Legal">Tutor Legal</SelectItem>
              <SelectItem value="Abuelo/a">Abuelo/a</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Ocupación</Label>
          <Input value={form.ocupacion} onChange={(e) => setForm({ ...form, ocupacion: e.target.value })} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Dirección</Label>
          <Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

export function TutoresAdmin() {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [alumnos, setAlumnos] = useState<{ id: number; persona: Persona }[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalVincular, setModalVincular] = useState(false);
  const [tutorSel, setTutorSel] = useState<Tutor | null>(null);
  const [form, setForm] = useState(formVacio);
  const [alumnoVincularId, setAlumnoVincularId] = useState("");
  const [saving, setSaving] = useState(false);

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

  const handleGuardar = () => {
    if (!form.nombre || !form.apellidos) { toast.error("Nombre y apellidos son obligatorios."); return; }
    setSaving(true);
    axios.post("/api/administrativo/tutores", form)
      .then(({ data }) => {
        setTutores((prev) => [...prev, data.tutor]);
        setModalNuevo(false);
        setForm(formVacio);
        toast.success("Tutor registrado correctamente.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al registrar."))
      .finally(() => setSaving(false));
  };

  const handleEditar = () => {
    if (!tutorSel) return;
    setSaving(true);
    axios.put(`/api/administrativo/tutores/${tutorSel.id}`, form)
      .then(({ data }) => {
        setTutores((prev) => prev.map((t) => t.id === data.tutor.id ? { ...data.tutor, alumnos: tutorSel.alumnos } : t));
        setModalEditar(false);
        setTutorSel(null);
        toast.success("Tutor actualizado.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al actualizar."))
      .finally(() => setSaving(false));
  };

  const handleEliminar = (tutor: Tutor) => {
    if (!confirm(`¿Eliminar a ${tutor.persona.nombre} ${tutor.persona.apellidos}?`)) return;
    axios.delete(`/api/administrativo/tutores/${tutor.id}`)
      .then(() => {
        setTutores((prev) => prev.filter((t) => t.id !== tutor.id));
        toast.success("Tutor eliminado.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "No se pudo eliminar."));
  };

  const handleVincular = () => {
    if (!tutorSel || !alumnoVincularId) { toast.error("Selecciona un alumno."); return; }
    setSaving(true);
    axios.post(`/api/administrativo/tutores/${tutorSel.id}/vincular`, { alumno_id: alumnoVincularId })
      .then(() => {
        const alumno = alumnos.find((a) => a.id.toString() === alumnoVincularId);
        if (alumno) {
          setTutores((prev) => prev.map((t) =>
            t.id === tutorSel.id ? { ...t, alumnos: [...t.alumnos, alumno] } : t
          ));
        }
        setModalVincular(false);
        setAlumnoVincularId("");
        toast.success("Alumno vinculado al tutor.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al vincular."))
      .finally(() => setSaving(false));
  };

  const abrirEditar = (tutor: Tutor) => {
    setTutorSel(tutor);
    setForm({
      nombre: tutor.persona.nombre,
      apellidos: tutor.persona.apellidos,
      curp: tutor.persona.curp ?? "",
      telefono: tutor.persona.telefono ?? "",
      direccion: tutor.persona.direccion ?? "",
      parentesco: tutor.parentesco ?? "",
      ocupacion: tutor.ocupacion ?? "",
    });
    setModalEditar(true);
  };

  const filtered = tutores.filter((t) => {
    if (!busqueda) return true;
    const nombre = `${t.persona.nombre} ${t.persona.apellidos}`.toLowerCase();
    return nombre.includes(busqueda.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={Users} title="Gestión de Tutores" description="Administra tutores y su vinculación con alumnos" color="bg-[#7C3AED]">
        <Dialog open={modalNuevo} onOpenChange={(open) => { setModalNuevo(open); if (!open) setForm(formVacio); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Plus className="h-4 w-4 mr-2" />Nuevo Tutor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Tutor</DialogTitle>
              <DialogDescription>Registra un nuevo tutor o padre de familia.</DialogDescription>
            </DialogHeader>
            <FormTutor form={form} setForm={setForm} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalNuevo(false)}>Cancelar</Button>
              <Button onClick={handleGuardar} disabled={saving} className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTitle>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-[#6B7280]">Total Tutores</p><p className="text-2xl font-bold text-[#7C3AED] mt-1">{tutores.length}</p></div>
              <div className="p-3 bg-purple-100 rounded-xl"><Users className="h-6 w-6 text-[#7C3AED]" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-[#6B7280]">Alumnos vinculados</p><p className="text-2xl font-bold text-[#1D4ED8] mt-1">{tutores.reduce((s, t) => s + t.alumnos.length, 0)}</p></div>
              <div className="p-3 bg-blue-100 rounded-xl"><GraduationCap className="h-6 w-6 text-[#1D4ED8]" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-[#6B7280]">Sin alumnos</p><p className="text-2xl font-bold text-[#F59E0B] mt-1">{tutores.filter((t) => t.alumnos.length === 0).length}</p></div>
              <div className="p-3 bg-amber-100 rounded-xl"><UserCircle className="h-6 w-6 text-[#F59E0B]" /></div>
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
          <CardDescription>Tutores y padres de familia registrados</CardDescription>
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
                          <h4 className="font-semibold text-[#111827]">{tutor.persona.nombre} {tutor.persona.apellidos}</h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {tutor.parentesco && <Badge variant="outline" className="text-xs">{tutor.parentesco}</Badge>}
                            {tutor.ocupacion && <span className="text-xs text-[#6B7280]">{tutor.ocupacion}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="ml-11 space-y-1">
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
                      <Button variant="ghost" size="sm" title="Editar" onClick={() => abrirEditar(tutor)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Vincular alumno" onClick={() => { setTutorSel(tutor); setModalVincular(true); }}>
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600" onClick={() => handleEliminar(tutor)}>
                        <Trash2 className="h-4 w-4" />
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
          <DialogHeader><DialogTitle>Detalle del Tutor</DialogTitle><DialogDescription>Información completa.</DialogDescription></DialogHeader>
          {tutorSel && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg"><UserCircle className="h-6 w-6 text-[#7C3AED]" /></div>
                <div>
                  <p className="font-bold">{tutorSel.persona.nombre} {tutorSel.persona.apellidos}</p>
                  {tutorSel.parentesco && <p className="text-[#6B7280] text-xs">{tutorSel.parentesco}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tutorSel.persona.curp && <div><p className="text-[#6B7280]">CURP</p><p className="font-mono text-xs">{tutorSel.persona.curp}</p></div>}
                {tutorSel.persona.telefono && <div><p className="text-[#6B7280]">Teléfono</p><p>{tutorSel.persona.telefono}</p></div>}
                {tutorSel.ocupacion && <div><p className="text-[#6B7280]">Ocupación</p><p>{tutorSel.ocupacion}</p></div>}
                {tutorSel.persona.direccion && <div className="col-span-2"><p className="text-[#6B7280]">Dirección</p><p>{tutorSel.persona.direccion}</p></div>}
              </div>
              {tutorSel.alumnos.length > 0 && (
                <div>
                  <p className="font-semibold text-[#111827] mb-2">Alumnos vinculados</p>
                  {tutorSel.alumnos.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg mb-1">
                      <GraduationCap className="h-4 w-4 text-[#1D4ED8]" />
                      <span>{a.persona.nombre} {a.persona.apellidos}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setModalDetalle(false)}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal editar */}
      <Dialog open={modalEditar} onOpenChange={(open) => { setModalEditar(open); if (!open) { setTutorSel(null); setForm(formVacio); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar Tutor</DialogTitle><DialogDescription>Modifica los datos.</DialogDescription></DialogHeader>
          <FormTutor form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEditar(false)}>Cancelar</Button>
            <Button onClick={handleEditar} disabled={saving} className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal vincular alumno */}
      <Dialog open={modalVincular} onOpenChange={(open) => { setModalVincular(open); if (!open) { setAlumnoVincularId(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular Alumno</DialogTitle>
            <DialogDescription>Vincula un alumno a {tutorSel?.persona.nombre} {tutorSel?.persona.apellidos}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Seleccionar alumno</Label>
            <Select value={alumnoVincularId} onValueChange={setAlumnoVincularId}>
              <SelectTrigger><SelectValue placeholder="Buscar alumno..." /></SelectTrigger>
              <SelectContent>
                {alumnos
                  .filter((a) => !tutorSel?.alumnos.some((ta) => ta.id === a.id))
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.persona.nombre} {a.persona.apellidos} — {a.persona.curp}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalVincular(false)}>Cancelar</Button>
            <Button onClick={handleVincular} disabled={saving || !alumnoVincularId} className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vincular"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
