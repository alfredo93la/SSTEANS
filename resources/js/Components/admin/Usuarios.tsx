import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  UserCog,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function Usuarios() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null);

  // Datos de ejemplo
  const usuarios = [
    {
      id: 1,
      nombre: "María García López",
      email: "maria.garcia@escuela.mx",
      telefono: "+52 555 1234 567",
      rol: "Profesor",
      estado: "activo",
      fechaCreacion: "15/01/2026",
      ultimoAcceso: "25/02/2026 08:30",
      gruposAsignados: ["1°A", "2°B", "3°C"],
      materiasAsignadas: ["Matemáticas"]
    },
    {
      id: 2,
      nombre: "Juan Pérez Martínez",
      email: "juan.perez@escuela.mx",
      telefono: "+52 555 2345 678",
      rol: "Tutor",
      estado: "activo",
      fechaCreacion: "10/01/2026",
      ultimoAcceso: "24/02/2026 20:15",
      hijosAsignados: ["Ana Pérez García - 1°A"]
    },
    {
      id: 3,
      nombre: "Laura Rodríguez Cruz",
      email: "laura.rodriguez@escuela.mx",
      telefono: "+52 555 3456 789",
      rol: "Trabajador Social",
      estado: "activo",
      fechaCreacion: "05/01/2026",
      ultimoAcceso: "25/02/2026 09:00",
      casosAsignados: 12
    },
    {
      id: 4,
      nombre: "Roberto Sánchez Díaz",
      email: "roberto.sanchez@escuela.mx",
      telefono: "+52 555 4567 890",
      rol: "Personal Administrativo",
      estado: "activo",
      fechaCreacion: "01/01/2026",
      ultimoAcceso: "25/02/2026 07:45"
    },
    {
      id: 5,
      nombre: "Carmen Flores Ruiz",
      email: "carmen.flores@escuela.mx",
      telefono: "+52 555 5678 901",
      rol: "Administrador",
      estado: "activo",
      fechaCreacion: "01/01/2026",
      ultimoAcceso: "25/02/2026 10:30"
    },
    {
      id: 6,
      nombre: "Pedro González Mora",
      email: "pedro.gonzalez@escuela.mx",
      telefono: "+52 555 6789 012",
      rol: "Profesor",
      estado: "inactivo",
      fechaCreacion: "15/01/2026",
      ultimoAcceso: "10/02/2026 15:20",
      gruposAsignados: ["2°A"],
      materiasAsignadas: ["Física", "Química"]
    }
  ];

  const estadisticas = {
    total: 45,
    activos: 42,
    inactivos: 3,
    administradores: 2,
    personalAdministrativo: 5,
    profesores: 18,
    tutores: 15,
    trabajadoresSociales: 5
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

  const verDetalle = (usuario: any) => {
    setUsuarioSeleccionado(usuario);
    setModalDetalle(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#111827]">Gestión de Usuarios</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Administra los usuarios y sus permisos del sistema
          </p>
        </div>
        <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Llena los campos para crear un nuevo usuario en el sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input id="nombre" placeholder="Ej: María García López" />
                </div>

                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" placeholder="usuario@escuela.mx" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" placeholder="+52 555 1234 567" />
                </div>

                <div>
                  <Label htmlFor="rol">Rol del Usuario</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="personal-admin">Personal Administrativo</SelectItem>
                      <SelectItem value="profesor">Profesor</SelectItem>
                      <SelectItem value="trabajador-social">Trabajador Social</SelectItem>
                      <SelectItem value="tutor">Tutor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Contraseña Temporal</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>

                <div>
                  <Label htmlFor="confirmar-password">Confirmar Contraseña</Label>
                  <Input id="confirmar-password" type="password" placeholder="••••••••" />
                </div>
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select defaultValue="activo">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Contraseña temporal
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      El usuario deberá cambiar su contraseña en el primer inicio de sesión
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setModalNuevo(false)}>
                  Cancelar
                </Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                  Crear Usuario
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Total Usuarios</p>
                <p className="text-2xl font-bold text-[#7C3AED] mt-1">{estadisticas.total}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-[#7C3AED]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Activos</p>
                <p className="text-2xl font-bold text-[#059669] mt-1">{estadisticas.activos}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-[#059669]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Inactivos</p>
                <p className="text-2xl font-bold text-[#DC2626] mt-1">{estadisticas.inactivos}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="h-6 w-6 text-[#DC2626]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Profesores</p>
                <p className="text-2xl font-bold text-[#1D4ED8] mt-1">{estadisticas.profesores}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <UserCog className="h-6 w-6 text-[#1D4ED8]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Buscar por nombre, email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroRol} onValueChange={setFiltroRol}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los roles</SelectItem>
                <SelectItem value="administrador">Administrador</SelectItem>
                <SelectItem value="personal-admin">Personal Administrativo</SelectItem>
                <SelectItem value="profesor">Profesor</SelectItem>
                <SelectItem value="trabajador-social">Trabajador Social</SelectItem>
                <SelectItem value="tutor">Tutor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Gestiona los usuarios del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {usuarios.map((usuario) => (
              <div
                key={usuario.id}
                className="p-4 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] rounded-lg">
                        <UserCog className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#111827]">{usuario.nombre}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getBadgeRol(usuario.rol)}>
                            {usuario.rol}
                          </Badge>
                          <Badge variant="outline" className={
                            usuario.estado === "activo" 
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }>
                            {usuario.estado === "activo" ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#6B7280] ml-12">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{usuario.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{usuario.telefono}</span>
                      </div>
                      <div className="text-xs">
                        Creado: {usuario.fechaCreacion}
                      </div>
                      <div className="text-xs">
                        Último acceso: {usuario.ultimoAcceso}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => verDetalle(usuario)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalle */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Usuario</DialogTitle>
            <DialogDescription>
              Información completa del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>
          {usuarioSeleccionado && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="p-3 bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] rounded-xl">
                  <UserCog className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{usuarioSeleccionado.nombre}</h3>
                  <Badge className={getBadgeRol(usuarioSeleccionado.rol)}>
                    {usuarioSeleccionado.rol}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#6B7280]">Email</Label>
                  <p className="font-medium">{usuarioSeleccionado.email}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Teléfono</Label>
                  <p className="font-medium">{usuarioSeleccionado.telefono}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Estado</Label>
                  <Badge variant="outline" className={
                    usuarioSeleccionado.estado === "activo" 
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }>
                    {usuarioSeleccionado.estado === "activo" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Fecha de creación</Label>
                  <p>{usuarioSeleccionado.fechaCreacion}</p>
                </div>
              </div>

              <div>
                <Label className="text-[#6B7280]">Último acceso</Label>
                <p>{usuarioSeleccionado.ultimoAcceso}</p>
              </div>

              {usuarioSeleccionado.gruposAsignados && (
                <div>
                  <Label className="text-[#6B7280]">Grupos asignados</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {usuarioSeleccionado.gruposAsignados.map((grupo: string, i: number) => (
                      <Badge key={i} variant="secondary">{grupo}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setModalDetalle(false)}>
                  Cerrar
                </Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Usuario
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
