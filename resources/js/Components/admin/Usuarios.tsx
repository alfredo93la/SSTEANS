import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Users, Search, Filter, Eye, Edit, Plus, UserCog,
  CheckCircle, XCircle, Trash2, Loader2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogDescription, DialogFooter,
} from "../ui/dialog";
import { PageTitle } from "../PageTitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";

type Role = { id: number; nombre: string };

interface Persona {
  id: number;
  nombre: string;
  apellidos: string;
  curp: string | null;
  telefono: string | null;
  direccion: string | null;
  tipo_persona: string | null;
}

interface UsuarioItem {
  id: number;
  name: string;
  email: string;
  role: string;
  persona_id: number | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  roles: Role[];
  persona: Persona | null;
}

const formVacio = {
  nombre: "", apellidos: "", email: "", password: "",
  curp: "", telefono: "", direccion: "",
  rolId: "", status: "approved" as UsuarioItem["status"],
};

type FormState = typeof formVacio;

function FormUsuario({
  form, setForm, roles, isEdit = false,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  roles: Role[];
  isEdit?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Nombre(s) *</Label>
          <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Juan" />
        </div>
        <div className="space-y-1.5">
          <Label>Apellidos *</Label>
          <Input value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} placeholder="Pérez García" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Correo electrónico *</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
        </div>
        {!isEdit && (
          <div className="col-span-2 space-y-1.5">
            <Label>Contraseña temporal *</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 8 caracteres" />
          </div>
        )}
        <div className="space-y-1.5">
          <Label>CURP</Label>
          <Input value={form.curp} onChange={(e) => setForm({ ...form, curp: e.target.value.toUpperCase() })} placeholder="18 caracteres" maxLength={18} className="uppercase" />
        </div>
        <div className="space-y-1.5">
          <Label>Teléfono</Label>
          <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="10 dígitos" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Dirección</Label>
          <Textarea rows={2} value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Calle, número, colonia, municipio" className="resize-none" />
        </div>
        <div className="space-y-1.5">
          <Label>Rol *</Label>
          <Select value={form.rolId} onValueChange={(v) => setForm({ ...form, rolId: v })}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {roles.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Estado</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as UsuarioItem["status"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="approved">Activo</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="rejected">Rechazado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export function Usuarios() {
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

  const cargar = () => {
    setLoading(true);
    axios.get("/admin/usuarios", {
      params: {
        search: busqueda,
        role: filtroRol === "todos" ? "" : filtroRol,
        status: filtroEstado === "todos" ? "" : filtroEstado,
      },
    })
      .then(({ data }) => {
        setUsers(data.users ?? []);
        setRoles(data.roles ?? []);
      })
      .catch(() => toast.error("No se pudo cargar la lista de usuarios"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [busqueda, filtroRol, filtroEstado]);

  const estadisticas = useMemo(() => ({
    total: users.length,
    activos: users.filter((u) => u.status === "approved").length,
    inactivos: users.filter((u) => u.status !== "approved").length,
    profesores: users.filter((u) => u.role === "Profesor").length,
  }), [users]);

  const handleCrear = () => {
    if (!form.nombre || !form.apellidos || !form.email || !form.password || !form.rolId) {
      toast.error("Nombre, apellidos, correo, contraseña y rol son obligatorios.");
      return;
    }
    setSaving(true);
    axios.post("/admin/usuarios", {
      nombre: form.nombre,
      apellidos: form.apellidos,
      email: form.email,
      password: form.password,
      curp: form.curp || undefined,
      telefono: form.telefono || undefined,
      direccion: form.direccion || undefined,
      roles: [Number(form.rolId)],
      status: form.status,
    })
      .then(({ data }) => {
        setUsers((prev) => [...prev, data.user]);
        setModalNuevo(false);
        setForm(formVacio);
        toast.success("Usuario creado correctamente.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "No se pudo crear el usuario."))
      .finally(() => setSaving(false));
  };

  const handleEditar = () => {
    if (!usuarioSel) return;
    if (!form.nombre || !form.apellidos || !form.email || !form.rolId) {
      toast.error("Nombre, apellidos, correo y rol son obligatorios.");
      return;
    }
    setSaving(true);
    axios.put(`/admin/usuarios/${usuarioSel.id}`, {
      nombre: form.nombre,
      apellidos: form.apellidos,
      email: form.email,
      curp: form.curp || undefined,
      telefono: form.telefono || undefined,
      direccion: form.direccion || undefined,
      roles: [Number(form.rolId)],
      status: form.status,
    })
      .then(({ data }) => {
        setUsers((prev) => prev.map((u) => u.id === data.user.id ? data.user : u));
        setModalEditar(false);
        setUsuarioSel(null);
        toast.success("Usuario actualizado correctamente.");
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "No se pudo actualizar el usuario."))
      .finally(() => setSaving(false));
  };

  const handleEliminar = (id: number) => {
    if (!confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) return;
    axios.delete(`/admin/usuarios/${id}`)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        toast.success("Usuario eliminado.");
      })
      .catch(() => toast.error("No se pudo eliminar el usuario."));
  };

  const abrirEditar = (u: UsuarioItem) => {
    setUsuarioSel(u);
    setForm({
      nombre: u.persona?.nombre ?? "",
      apellidos: u.persona?.apellidos ?? "",
      email: u.email,
      password: "",
      curp: u.persona?.curp ?? "",
      telefono: u.persona?.telefono ?? "",
      direccion: u.persona?.direccion ?? "",
      rolId: u.roles[0]?.id.toString() ?? "",
      status: u.status,
    });
    setModalEditar(true);
  };

  const abrirDetalle = (u: UsuarioItem) => {
    setUsuarioSel(u);
    setModalDetalle(true);
  };

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

  const getEstadoLabel = (s: UsuarioItem["status"]) =>
    s === "approved" ? "Activo" : s === "pending" ? "Pendiente" : "Rechazado";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={Users} title="Gestión de Usuarios" description="Administra los usuarios y sus permisos del sistema" color="bg-[#1D4ED8]">
        <Dialog open={modalNuevo} onOpenChange={(open) => { setModalNuevo(open); if (!open) setForm(formVacio); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Plus className="h-4 w-4 mr-2" />Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>Alta de usuario con datos personales y rol del sistema.</DialogDescription>
            </DialogHeader>
            <FormUsuario form={form} setForm={setForm} roles={roles} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalNuevo(false)}>Cancelar</Button>
              <Button onClick={handleCrear} disabled={saving} className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Usuario"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTitle>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB]"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#6B7280]">Total Usuarios</p><p className="text-2xl font-bold">{estadisticas.total}</p></div><div className="p-2.5 rounded-xl bg-indigo-100"><Users className="h-5 w-5 text-indigo-600" /></div></div></CardContent></Card>
        <Card className="border-[#E5E7EB]"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#6B7280]">Activos</p><p className="text-2xl font-bold text-[#059669]">{estadisticas.activos}</p></div><div className="p-2.5 rounded-xl bg-emerald-100"><CheckCircle className="h-5 w-5 text-emerald-600" /></div></div></CardContent></Card>
        <Card className="border-[#E5E7EB]"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#6B7280]">Inactivos</p><p className="text-2xl font-bold text-[#DC2626]">{estadisticas.inactivos}</p></div><div className="p-2.5 rounded-xl bg-rose-100"><XCircle className="h-5 w-5 text-rose-600" /></div></div></CardContent></Card>
        <Card className="border-[#E5E7EB]"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#6B7280]">Profesores</p><p className="text-2xl font-bold text-[#1D4ED8]">{estadisticas.profesores}</p></div><div className="p-2.5 rounded-xl bg-blue-100"><UserCog className="h-5 w-5 text-blue-600" /></div></div></CardContent></Card>
      </div>

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <Input placeholder="Buscar por nombre, apellidos o correo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10" />
            </div>
            <Select value={filtroRol} onValueChange={setFiltroRol}>
              <SelectTrigger className="w-full lg:w-52">
                <Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los roles</SelectItem>
                {roles.map((r) => <SelectItem key={r.id} value={r.nombre}>{r.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="approved">Activo</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card className="border-[#E5E7EB]">
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
              {users.map((u) => (
                <div key={u.id} className="border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {u.persona ? `${u.persona.nombre} ${u.persona.apellidos}` : u.name}
                    </p>
                    <p className="text-sm text-[#6B7280]">{u.email}</p>
                    {u.persona?.curp && (
                      <p className="text-xs text-[#9CA3AF] mt-0.5">CURP: {u.persona.curp}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge className={getBadgeRol(u.role)}>{u.role}</Badge>
                      <Badge variant="outline">{getEstadoLabel(u.status)}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => abrirDetalle(u)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => abrirEditar(u)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[#E11D48] hover:text-[#E11D48]" onClick={() => handleEliminar(u.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
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
                <div className="col-span-2">
                  <p className="text-[#6B7280] text-xs">Correo electrónico</p>
                  <p className="font-medium">{usuarioSel.email}</p>
                </div>
                <div>
                  <p className="text-[#6B7280] text-xs">CURP</p>
                  <p className="font-medium">{usuarioSel.persona?.curp ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[#6B7280] text-xs">Teléfono</p>
                  <p className="font-medium">{usuarioSel.persona?.telefono ?? "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[#6B7280] text-xs">Dirección</p>
                  <p className="font-medium">{usuarioSel.persona?.direccion ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[#6B7280] text-xs">Rol</p>
                  <Badge className={getBadgeRol(usuarioSel.role)}>{usuarioSel.role}</Badge>
                </div>
                <div>
                  <p className="text-[#6B7280] text-xs">Estado</p>
                  <Badge variant="outline">{getEstadoLabel(usuarioSel.status)}</Badge>
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setModalDetalle(false)}>Cerrar</Button>
                <Button onClick={() => { setModalDetalle(false); abrirEditar(usuarioSel); }}>
                  <Edit className="h-4 w-4 mr-1" />Editar
                </Button>
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
            <DialogDescription>Modifica los datos del usuario y su persona.</DialogDescription>
          </DialogHeader>
          <FormUsuario form={form} setForm={setForm} roles={roles} isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEditar(false)}>Cancelar</Button>
            <Button onClick={handleEditar} disabled={saving} className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
