import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../Components/ui/dialog";
import { Plus, CalendarRange, CheckCircle, Lock, Trash2, Loader2 } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";
import { toast } from "sonner";

interface Ciclo {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  cerrado: boolean;
}

export function CiclosEscolares() {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", fecha_inicio: "", fecha_fin: "" });
  const [saving, setSaving] = useState(false);

  const cargar = () => {
    setLoading(true);
    axios.get("/api/admin/ciclos")
      .then(({ data }) => setCiclos(data.ciclos))
      .catch(() => toast.error("No se pudieron cargar los ciclos."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const handleGuardarCiclo = () => {
    if (!nuevo.nombre || !nuevo.fecha_inicio || !nuevo.fecha_fin) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }
    setSaving(true);
    axios.post("/api/admin/ciclos", nuevo)
      .then(({ data }) => {
        setCiclos((prev) => [data.ciclo, ...prev]);
        setDialogOpen(false);
        setNuevo({ nombre: "", fecha_inicio: "", fecha_fin: "" });
        toast.success("Ciclo escolar creado exitosamente");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al crear el ciclo."))
      .finally(() => setSaving(false));
  };

  const handleActivar = (id: number) => {
    axios.post(`/api/admin/ciclos/${id}/activar`)
      .then(({ data }) => {
        setCiclos((prev) => prev.map((c) => ({ ...c, activo: c.id === id ? data.ciclo.activo : false })));
        toast.success("Ciclo escolar activado.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al activar el ciclo."));
  };

  const handleCerrar = (id: number) => {
    axios.post(`/api/admin/ciclos/${id}/cerrar`)
      .then(({ data }) => {
        setCiclos((prev) => prev.map((c) => c.id === id ? data.ciclo : c));
        toast.success("Ciclo escolar cerrado correctamente.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al cerrar el ciclo."));
  };

  const handleEliminar = (id: number) => {
    axios.delete(`/api/admin/ciclos/${id}`)
      .then(() => {
        setCiclos((prev) => prev.filter((c) => c.id !== id));
        toast.success("Ciclo escolar eliminado.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al eliminar el ciclo."));
  };

  const cicloActivo = ciclos.find((c) => c.activo);

  return (
    <div className="space-y-6">
      <PageTitle icon={CalendarRange} title="Ciclos Escolares" description="Gestiona los ciclos escolares del plantel" color="bg-[#1D4ED8]" />

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <CheckCircle className="h-6 w-6 text-[#059669]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Ciclo activo</p>
                <p className="text-2xl font-bold text-[#059669]">{cicloActivo?.nombre ?? "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <CalendarRange className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total de ciclos</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{ciclos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB] bg-linear-to-br from-gray-50 to-gray-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Lock className="h-6 w-6 text-[#6B7280]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Ciclos cerrados</p>
                <p className="text-2xl font-bold text-[#6B7280]">{ciclos.filter((c) => c.cerrado).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listado */}
      <Card className="border-[#E5E7EB] rounded-3xl">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <CalendarRange className="h-5 w-5 text-[#1D4ED8]" />
              </div>
              <div>
                <CardTitle>Listado de Ciclos</CardTitle>
                <CardDescription>Solo puede haber un ciclo activo a la vez</CardDescription>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setNuevo({ nombre: "", fecha_inicio: "", fecha_fin: "" }); }}>
              <DialogTrigger asChild>
                <Button className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />Nuevo ciclo
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl max-w-md">
                <DialogHeader>
                  <DialogTitle>Nuevo Ciclo Escolar</DialogTitle>
                  <DialogDescription>
                    Registra un nuevo ciclo escolar. Solo puede haber un ciclo activo a la vez.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ncNombre">Nombre *</Label>
                    <Input
                      id="ncNombre"
                      value={nuevo.nombre}
                      onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                      placeholder="Ej. 2026-2027"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ncFini">Fecha inicio *</Label>
                      <Input
                        id="ncFini"
                        type="date"
                        value={nuevo.fecha_inicio}
                        onChange={(e) => setNuevo({ ...nuevo, fecha_inicio: e.target.value })}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ncFfin">Fecha fin *</Label>
                      <Input
                        id="ncFfin"
                        type="date"
                        value={nuevo.fecha_fin}
                        onChange={(e) => setNuevo({ ...nuevo, fecha_fin: e.target.value })}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">
                    Cancelar
                  </Button>
                  <Button onClick={handleGuardarCiclo} disabled={saving} className="bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[#1D4ED8]" />
            </div>
          ) : ciclos.length === 0 ? (
            <p className="text-sm text-[#6B7280] text-center py-8">No hay ciclos registrados.</p>
          ) : (
            <div className="space-y-3">
              {ciclos.map((ciclo) => (
                <div
                  key={ciclo.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                    ciclo.activo
                      ? "border-[#1D4ED8] bg-blue-50/50"
                      : ciclo.cerrado
                      ? "border-[#E5E7EB] bg-[#F9FAFB] opacity-60"
                      : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${ciclo.activo ? "bg-blue-100" : "bg-gray-100"}`}>
                      <CalendarRange className={`h-4 w-4 ${ciclo.activo ? "text-[#1D4ED8]" : "text-[#6B7280]"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-[#111827]">{ciclo.nombre}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {ciclo.fecha_inicio} — {ciclo.fecha_fin}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={
                        ciclo.activo
                          ? "bg-[#DBEAFE] text-[#1D4ED8] border-0"
                          : "bg-[#F3F4F6] text-[#6B7280] border-0"
                      }
                    >
                      {ciclo.activo ? "Activo" : ciclo.cerrado ? "Cerrado" : "Inactivo"}
                    </Badge>

                    {!ciclo.activo && !ciclo.cerrado && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg text-[#059669] border-[#059669] hover:bg-green-50 text-xs h-7"
                        onClick={() => handleActivar(ciclo.id)}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />Activar
                      </Button>
                    )}
                    {ciclo.activo && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg text-[#D97706] border-[#D97706] hover:bg-amber-50 text-xs h-7"
                        onClick={() => handleCerrar(ciclo.id)}
                      >
                        <Lock className="h-3.5 w-3.5 mr-1" />Cerrar ciclo
                      </Button>
                    )}
                    {!ciclo.activo && !ciclo.cerrado && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg text-[#E11D48] hover:bg-red-50 text-xs h-7"
                        onClick={() => handleEliminar(ciclo.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
