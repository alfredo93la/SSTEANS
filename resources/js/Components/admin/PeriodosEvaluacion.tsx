import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus, BookKey, Pencil, Trash2 } from "lucide-react";
import { PageTitle } from "../PageTitle";
import { toast } from "sonner";
import { ciclosEscolares } from "../../data/mockData";

const PERIODOS_INICIALES = [
  { id: 1, cicloId: 1, nombre: "1er Trimestre",        fechaInicio: "01/09/2025", fechaFin: "31/10/2025", capturaAbierta: false },
  { id: 2, cicloId: 1, nombre: "2do Trimestre",        fechaInicio: "03/11/2025", fechaFin: "19/12/2025", capturaAbierta: true  },
  { id: 3, cicloId: 1, nombre: "3er Trimestre",        fechaInicio: "12/01/2026", fechaFin: "27/02/2026", capturaAbierta: false },
  { id: 4, cicloId: 1, nombre: "Calificación Final", fechaInicio: "02/03/2026", fechaFin: "30/06/2026", capturaAbierta: false },
  { id: 5, cicloId: 2, nombre: "1er Trimestre",        fechaInicio: "01/09/2024", fechaFin: "31/10/2024", capturaAbierta: false },
  { id: 6, cicloId: 2, nombre: "2do Trimestre",        fechaInicio: "04/11/2024", fechaFin: "20/12/2024", capturaAbierta: false },
  { id: 7, cicloId: 2, nombre: "3er Trimestre",        fechaInicio: "13/01/2025", fechaFin: "28/02/2025", capturaAbierta: false },
  { id: 8, cicloId: 2, nombre: "Calificación Final", fechaInicio: "03/03/2025", fechaFin: "30/06/2025", capturaAbierta: false },
];

