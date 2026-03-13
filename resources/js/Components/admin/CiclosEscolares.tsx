import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus, CalendarRange, CheckCircle, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ciclosEscolares } from "../../data/mockData";

export function CiclosEscolares() {
  const [ciclos, setCiclos] = useState<Array<{
    id: number; nombre: string; fechaInicio: string; fechaFin: string; activo: boolean; cerrado?: boolean;
  }>>(ciclosEscolares);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", fechaInicio: "", fechaFin: "" });

  const handleGuardarCiclo = () => {
    if (!nuevo.nombre || !nuevo.fechaInicio || !nuevo.fechaFin) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }
    setCiclos([...ciclos, {
      id: ciclos.length + 1,
      nombre: nuevo.nombre,
      fechaInicio: nuevo.fechaInicio,
      fechaFin: nuevo.fechaFin,
      activo: false,
    }]);
    setDialogOpen(false);
    setNuevo({ nombre: "", fechaInicio: "", fechaFin: "" });
    toast.success("Ciclo escolar creado exitosamente");
  };

  const handleActivar = (id: number) => {
    setCiclos(ciclos.map(c => ({ ...c, activo: c.id === id })));
    toast.success("Ciclo escolar activado. Los demás ciclos fueron desactivados.");
  };

  const handleCerrar = (id: number) => {
    setCiclos(ciclos.map(c => c.id === id ? { ...c, activo: false, cerrado: true } : c));
    toast.success("Ciclo escolar cerrado correctamente.");
  };

  const handleEliminar = (id: number) => {
    setCiclos(ciclos.filter(c => c.id !== id));
    toast.success("Ciclo escolar eliminado.");
  };

  const cicloActivo = ciclos.find(c => c.activo);

  return (
    <div className="space-y-6">
      <div>
        <h1>Ciclos Escolares</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Gestiona los ciclos escolares del plantel
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Ciclo activo",    value: cicloActivo?.nombre ?? "Sin ciclo activo" },
          { label: "Total de ciclos", value: ciclos.length.toString() },
          { label: "Ciclos cerrados", value: ciclos.filter(c => c.cerrado).length.toString() },
        ].map(({ label, value }) => (
          <Card key={label} className="border-[#E5E7EB] rounded-2xl">
            <CardContent className="pt-5">
              <p className="text-xs text-[#6B7280]">{label}</p>
              <p className="font-semibold text-[#111827] mt-1">{value}</p>
            </CardContent>
          </Card>
        ))}
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
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setNuevo({ nombre: "", fechaInicio: "", fechaFin: "" }); }}>
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
                        value={nuevo.fechaInicio}
                        onChange={(e) => setNuevo({ ...nuevo, fechaInicio: e.target.value })}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ncFfin">Fecha fin *</Label>
                      <Input
                        id="ncFfin"
                        type="date"
                        value={nuevo.fechaFin}
                        onChange={(e) => setNuevo({ ...nuevo, fechaFin: e.target.value })}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">
                    Cancelar
                  </Button>
                  <Button onClick={handleGuardarCiclo} className="bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg">
                    Guardar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
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
                      {ciclo.fechaInicio} — {ciclo.fechaFin}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={
                      ciclo.activo
                        ? "bg-[#DBEAFE] text-[#1D4ED8] border-0"
                        : ciclo.cerrado
                        ? "bg-[#F3F4F6] text-[#6B7280] border-0"
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
        </CardContent>
      </Card>
    </div>
  );
}
