import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Shield, Edit, Eye, Plus, CheckCircle, Settings, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";

type Permiso = {
  id: number;
  nombre: string;
  descripcion?: string | null;
};

type Rol = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  users_count: number;
  permisos: Permiso[];
};

type RoleResponse = {
  roles: Rol[];
  permisos: Permiso[];
};

export function Roles() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisosCatalogo, setPermisosCatalogo] = useState<Permiso[]>([]);
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null);

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevosPermisos, setNuevosPermisos] = useState<number[]>([]);

  const [editarNombre, setEditarNombre] = useState("");
  const [editarDescripcion, setEditarDescripcion] = useState("");
  const [editarPermisos, setEditarPermisos] = useState<number[]>([]);

  const cargarRoles = async () => {
    setLoading(true);

    try {
      const { data } = await window.axios.get<RoleResponse>("/admin/roles-permisos");
      setRoles(data.roles ?? []);
      setPermisosCatalogo(data.permisos ?? []);
    } catch {
      toast.error("No se pudieron cargar roles y permisos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  const permisosUnicos = useMemo(() => permisosCatalogo.length, [permisosCatalogo]);
  const usuariosAsignados = useMemo(
    () => roles.reduce((acc, rol) => acc + rol.users_count, 0),
    [roles],
  );

  const togglePermiso = (
    setState: Dispatch<SetStateAction<number[]>>,
    permisoId: number,
    checked: boolean,
  ) => {
    setState((prev) => {
      if (checked) {
        return prev.includes(permisoId) ? prev : [...prev, permisoId];
      }

      return prev.filter((id) => id !== permisoId);
    });
  };

  const crearRol = async () => {
    if (!nuevoNombre.trim()) {
      toast.error("El nombre del rol es obligatorio");
      return;
    }

    setSaving(true);

    try {
      await window.axios.post("/admin/roles", {
        nombre: nuevoNombre.trim(),
        descripcion: nuevaDescripcion.trim() || null,
        permisos: nuevosPermisos,
      });

      toast.success("Rol creado correctamente");
      setModalNuevo(false);
      setNuevoNombre("");
      setNuevaDescripcion("");
      setNuevosPermisos([]);
      await cargarRoles();
    } catch {
      toast.error("No se pudo crear el rol");
    } finally {
      setSaving(false);
    }
  };

  const verDetalle = (rol: Rol) => {
    setRolSeleccionado(rol);
    setEditarNombre(rol.nombre);
    setEditarDescripcion(rol.descripcion ?? "");
    setEditarPermisos(rol.permisos.map((permiso) => permiso.id));
    setModalDetalle(true);
  };

  const guardarEdicion = async () => {
    if (!rolSeleccionado) return;

    setSaving(true);

    try {
      await window.axios.put(`/admin/roles/${rolSeleccionado.id}`, {
        nombre: editarNombre.trim(),
        descripcion: editarDescripcion.trim() || null,
        permisos: editarPermisos,
      });

      toast.success("Rol actualizado correctamente");
      setModalDetalle(false);
      await cargarRoles();
    } catch {
      toast.error("No se pudo actualizar el rol");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#111827]">Roles y Permisos</h1>
          <p className="text-sm text-[#6B7280] mt-1">Configura los roles y sus permisos en el sistema</p>
        </div>

        <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Rol
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Rol</DialogTitle>
              <DialogDescription>Define un nuevo rol con sus permisos correspondientes.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre-rol">Nombre del Rol</Label>
                  <Input id="nombre-rol" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="descripcion-rol">Descripción</Label>
                  <Textarea
                    id="descripcion-rol"
                    rows={3}
                    value={nuevaDescripcion}
                    onChange={(e) => setNuevaDescripcion(e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-3">
                <h3 className="font-semibold text-[#111827]">Permisos del Rol</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permisosCatalogo.map((permiso) => (
                    <div key={permiso.id} className="flex items-start gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:bg-gray-50">
                      <Checkbox
                        id={`new-perm-${permiso.id}`}
                        checked={nuevosPermisos.includes(permiso.id)}
                        onCheckedChange={(checked) => togglePermiso(setNuevosPermisos, permiso.id, checked === true)}
                      />
                      <div className="flex-1">
                        <label htmlFor={`new-perm-${permiso.id}`} className="text-sm font-medium text-[#111827] cursor-pointer">
                          {permiso.nombre}
                        </label>
                        <p className="text-xs text-[#6B7280] mt-0.5">{permiso.descripcion ?? "Sin descripción"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setModalNuevo(false)} disabled={saving}>Cancelar</Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]" onClick={crearRol} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Crear Rol
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB]"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#6B7280]">Total Roles</p><p className="text-2xl font-bold text-[#7C3AED] mt-1">{roles.length}</p></div><div className="p-3 bg-purple-100 rounded-xl"><Shield className="h-6 w-6 text-[#7C3AED]" /></div></div></CardContent></Card>
        <Card className="border-[#E5E7EB]"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#6B7280]">Usuarios Asignados</p><p className="text-2xl font-bold text-[#1D4ED8] mt-1">{usuariosAsignados}</p></div><div className="p-3 bg-blue-100 rounded-xl"><CheckCircle className="h-6 w-6 text-[#1D4ED8]" /></div></div></CardContent></Card>
        <Card className="border-[#E5E7EB]"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#6B7280]">Permisos Únicos</p><p className="text-2xl font-bold text-[#059669] mt-1">{permisosUnicos}</p></div><div className="p-3 bg-green-100 rounded-xl"><Settings className="h-6 w-6 text-[#059669]" /></div></div></CardContent></Card>
      </div>

      {loading ? (
        <div className="rounded-lg border border-[#E5E7EB] p-8 text-center text-[#6B7280]">Cargando roles...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {roles.map((rol) => (
            <Card key={rol.id} className="border-[#E5E7EB] hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500 rounded-xl">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{rol.nombre}</CardTitle>
                      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 mt-1">
                        {rol.users_count} {rol.users_count === 1 ? "usuario" : "usuarios"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => verDetalle(rol)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="mt-2">{rol.descripcion || "Sin descripción"}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-[#111827] mb-2">Permisos:</p>
                <div className="flex flex-wrap gap-1.5">
                  {rol.permisos.slice(0, 6).map((permiso) => (
                    <Badge key={permiso.id} variant="outline" className="text-xs">{permiso.nombre}</Badge>
                  ))}
                  {rol.permisos.length > 6 && (
                    <Badge variant="outline" className="text-xs">+{rol.permisos.length - 6} más</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Rol</DialogTitle>
            <DialogDescription>Actualiza nombre, descripción y permisos del rol.</DialogDescription>
          </DialogHeader>

          {rolSeleccionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nombre">Nombre</Label>
                  <Input id="edit-nombre" value={editarNombre} onChange={(e) => setEditarNombre(e.target.value)} />
                </div>
                <div>
                  <Label>Usuarios Asignados</Label>
                  <div className="h-10 px-3 rounded-md border border-[#E5E7EB] flex items-center text-sm text-[#374151]">
                    {rolSeleccionado.users_count}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Textarea
                  id="edit-descripcion"
                  rows={3}
                  value={editarDescripcion}
                  onChange={(e) => setEditarDescripcion(e.target.value)}
                />
              </div>

              <div className="border-t pt-4">
                <Label className="font-semibold">Permisos</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {permisosCatalogo.map((permiso) => (
                    <div key={permiso.id} className="flex items-start gap-3 p-3 rounded-lg border border-[#E5E7EB]">
                      <Checkbox
                        id={`edit-perm-${permiso.id}`}
                        checked={editarPermisos.includes(permiso.id)}
                        onCheckedChange={(checked) => togglePermiso(setEditarPermisos, permiso.id, checked === true)}
                      />
                      <div>
                        <label htmlFor={`edit-perm-${permiso.id}`} className="text-sm font-medium text-[#111827] cursor-pointer">
                          {permiso.nombre}
                        </label>
                        <p className="text-xs text-[#6B7280]">{permiso.descripcion ?? "Sin descripción"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setModalDetalle(false)} disabled={saving}>Cerrar</Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]" onClick={guardarEdicion} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Edit className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
