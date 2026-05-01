import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Switch } from "../../Components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../Components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../Components/ui/dialog";
import { Plus, BookKey, Pencil, Trash2, CheckCircle, CalendarRange } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";
import { toast } from "sonner";

interface CicloData { id: number; nombre: string; }
interface PeriodoData { id: number; cicloId: number; nombre: string; fechaInicio: string; fechaFin: string; capturaAbierta: boolean; }

export function PeriodosEvaluacion() {
  const [periodos, setPeriodos] = useState<PeriodoData[]>([]);
  const [ciclos, setCiclos] = useState<CicloData[]>([]);
  const [filtroCiclo, setFiltroCiclo] = useState("");
  const [cargando, setCargando] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState({ cicloId: "", nombre: "", fechaInicio: "", fechaFin: "" });

  useEffect(() => {
    axios.get("/api/admin/ciclos")
      .then(({ data }) => {
        const lista: CicloData[] = data.ciclos ?? [];
        setCiclos(lista);
        if (lista.length > 0) setFiltroCiclo(lista[0].id.toString());
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!filtroCiclo) return;
    setCargando(true);
    axios.get("/api/periodos", { params: { ciclo_id: filtroCiclo } })
      .then(({ data }) => setPeriodos(data.periodos ?? []))
      .catch(() => toast.error("Error al cargar periodos"))
      .finally(() => setCargando(false));
  }, [filtroCiclo]);

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
      axios.put(`/api/periodos/${editandoId}`, form)
        .then(({ data }) => {
          setPeriodos(prev => prev.map(p => p.id === editandoId ? data.periodo : p));
          toast.success("Periodo actualizado correctamente.");
          resetForm();
        })
        .catch(() => toast.error("Error al actualizar el periodo"));
    } else {
      axios.post("/api/periodos", { ...form, cicloId: parseInt(form.cicloId) })
        .then(({ data }) => {
          setPeriodos(prev => [...prev, data.periodo]);
          toast.success("Periodo de evaluación creado.");
          resetForm();
        })
        .catch(() => toast.error("Error al crear el periodo"));
    }
  };

  const handleEditar = (p: PeriodoData) => {
    const toISO = (fecha: string) => {
      if (/^\d{4}-\d{2}-\d{2}/.test(fecha)) return fecha.slice(0, 10);
      const [d, m, y] = fecha.split('/');
      return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    };
    setForm({ cicloId: p.cicloId.toString(), nombre: p.nombre, fechaInicio: toISO(p.fechaInicio), fechaFin: toISO(p.fechaFin) });
    setEditandoId(p.id);
    setDialogOpen(true);
  };

  const handleEliminar = (id: number) => {
    axios.delete(`/api/periodos/${id}`)
      .then(() => {
        setPeriodos(prev => prev.filter(p => p.id !== id));
        toast.success("Periodo eliminado.");
      })
      .catch(() => toast.error("Error al eliminar el periodo"));
  };

  const handleToggleCaptura = (id: number) => {
    axios.patch(`/api/periodos/${id}/captura`)
      .then(({ data }) => {
        setPeriodos(prev => prev.map(x => x.id === id ? { ...x, capturaAbierta: data.capturaAbierta } : x));
        toast.success(data.capturaAbierta ? "Captura de calificaciones abierta." : "Captura de calificaciones cerrada.");
      })
      .catch(() => toast.error("Error al cambiar el estado de captura"));
  };

  const periodosFiltrados = periodos.filter(p => p.cicloId === parseInt(filtroCiclo));
  const cicloNombre = ciclos.find(c => c.id === parseInt(filtroCiclo))?.nombre ?? "";

  return (
    <div className="space-y-6">
      <PageTitle icon={BookKey} title="Periodos de Evaluación" description="Gestiona parciales y calificación final por ciclo escolar" color="bg-[#D97706]" />

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <BookKey className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Periodos en este ciclo</p>
                <p className="text-2xl font-bold text-[#D97706]">{periodosFiltrados.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <CheckCircle className="h-6 w-6 text-[#059669]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Captura abierta</p>
                <p className="text-2xl font-bold text-[#059669]">{periodosFiltrados.filter(p => p.capturaAbierta).length}</p>
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
                <p className="text-sm text-[#6B7280]">Ciclo seleccionado</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{cicloNombre || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                    <DialogTitle>{editandoId ? "Editar Periodo" : "Nuevo Periodo de Evaluación"}</DialogTitle>
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
          {cargando ? (
            <div className="text-center py-12 text-sm text-[#6B7280]">Cargando periodos…</div>
          ) : periodosFiltrados.length === 0 ? (
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
                            className="data-[state=checked]:bg-[#059669] data-[state=unchecked]:bg-[#b1b5bc]"
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
