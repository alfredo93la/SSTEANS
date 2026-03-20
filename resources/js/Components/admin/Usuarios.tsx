import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Users, Search, Filter, Eye, Edit, Plus, UserCog, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";

type Role = { id: number; nombre: string };
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  roles: Role[];
};

export function Usuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<User | null>(null);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rolId, setRolId] = useState("");
  const [estado, setEstado] = useState<"pending" | "approved" | "rejected">("approved");

  const cargar = async () => {
    try {
      const response = await window.axios.get("/admin/usuarios", {
        params: { search: busqueda, role: filtroRol === "todos" ? "" : filtroRol, status: filtroEstado === "todos" ? "" : filtroEstado },
      });
      const baseData = response.data;

      setUsers(baseData.users ?? []);
      setRoles(baseData.roles ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "No se pudo cargar la lista de usuarios");
    }
  };

  useEffect(() => {
    cargar();
  }, [busqueda, filtroRol, filtroEstado]);

  const estadisticas = useMemo(() => {
    const total = users.length;
    const activos = users.filter((u) => u.status === "approved").length;
    const inactivos = users.filter((u) => u.status !== "approved").length;
    const profesores = users.filter((u) => u.role === "Profesor").length;
    return { total, activos, inactivos, profesores };
  }, [users]);

  const crearUsuario = async () => {
    if (!nombre || !email || !password || !rolId) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    try {
      await window.axios.post("/admin/usuarios", {
        name: nombre,
        email,
        password,
        roles: [Number(rolId)],
        status: estado,
      });
      toast.success("Usuario creado correctamente");
      setModalNuevo(false);
      setNombre("");
      setEmail("");
      setPassword("");
      setRolId("");
      setEstado("approved");
      await cargar();
    } catch {
      toast.error("No se pudo crear el usuario");
    }
  };

  const eliminarUsuario = async (id: number) => {
    try {
      await window.axios.delete(`/admin/usuarios/${id}`);
      toast.success("Usuario eliminado");
      await cargar();
    } catch {
      toast.error("No se pudo eliminar");
    }
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

  const getEstadoLabel = (status: User["status"]) => status === "approved" ? "Activo" : status === "pending" ? "Pendiente" : "Rechazado";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#111827]">Gestión de Usuarios</h1>
          <p className="text-sm text-[#6B7280] mt-1">Administra los usuarios y sus permisos del sistema</p>
        </div>
        <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]"><Plus className="h-4 w-4 mr-2" />Nuevo Usuario</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Crear Nuevo Usuario</DialogTitle><DialogDescription>Alta rápida de usuarios administrativos.</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nombre Completo</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
              <div><Label>Correo</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label>Contraseña temporal</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <div><Label>Rol</Label><Select value={rolId} onValueChange={setRolId}><SelectTrigger><SelectValue placeholder="Selecciona rol" /></SelectTrigger><SelectContent>{roles.map((rol) => <SelectItem key={rol.id} value={String(rol.id)}>{rol.nombre}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Estado</Label><Select value={estado} onValueChange={(v) => setEstado(v as User["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="approved">Activo</SelectItem><SelectItem value="pending">Pendiente</SelectItem><SelectItem value="rejected">Rechazado</SelectItem></SelectContent></Select></div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setModalNuevo(false)}>Cancelar</Button><Button onClick={crearUsuario}>Crear Usuario</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB]"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#6B7280]">Total Usuarios</p><p className="text-2xl font-bold">{estadisticas.total}</p></div><div className="p-2.5 rounded-xl bg-indigo-100"><Users className="h-5 w-5 text-indigo-600" /></div></div></CardContent></Card>
        <Card className="border-[#E5E7EB]"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#6B7280]">Activos</p><p className="text-2xl font-bold text-[#059669]">{estadisticas.activos}</p></div><div className="p-2.5 rounded-xl bg-emerald-100"><CheckCircle className="h-5 w-5 text-emerald-600" /></div></div></CardContent></Card>
        <Card className="border-[#E5E7EB]"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#6B7280]">Inactivos</p><p className="text-2xl font-bold text-[#DC2626]">{estadisticas.inactivos}</p></div><div className="p-2.5 rounded-xl bg-rose-100"><XCircle className="h-5 w-5 text-rose-600" /></div></div></CardContent></Card>
        <Card className="border-[#E5E7EB]"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#6B7280]">Profesores</p><p className="text-2xl font-bold text-[#1D4ED8]">{estadisticas.profesores}</p></div><div className="p-2.5 rounded-xl bg-blue-100"><UserCog className="h-5 w-5 text-blue-600" /></div></div></CardContent></Card>
      </div>

      <Card><CardContent className="pt-6"><div className="flex flex-col lg:flex-row gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" /><Input placeholder="Buscar por nombre, email..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10" /></div><Select value={filtroRol} onValueChange={setFiltroRol}><SelectTrigger className="w-full lg:w-48"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Rol" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem>{roles.map((rol) => <SelectItem key={rol.id} value={rol.nombre}>{rol.nombre}</SelectItem>)}</SelectContent></Select><Select value={filtroEstado} onValueChange={setFiltroEstado}><SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="approved">Activo</SelectItem><SelectItem value="pending">Pendiente</SelectItem><SelectItem value="rejected">Rechazado</SelectItem></SelectContent></Select></div></CardContent></Card>

      <Card>
        <CardHeader><CardTitle>Usuarios</CardTitle><CardDescription>{users.length} registros</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-[#6B7280]">{u.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getBadgeRol(u.role)}>{u.role}</Badge>
                    <Badge variant="outline">{getEstadoLabel(u.status)}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setUsuarioSeleccionado(u); setModalDetalle(true); }}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => eliminarUsuario(u.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
            {!users.length && (
              <div className="border border-dashed border-[#D1D5DB] rounded-xl p-8 text-center">
                <p className="text-sm text-[#6B7280]">No hay usuarios para los filtros seleccionados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalle de usuario</DialogTitle></DialogHeader>
          {usuarioSeleccionado && (
            <div className="space-y-2">
              <p><strong>Nombre:</strong> {usuarioSeleccionado.name}</p>
              <p><strong>Email:</strong> {usuarioSeleccionado.email}</p>
              <p><strong>Rol:</strong> {usuarioSeleccionado.role}</p>
              <p><strong>Estado:</strong> {getEstadoLabel(usuarioSeleccionado.status)}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
