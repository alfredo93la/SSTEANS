import { useEffect, useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import type { PageProps } from "../../types";
import axios from "axios";
import { emailValido, curpValido, telefonoValido, horaFinMayorQueInicio } from "../../lib/validators";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Textarea } from "../../Components/ui/textarea";
import {
  Users, Search, Eye, Edit, Plus,
  CheckCircle, XCircle, UserX, Loader2, Mail, Phone,
  UserPen, ShieldCheck, ShieldAlert,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogDescription, DialogFooter,
} from "../../Components/ui/dialog";
import { PageTitle } from "../../Layouts/PageTitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "../../Components/ui/pagination";
import { toast } from "sonner";

// ─── Tipos ─────────────────────────────────────────────────────────────────

type Role = { id: number; nombre: string };

interface Persona {
  id: number;
  nombre: string;
  apellidos: string;
  curp: string | null;
  telefono: string | null;
  tipo_persona: string | null;
  tutor?: { ocupacion: string | null } | null;
  profesor?: { academia: string | null; cubiculo: string | null; hora_entrada: string | null; hora_salida: string | null } | null;
  trab_social?: { hora_entrada: string | null; hora_salida: string | null; extension: string | null } | null;
  pers_admin?: { cargo: string | null; departamento: string | null; extension: string | null } | null;
}

interface UsuarioItem {
  id: number;
  name: string;
  email: string;
  role: string;
  persona_id: number | null;
  status: "Pendiente" | "Activo" | "Rechazado" | "Inactivo";
  created_at: string;
  email_verified_at: string | null;
  roles: Role[];
  persona: Persona | null;
}

// ─── Estado inicial del formulario ─────────────────────────────────────────

const formVacio = {
  nombre: "", apellidos: "", email: "",
  curp: "", telefono: "",
  rolId: "", status: "Activo" as UsuarioItem["status"],
  // Tutor
  ocupacion: "",
  // Profesor
  academia: "", cubiculo: "", hora_entrada: "", hora_salida: "",
  // Trabajador Social
  extension: "",
  // Personal Administrativo
  cargo: "", departamento: "",
};

type FormState = typeof formVacio;

// ─── Sección de campos específicos por rol ─────────────────────────────────