export function PeriodosEvaluacion() {
  const [periodos, setPeriodos] = useState(PERIODOS_INICIALES);
  const [ciclos] = useState(ciclosEscolares);
  const [filtroCiclo, setFiltroCiclo] = useState("1");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState({ cicloId: "1", nombre: "", fechaInicio: "", fechaFin: "" });

  const resetForm = () => {
    setDialogOpen(false);
    setEditandoId(null);
    setForm({ cicloId: filtroCiclo, nombre: "", fechaInicio: "", fechaFin: "" });
  };

  const handleGuardar = () => {
    if (!form.nombre || !form.fechaInicio || !form.fechaFin) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }
    if (editandoId !== null) {
      setPeriodos(periodos.map(p =>
        p.id === editandoId
          ? { ...p, nombre: form.nombre, fechaInicio: form.fechaInicio, fechaFin: form.fechaFin, cicloId: parseInt(form.cicloId) }
          : p
      ));
      toast.success("Periodo actualizado correctamente.");
    } else {
      setPeriodos([...periodos, {
        id: periodos.length + 1,
        cicloId: parseInt(form.cicloId),
        nombre: form.nombre,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        capturaAbierta: false,
      }]);
      toast.success("Periodo de evaluación creado.");
    }
    resetForm();
  };

  const handleEditar = (p: typeof periodos[0]) => {
    setForm({ cicloId: p.cicloId.toString(), nombre: p.nombre, fechaInicio: p.fechaInicio, fechaFin: p.fechaFin });
    setEditandoId(p.id);
    setDialogOpen(true);
  };

  const handleEliminar = (id: number) => {
    setPeriodos(periodos.filter(p => p.id !== id));
    toast.success("Periodo eliminado.");
  };

  const handleToggleCaptura = (id: number) => {
    const p = periodos.find(x => x.id === id);
    setPeriodos(periodos.map(x => x.id === id ? { ...x, capturaAbierta: !x.capturaAbierta } : x));
    toast.success(p?.capturaAbierta ? "Captura de calificaciones cerrada." : "Captura de calificaciones abierta.");
  };

  const periodosFiltrados = periodos.filter(p => p.cicloId === parseInt(filtroCiclo));
  const cicloNombre = ciclos.find(c => c.id === parseInt(filtroCiclo))?.nombre ?? "";

  return (
    <div className="space-y-6">
      <PageTitle icon={BookKey} title="Periodos de Evaluación" description="Gestiona parciales y calificación final por ciclo escolar" color="bg-[#D97706]" />

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Periodos en este ciclo", value: periodosFiltrados.length.toString() },
          { label: "Captura abierta",         value: periodosFiltrados.filter(p => p.capturaAbierta).length.toString() },
          { label: "Ciclo seleccionado",      value: cicloNombre },
        ].map(({ label, value }) => (
          <Card key={label} className="border-[#E5E7EB] rounded-2xl">
            <CardContent className="pt-5">
              <p className="text-xs text-[#6B7280]">{label}</p>
              <p className="font-semibold text-[#111827] mt-1">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla */}
      <Card className="border-[#E5E7EB] rounded-3xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-xl">
                <BookKey className="h-5 w-5 text-[#7C3AED]" />
              </div>
              <div>
                <CardTitle>Periodos registrados</CardTitle>
                <CardDescription>Activa o desactiva la captura de calificaciones por periodo</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={filtroCiclo}
                onValueChange={(v) => { setFiltroCiclo(v); setForm(f => ({ ...f, cicloId: v })); }}
              >
                <SelectTrigger className="w-44 rounded-lg h-9 text-sm">
                  <SelectValue placeholder="Selecciona ciclo" />
                </SelectTrigger>
                <SelectContent>
                  {ciclos.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />Nuevo periodo
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editandoId ? "Editar Período" : "Nuevo Período de Evaluación"}</DialogTitle>
                    <DialogDescription>Define el nombre y fechas del periodo.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Ciclo escolar *</Label>
                      <Select value={form.cicloId} onValueChange={(v) => setForm({ ...form, cicloId: v })}>
                        <SelectTrigger className="rounded-lg"><SelectValue placeholder="Selecciona ciclo" /></SelectTrigger>
                        <SelectContent>
                          {ciclos.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="npNombre">Nombre del periodo *</Label>
                      <Input
                        id="npNombre"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Ej. 1er Parcial"
                        className="rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="npFini">Fecha inicio *</Label>
                        <Input
                          id="npFini"
                          type="date"
                          value={form.fechaInicio}
                          onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="npFfin">Fecha fin *</Label>
                        <Input
                          id="npFfin"
                          type="date"
                          value={form.fechaFin}
                          onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetForm} className="rounded-lg">Cancelar</Button>
                    <Button onClick={handleGuardar} className="bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg">
                      {editandoId ? "Actualizar" : "Guardar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {periodosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <BookKey className="h-10 w-10 text-[#D1D5DB] mx-auto mb-3" />
              <p className="text-sm text-[#6B7280]">No hay periodos para el ciclo <strong>{cicloNombre}</strong></p>
              <p className="text-xs text-[#9CA3AF] mt-1">Crea el primer periodo con el botón "Nuevo periodo"</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F9FAFB]">
                    <TableHead>Periodo</TableHead>
                    <TableHead>Fecha inicio</TableHead>
                    <TableHead>Fecha fin</TableHead>
                    <TableHead>Captura de calificaciones</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periodosFiltrados.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nombre}</TableCell>
                      <TableCell className="text-sm text-[#6B7280]">{p.fechaInicio}</TableCell>
                      <TableCell className="text-sm text-[#6B7280]">{p.fechaFin}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={p.capturaAbierta}
                            onCheckedChange={() => handleToggleCaptura(p.id)}
                            className="data-[state=checked]:bg-[#059669]"
                          />
                          <Badge className={
                            p.capturaAbierta
                              ? "bg-[#ECFDF5] text-[#059669] border-0 text-xs"
                              : "bg-[#F3F4F6] text-[#6B7280] border-0 text-xs"
                          }>
                            {p.capturaAbierta ? "Abierta" : "Cerrada"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#1D4ED8] hover:bg-blue-50 rounded-lg"
                            onClick={() => handleEditar(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#E11D48] hover:bg-red-50 rounded-lg"
                            onClick={() => handleEliminar(p.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
