import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { PageTitle } from "../../Layouts/PageTitle";
import { DoorOpen, Search, Edit, Trash2, Plus, Loader2, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../../Components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { toast } from "sonner";

interface Salon {
  id: number;
  nombre: string;
  edificio: string | null;
  capacidad: number;
  turno: "matutino" | "vespertino" | "ambos";
}

const formVacio = { nombre: "", edificio: "", capacidad: "30", turno: "matutino" };

const TURNO_LABELS: Record<string, string> = {
  matutino: "Matutino",
  vespertino: "Vespertino",
  ambos: "Ambos",
};

const TURNO_BADGE: Record<string, string> = {
  matutino: "text-blue-700 border-blue-300",
  vespertino: "text-orange-700 border-orange-300",
  ambos: "text-green-700 border-green-300",
};

function FormSalon({ form, setForm }: { form: typeof formVacio; setForm: (f: typeof formVacio) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 space-y-2">
        <Label>Nombre / Número *</Label>
        <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Salón 1, Aula 102" />
      </div>
      <div className="space-y-2">
        <Label>Edificio</Label>
        <Input value={form.edificio} onChange={(e) => setForm({ ...form, edificio: e.target.value })} placeholder="Ej: Edificio A" />
      </div>
      <div className="space-y-2">
        <Label>Capacidad *</Label>
        <Input type="number" min="1" max="100" value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: e.target.value })} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label>Turno *</Label>
        <Select value={form.turno} onValueChange={(v) => setForm({ ...form, turno: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="matutino">Matutino</SelectItem>
            <SelectItem value="vespertino">Vespertino</SelectItem>
            <SelectItem value="ambos">Ambos turnos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function Salones() {
  const [salones, setSalones] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTurno, setFiltroTurno] = useState("todos");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [salonSel, setSalonSel] = useState<Salon | null>(null);
  const [form, setForm] = useState(formVacio);
  const [saving, setSaving] = useState(false);

  const cargar = () => {
    setLoading(true);
    axios.get("/api/administrativo/salones")
      .then(({ data }) => setSalones(data.salones))
      .catch(() => toast.error("No se pudieron cargar los salones."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const handleGuardar = () => {
    if (!form.nombre) { toast.error("El nombre es obligatorio."); return; }
    setSaving(true);
    axios.post("/api/administrativo/salones", form)
      .then(({ data }) => {
        setSalones((prev) =>
          [...prev, data.salon].sort((a, b) =>
            (a.edificio ?? "").localeCompare(b.edificio ?? "") || a.nombre.localeCompare(b.nombre)
          )
        );
        setModalNuevo(false);
        setForm(formVacio);
        toast.success("Salón registrado.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al crear el salón."))
      .finally(() => setSaving(false));
  };

  const handleEditar = () => {
    if (!salonSel || !form.nombre) { toast.error("El nombre es obligatorio."); return; }
    setSaving(true);
    axios.put(`/api/administrativo/salones/${salonSel.id}`, form)
      .then(({ data }) => {
        setSalones((prev) => prev.map((s) => s.id === data.salon.id ? data.salon : s));
        setModalEditar(false);
        setSalonSel(null);
        toast.success("Salón actualizado.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al actualizar."))
      .finally(() => setSaving(false));
  };

  const handleEliminar = (salon: Salon) => {
    if (!confirm(`¿Eliminar "${salon.nombre}"? Solo es posible si no tiene clases asignadas.`)) return;
    axios.delete(`/api/administrativo/salones/${salon.id}`)
      .then(() => {
        setSalones((prev) => prev.filter((s) => s.id !== salon.id));
        toast.success("Salón eliminado.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "No se pudo eliminar."));
  };

  const abrirEditar = (salon: Salon) => {
    setSalonSel(salon);
    setForm({ nombre: salon.nombre, edificio: salon.edificio ?? "", capacidad: salon.capacidad.toString(), turno: salon.turno });
    setModalEditar(true);
  };

  const filtered = salones.filter((s) => {
    const texto = `${s.nombre} ${s.edificio ?? ""}`.toLowerCase();
    return (
      (!busqueda || texto.includes(busqueda.toLowerCase())) &&
      (filtroTurno === "todos" || s.turno === filtroTurno)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={DoorOpen} title="Gestión de Salones" description="Aulas y espacios disponibles en la escuela" color="bg-[#0891B2]">
        <Dialog open={modalNuevo} onOpenChange={(open) => { setModalNuevo(open); if (!open) setForm(formVacio); }}>
          <DialogTrigger asChild>
            <Button className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Plus className="h-4 w-4 mr-2" />Nuevo Salón
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nuevo Salón</DialogTitle>
              <DialogDescription>Registra un aula o espacio físico.</DialogDescription>
            </DialogHeader>
            <FormSalon form={form} setForm={setForm} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalNuevo(false)}>Cancelar</Button>
              <Button onClick={handleGuardar} disabled={saving} className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Salón"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTitle>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total salones", value: salones.length, color: "text-[#0891B2]", from: "from-cyan-50", to: "to-cyan-100" },
          { label: "Turno matutino", value: salones.filter((s) => s.turno === "matutino" || s.turno === "ambos").length, color: "text-[#1D4ED8]", from: "from-blue-50", to: "to-blue-100" },
          { label: "Turno vespertino", value: salones.filter((s) => s.turno === "vespertino" || s.turno === "ambos").length, color: "text-[#D97706]", from: "from-amber-50", to: "to-amber-100" },
        ].map(({ label, value, color, from, to }) => (
          <Card key={label} className={`border-[#E5E7EB] bg-linear-to-br ${from} ${to}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl"><DoorOpen className={`h-6 w-6 ${color}`} /></div>
                <div>
                  <p className="text-sm text-[#6B7280]">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <Input placeholder="Buscar por nombre o edificio..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10" />
            </div>
            <Select value={filtroTurno} onValueChange={setFiltroTurno}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Turno" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los turnos</SelectItem>
                <SelectItem value="matutino">Matutino</SelectItem>
                <SelectItem value="vespertino">Vespertino</SelectItem>
                <SelectItem value="ambos">Ambos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#0891B2]" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[#6B7280] text-center py-10">No hay salones registrados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((salon) => (
            <Card key={salon.id} className="border-[#E5E7EB] hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 rounded-xl">
                      <DoorOpen className="h-5 w-5 text-[#0891B2]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{salon.nombre}</CardTitle>
                      {salon.edificio && (
                        <p className="text-xs text-[#6B7280] flex items-center gap-1">
                          <Building2 className="h-3 w-3" />{salon.edificio}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={TURNO_BADGE[salon.turno]}>
                    {TURNO_LABELS[salon.turno]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Capacidad:</span>
                  <span className="font-semibold">{salon.capacidad} personas</span>
                </div>
                <div className="flex gap-2 pt-1 justify-end">
                  <Button variant="outline" size="sm" onClick={() => abrirEditar(salon)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-[#E11D48] border-[#E11D48] hover:bg-red-50" onClick={() => handleEliminar(salon)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal editar */}
      <Dialog open={modalEditar} onOpenChange={(open) => { setModalEditar(open); if (!open) { setSalonSel(null); setForm(formVacio); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Salón</DialogTitle>
            <DialogDescription>Modifica los datos del salón.</DialogDescription>
          </DialogHeader>
          <FormSalon form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEditar(false)}>Cancelar</Button>
            <Button onClick={handleEditar} disabled={saving} className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
