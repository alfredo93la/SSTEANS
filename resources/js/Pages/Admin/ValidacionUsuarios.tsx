import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Label } from "../../Components/ui/label";
import { Textarea } from "../../Components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../Components/ui/dialog";
import { UserCheck, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp, Mail, IdCard, Clock, GraduationCap } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";

interface Persona {
  nombre: string;
  apellidos: string;
  curp: string | null;
  tutor?: { ocupacion: string | null } | null;
  profesor?: { academia: string | null; cubiculo: string | null; hora_entrada: string | null; hora_salida: string | null } | null;
  trab_social?: { hora_entrada: string | null; hora_salida: string | null; extension: string | null } | null;
  pers_admin?: { cargo: string | null; departamento: string | null; extension: string | null } | null;
}

interface AlumnoPendiente {
  id: number;
  nombre: string | null;
  apellidos: string | null;
  curp: string | null;
  fecha_nacimiento: string | null;
  sexo: string | null;
  parentesco: string;
}

interface UsuarioPendiente {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  persona: Persona | null;
  alumnos_pendientes: AlumnoPendiente[];
}

function formatFecha(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function DetalleExtra({ persona, role }: { persona: Persona; role: string }) {
  const items: { label: string; value: string | null | undefined }[] = [];

  if (persona.curp) items.push({ label: "CURP", value: persona.curp });

  if (role === "Tutor" && persona.tutor)
    items.push({ label: "Ocupación", value: persona.tutor.ocupacion });

  if (role === "Profesor" && persona.profesor) {
    items.push(
      { label: "Academia",     value: persona.profesor.academia },
      { label: "Cubículo",     value: persona.profesor.cubiculo },
      { label: "Hora entrada", value: persona.profesor.hora_entrada },
      { label: "Hora salida",  value: persona.profesor.hora_salida },
    );
  }

  if (role === "Trabajador Social" && persona.trab_social) {
    items.push(
      { label: "Hora entrada", value: persona.trab_social.hora_entrada },
      { label: "Hora salida",  value: persona.trab_social.hora_salida },
      { label: "Extensión",    value: persona.trab_social.extension },
    );
  }

  if (role === "Personal Administrativo" && persona.pers_admin) {
    items.push(
      { label: "Cargo",        value: persona.pers_admin.cargo },
      { label: "Departamento", value: persona.pers_admin.departamento },
      { label: "Extensión",    value: persona.pers_admin.extension },
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="pt-3 mt-3 border-t border-dashed border-[#D1D5DB] grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
      {items.map(({ label, value }) => (
        <div key={label}>
          <span className="text-[#9CA3AF] text-xs">{label}</span>
          <p className="font-medium text-[#374151]">{value ?? "—"}</p>
        </div>
      ))}
    </div>
  );
}

function TarjetaUsuario({
  usuario,
  onAprobar,
  onRechazar,
  procesando,
}: {
  usuario: UsuarioPendiente;
  onAprobar: (u: UsuarioPendiente) => void;
  onRechazar: (u: UsuarioPendiente) => void;
  procesando: boolean;
}) {
  const [expandido, setExpandido] = useState(false);
  const p = usuario.persona;
  const nombre = p ? `${p.nombre} ${p.apellidos}` : usuario.name;
  const iniciales = nombre.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  return (
    <Card className="border-[#E5E7EB] hover:shadow-md transition-shadow">
      <CardContent className="pt-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 font-bold text-sm flex items-center justify-center shrink-0">
            {iniciales}
          </div>

          <div className="flex-1 min-w-0">
            {/* Encabezado */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-semibold text-[#111827]">{nombre}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">{usuario.role}</Badge>
                  <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">Pendiente</Badge>
                </div>
              </div>
              {/* Acciones */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  className="bg-[#059669] hover:bg-[#047857] text-white h-8 px-3 rounded-lg"
                  disabled={procesando}
                  onClick={() => onAprobar(usuario)}
                >
                  {procesando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-[#E11D48] hover:bg-red-50 h-8 px-3 rounded-lg"
                  disabled={procesando}
                  onClick={() => onRechazar(usuario)}
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Rechazar
                </Button>
              </div>
            </div>

            {/* Datos básicos */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{usuario.email}</span>
              </span>
              {p?.curp && (
                <span className="flex items-center gap-1.5">
                  <IdCard className="h-3.5 w-3.5 shrink-0" />
                  {p.curp}
                </span>
              )}
              <span className="flex items-center gap-1.5 col-span-full text-xs text-[#9CA3AF]">
                <Clock className="h-3 w-3 shrink-0" />
                Solicitud recibida: {formatFecha(usuario.created_at)}
              </span>
            </div>

            {/* Detalle expandible */}
            {p && (
              <>
                <button
                  className="mt-3 flex items-center gap-1 text-xs text-[#1D4ED8] hover:underline"
                  onClick={() => setExpandido(v => !v)}
                >
                  {expandido ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {expandido ? "Ocultar detalles" : "Ver detalles del perfil"}
                </button>
                {expandido && <DetalleExtra persona={p} role={usuario.role} />}
              </>
            )}

            {/* Alumnos vinculados (solo tutores con hijos pendientes) */}
            {usuario.role === "Tutor" && usuario.alumnos_pendientes?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-dashed border-[#D1D5DB]">
                <p className="text-xs font-semibold text-[#374151] flex items-center gap-1.5 mb-2">
                  <GraduationCap className="h-3.5 w-3.5 text-[#1D4ED8]" />
                  Alumnos a registrar ({usuario.alumnos_pendientes.length})
                </p>
                <div className="space-y-1.5">
                  {usuario.alumnos_pendientes.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-sm">
                      <div>
                        <span className="font-medium text-[#111827]">
                          {a.apellidos} {a.nombre}
                        </span>
                        {a.curp && (
                          <span className="ml-2 text-xs text-[#6B7280] font-mono">{a.curp}</span>
                        )}
                      </div>
                      <span className="text-xs text-[#6B7280] shrink-0 ml-3">{a.parentesco}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[#6B7280]">
                  Al aprobar esta cuenta los alumnos quedarán activos automáticamente.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ValidacionUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioPendiente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);

  const [usuarioSel, setUsuarioSel] = useState<UsuarioPendiente | null>(null);
  const [modalRechazo, setModalRechazo] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [rechazando, setRechazando] = useState(false);

  const cargar = () => {
    setCargando(true);
    axios.get("/admin/usuarios", { params: { status: "Pendiente" } })
      .then(({ data }) => setUsuarios(data.users ?? []))
      .catch(() => toast.error("No se pudo cargar la lista de solicitudes."))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const handleAprobar = async (u: UsuarioPendiente) => {
    setProcesando(u.id);
    try {
      await axios.post(`/admin/validar-usuarios/${u.id}/aprobar`);
      setUsuarios(prev => prev.filter(x => x.id !== u.id));
      toast.success(`${u.persona ? `${u.persona.nombre} ${u.persona.apellidos}` : u.name} aprobado. Ya puede iniciar sesión.`);
    } catch {
      toast.error("No se pudo aprobar la solicitud.");
    } finally {
      setProcesando(null);
    }
  };

  const abrirRechazo = (u: UsuarioPendiente) => {
    setUsuarioSel(u);
    setMotivo("");
    setModalRechazo(true);
  };

  const handleConfirmarRechazo = async () => {
    if (!usuarioSel) return;
    if (!motivo.trim()) { toast.error("Debes indicar el motivo del rechazo."); return; }
    setRechazando(true);
    try {
      await axios.post(`/admin/validar-usuarios/${usuarioSel.id}/rechazar`, { reason: motivo });
      setUsuarios(prev => prev.filter(x => x.id !== usuarioSel.id));
      toast.success("Solicitud rechazada.");
      setModalRechazo(false);
    } catch {
      toast.error("No se pudo rechazar la solicitud.");
    } finally {
      setRechazando(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle
        icon={UserCheck}
        title="Validación de Cuentas"
        description="Aprueba o rechaza las solicitudes de registro de nuevos usuarios"
        color="bg-[#E11D48]"
      />

      {/* Contador */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <UserCheck className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Solicitudes pendientes</p>
                <p className="text-3xl font-bold text-[#D97706]">{usuarios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Solicitudes por revisar</CardTitle>
              <CardDescription>Usuarios que se registraron y esperan aprobación para acceder al sistema</CardDescription>
            </div>
            {!cargando && (
              <Button variant="outline" size="sm" onClick={cargar} className="rounded-lg">
                Actualizar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#D97706]" />
            </div>
          ) : usuarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-[#059669]" />
              </div>
              <p className="font-semibold text-[#111827]">No hay solicitudes pendientes</p>
              <p className="text-sm text-[#6B7280]">Todas las cuentas han sido revisadas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {usuarios.map(u => (
                <TarjetaUsuario
                  key={u.id}
                  usuario={u}
                  onAprobar={handleAprobar}
                  onRechazar={abrirRechazo}
                  procesando={procesando === u.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal rechazo */}
      <Dialog open={modalRechazo} onOpenChange={(open) => { setModalRechazo(open); if (!open) setUsuarioSel(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motivo de rechazo</DialogTitle>
            <DialogDescription>
              {usuarioSel && `Indica el motivo para rechazar la solicitud de ${usuarioSel.persona ? `${usuarioSel.persona.nombre} ${usuarioSel.persona.apellidos}` : usuarioSel.name}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="motivo-validacion">Motivo *</Label>
            <Textarea
              id="motivo-validacion"
              value={motivo}
              maxLength={500}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              placeholder="Ej. La información proporcionada no corresponde a un docente registrado..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalRechazo(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmarRechazo} disabled={rechazando}>
              {rechazando ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
              Confirmar rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}