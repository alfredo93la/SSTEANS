import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Components/ui/card";
import { colorMateria } from "../../lib/horarioColors";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { PageTitle } from "../../Layouts/PageTitle";
import { Clock, Edit, Plus, Trash2, Loader2, X, ChevronsUpDown, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../../Components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../../Components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../Components/ui/command";
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

interface Sesion {
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}

function ProfesorCombobox({ value, onChange, profesores }: {
  value: string;
  onChange: (v: string) => void;
  profesores: ProfesorUser[];
}) {
  const [open, setOpen] = useState(false);
  const selected = profesores.find((p) => p.id.toString() === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
          <span className="truncate">{selected ? selected.name : "Buscar profesor..."}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar por nombre..." />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {profesores.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.name}
                  onSelect={() => { onChange(p.id.toString()); setOpen(false); }}
                >
                  <Check className={`mr-2 h-4 w-4 ${value === p.id.toString() ? "opacity-100" : "opacity-0"}`} />
                  {p.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes"] as const;
const DIAS_LABEL: Record<string, string> = { lunes: "Lunes", martes: "Martes", miercoles: "Miércoles", jueves: "Jueves", viernes: "Viernes" };

const sesionVacia = (): Sesion => ({ dia_semana: "lunes", hora_inicio: "07:00", hora_fin: "08:00" });

const formNuevoVacio = {
  grupo_id: "",
  materia_id: "",
  profesor_user_id: "",
  salon_id: "",
  sesiones: [sesionVacia()] as Sesion[],
};

const formEditVacio = { grupo_id: "", materia_id: "", profesor_user_id: "", salon_id: "", dia_semana: "lunes", hora_inicio: "07:00", hora_fin: "08:00" };
type ClaseFormEdit = typeof formEditVacio;

function FormNuevaClase({ form, setForm, grupos, materiasFiltradas, salones, profesores }: {
  form: typeof formNuevoVacio;
  setForm: (f: typeof formNuevoVacio) => void;
  grupos: Grupo[];
  materiasFiltradas: Materia[];
  salones: Salon[];
  profesores: ProfesorUser[];
}) {
  const updateSesion = (idx: number, campo: keyof Sesion, valor: string) => {
    const nuevas = form.sesiones.map((s, i) => i === idx ? { ...s, [campo]: valor } : s);
    setForm({ ...form, sesiones: nuevas });
  };

  const agregarSesion = () => {
    setForm({ ...form, sesiones: [...form.sesiones, sesionVacia()] });
  };

  const eliminarSesion = (idx: number) => {
    if (form.sesiones.length === 1) return;
    setForm({ ...form, sesiones: form.sesiones.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5">
      {/* Grupo */}
      <div className="space-y-2">
        <Label>Grupo *</Label>
        <Select value={form.grupo_id} onValueChange={(v) => setForm({ ...form, grupo_id: v })}>
          <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
          <SelectContent>
            {grupos.map((g) => (
              <SelectItem key={g.id} value={g.id.toString()}>
                {g.grado?.numero ?? ""}°{g.nombre} — {g.ciclo_escolar?.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Materia, Profesor, Salón */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Materia *</Label>
          <Select value={form.materia_id} onValueChange={(v) => setForm({ ...form, materia_id: v })}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {materiasFiltradas.map((m) => <SelectItem key={m.id} value={m.id.toString()}>{m.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Profesor *</Label>
          <ProfesorCombobox value={form.profesor_user_id} onChange={(v) => setForm({ ...form, profesor_user_id: v })} profesores={profesores} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Salón</Label>
          <Select value={form.salon_id || "none"} onValueChange={(v) => setForm({ ...form, salon_id: v === "none" ? "" : v })}>
            <SelectTrigger><SelectValue placeholder="Sin salón" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin salón</SelectItem>
              {salones.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}{s.edificio ? ` (${s.edificio})` : ""}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sesiones semanales */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Sesiones de la semana *</Label>
          <Button type="button" variant="outline" size="sm" onClick={agregarSesion} className="h-7 text-xs gap-1">
            <Plus className="h-3 w-3" />Agregar día
          </Button>
        </div>

        <div className="space-y-2">
          {form.sesiones.map((sesion, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <Select value={sesion.dia_semana} onValueChange={(v) => updateSesion(idx, "dia_semana", v)}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIAS.map((d) => <SelectItem key={d} value={d}>{DIAS_LABEL[d]}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={sesion.hora_inicio}
                  onChange={(e) => updateSesion(idx, "hora_inicio", e.target.value)}
                  className="w-28 h-8 text-xs"
                />
                <span className="text-gray-400 text-xs">–</span>
                <Input
                  type="time"
                  value={sesion.hora_fin}
                  onChange={(e) => updateSesion(idx, "hora_fin", e.target.value)}
                  className="w-28 h-8 text-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-400 hover:text-red-600 shrink-0"
                  onClick={() => eliminarSesion(idx)}
                  disabled={form.sesiones.length === 1}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FormEditarClase({ form, setForm, materias, salones, profesores }: {
  form: ClaseFormEdit;
  setForm: (f: ClaseFormEdit) => void;
  materias: Materia[];
  salones: Salon[];
  profesores: ProfesorUser[];
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Materia *</Label>
        <Select value={form.materia_id} onValueChange={(v) => setForm({ ...form, materia_id: v })}>
          <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
          <SelectContent>
            {materias.map((m) => <SelectItem key={m.id} value={m.id.toString()}>{m.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Profesor *</Label>
        <ProfesorCombobox value={form.profesor_user_id} onChange={(v) => setForm({ ...form, profesor_user_id: v })} profesores={profesores} />
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
  const [formNuevo, setFormNuevo] = useState(formNuevoVacio);
  const [formEdit, setFormEdit] = useState(formEditVacio);
  const [saving, setSaving] = useState(false);
  const [eliminando, setEliminando] = useState<number | null>(null);

  useEffect(() => {
    setLoadingInicial(true);
    Promise.all([
      axios.get("/api/administrativo/grupos"),
      axios.get("/api/administrativo/materias"),
      axios.get("/api/administrativo/salones"),
    ])
      .then(([gRes, mRes, sRes]) => {
        const gruposData: Grupo[] = gRes.data.grupos ?? [];
        setGrupos(gruposData);
        setMaterias(mRes.data.materias ?? []);
        setSalones(sRes.data.salones ?? []);
        if (gruposData.length > 0) {
          const primerGrupoId = gruposData[0].id.toString();
          setGrupoSelId(primerGrupoId);
          setFormNuevo((prev) => ({ ...prev, grupo_id: primerGrupoId }));
          cargarClases(primerGrupoId);
        }
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
    setFormNuevo((prev) => ({ ...prev, grupo_id: id }));
    cargarClases(id);
  };

  const resetFormNuevo = (grupoId = grupoSelId) => {
    setFormNuevo({ ...formNuevoVacio, grupo_id: grupoId, sesiones: [sesionVacia()] });
  };

  const handleGuardar = async () => {
    if (!formNuevo.grupo_id || !formNuevo.materia_id || !formNuevo.profesor_user_id) {
      toast.error("Completa todos los campos obligatorios.");
      return;
    }
    for (const s of formNuevo.sesiones) {
      if (!s.hora_inicio || !s.hora_fin) {
        toast.error("Completa las horas de todas las sesiones.");
        return;
      }
      if (s.hora_inicio >= s.hora_fin) {
        toast.error(`La hora de fin debe ser mayor que la hora de inicio en ${DIAS_LABEL[s.dia_semana]}.`);
        return;
      }
    }

    for (let i = 0; i < formNuevo.sesiones.length; i++) {
      for (let j = i + 1; j < formNuevo.sesiones.length; j++) {
        const a = formNuevo.sesiones[i];
        const b = formNuevo.sesiones[j];
        if (a.dia_semana === b.dia_semana && a.hora_inicio < b.hora_fin && b.hora_inicio < a.hora_fin) {
          toast.error(`Horario traslapado en ${DIAS_LABEL[a.dia_semana]}: ${a.hora_inicio}–${a.hora_fin} y ${b.hora_inicio}–${b.hora_fin}.`);
          return;
        }
      }
    }

    setSaving(true);
    const clasesCreadas: Clase[] = [];

    try {
      for (const sesion of formNuevo.sesiones) {
        const { data } = await axios.post("/api/administrativo/clases", {
          grupo_id: formNuevo.grupo_id,
          materia_id: formNuevo.materia_id,
          profesor_user_id: formNuevo.profesor_user_id,
          salon_id: formNuevo.salon_id || null,
          dia_semana: sesion.dia_semana,
          hora_inicio: sesion.hora_inicio,
          hora_fin: sesion.hora_fin,
        });
        clasesCreadas.push(data.clase);
      }

      setClases((prev) => [...prev, ...clasesCreadas]);
      toast.success(`${clasesCreadas.length} sesión(es) agregada(s) al horario.`);
      setModalNuevo(false);
      resetFormNuevo();
    } catch (err: any) {
      // Revertir las sesiones que sí se guardaron antes del fallo
      await Promise.allSettled(clasesCreadas.map((c) => axios.delete(`/api/administrativo/clases/${c.id}`)));
      const msg = err.response?.data?.message ?? "Error desconocido";
      const sesionFallida = formNuevo.sesiones[clasesCreadas.length];
      toast.error(`Error en ${DIAS_LABEL[sesionFallida.dia_semana]}: ${msg}. No se guardó ninguna sesión.`);
    } finally {
      setSaving(false);
    }
  };

  const handleEditar = () => {
    if (!claseSel) return;
    if (!formEdit.materia_id || !formEdit.profesor_user_id) {
      toast.error("Materia y profesor son obligatorios."); return;
    }
    if (formEdit.hora_inicio && formEdit.hora_fin && formEdit.hora_inicio >= formEdit.hora_fin) {
      toast.error("La hora de fin debe ser mayor que la hora de inicio."); return;
    }
    setSaving(true);
    axios.put(`/api/administrativo/clases/${claseSel.id}`, { ...formEdit, salon_id: formEdit.salon_id || null })
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
    setEliminando(clase.id);
    axios.delete(`/api/administrativo/clases/${clase.id}`)
      .then(() => {
        setClases((prev) => prev.filter((c) => c.id !== clase.id));
        toast.success("Clase eliminada.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al eliminar."))
      .finally(() => setEliminando(null));
  };

  const abrirEditar = (clase: Clase) => {
    setClaseSel(clase);
    setFormEdit({
      grupo_id: clase.grupo_id.toString(),
      materia_id: clase.materia_id.toString(),
      profesor_user_id: clase.profesor_user_id.toString(),
      salon_id: clase.salon_id?.toString() ?? "",
      dia_semana: clase.dia_semana,
      hora_inicio: clase.hora_inicio.substring(0, 5),
      hora_fin: clase.hora_fin.substring(0, 5),
    });
    setModalEditar(true);
  };

  const grupoSel = grupos.find((g) => g.id.toString() === grupoSelId);
  const materiasFiltradas = grupoSel?.grado ? materias.filter((m) => m.grado_id === grupoSel.grado!.id) : materias;
  const clasesPorDia = (dia: string) => clases.filter((c) => c.dia_semana === dia).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={Clock} title="Asignación de Horarios" description="Gestiona el horario de clases por grupo" color="bg-[#D97706]">
        <Dialog open={modalNuevo} onOpenChange={(open) => { setModalNuevo(open); if (!open) resetFormNuevo(); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white">
              <Plus className="h-4 w-4 mr-2" />Nueva Clase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Clase</DialogTitle>
              <DialogDescription>Define la materia, profesor y todas las sesiones de la semana.</DialogDescription>
            </DialogHeader>
            <FormNuevaClase
              form={formNuevo}
              setForm={setFormNuevo}
              grupos={grupos}
              materiasFiltradas={materiasFiltradas}
              salones={salones}
              profesores={profesores}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalNuevo(false)}>Cancelar</Button>
              <Button onClick={handleGuardar} disabled={saving} className="bg-[#1D4ED8] text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {saving ? "Guardando..." : `Agregar ${formNuevo.sesiones.length > 1 ? `${formNuevo.sesiones.length} sesiones` : "clase"}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTitle>

      {/* Selector de grupo */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Selector de Grupo</CardTitle>
          <CardDescription>Elige el grupo para ver y editar su horario.</CardDescription>
        </CardHeader>
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

      

      {/* Nombre del grupo seleccionado */}
      {grupoSel && (
        <Card className="border-[#FDE68A] bg-[#FFFBEB]">
          <CardContent className="py-3 px-4 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-lg font-bold text-[#D97706]">
              {grupoSel.grado?.numero ?? ""}°{grupoSel.nombre}
            </span>
            {grupoSel.ciclo_escolar && (
              <span className="text-sm text-[#92400E]">{grupoSel.ciclo_escolar.nombre}</span>
            )}
            <span className="text-sm text-[#92400E] capitalize">· Turno {grupoSel.turno}</span>
          </CardContent>
        </Card>
      )}

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
                      clasesDelDia.map((clase) => {
                        const color = colorMateria(clase.materia_id);
                        return (
                          <div key={clase.id} className={`p-2 rounded-lg border ${color.bg} ${color.border}`}>
                            <p className={`text-xs font-semibold leading-tight ${color.text}`}>{clase.materia?.nombre}</p>
                            <p className="text-xs text-[#6B7280] mt-0.5">{clase.hora_inicio.substring(0, 5)}–{clase.hora_fin.substring(0, 5)}</p>
                            <p className="text-xs text-[#6B7280] truncate">{clase.profesor?.name}</p>
                            {clase.salon && <p className="text-xs text-[#9CA3AF]">{clase.salon.nombre}{clase.salon.edificio ? ` (${clase.salon.edificio})` : ""}</p>}
                            <div className="flex gap-1 mt-1">
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => abrirEditar(clase)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-red-400 hover:text-red-600" onClick={() => handleEliminar(clase)} disabled={eliminando === clase.id}>
                                {eliminando === clase.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Modal editar */}
      <Dialog open={modalEditar} onOpenChange={(open) => { setModalEditar(open); if (!open) { setClaseSel(null); setFormEdit(formEditVacio); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar Clase</DialogTitle><DialogDescription>Modifica los datos de esta clase.</DialogDescription></DialogHeader>
          <FormEditarClase form={formEdit} setForm={setFormEdit} materias={materias} salones={salones} profesores={profesores} />
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
