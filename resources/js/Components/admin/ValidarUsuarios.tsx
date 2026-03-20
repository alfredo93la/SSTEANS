import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { UserCheck, Search, CheckCircle, XCircle, Clock, Eye, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

type EstadoValidacion = "pending" | "approved" | "rejected";

interface SolicitudUsuario {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  status: EstadoValidacion;
  rejection_reason?: string | null;
}

const getBadgeRol = (rol: string) => {
  switch (rol) {
    case "Administrador": return "bg-purple-100 text-purple-700 border-purple-200";
    case "Personal Administrativo": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Profesor": return "bg-green-100 text-green-700 border-green-200";
    case "Trabajador Social": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Tutor": return "bg-pink-100 text-pink-700 border-pink-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getBadgeEstado = (estado: EstadoValidacion) => {
  switch (estado) {
    case "pending": return "bg-[#FEF3C7] text-[#D97706] border-0";
    case "approved": return "bg-[#ECFDF5] text-[#059669] border-0";
    case "rejected": return "bg-[#FEE2E2] text-[#E11D48] border-0";
  }
};

const getLabelEstado = (estado: EstadoValidacion) => estado === "pending" ? "Pendiente" : estado === "approved" ? "Aprobado" : "Rechazado";

export function ValidarUsuarios() {
  const [solicitudes, setSolicitudes] = useState<SolicitudUsuario[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroRol, setFiltroRol] = useState<string>("todos");

  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalRechazo, setModalRechazo] = useState(false);
  const [seleccionada, setSeleccionada] = useState<SolicitudUsuario | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  const cargarSolicitudes = async () => {
    try {
      const { data } = await window.axios.get("/admin/validar-usuarios", {
        params: { search: busqueda, status: filtroEstado, role: filtroRol },
      });
      setSolicitudes(data.requests ?? []);
    } catch {
      toast.error("No se pudieron cargar las solicitudes");
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, [busqueda, filtroEstado, filtroRol]);

  const pendientes = useMemo(() => solicitudes.filter((s) => s.status === "pending").length, [solicitudes]);
  const aprobados = useMemo(() => solicitudes.filter((s) => s.status === "approved").length, [solicitudes]);
  const rechazados = useMemo(() => solicitudes.filter((s) => s.status === "rejected").length, [solicitudes]);

  const handleAprobar = async (id: number) => {
    try {
      await window.axios.post(`/admin/validar-usuarios/${id}/aprobar`);
      toast.success("Solicitud aprobada");
      setModalDetalle(false);
      await cargarSolicitudes();
    } catch {
      toast.error("No se pudo aprobar");
    }
  };

  const handleConfirmarRechazo = async () => {
    if (!seleccionada) return;
    if (!motivoRechazo.trim()) {
      toast.error("Debes indicar el motivo del rechazo.");
      return;
    }

    try {
      await window.axios.post(`/admin/validar-usuarios/${seleccionada.id}/rechazar`, {
        reason: motivoRechazo,
      });
      toast.success("Solicitud rechazada");
      setModalRechazo(false);
      setModalDetalle(false);
      setMotivoRechazo("");
      await cargarSolicitudes();
    } catch {
      toast.error("No se pudo rechazar");
    }
  };

  const handleVerDetalle = (solicitud: SolicitudUsuario) => {
    setSeleccionada(solicitud);
    setModalDetalle(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Validar Usuarios</h1>
        <p className="text-sm text-[#6B7280] mt-1">Revisa y aprueba las solicitudes de acceso al sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-5"><p className="text-xs text-[#6B7280]">Pendientes</p><p className="text-2xl font-bold text-[#D97706] mt-1">{pendientes}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs text-[#6B7280]">Aprobados</p><p className="text-2xl font-bold text-[#059669] mt-1">{aprobados}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs text-[#6B7280]">Rechazados</p><p className="text-2xl font-bold text-[#E11D48] mt-1">{rechazados}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" /><Input placeholder="Buscar por nombre o correo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10 rounded-lg" /></div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}><SelectTrigger className="w-full lg:w-44 rounded-lg"><Filter className="h-4 w-4 mr-2 text-[#6B7280]" /><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="pending">Pendiente</SelectItem><SelectItem value="approved">Aprobado</SelectItem><SelectItem value="rejected">Rechazado</SelectItem></SelectContent></Select>
            <Select value={filtroRol} onValueChange={setFiltroRol}><SelectTrigger className="w-full lg:w-48 rounded-lg"><SelectValue placeholder="Rol" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos los roles</SelectItem><SelectItem value="Profesor">Profesor</SelectItem><SelectItem value="Tutor">Tutor</SelectItem><SelectItem value="Trabajador Social">Trabajador Social</SelectItem><SelectItem value="Personal Administrativo">Personal Administrativo</SelectItem><SelectItem value="Administrador">Administrador</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Solicitudes de acceso</CardTitle><CardDescription>{solicitudes.length} registros</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {solicitudes.map((s) => (
              <div key={s.id} className="border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-[#6B7280]">{s.email}</p>
                  <div className="flex items-center gap-2 mt-2"><Badge className={getBadgeRol(s.role)}>{s.role}</Badge><Badge className={getBadgeEstado(s.status)}>{getLabelEstado(s.status)}</Badge></div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleVerDetalle(s)}><Eye className="h-4 w-4 mr-2" />Ver</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalle de solicitud</DialogTitle><DialogDescription>Valida o rechaza la cuenta.</DialogDescription></DialogHeader>
          {seleccionada && (
            <div className="space-y-3">
              <p><strong>Nombre:</strong> {seleccionada.name}</p>
              <p><strong>Email:</strong> {seleccionada.email}</p>
              <p><strong>Rol:</strong> {seleccionada.role}</p>
              {seleccionada.rejection_reason && <p><strong>Motivo rechazo:</strong> {seleccionada.rejection_reason}</p>}
              <DialogFooter>
                <Button variant="outline" onClick={() => setModalDetalle(false)}>Cerrar</Button>
                <Button variant="destructive" onClick={() => { setMotivoRechazo(""); setModalRechazo(true); }}>Rechazar</Button>
                <Button onClick={() => handleAprobar(seleccionada.id)}>Aprobar</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={modalRechazo} onOpenChange={setModalRechazo}>
        <DialogContent>
          <DialogHeader><DialogTitle>Motivo de rechazo</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="motivo">Indica el motivo</Label>
            <Textarea id="motivo" value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} rows={4} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalRechazo(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleConfirmarRechazo}>Confirmar rechazo</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
