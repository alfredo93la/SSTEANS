import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Textarea } from "../../Components/ui/textarea";
import { PageTitle } from "../../Layouts/PageTitle";
import {
  BookOpen,
  Search,
  Edit,
  Trash2,
  Plus,
  BookMarked,
  Clock,
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../../Components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { toast } from "sonner";

interface Grado { id: number; numero: number; descripcion: string; }
interface Materia {
  id: number;
  grado_id: number;
  nombre: string;
  descripcion: string | null;
  horas_semanales: number;
  grado?: Grado;
}

const PALETA = [
  { bg: "bg-blue-500",    light: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"    },
  { bg: "bg-violet-500",  light: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200"  },
  { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  { bg: "bg-rose-500",    light: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200"    },
  { bg: "bg-amber-500",   light: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"   },
  { bg: "bg-cyan-500",    light: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200"    },
  { bg: "bg-orange-500",  light: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200"  },
  { bg: "bg-pink-500",    light: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200"    },
  { bg: "bg-teal-500",    light: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200"    },
  { bg: "bg-indigo-500",  light: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200"  },
];

function colorMateria(nombre: string) {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash = (hash * 31 + nombre.charCodeAt(i)) >>> 0;
  return PALETA[hash % PALETA.length];
}

const formVacio = { grado_id: "", nombre: "", descripcion: "", horas_semanales: "3" };

type MateriaForm = typeof formVacio;

function FormMateria({ form, setForm, grados }: {
  form: MateriaForm;
  setForm: (f: MateriaForm) => void;
  grados: Grado[];
}) {
  const gradoLabel = (numero: number) => `${numero}°`;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label>Nombre de la materia *</Label>
          <Input value={form.nombre} maxLength={255} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Matemáticas IV" />
        </div>
        <div className="space-y-2">
          <Label>Grado *</Label>
          <Select value={form.grado_id} onValueChange={(v) => setForm({ ...form, grado_id: v })}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {grados.map((g) => (
                <SelectItem key={g.id} value={g.id.toString()}>{gradoLabel(g.numero)} — {g.descripcion}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Horas por semana *</Label>
          <Input type="number" min="1" max="10" value={form.horas_semanales} onChange={(e) => setForm({ ...form, horas_semanales: e.target.value })} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Descripción</Label>
          <Textarea rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción opcional" className="resize-none" />
        </div>
      </div>
    </div>
  );
}

export function Materias() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("todos");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [editando, setEditando] = useState<Materia | null>(null);
  const [saving, setSaving] = useState(false);
  const [eliminando, setEliminando] = useState<number | null>(null);

  const cargar = () => {
    setLoading(true);
    axios.get("/api/admin/materias")
      .then(({ data }) => {
        setMaterias(data.materias);
        setGrados(data.grados);
      })
      .catch(() => toast.error("No se pudieron cargar las materias."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const validarMateria = () => {
    if (!form.nombre.trim() || form.nombre.trim().length < 2) {
      toast.error("El nombre de la materia debe tener al menos 2 caracteres."); return false;
    }
    if (!form.grado_id) { toast.error("Debes seleccionar un grado."); return false; }
    const horas = Number(form.horas_semanales);
    if (isNaN(horas) || horas < 1 || horas > 10) {
      toast.error("Las horas por semana deben ser entre 1 y 10."); return false;
    }
    return true;
  };

  const handleGuardar = () => {
    if (!validarMateria()) return;
    setSaving(true);
    axios.post("/api/admin/materias", form)
      .then(({ data }) => {
        setMaterias((prev) => [...prev, data.materia]);
        setModalNuevo(false);
        setForm(formVacio);
        toast.success("Materia creada correctamente.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al crear la materia."))
      .finally(() => setSaving(false));
  };

  const handleEditar = () => {
    if (!editando || !validarMateria()) return;
    setSaving(true);
    axios.put(`/api/admin/materias/${editando.id}`, form)
      .then(({ data }) => {
        setMaterias((prev) => prev.map((m) => m.id === data.materia.id ? data.materia : m));
        setModalEditar(false);
        setEditando(null);
        toast.success("Materia actualizada.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al actualizar."))
      .finally(() => setSaving(false));
  };

  const handleEliminar = (materia: Materia) => {
    if (!confirm(`¿Eliminar "${materia.nombre}"?`)) return;
    setEliminando(materia.id);
    axios.delete(`/api/admin/materias/${materia.id}`)
      .then(() => {
        setMaterias((prev) => prev.filter((m) => m.id !== materia.id));
        toast.success("Materia eliminada.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "No se pudo eliminar."))
      .finally(() => setEliminando(null));
  };

  const abrirEditar = (materia: Materia) => {
    setEditando(materia);
    setForm({
      grado_id: materia.grado_id.toString(),
      nombre: materia.nombre,
      descripcion: materia.descripcion ?? "",
      horas_semanales: materia.horas_semanales.toString(),
    });
    setModalEditar(true);
  };

  const filtered = materias.filter((m) => {
    const coincideBusqueda = m.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideGrado = filtroGrado === "todos" || m.grado_id.toString() === filtroGrado;
    return coincideBusqueda && coincideGrado;
  });

  const gradoLabel = (numero: number) => `${numero}°`;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={BookMarked} title="Administración de Materias" description="Administra el catálogo de materias del plan de estudios" color="bg-[#059669]">
        <Dialog open={modalNuevo} onOpenChange={(open) => { setModalNuevo(open); if (!open) setForm(formVacio); }}>
          <DialogTrigger asChild>
            <Button className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Plus className="h-4 w-4 mr-2" />Nueva Materia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nueva Materia</DialogTitle>
              <DialogDescription>Agrega una materia al plan de estudios.</DialogDescription>
            </DialogHeader>
            <FormMateria form={form} setForm={setForm} grados={grados} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalNuevo(false)}>Cancelar</Button>
              <Button onClick={handleGuardar} disabled={saving} className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Materia"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTitle>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <BookMarked className="h-6 w-6 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total Materias</p>
                <p className="text-2xl font-bold text-[#7C3AED]">{materias.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {grados.map((g) => (
          <Card key={g.id} className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl">
                  <BookOpen className="h-6 w-6 text-[#1D4ED8]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B7280]">Materias {gradoLabel(g.numero)}</p>
                  <p className="text-2xl font-bold text-[#1D4ED8]">
                    {materias.filter((m) => m.grado_id === g.id).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <Input
                placeholder="Buscar por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroGrado} onValueChange={setFiltroGrado}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Grado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los grados</SelectItem>
                {grados.map((g) => (
                  <SelectItem key={g.id} value={g.id.toString()}>{gradoLabel(g.numero)} — {g.descripcion}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de materias */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-[#1D4ED8]" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[#6B7280] text-center py-10">No hay materias registradas.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((materia) => {
            const color = colorMateria(materia.nombre);
            return (
            <Card key={materia.id} className={`hover:shadow-lg transition-all border ${color.border}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 ${color.bg} rounded-xl`}>
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{materia.nombre}</CardTitle>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {materia.grado ? `${gradoLabel(materia.grado.numero)} — ${materia.grado.descripcion}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Horas/semana:</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />{materia.horas_semanales}h
                  </Badge>
                </div>
                {materia.descripcion && (
                  <p className="text-xs text-[#6B7280] line-clamp-2">{materia.descripcion}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => abrirEditar(materia)}>
                    <Edit className="h-3.5 w-3.5 mr-1" />Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={eliminando === materia.id}
                    className="text-[#E11D48] border-[#E11D48] hover:bg-red-50"
                    onClick={() => handleEliminar(materia)}
                  >
                    {eliminando === materia.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
          })}
        </div>
      )}

      {/* Modal editar */}
      <Dialog open={modalEditar} onOpenChange={(open) => { setModalEditar(open); if (!open) { setEditando(null); setForm(formVacio); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Materia</DialogTitle>
            <DialogDescription>Modifica los datos de la materia.</DialogDescription>
          </DialogHeader>
          <FormMateria form={form} setForm={setForm} grados={grados} />
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
