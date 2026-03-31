import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { PageTitle } from "../../Components/PageTitle";
import { Clock, Edit, Plus, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../../Components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { toast } from "sonner";

interface Grado { id: number; numero: number; }
interface Ciclo { id: number; nombre: string; }
interface Grupo { id: number; nombre: string; turno: string; grado?: Grado; ciclo_escolar?: Ciclo; }
interface Materia { id: number; nombre: string; grado_id: number; }
interface Salon { id: number; nombre: string; edificio: string | null; }
interface ProfesorUser { id: number; name: string; }
interface Clase {
  id: number;
  grupo_id: number;
  materia_id: number;
  profesor_user_id: number;
  salon_id: number | null;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  materia?: Materia;
  profesor?: ProfesorUser;
  salon?: Salon;
}

const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes"] as const;
const DIAS_LABEL: Record<string, string> = { lunes: "Lunes", martes: "Martes", miercoles: "Miércoles", jueves: "Jueves", viernes: "Viernes" };
const formVacio = { grupo_id: "", materia_id: "", profesor_user_id: "", salon_id: "", dia_semana: "lunes", hora_inicio: "07:00", hora_fin: "08:00" };

type ClaseForm = typeof formVacio;

function FormClase({ form, setForm, grupos, materias, materiasFiltradas, salones, profesores, isEdit = false }: {
  form: ClaseForm;
  setForm: (f: ClaseForm) => void;
  grupos: Grupo[];
  materias: Materia[];
  materiasFiltradas: Materia[];
  salones: Salon[];
  profesores: ProfesorUser[];
  isEdit?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {!isEdit && (
          <div className="col-span-2 space-y-2">
            <Label>Grupo *</Label>
            <Select value={form.grupo_id} onValueChange={(v) => setForm({ ...form, grupo_id: v })}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {grupos.map((g) => <SelectItem key={g.id} value={g.id.toString()}>{g.grado?.numero ?? ""}°{g.nombre} — {g.ciclo_escolar?.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label>Materia *</Label>
          <Select value={form.materia_id} onValueChange={(v) => setForm({ ...form, materia_id: v })}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {(isEdit ? materias : materiasFiltradas).map((m) => <SelectItem key={m.id} value={m.id.toString()}>{m.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Profesor *</Label>
          <Select value={form.profesor_user_id} onValueChange={(v) => setForm({ ...form, profesor_user_id: v })}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {profesores.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Día *</Label>
          <Select value={form.dia_semana} onValueChange={(v) => setForm({ ...form, dia_semana: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DIAS.map((d) => <SelectItem key={d} value={d}>{DIAS_LABEL[d]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Salón</Label>
          <Select value={form.salon_id || "none"} onValueChange={(v) => setForm({ ...form, salon_id: v === "none" ? "" : v })}>
            <SelectTrigger><SelectValue placeholder="Sin salón" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin salón</SelectItem>
              {salones.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}{s.edificio ? ` (${s.edificio})` : ""}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Hora inicio *</Label>
          <Input type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Hora fin *</Label>
          <Input type="time" value={form.hora_fin} onChange={(e) => setForm({ ...form, hora_fin: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

export function Horarios() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [salones, setSalones] = useState<Salon[]>([]);
  const [profesores, setProfesores] = useState<ProfesorUser[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [grupoSelId, setGrupoSelId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [claseSel, setClaseSel] = useState<Clase | null>(null);
  const [form, setForm] = useState(formVacio);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoadingInicial(true);
    Promise.all([
      axios.get("/api/administrativo/grupos"),
      axios.get("/api/administrativo/materias"),
      axios.get("/api/administrativo/salones"),
    ])
      .then(([gRes, mRes, sRes]) => {
        setGrupos(gRes.data.grupos ?? []);
        setMaterias(mRes.data.materias ?? []);
        setSalones(sRes.data.salones ?? []);
      })
      .catch(() => toast.error("Error al cargar datos iniciales."))
      .finally(() => setLoadingInicial(false));
  }, []);

  const cargarClases = (grupoId: string) => {
    if (!grupoId) return;
    setLoading(true);
    axios.get("/api/administrativo/clases", { params: { grupo_id: grupoId } })
      .then(({ data }) => {
        setClases(data.clases);
        setProfesores(data.profesores ?? []);
      })
      .catch(() => toast.error("No se pudieron cargar las clases."))
      .finally(() => setLoading(false));
  };

  const handleSelGrupo = (id: string) => {
    setGrupoSelId(id);
    setForm((prev) => ({ ...prev, grupo_id: id }));
    cargarClases(id);
  };

  const handleGuardar = () => {
    if (!form.grupo_id || !form.materia_id || !form.profesor_user_id || !form.hora_inicio || !form.hora_fin) {
      toast.error("Completa todos los campos obligatorios.");
      return;
    }
    setSaving(true);
    axios.post("/api/administrativo/clases", { ...form, salon_id: form.salon_id || null })
      .then(({ data }) => {
        setClases((prev) => [...prev, data.clase]);
        setModalNuevo(false);
        setForm({ ...formVacio, grupo_id: grupoSelId });
        toast.success("Clase agregada al horario.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al crear la clase."))
      .finally(() => setSaving(false));
  };

  const handleEditar = () => {
    if (!claseSel) return;
    setSaving(true);
    axios.put(`/api/administrativo/clases/${claseSel.id}`, { ...form, salon_id: form.salon_id || null })
      .then(({ data }) => {
        setClases((prev) => prev.map((c) => c.id === data.clase.id ? data.clase : c));
        setModalEditar(false);
        setClaseSel(null);
        toast.success("Clase actualizada.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al actualizar."))
      .finally(() => setSaving(false));
  };

  const handleEliminar = (clase: Clase) => {
    if (!confirm("¿Eliminar esta clase del horario?")) return;
    axios.delete(`/api/administrativo/clases/${clase.id}`)
      .then(() => {
        setClases((prev) => prev.filter((c) => c.id !== clase.id));
        toast.success("Clase eliminada.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al eliminar."));
  };

  const abrirEditar = (clase: Clase) => {
    setClaseSel(clase);
    setForm({
      grupo_id: clase.grupo_id.toString(),
      materia_id: clase.materia_id.toString(),
      profesor_user_id: clase.profesor_user_id.toString(),
      salon_id: clase.salon_id?.toString() ?? "",
      dia_semana: clase.dia_semana,
      hora_inicio: clase.hora_inicio,
      hora_fin: clase.hora_fin,
    });
    setModalEditar(true);
  };

  const grupoSel = grupos.find((g) => g.id.toString() === grupoSelId);
  const materiasFiltradas = grupoSel?.grado ? materias.filter((m) => m.grado_id === grupoSel.grado!.id) : materias;
  const clasesPorDia = (dia: string) => clases.filter((c) => c.dia_semana === dia).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={Clock} title="Horarios" description="Gestiona el horario de clases por grupo" color="bg-[#1D4ED8]">
        <Dialog open={modalNuevo} onOpenChange={(open) => { setModalNuevo(open); if (!open) setForm({ ...formVacio, grupo_id: grupoSelId }); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white">
              <Plus className="h-4 w-4 mr-2" />Nueva Clase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nueva Clase</DialogTitle><DialogDescription>Agrega una clase al horario del grupo.</DialogDescription></DialogHeader>
            <FormClase form={form} setForm={setForm} grupos={grupos} materias={materias} materiasFiltradas={materiasFiltradas} salones={salones} profesores={profesores} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalNuevo(false)}>Cancelar</Button>
              <Button onClick={handleGuardar} disabled={saving} className="bg-[#1D4ED8] text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Agregar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTitle>

      {/* Selector de grupo */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Label className="shrink-0">Grupo:</Label>
            {loadingInicial ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Select value={grupoSelId} onValueChange={handleSelGrupo}>
                <SelectTrigger className="w-full sm:w-72">
                  <SelectValue placeholder="Seleccionar grupo para ver su horario" />
                </SelectTrigger>
                <SelectContent>
                  {grupos.map((g) => (
                    <SelectItem key={g.id} value={g.id.toString()}>
                      {g.grado?.numero ?? ""}°{g.nombre} — {g.ciclo_escolar?.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Horario en columnas por día */}
      {grupoSelId && (
        loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#1D4ED8]" /></div>
        ) : clases.length === 0 ? (
          <Card className="border-[#E5E7EB]">
            <CardContent className="py-12 text-center">
              <Clock className="h-10 w-10 text-[#D1D5DB] mx-auto mb-3" />
              <p className="text-[#6B7280]">No hay clases asignadas a este grupo.</p>
              <p className="text-sm text-[#9CA3AF] mt-1">Usa "Nueva Clase" para agregar al horario.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {DIAS.map((dia) => {
              const clasesDelDia = clasesPorDia(dia);
              return (
                <Card key={dia} className="border-[#E5E7EB]">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-sm font-semibold text-[#374151]">{DIAS_LABEL[dia]}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 space-y-2">
                    {clasesDelDia.length === 0 ? (
                      <p className="text-xs text-[#9CA3AF] text-center py-2">—</p>
                    ) : (
                      clasesDelDia.map((clase) => (
                        <div key={clase.id} className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs font-semibold text-[#1D4ED8] leading-tight">{clase.materia?.nombre}</p>
                          <p className="text-xs text-[#6B7280] mt-0.5">{clase.hora_inicio}–{clase.hora_fin}</p>
                          <p className="text-xs text-[#6B7280] truncate">{clase.profesor?.name}</p>
                          {clase.salon && <p className="text-xs text-[#9CA3AF]">{clase.salon.nombre}</p>}
                          <div className="flex gap-1 mt-1">
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => abrirEditar(clase)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-red-400 hover:text-red-600" onClick={() => handleEliminar(clase)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Modal editar */}
      <Dialog open={modalEditar} onOpenChange={(open) => { setModalEditar(open); if (!open) { setClaseSel(null); setForm({ ...formVacio, grupo_id: grupoSelId }); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar Clase</DialogTitle><DialogDescription>Modifica los datos de esta clase.</DialogDescription></DialogHeader>
          <FormClase form={form} setForm={setForm} grupos={grupos} materias={materias} materiasFiltradas={materiasFiltradas} salones={salones} profesores={profesores} isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEditar(false)}>Cancelar</Button>
            <Button onClick={handleEditar} disabled={saving} className="bg-[#1D4ED8] text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
