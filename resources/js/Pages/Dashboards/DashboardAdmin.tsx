import { useEffect, useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Label } from "../../Components/ui/label";
import { Textarea } from "../../Components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../Components/ui/dialog";
import {
  Shield,
  Activity,
  Clock,
  UserCheck,
  UserX,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { PageProps } from "../../types";

interface CicloData {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  cerrado: boolean;
}

interface SolicitudData {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface StatsData {
  total: number;
  activos: number;
  inactivos: number;
  roles_unicos: number;
  por_rol: Record<string, number>;
  recientes: { name: string; role: string; status: string; created_at: string }[];
}

interface DashboardAdminProps {
  onNavigate: (route: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(hours / 24);
  if (hours < 1) return "Hace menos de 1 hora";
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? "s" : ""}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

export function DashboardAdmin({ onNavigate }: DashboardAdminProps) {
  const { auth } = usePage<PageProps>().props;
  const userName = auth.user?.name ?? "Administrador";
  const userRole = auth.user?.role ?? "Administrador";

  const [stats, setStats] = useState<StatsData | null>(null);
  const [cicloActivo, setCicloActivo] = useState<CicloData | null | undefined>(undefined);
  const [solicitudes, setSolicitudes] = useState<SolicitudData[]>([]);
  const [aprobando, setAprobando] = useState<number | null>(null);
  const [solicitudARechazo, setSolicitudARechazo] = useState<SolicitudData | null>(null);
  const [modalRechazo, setModalRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [rechazando, setRechazando] = useState(false);

  useEffect(() => {
    axios.get("/admin/usuarios/stats")
      .then(({ data }) => setStats(data))
      .catch(() => {});

    axios.get("/api/admin/ciclos")
      .then(({ data }) => setCicloActivo(data.ciclo_activo ?? null))
      .catch(() => setCicloActivo(null));

    axios.get("/admin/validar-usuarios", { params: { status: "Pendiente" } })
      .then(({ data }) => setSolicitudes(data.requests ?? []))
      .catch(() => {});
  }, []);

  const usuariosActivos   = stats?.activos   ?? 0;
  const usuariosInactivos = stats?.inactivos ?? 0;
  const totalUsuarios     = stats?.total     ?? 0;
  const rolesUnicos       = stats?.roles_unicos ?? 0;

  const ROLES_ESTANDAR = [
    { rol: "Tutor",                   color: "bg-blue-100 text-[#1D4ED8]"   },
    { rol: "Profesor",                color: "bg-purple-100 text-[#7C3AED]" },
    { rol: "Trabajador Social",       color: "bg-green-100 text-[#059669]"  },
    { rol: "Personal Administrativo", color: "bg-amber-100 text-[#D97706]"  },
  ];
  const COLORES_CUSTOM = [
    "bg-teal-100 text-[#0F766E]",
    "bg-indigo-100 text-[#4338CA]",
    "bg-pink-100 text-[#BE185D]",
    "bg-orange-100 text-[#C2410C]",
    "bg-cyan-100 text-[#0E7490]",
  ];
  const nombresEstandar = new Set(ROLES_ESTANDAR.map(r => r.rol));
  const rolesCustom = Object.entries(stats?.por_rol ?? {})
    .filter(([rol]) => !nombresEstandar.has(rol))
    .map(([rol, cantidad], idx) => ({
      rol,
      color: COLORES_CUSTOM[idx % COLORES_CUSTOM.length],
      cantidad,
    }));
  const distribucionRoles = [
    ...ROLES_ESTANDAR.map(item => ({ ...item, cantidad: stats?.por_rol[item.rol] ?? 0 })),
    ...rolesCustom,
  ];

  const actividadesRecientes = useMemo(() => {
    if (!stats?.recientes.length) return [];
    return stats.recientes.map(u => ({
      accion:  u.status === "Rechazado" ? "Solicitud rechazada"
             : u.status === "Pendiente" ? "Solicitud pendiente"
             : "Usuario registrado",
      detalle: `${u.name} — ${u.role}`,
      fecha:   formatRelativeTime(u.created_at),
    }));
  }, [stats]);

  const handleAbrirRechazo = (solicitud: SolicitudData) => {
    setSolicitudARechazo(solicitud);
    setMotivoRechazo("");
    setModalRechazo(true);
  };

  const handleConfirmarRechazo = async () => {
    if (!solicitudARechazo) return;
    if (!motivoRechazo.trim()) { toast.error("Debes indicar el motivo del rechazo."); return; }
    setRechazando(true);
    try {
      await axios.post(`/admin/validar-usuarios/${solicitudARechazo.id}/rechazar`, { reason: motivoRechazo });
      setSolicitudes(prev => prev.filter(s => s.id !== solicitudARechazo.id));
      toast.success(`${solicitudARechazo.name} rechazado.`);
      setModalRechazo(false);
    } catch {
      toast.error("No se pudo rechazar la solicitud.");
    } finally {
      setRechazando(false);
    }
  };

  const handleAprobar = async (solicitud: SolicitudData) => {
    setAprobando(solicitud.id);
    try {
      await axios.post(`/admin/validar-usuarios/${solicitud.id}/aprobar`);
      setSolicitudes(prev => prev.filter(s => s.id !== solicitud.id));
      toast.success(`${solicitud.name} aprobado correctamente.`);
    } catch {
      toast.error("No se pudo aprobar la solicitud.");
    } finally {
      setAprobando(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Banner principal */}
      <Card className="bg-linear-to-br from-red-50 to-purple-50 border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-xl">
              <Shield className="h-7 w-7 text-[#E11D48]" />
            </div>
            <div>
              <h2 className="text-[#111827]">¡Bienvenido/a, {userName}!</h2>
              <p className="text-sm text-[#6B7280] mt-1 flex items-center gap-2 flex-wrap">
                <Badge className="bg-red-100 text-[#E11D48] border-0 text-xs">{userRole}</Badge>
                Administración de usuarios, roles y permisos del sistema
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ciclo escolar activo */}
      {cicloActivo !== undefined && (
        cicloActivo ? (
          <Card
            className="border-green-200 bg-linear-to-br from-green-50 to-emerald-50 cursor-pointer hover:shadow-md transition-all"
            onClick={() => onNavigate("#/ciclos")}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-100 rounded-xl">
                    <CalendarDays className="h-5 w-5 text-[#059669]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Ciclo Escolar Activo</p>
                    <p className="text-lg font-bold text-[#111827] mt-0.5">{cicloActivo.nombre}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                  <span>{formatDate(cicloActivo.fecha_inicio)} — {formatDate(cicloActivo.fecha_fin)}</span>
                  <Badge className="bg-green-100 text-[#059669]">Activo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card
            className="border-amber-200 bg-linear-to-br from-amber-50 to-yellow-50 cursor-pointer hover:shadow-md transition-all"
            onClick={() => onNavigate("#/ciclos")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-[#D97706]" />
                </div>
                <div>
                  <p className="font-semibold text-[#111827]">Sin ciclo escolar activo</p>
                  <p className="text-sm text-[#6B7280] mt-0.5">
                    El sistema no tiene un ciclo activo. Haz clic para configurarlo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-green-100 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onNavigate("#/usuarios")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <UserCheck className="h-6 w-6 text-[#059669]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Usuarios Activos</p>
                <p className="text-2xl font-bold text-[#059669]">{usuariosActivos}</p>
                <p className="text-xs text-[#6B7280] mt-1">De {totalUsuarios} registrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-[#E5E7EB] bg-linear-to-br from-red-50 to-red-100 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onNavigate("#/usuarios")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <UserX className="h-6 w-6 text-[#E11D48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Usuarios Inactivos</p>
                <p className="text-2xl font-bold text-[#E11D48]">{usuariosInactivos}</p>
                <p className="text-xs text-[#6B7280] mt-1">Cuentas desactivadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-[#E5E7EB] bg-linear-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onNavigate("#/roles")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Shield className="h-6 w-6 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Roles del Sistema</p>
                <p className="text-2xl font-bold text-[#7C3AED]">{rolesUnicos}</p>
                <p className="text-xs text-[#6B7280] mt-1">Perfiles configurados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onNavigate("#/usuarios")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Activity className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total Usuarios</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{totalUsuarios}</p>
                <p className="text-xs text-[#6B7280] mt-1">En el sistema</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución y actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#E5E7EB] flex flex-col">
          <CardHeader>
            <CardTitle>Distribución por Roles</CardTitle>
            <CardDescription>Usuarios registrados por perfil de acceso</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <div className="space-y-3 flex-1">
              {distribucionRoles.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-[#6B7280]" />
                    <span className="font-medium text-[#111827] text-sm">{item.rol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1D4ED8] rounded-full"
                        style={{ width: totalUsuarios ? `${(item.cantidad / totalUsuarios) * 100}%` : "0%" }}
                      />
                    </div>
                    <Badge className={item.color}>{item.cantidad}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 rounded-lg" onClick={() => onNavigate("#/usuarios")}>
              Ver todos los usuarios
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos usuarios registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {actividadesRecientes.length === 0 ? (
              <p className="text-sm text-[#6B7280] text-center py-6">No hay actividad registrada.</p>
            ) : (
              <div className="space-y-3">
                {actividadesRecientes.map((actividad, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-[#E5E7EB] bg-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <Activity className="h-3.5 w-3.5 text-[#6B7280] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#111827] text-xs">{actividad.accion}</p>
                          <p className="text-xs text-[#6B7280] mt-0.5">{actividad.detalle}</p>
                        </div>
                      </div>
                      <span className="text-xs text-[#6B7280] whitespace-nowrap flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {actividad.fecha}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Solicitudes pendientes de validación */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Solicitudes Pendientes
                {solicitudes.length > 0 && (
                  <Badge className="bg-red-100 text-[#E11D48]">{solicitudes.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>Usuarios registrados que esperan aprobación</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => onNavigate("#/usuarios")}>
              Ver todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {solicitudes.length === 0 ? (
            <div className="flex items-center gap-2 py-6 justify-center text-sm text-[#6B7280]">
              <CheckCircle2 className="h-4 w-4 text-[#059669]" />
              No hay solicitudes pendientes.
            </div>
          ) : (
            <div className="space-y-3">
              {solicitudes.map(s => (
                <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#111827] text-sm truncate">{s.name}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{s.email} · {s.role} · {formatRelativeTime(s.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-[#059669] hover:bg-[#047857] text-white rounded-lg h-8 px-3"
                      disabled={aprobando === s.id}
                      onClick={() => handleAprobar(s)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      {aprobando === s.id ? "..." : "Aprobar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg h-8 px-3 border-red-200 text-[#E11D48] hover:bg-red-50"
                      onClick={() => handleAbrirRechazo(s)}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal motivo de rechazo */}
      <Dialog open={modalRechazo} onOpenChange={(open) => { setModalRechazo(open); if (!open) setSolicitudARechazo(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motivo de rechazo</DialogTitle>
            <DialogDescription>
              {solicitudARechazo && `Indica el motivo para rechazar a ${solicitudARechazo.name}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="motivo-rechazo-dashboard">Motivo *</Label>
            <Textarea
              id="motivo-rechazo-dashboard"
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              rows={4}
              placeholder="Escribe el motivo del rechazo..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalRechazo(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmarRechazo} disabled={rechazando}>
              {rechazando ? "Rechazando..." : "Confirmar rechazo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