function CamposEspecificosRol({ rolNombre, form, setForm }: {
  rolNombre: string;
  form: FormState;
  setForm: (f: FormState) => void;
}) {
  if (!rolNombre) return null;

  const header = (label: string) => (
    <div className="col-span-2 border-t border-dashed border-[#D1D5DB] pt-4 mt-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280] mb-3">
        Datos específicos — {label}
      </p>
    </div>
  );

  if (rolNombre === "Tutor") {
    return (
      <>
        {header("Tutor")}
        <div className="space-y-1.5">
          <Label>Ocupación</Label>
          <Input value={form.ocupacion} onChange={(e) => setForm({ ...form, ocupacion: e.target.value })} placeholder="Profesión u ocupación" maxLength={255} />
        </div>
      </>
    );
  }

  if (rolNombre === "Profesor") {
    return (
      <>
        {header("Profesor")}
        <div className="space-y-1.5">
          <Label>Academia</Label>
          <Input value={form.academia} onChange={(e) => setForm({ ...form, academia: e.target.value })} placeholder="Ej. Ciencias Naturales" maxLength={100} />
        </div>
        <div className="space-y-1.5">
          <Label>Cubículo</Label>
          <Input value={form.cubiculo} onChange={(e) => setForm({ ...form, cubiculo: e.target.value })} placeholder="Ej. C-12" maxLength={50} />
        </div>
        <div className="space-y-1.5">
          <Label>Hora de entrada</Label>
          <Input type="time" value={form.hora_entrada} onChange={(e) => setForm({ ...form, hora_entrada: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Hora de salida</Label>
          <Input type="time" value={form.hora_salida} onChange={(e) => setForm({ ...form, hora_salida: e.target.value })} />
        </div>
      </>
    );
  }

  if (rolNombre === "Trabajador Social") {
    return (
      <>
        {header("Trabajador Social")}
        <div className="space-y-1.5">
          <Label>Hora de entrada</Label>
          <Input type="time" value={form.hora_entrada} onChange={(e) => setForm({ ...form, hora_entrada: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Hora de salida</Label>
          <Input type="time" value={form.hora_salida} onChange={(e) => setForm({ ...form, hora_salida: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Extensión telefónica</Label>
          <Input value={form.extension} onChange={(e) => setForm({ ...form, extension: e.target.value })} placeholder="Ej. 101" maxLength={20} />
        </div>
      </>
    );
  }

  const SYSTEM_ROLES = ["Tutor", "Profesor", "Trabajador Social", "Administrador", "Personal Administrativo"];
  const isCustomRole = rolNombre !== "" && !SYSTEM_ROLES.includes(rolNombre);

  if (rolNombre === "Personal Administrativo" || isCustomRole) {
    return (
      <>
        {header(isCustomRole ? rolNombre : "Personal Administrativo")}
        <div className="space-y-1.5">
          <Label>Cargo</Label>
          <Input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} placeholder="Ej. Secretaria, Prefecto" maxLength={100} />
        </div>
        <div className="space-y-1.5">
          <Label>Departamento</Label>
          <Input value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })} placeholder="Ej. Dirección, Control Escolar" maxLength={100} />
        </div>
        <div className="space-y-1.5">
          <Label>Extensión telefónica</Label>
          <Input value={form.extension} onChange={(e) => setForm({ ...form, extension: e.target.value })} placeholder="Ej. 102" maxLength={20} />
        </div>
      </>
    );
  }

  return null;
}

// ─── Formulario principal ──────────────────────────────────────────────────

function FormUsuario({ form, setForm, roles, isEdit = false }: {
  form: FormState;
  setForm: (f: FormState) => void;
  roles: Role[];
  isEdit?: boolean;
}) {
  const rolNombre = roles.find((r) => String(r.id) === form.rolId)?.nombre ?? "";

  const resetEspecificos = (rolId: string) =>
    setForm({
      ...form, rolId,
      ocupacion: "",
      academia: "", cubiculo: "", hora_entrada: "", hora_salida: "",
      extension: "",
      cargo: "", departamento: "",
    });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Datos comunes */}
        <div className="space-y-1.5">
          <Label>Nombre(s) *</Label>
          <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Escribe el(los) nombre(s)" maxLength={255} />
        </div>
        <div className="space-y-1.5">
          <Label>Apellidos *</Label>
          <Input value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} placeholder="Escribe los apellidos" maxLength={255} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Correo electrónico *</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" maxLength={255} />
        </div>
        {!isEdit && (
          <div className="col-span-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700">
            Se generará una contraseña temporal y se enviará automáticamente al correo del usuario.
          </div>
        )}
        <div className="space-y-1.5">
          <Label>CURP {rolNombre === "Tutor" && <span className="text-red-500">*</span>}</Label>
          <Input value={form.curp} onChange={(e) => setForm({ ...form, curp: e.target.value.toUpperCase() })} placeholder="18 caracteres" maxLength={18} className="uppercase" />
        </div>
        <div className="space-y-1.5">
          <Label>Teléfono</Label>
          <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="10 dígitos" maxLength={30} />
        </div>
        {/* Rol y estado */}
        <div className="space-y-1.5">
          <Label>Rol *</Label>
          <Select value={form.rolId} onValueChange={resetEspecificos}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {roles.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Campos específicos por rol */}
        <CamposEspecificosRol rolNombre={rolNombre} form={form} setForm={setForm} />
      </div>
    </div>
  );
}

// ─── Detalle específico por rol en el modal ────────────────────────────────

function DetalleEspecificoRol({ usuario }: { usuario: UsuarioItem }) {
  const p = usuario.persona;
  if (!p) return null;

  const row = (label: string, value: string | null | undefined) => (
    <div key={label}>
      <p className="text-[#6B7280] text-xs">{label}</p>
      <p className="font-medium">{value ?? "—"}</p>
    </div>
  );

  let fields: JSX.Element[] = [];

  if (usuario.role === "Tutor" && p.tutor) {
    fields = [row("Ocupación", p.tutor.ocupacion)];
  } else if (usuario.role === "Profesor" && p.profesor) {
    fields = [
      row("Academia", p.profesor.academia),
      row("Cubículo", p.profesor.cubiculo),
      row("Hora entrada", p.profesor.hora_entrada),
      row("Hora salida", p.profesor.hora_salida),
    ];
  } else if (usuario.role === "Trabajador Social" && p.trab_social) {
    fields = [row("Hora entrada", p.trab_social.hora_entrada), row("Hora salida", p.trab_social.hora_salida), row("Extensión", p.trab_social.extension)];
  } else if (usuario.role === "Personal Administrativo" && p.pers_admin) {
    fields = [
      row("Cargo", p.pers_admin.cargo),
      row("Departamento", p.pers_admin.departamento),
      row("Extensión", p.pers_admin.extension),
    ];
  }

  if (fields.length === 0) return null;

  return (
    <div className="col-span-2 border-t border-dashed border-[#D1D5DB] pt-3 mt-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280] mb-2">
        Datos de {usuario.role}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">{fields}</div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────

export function Usuarios() {
  const { auth } = usePage<PageProps>().props;
  const currentUserId = auth.user?.id;

  const [users, setUsers] = useState<UsuarioItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [usuarioSel, setUsuarioSel] = useState<UsuarioItem | null>(null);

  const [form, setForm] = useState(formVacio);

  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 10;

  const [modalValidar, setModalValidar] = useState(false);
  const [modalRechazo, setModalRechazo] = useState(false);
  const [aprobando, setAprobando] = useState(false);
  const [rechazando, setRechazando] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  const cargar = () => {
    setLoading(true);
    axios.get("/admin/usuarios", {
      params: {
        search: busqueda,
        role: filtroRol === "todos" ? "" : filtroRol,
        status: filtroEstado === "todos" ? "" : filtroEstado,
      },
    })
      .then(({ data }) => { setUsers(data.users ?? []); setRoles(data.roles ?? []); })
      .catch(() => toast.error("No se pudo cargar la lista de usuarios"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [busqueda, filtroRol, filtroEstado]);
  useEffect(() => { setPagina(1); }, [busqueda, filtroRol, filtroEstado]);

  const estadisticas = useMemo(() => ({
    total: users.length,
    activos: users.filter((u) => u.status === "Activo").length,
    inactivos: users.filter((u) => u.status !== "Activo").length,
    profesores: users.filter((u) => u.role === "Profesor").length,
  }), [users]);

  // Construye el payload de campos específicos según el rol
  const payloadEspecifico = (rolNombre: string) => {
    switch (rolNombre) {
      case "Tutor":
        return { ocupacion: form.ocupacion || undefined };
      case "Profesor":
        return { academia: form.academia || undefined, cubiculo: form.cubiculo || undefined, hora_entrada: form.hora_entrada || undefined, hora_salida: form.hora_salida || undefined };
      case "Trabajador Social":
        return { hora_entrada: form.hora_entrada || undefined, hora_salida: form.hora_salida || undefined, extension: form.extension || undefined };
      case "Personal Administrativo":
        return { cargo: form.cargo || undefined, departamento: form.departamento || undefined, extension: form.extension || undefined };
      default:
        return {};
    }
  };

  const validarFormUsuario = () => {
    if (!form.nombre.trim()) { toast.error("El nombre es obligatorio."); return false; }
    if (!form.apellidos.trim()) { toast.error("Los apellidos son obligatorios."); return false; }
    if (!form.email.trim()) { toast.error("El correo es obligatorio."); return false; }
    if (!emailValido(form.email)) { toast.error("El correo electrónico no tiene un formato válido."); return false; }
    if (!form.rolId) { toast.error("Debes seleccionar un rol."); return false; }
    const rolNombreCheck = roles.find((r) => String(r.id) === form.rolId)?.nombre ?? "";
    if (rolNombreCheck === "Tutor" && form.curp && !curpValido(form.curp)) {
      toast.error("El CURP no tiene el formato correcto (18 caracteres)."); return false;
    }
    if (form.curp && form.curp.length > 0 && !curpValido(form.curp)) {
      toast.error("El CURP no tiene el formato correcto (18 caracteres)."); return false;
    }
    if (form.telefono && !telefonoValido(form.telefono)) {
      toast.error("El teléfono debe tener exactamente 10 dígitos."); return false;
    }
    if (form.hora_entrada && form.hora_salida && !horaFinMayorQueInicio(form.hora_entrada, form.hora_salida)) {
      toast.error("La hora de salida debe ser mayor que la hora de entrada."); return false;
    }
    return true;
  };

  const handleCrear = () => {
    if (!validarFormUsuario()) return;
    const rolNombre = roles.find((r) => String(r.id) === form.rolId)?.nombre ?? "";
    setSaving(true);
    axios.post("/admin/usuarios", {
      nombre: form.nombre, apellidos: form.apellidos, email: form.email,
      curp: form.curp || undefined,
      telefono: form.telefono || undefined,
      roles: [Number(form.rolId)], status: form.status,
      ...payloadEspecifico(rolNombre),
    })
      .then(({ data }) => { setUsers((prev) => [...prev, data.user]); setModalNuevo(false); setForm(formVacio); toast.success("Usuario creado correctamente."); })
      .catch((err) => toast.error(err.response?.data?.message ?? "No se pudo crear el usuario."))
      .finally(() => setSaving(false));
  };

  const handleEditar = () => {
    if (!usuarioSel) return;
    if (!validarFormUsuario()) return;
    const rolNombre = roles.find((r) => String(r.id) === form.rolId)?.nombre ?? "";
    setSaving(true);
    axios.put(`/admin/usuarios/${usuarioSel.id}`, {
      nombre: form.nombre, apellidos: form.apellidos, email: form.email,
      curp: form.curp || undefined,
      telefono: form.telefono || undefined,
      roles: [Number(form.rolId)], status: form.status,
      ...payloadEspecifico(rolNombre),
    })
      .then(({ data }) => { setUsers((prev) => prev.map((u) => u.id === data.user.id ? data.user : u)); setModalEditar(false); setUsuarioSel(null); toast.success("Usuario actualizado correctamente."); })
      .catch((err) => toast.error(err.response?.data?.message ?? "No se pudo actualizar el usuario."))
      .finally(() => setSaving(false));
  };

  const handleDesactivar = (u: UsuarioItem) => {
    if (!confirm(`¿Desactivar a ${u.persona ? `${u.persona.nombre} ${u.persona.apellidos}` : u.name}? Su cuenta quedará inactiva.`)) return;
    const rolId = u.roles[0]?.id;
    if (!rolId) { toast.error("No se pudo determinar el rol del usuario."); return; }
    axios.put(`/admin/usuarios/${u.id}`, {
      nombre: u.persona?.nombre ?? u.name,
      apellidos: u.persona?.apellidos ?? "",
      email: u.email,
      curp: u.persona?.curp ?? undefined,
      roles: [rolId],
      status: "Inactivo",
    })
      .then(({ data }) => { setUsers((prev) => prev.map((x) => x.id === data.user.id ? data.user : x)); toast.success("Usuario desactivado."); })
      .catch(() => toast.error("No se pudo desactivar el usuario."));
  };

  const abrirEditar = (u: UsuarioItem) => {
    const p = u.persona;
    const rolId = u.roles[0]?.id.toString()
      ?? roles.find((r) => r.nombre === u.role)?.id.toString()
      ?? "";
    setUsuarioSel(u);
    setForm({
      nombre: p?.nombre ?? "", apellidos: p?.apellidos ?? "",
      email: u.email,
      curp: p?.curp ?? "", telefono: p?.telefono ?? "",
      rolId, status: u.status,
      // Tutor
      ocupacion: p?.tutor?.ocupacion ?? "",
      // Profesor
      academia: p?.profesor?.academia ?? "", cubiculo: p?.profesor?.cubiculo ?? "",
      // Hora entrada/salida compartida entre Profesor y Trabajador Social
      hora_entrada: p?.profesor?.hora_entrada ?? p?.trab_social?.hora_entrada ?? "",
      hora_salida: p?.profesor?.hora_salida ?? p?.trab_social?.hora_salida ?? "",
      // Trabajador Social
      extension: p?.trab_social?.extension ?? p?.pers_admin?.extension ?? "",
      // Personal Administrativo
      cargo: p?.pers_admin?.cargo ?? "", departamento: p?.pers_admin?.departamento ?? "",
    });
    setModalEditar(true);
  };

  const handleValidar = (u: UsuarioItem) => { setUsuarioSel(u); setModalValidar(true); };

  const handleAprobar = async (id: number) => {
    setAprobando(true);
    try {
      await axios.post(`/admin/validar-usuarios/${id}/aprobar`);
      toast.success("Solicitud aprobada"); setModalValidar(false); cargar();
    } catch { toast.error("No se pudo aprobar"); }
    finally { setAprobando(false); }
  };

  const handleConfirmarRechazo = async () => {
    if (!usuarioSel) return;
    if (!motivoRechazo.trim()) { toast.error("Debes indicar el motivo del rechazo."); return; }
    setRechazando(true);
    try {
      await axios.post(`/admin/validar-usuarios/${usuarioSel.id}/rechazar`, { reason: motivoRechazo });
      toast.success("Solicitud rechazada"); setModalRechazo(false); setModalValidar(false); setMotivoRechazo(""); cargar();
    } catch { toast.error("No se pudo rechazar"); }
    finally { setRechazando(false); }
  };

  const abrirDetalle = (u: UsuarioItem) => { setUsuarioSel(u); setModalDetalle(true); };

  const getBadgeRol = (rol: string) => {
    switch (rol) {
      case "Administrador":           return "bg-purple-100 text-purple-700 border-purple-200";
      case "Personal Administrativo": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Profesor":                return "bg-sky-100 text-sky-700 border-sky-200";
      case "Trabajador Social":       return "bg-orange-100 text-orange-700 border-orange-200";
      case "Tutor":                   return "bg-pink-100 text-pink-700 border-pink-200";
      default:                        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getBadgeEstado = (s: UsuarioItem["status"]) => {
    switch (s) {
      case "Activo":    return "bg-green-100 text-green-700 border-green-200";
      case "Pendiente": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Rechazado": return "bg-red-100 text-red-700 border-red-200";
      case "Inactivo":  return "bg-gray-100 text-gray-500 border-gray-200";
      default:          return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={UserPen} title="Administración de Usuarios" description="Administra los usuarios y sus permisos del sistema" color="bg-[#1D4ED8]">
        <Dialog open={modalNuevo} onOpenChange={(open) => { setModalNuevo(open); if (!open) setForm(formVacio); }}>
          <DialogTrigger asChild>
            <Button className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Plus className="h-4 w-4 mr-2" />Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>Alta de usuario con datos personales y rol del sistema.</DialogDescription>
            </DialogHeader>
            <FormUsuario form={form} setForm={setForm} roles={roles.filter((r) => r.nombre !== "Administrador")} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalNuevo(false)}>Cancelar</Button>
              <Button onClick={handleCrear} disabled={saving} className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Usuario"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTitle>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-indigo-50 to-indigo-100"><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-3 bg-white rounded-xl"><Users className="h-6 w-6 text-indigo-600" /></div><div><p className="text-sm text-[#6B7280]">Total Usuarios</p><p className="text-2xl font-bold text-indigo-600">{estadisticas.total}</p></div></div></CardContent></Card>
        <Card className="border-[#E5E7EB] bg-linear-to-br from-emerald-50 to-emerald-100"><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-3 bg-white rounded-xl"><CheckCircle className="h-6 w-6 text-emerald-600" /></div><div><p className="text-sm text-[#6B7280]">Activos</p><p className="text-2xl font-bold text-[#059669]">{estadisticas.activos}</p></div></div></CardContent></Card>
        <Card className="border-[#E5E7EB] bg-linear-to-br from-rose-50 to-rose-100"><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-3 bg-white rounded-xl"><XCircle className="h-6 w-6 text-rose-600" /></div><div><p className="text-sm text-[#6B7280]">Inactivos</p><p className="text-2xl font-bold text-[#DC2626]">{estadisticas.inactivos}</p></div></div></CardContent></Card>
      </div>

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-[#6B7280] mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input placeholder="Buscar por nombre, apellidos o correo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="w-full lg:w-52">
              <label className="text-sm text-[#6B7280] mb-2 block">Rol</label>
              <Select value={filtroRol} onValueChange={setFiltroRol}>
                <SelectTrigger>
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  {roles.filter((r) => r.nombre !== "Administrador").map((r) => <SelectItem key={r.id} value={r.nombre}>{r.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full lg:w-44">
              <label className="text-sm text-[#6B7280] mb-2 block">Estado</label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Rechazado">Rechazado</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card className="border-[#E5E7EB] overflow-hidden">
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>{users.length} registros</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#1D4ED8]" /></div>
          ) : users.length === 0 ? (
            <div className="border border-dashed border-[#D1D5DB] rounded-xl p-8 text-center">
              <p className="text-sm text-[#6B7280]">No hay usuarios para los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map((u) => (
                <div key={u.id} className="p-4 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
                          <Users className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-[#111827] truncate">
                            {u.persona ? `${u.persona.nombre} ${u.persona.apellidos}` : u.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge className={getBadgeRol(u.role)}>{u.role}</Badge>
                            <Badge className={getBadgeEstado(u.status)}>{u.status}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="ml-11 space-y-1">
                        <div className="flex items-center gap-1 text-xs text-[#6B7280] min-w-0">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{u.email}</span>
                          {u.email_verified_at
                            ? <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-500" aria-label="Email verificado" />
                            : <ShieldAlert className="h-3 w-3 shrink-0 text-amber-400" aria-label="Email no verificado" />}
                        </div>
                        {u.persona?.telefono && (
                          <div className="flex items-center gap-1 text-xs text-[#6B7280] min-w-0">
                            <Phone className="h-3 w-3 shrink-0" /><span className="truncate">{u.persona.telefono}</span>
                          </div>
                        )}
                        <div className="text-xs text-[#6B7280]">
                          Creado: {new Date(u.created_at).toLocaleDateString("es-MX")}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Button variant="outline" size="sm" onClick={() => abrirDetalle(u)}>
                        <Eye className="h-4 w-4" />Ver detalle
                      </Button>
                      {u.status === "Pendiente" && (
                        <Button variant="outline" size="sm" className="text-[#E11D48] hover:text-[#E11D48]" onClick={() => handleValidar(u)}>
                          <CheckCircle className="h-4 w-4" />Validar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {Math.ceil(users.length / POR_PAGINA) > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-[#6B7280]">
              <span>Mostrando {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, users.length)} de {users.length}</span>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPagina((p) => Math.max(1, p - 1)); }}
                      className={pagina === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.ceil(users.length / POR_PAGINA) }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === Math.ceil(users.length / POR_PAGINA) || Math.abs(n - pagina) <= 1)
                    .reduce<(number | "ellipsis")[]>((acc, n, idx, arr) => {
                      if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "ellipsis" ? (
                        <PaginationItem key={`e-${idx}`}><PaginationEllipsis /></PaginationItem>
                      ) : (
                        <PaginationItem key={item}>
                          <PaginationLink
                            href="#"
                            isActive={pagina === item}
                            onClick={(e) => { e.preventDefault(); setPagina(item as number); }}
                          >
                            {item}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPagina((p) => Math.min(Math.ceil(users.length / POR_PAGINA), p + 1)); }}
                      className={pagina === Math.ceil(users.length / POR_PAGINA) ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal detalle */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de usuario</DialogTitle>
            <DialogDescription>Información completa del usuario.</DialogDescription>
          </DialogHeader>
          {usuarioSel && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-[#6B7280] text-xs">Nombre(s)</p>
                  <p className="font-medium">{usuarioSel.persona?.nombre ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[#6B7280] text-xs">Apellidos</p>
                  <p className="font-medium">{usuarioSel.persona?.apellidos ?? "—"}</p>
                </div>
                <div className={usuarioSel.persona?.telefono ? "" : "col-span-2"}>
                  <p className="text-[#6B7280] text-xs">Correo electrónico</p>
                  <p className="font-medium">{usuarioSel.email}</p>
                </div>
                {usuarioSel.persona?.telefono && (
                  <div>
                    <p className="text-[#6B7280] text-xs">Teléfono</p>
                    <p className="font-medium">{usuarioSel.persona.telefono}</p>
                  </div>
                )}
                <div>
                  <p className="text-[#6B7280] text-xs">CURP</p>
                  <p className="font-medium">{usuarioSel.persona?.curp ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[#6B7280] text-xs">Rol</p>
                  <Badge className={getBadgeRol(usuarioSel.role)}>{usuarioSel.role}</Badge>
                </div>
                <div>
                  <p className="text-[#6B7280] text-xs">Estado</p>
                  <Badge variant="outline">{usuarioSel.status}</Badge>
                </div>
                <div>
                  <p className="text-[#6B7280] text-xs">Email verificado</p>
                  {usuarioSel.email_verified_at ? (
                    <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                      <ShieldCheck className="h-4 w-4" />
                      {new Date(usuarioSel.email_verified_at).toLocaleDateString("es-MX")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-amber-500 font-medium">
                      <ShieldAlert className="h-4 w-4" />No verificado
                    </span>
                  )}
                </div>
                <DetalleEspecificoRol usuario={usuarioSel} />
              </div>
              <DialogFooter className="pt-2 flex-col-reverse sm:flex-row sm:justify-between gap-2">
                <div>
                  {usuarioSel.id !== currentUserId && usuarioSel.status !== "Inactivo" && (
                    <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto" onClick={() => { setModalDetalle(false); handleDesactivar(usuarioSel); }}>
                      <UserX className="h-4 w-4 mr-1" />Desactivar
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => { setModalDetalle(false); abrirEditar(usuarioSel); }}>
                    <Edit className="h-4 w-4 mr-1" />Editar
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal editar */}
      <Dialog open={modalEditar} onOpenChange={(open) => { setModalEditar(open); if (!open) { setUsuarioSel(null); setForm(formVacio); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifica los datos del usuario y su perfil.</DialogDescription>
          </DialogHeader>
          <FormUsuario
            form={form}
            setForm={setForm}
            roles={usuarioSel?.role === "Administrador" ? roles : roles.filter((r) => r.nombre !== "Administrador")}
            isEdit
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEditar(false)}>Cancelar</Button>
            <Button onClick={handleEditar} disabled={saving} className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal validar */}
      <Dialog open={modalValidar} onOpenChange={setModalValidar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validar solicitud</DialogTitle>
            <DialogDescription>Aprueba o rechaza la cuenta del usuario.</DialogDescription>
          </DialogHeader>
          {usuarioSel && (
            <div className="space-y-3 text-sm">
              <p><strong>Nombre:</strong> {usuarioSel.persona ? `${usuarioSel.persona.nombre} ${usuarioSel.persona.apellidos}` : usuarioSel.name}</p>
              <p><strong>Email:</strong> {usuarioSel.email}</p>
              <p><strong>Rol:</strong> {usuarioSel.role}</p>
              <p><strong>Estado actual:</strong> {usuarioSel.status}</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModalValidar(false)}>Cerrar</Button>
                <Button variant="destructive" disabled={aprobando} onClick={() => { setMotivoRechazo(""); setModalRechazo(true); }}>Rechazar</Button>
                <Button disabled={aprobando} onClick={() => handleAprobar(usuarioSel.id)}>
                  {aprobando ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}Aprobar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal motivo rechazo */}
      <Dialog open={modalRechazo} onOpenChange={setModalRechazo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motivo de rechazo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="motivo">Indica el motivo</Label>
            <Textarea id="motivo" value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} rows={4} />
            <DialogFooter>
              <Button variant="outline" disabled={rechazando} onClick={() => setModalRechazo(false)}>Cancelar</Button>
              <Button variant="destructive" disabled={rechazando} onClick={handleConfirmarRechazo}>
                {rechazando ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}Confirmar rechazo
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
