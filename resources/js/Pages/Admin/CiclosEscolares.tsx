import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../Components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../Components/ui/alert-dialog";
import { Plus, CalendarRange, CheckCircle, Lock, Trash2, Loader2, Archive, XCircle, AlertTriangle } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";
import { toast } from "sonner";

interface Ciclo {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  cerrado: boolean;
  archivado: boolean;
}

interface Grado {
  id: number;
  numero: number;
  descripcion: string;
}

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });

export function CiclosEscolares() {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [turnosDisponibles, setTurnosDisponibles] = useState<"matutino" | "vespertino" | "ambos">("matutino");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", fecha_inicio: "", fecha_fin: "", grupos_matutino: "", grupos_vespertino: "" });
  const [saving, setSaving] = useState(false);

  const [modalCerrar, setModalCerrar] = useState(false);
  const [cicloACerrar, setCicloACerrar] = useState<Ciclo | null>(null);
  const [confirmNombre, setConfirmNombre] = useState("");
  const [checks, setChecks] = useState<{ label: string; ok: boolean; detalle: string }[]>([]);
  const [loadingChecks, setLoadingChecks] = useState(false);
  const [puedeCerrar, setPuedeCerrar] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [alertCerrar, setAlertCerrar] = useState(false);
  const [eliminando, setEliminando] = useState<number | null>(null);

  const nuevoVacio = { nombre: "", fecha_inicio: "", fecha_fin: "", grupos_matutino: "", grupos_vespertino: "" };

  const cargar = () => {
    setLoading(true);
    axios.get("/api/admin/ciclos")
      .then(({ data }) => {
        setCiclos(data.ciclos);
        if (data.grados)             setGrados(data.grados);
        if (data.turnos_disponibles) setTurnosDisponibles(data.turnos_disponibles);
      })
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
    axios.post("/api/admin/ciclos", {
      nombre:            nuevo.nombre,
      fecha_inicio:      nuevo.fecha_inicio,
      fecha_fin:         nuevo.fecha_fin,
      grupos_matutino:   nuevo.grupos_matutino   !== "" ? parseInt(nuevo.grupos_matutino)   : undefined,
      grupos_vespertino: nuevo.grupos_vespertino !== "" ? parseInt(nuevo.grupos_vespertino) : undefined,
    })
      .then(({ data }) => {
        setCiclos((prev) => [data.ciclo, ...prev]);
        setDialogOpen(false);
        setNuevo(nuevoVacio);
        toast.success(data.message ?? "Ciclo escolar creado exitosamente");
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

  const abrirModalCerrar = (ciclo: Ciclo) => {
    setCicloACerrar(ciclo);
    setConfirmNombre("");
    setChecks([]);
    setPuedeCerrar(false);
    setLoadingChecks(true);
    setModalCerrar(true);
    axios.get(`/api/admin/ciclos/${ciclo.id}/verificar-cierre`)
      .then(({ data }) => {
        setChecks(data.checks);
        setPuedeCerrar(data.puede_cerrar);
      })
      .catch(() => toast.error("No se pudo verificar el estado del ciclo."))
      .finally(() => setLoadingChecks(false));
  };

  const handleCerrar = () => {
    if (!cicloACerrar) return;
    setCerrando(true);
    axios.post(`/api/admin/ciclos/${cicloACerrar.id}/cerrar`)
      .then(({ data }) => {
        setCiclos((prev) => prev.map((c) => c.id === cicloACerrar.id ? data.ciclo : c));
        setModalCerrar(false);
        setCicloACerrar(null);
        toast.success("Ciclo escolar cerrado correctamente.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al cerrar el ciclo."))
      .finally(() => setCerrando(false));
  };

  const handleArchivar = (id: number) => {
    if (!confirm("¿Archivar este ciclo escolar? Quedará oculto pero sus datos se conservarán.")) return;
    axios.post(`/api/admin/ciclos/${id}/archivar`)
      .then(() => {
        setCiclos((prev) => prev.filter((c) => c.id !== id));
        toast.success("Ciclo archivado correctamente.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al archivar el ciclo."));
  };

  const handleEliminar = (id: number) => {
    setEliminando(id);
    axios.delete(`/api/admin/ciclos/${id}`)
      .then(() => {
        setCiclos((prev) => prev.filter((c) => c.id !== id));
        toast.success("Ciclo escolar eliminado.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Error al eliminar el ciclo."))
      .finally(() => setEliminando(null));
  };

  const cicloActivo = ciclos.find((c) => c.activo);

  return (
    <div className="space-y-6">
      <PageTitle icon={CalendarRange} title="Ciclos Escolares" description="Gestiona los ciclos escolares del plantel" color="bg-[#D97706]" />

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
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setNuevo(nuevoVacio); }}>
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

                  {/* ── Grupos iniciales ── */}
                  <div className="border-t pt-4 space-y-3">
                    <p className="text-sm font-medium text-[#374151]">Grupos iniciales <span className="text-[#9CA3AF] font-normal">(opcional)</span></p>
                    {turnosDisponibles === "ambos" ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="ncGMat" className="text-xs">Grupos matutino</Label>
                          <Input
                            id="ncGMat"
                            type="number"
                            min={0}
                            max={13}
                            value={nuevo.grupos_matutino}
                            onChange={(e) => setNuevo({ ...nuevo, grupos_matutino: e.target.value })}
                            placeholder="0"
                            className="rounded-lg"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="ncGVesp" className="text-xs">Grupos vespertino</Label>
                          <Input
                            id="ncGVesp"
                            type="number"
                            min={0}
                            max={13}
                            value={nuevo.grupos_vespertino}
                            onChange={(e) => setNuevo({ ...nuevo, grupos_vespertino: e.target.value })}
                            placeholder="0"
                            className="rounded-lg"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Label htmlFor="ncGGrupos" className="text-xs">
                          Grupos por grado ({turnosDisponibles})
                        </Label>
                        <Input
                          id="ncGGrupos"
                          type="number"
                          min={0}
                          max={13}
                          value={nuevo.grupos_matutino}
                          onChange={(e) => setNuevo({ ...nuevo, grupos_matutino: e.target.value })}
                          placeholder="0"
                          className="rounded-lg"
                        />
                      </div>
                    )}

                    {/* Preview */}
                    {(() => {
                      const nMat  = parseInt(nuevo.grupos_matutino  || "0") || 0;
                      const nVesp = parseInt(nuevo.grupos_vespertino || "0") || 0;
                      const letras = (n: number, offset = 0) =>
                        Array.from({ length: n }, (_, i) => String.fromCharCode(65 + offset + i));

                      const hayVesp = turnosDisponibles === "ambos"
                        ? nVesp > 0
                        : turnosDisponibles === "vespertino" && nMat > 0;

                      const matLetras  = letras(nMat);
                      const vespLetras = turnosDisponibles === "ambos" ? letras(nVesp, nMat) : letras(nMat);
                      const total      = (nMat + (turnosDisponibles === "ambos" ? nVesp : 0)) * grados.length;

                      if (nMat === 0 && nVesp === 0) return null;

                      return (
                        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs space-y-1.5">
                          {turnosDisponibles !== "vespertino" && nMat > 0 && (
                            <p className="text-[#1D4ED8]">
                              <span className="font-semibold">Matutino:</span>{" "}
                              {matLetras.join(", ")}
                            </p>
                          )}
                          {hayVesp && (
                            <p className="text-[#7C3AED]">
                              <span className="font-semibold">Vespertino:</span>{" "}
                              {vespLetras.join(", ")}
                            </p>
                          )}
                          {grados.length > 0 && (
                            <p className="text-[#6B7280] border-t border-blue-100 pt-1.5 mt-1">
                              {grados.map(g => `${g.numero}°`).join(", ")} → <span className="font-semibold text-[#374151]">{total} grupos en total</span>
                            </p>
                          )}
                        </div>
                      );
                    })()}
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
                        {formatFecha(ciclo.fecha_inicio)} — {formatFecha(ciclo.fecha_fin)}
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
                        onClick={() => abrirModalCerrar(ciclo)}
                      >
                        <Lock className="h-3.5 w-3.5 mr-1" />Cerrar ciclo
                      </Button>
                    )}
                    {!ciclo.activo && !ciclo.cerrado && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg text-[#E11D48] hover:bg-red-50 text-xs h-7"
                        disabled={eliminando === ciclo.id}
                        onClick={() => handleEliminar(ciclo.id)}
                      >
                        {eliminando === ciclo.id
                          ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5 mr-1" />}Eliminar
                      </Button>
                    )}
                    {ciclo.cerrado && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg text-[#6B7280] hover:bg-gray-100 text-xs h-7"
                        onClick={() => handleArchivar(ciclo.id)}
                      >
                        <Archive className="h-3.5 w-3.5 mr-1" />Archivar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal confirmación de cierre */}
      <Dialog open={modalCerrar} onOpenChange={(open) => { if (!open) { setModalCerrar(false); setCicloACerrar(null); setConfirmNombre(""); } }}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#D97706]">
              <AlertTriangle className="h-5 w-5" />
              Cerrar ciclo escolar
            </DialogTitle>
            <DialogDescription>
              Esta acción es irreversible. El ciclo no podrá volver a activarse.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Checks de negocio */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#374151]">Verificación previa:</p>
              {loadingChecks ? (
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Loader2 className="h-4 w-4 animate-spin" /> Verificando condiciones...
                </div>
              ) : (
                checks.map((check, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-sm ${check.ok ? "bg-green-50 text-[#059669]" : "bg-red-50 text-[#E11D48]"}`}>
                    {check.ok
                      ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      : <XCircle className="h-4 w-4 mt-0.5 shrink-0" />}
                    <div>
                      <p className="font-medium">{check.label}</p>
                      <p className="text-xs opacity-80">{check.detalle}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Campo de confirmación */}
            {!loadingChecks && puedeCerrar && (
              <div className="space-y-2">
                <Label className="text-sm text-[#374151]">
                  Escribe <span className="font-semibold text-[#111827]">{cicloACerrar?.nombre}</span> para confirmar:
                </Label>
                <Input
                  value={confirmNombre}
                  onChange={(e) => setConfirmNombre(e.target.value)}
                  placeholder={cicloACerrar?.nombre}
                  className="rounded-lg"
                />
              </div>
            )}

            {!loadingChecks && !puedeCerrar && (
              <p className="text-sm text-[#E11D48] bg-red-50 p-3 rounded-lg">
                Resuelve los problemas anteriores antes de cerrar el ciclo.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCerrar(false)} className="rounded-lg">
              Cancelar
            </Button>
            <Button
              onClick={() => setAlertCerrar(true)}
              disabled={!puedeCerrar || confirmNombre !== cicloACerrar?.nombre || cerrando}
              className="bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg"
            >
              {cerrando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cerrar ciclo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertCerrar} onOpenChange={setAlertCerrar}>
        <AlertDialogContent className="rounded-3xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[#D97706]">
              <AlertTriangle className="h-5 w-5" />
              ¿Confirmar cierre?
            </AlertDialogTitle>
            <AlertDialogDescription>
              El ciclo <span className="font-semibold text-[#111827]">{cicloACerrar?.nombre}</span> quedará cerrado permanentemente. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCerrar}
              disabled={cerrando}
              className="bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg"
            >
              {cerrando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sí, cerrar ciclo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
