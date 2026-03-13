import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { 
  Shield, 
  Edit,
  Eye,
  Plus,
  CheckCircle,
  XCircle,
  Settings
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";

export function Roles() {
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState<any>(null);

  // Datos de ejemplo
  const roles = [
    {
      id: 1,
      nombre: "Administrador",
      descripcion: "Control total del sistema, gestión de usuarios y configuraciones",
      color: "purple",
      usuarios: 2,
      permisos: [
        "Gestión de usuarios",
        "Gestión de roles",
        "Configuración del sistema",
        "Ver todos los módulos",
        "Eliminar datos",
        "Exportar información"
      ]
    },
    {
      id: 2,
      nombre: "Personal Administrativo",
      descripcion: "Gestión escolar, grupos, materias, horarios y vinculación tutor-alumno",
      color: "blue",
      usuarios: 5,
      permisos: [
        "Crear y editar grupos",
        "Gestionar materias",
        "Configurar horarios",
        "Gestionar alumnos",
        "Vincular tutores",
        "Publicar eventos",
        "Publicar circulares"
      ]
    },
    {
      id: 3,
      nombre: "Profesor",
      descripcion: "Gestión académica, calificaciones, tareas y asistencia",
      color: "green",
      usuarios: 18,
      permisos: [
        "Ver sus grupos asignados",
        "Registrar calificaciones",
        "Tomar asistencia",
        "Crear y asignar tareas",
        "Enviar notificaciones",
        "Ver agenda escolar"
      ]
    },
    {
      id: 4,
      nombre: "Trabajador Social",
      descripcion: "Seguimiento de alumnos, reportes de conducta y notificaciones",
      color: "orange",
      usuarios: 5,
      permisos: [
        "Ver todos los alumnos",
        "Crear reportes de conducta",
        "Gestionar seguimientos",
        "Enviar notificaciones masivas",
        "Ver historial de alumnos",
        "Acceder a expedientes"
      ]
    },
    {
      id: 5,
      nombre: "Tutor",
      descripcion: "Consulta de información académica de sus hijos",
      color: "pink",
      usuarios: 15,
      permisos: [
        "Ver calificaciones de sus hijos",
        "Ver tareas pendientes",
        "Consultar asistencia",
        "Ver reportes",
        "Ver notificaciones",
        "Ver horarios",
        "Ver agenda escolar"
      ]
    }
  ];

  const modulosDisponibles = [
    {
      categoria: "Dashboard",
      permisos: [
        { id: "dashboard_view", nombre: "Ver Dashboard", descripcion: "Acceso al panel principal" },
        { id: "dashboard_stats", nombre: "Ver Estadísticas", descripcion: "Visualizar métricas y reportes" }
      ]
    },
    {
      categoria: "Gestión Escolar",
      permisos: [
        { id: "grupos_create", nombre: "Crear Grupos", descripcion: "Crear nuevos grupos escolares" },
        { id: "grupos_edit", nombre: "Editar Grupos", descripcion: "Modificar grupos existentes" },
        { id: "grupos_delete", nombre: "Eliminar Grupos", descripcion: "Eliminar grupos" },
        { id: "materias_manage", nombre: "Gestionar Materias", descripcion: "CRUD completo de materias" },
        { id: "horarios_manage", nombre: "Gestionar Horarios", descripcion: "Configurar horarios escolares" },
        { id: "alumnos_manage", nombre: "Gestionar Alumnos", descripcion: "CRUD completo de alumnos" },
        { id: "tutores_manage", nombre: "Gestionar Tutores", descripcion: "Vincular tutores con alumnos" }
      ]
    },
    {
      categoria: "Académico",
      permisos: [
        { id: "calificaciones_view", nombre: "Ver Calificaciones", descripcion: "Consultar calificaciones" },
        { id: "calificaciones_edit", nombre: "Editar Calificaciones", descripcion: "Registrar calificaciones" },
        { id: "tareas_create", nombre: "Crear Tareas", descripcion: "Asignar nuevas tareas" },
        { id: "tareas_edit", nombre: "Editar Tareas", descripcion: "Modificar tareas" },
        { id: "asistencia_view", nombre: "Ver Asistencia", descripcion: "Consultar asistencia" },
        { id: "asistencia_edit", nombre: "Tomar Asistencia", descripcion: "Registrar asistencia" }
      ]
    },
    {
      categoria: "Comunicación",
      permisos: [
        { id: "notificaciones_send", nombre: "Enviar Notificaciones", descripcion: "Enviar mensajes" },
        { id: "circulares_publish", nombre: "Publicar Circulares", descripcion: "Crear circulares" },
        { id: "eventos_publish", nombre: "Publicar Eventos", descripcion: "Crear eventos en agenda" }
      ]
    },
    {
      categoria: "Administración",
      permisos: [
        { id: "usuarios_manage", nombre: "Gestionar Usuarios", descripcion: "CRUD de usuarios" },
        { id: "roles_manage", nombre: "Gestionar Roles", descripcion: "CRUD de roles" },
        { id: "config_system", nombre: "Configuración del Sistema", descripcion: "Ajustes generales" },
        { id: "logs_view", nombre: "Ver Logs", descripcion: "Consultar registros del sistema" },
        { id: "backup_manage", nombre: "Gestionar Respaldos", descripcion: "Crear y restaurar respaldos" }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "purple": return { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", icon: "bg-purple-500" };
      case "blue": return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", icon: "bg-blue-500" };
      case "green": return { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", icon: "bg-green-500" };
      case "orange": return { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", icon: "bg-orange-500" };
      case "pink": return { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200", icon: "bg-pink-500" };
      default: return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", icon: "bg-gray-500" };
    }
  };

  const verDetalle = (rol: any) => {
    setRolSeleccionado(rol);
    setModalDetalle(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#111827]">Roles y Permisos</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Configura los roles y sus permisos en el sistema
          </p>
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
              <DialogDescription>
                Define un nuevo rol con sus permisos correspondientes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre-rol">Nombre del Rol</Label>
                  <Input id="nombre-rol" placeholder="Ej: Coordinador Académico" />
                </div>

                <div>
                  <Label htmlFor="descripcion-rol">Descripción</Label>
                  <Textarea 
                    id="descripcion-rol" 
                    placeholder="Describe las responsabilidades de este rol..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="color-rol">Color Identificador</Label>
                  <div className="flex gap-2 mt-2">
                    {["purple", "blue", "green", "orange", "pink", "red", "yellow", "indigo"].map((color) => {
                      const classes = getColorClasses(color);
                      return (
                        <button
                          key={color}
                          className={`w-10 h-10 rounded-lg ${classes.icon} hover:scale-110 transition-transform border-2 border-transparent hover:border-gray-300`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-[#111827] mb-4">Permisos del Rol</h3>
                <div className="space-y-6">
                  {modulosDisponibles.map((modulo) => (
                    <div key={modulo.categoria} className="space-y-3">
                      <h4 className="font-medium text-[#111827] flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#7C3AED]" />
                        {modulo.categoria}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                        {modulo.permisos.map((permiso) => (
                          <div key={permiso.id} className="flex items-start gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:bg-gray-50">
                            <Checkbox id={permiso.id} />
                            <div className="flex-1">
                              <label
                                htmlFor={permiso.id}
                                className="text-sm font-medium text-[#111827] cursor-pointer"
                              >
                                {permiso.nombre}
                              </label>
                              <p className="text-xs text-[#6B7280] mt-0.5">
                                {permiso.descripcion}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setModalNuevo(false)}>
                  Cancelar
                </Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                  Crear Rol
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Total Roles</p>
                <p className="text-2xl font-bold text-[#7C3AED] mt-1">{roles.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Shield className="h-6 w-6 text-[#7C3AED]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Usuarios Asignados</p>
                <p className="text-2xl font-bold text-[#1D4ED8] mt-1">
                  {roles.reduce((acc, rol) => acc + rol.usuarios, 0)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-[#1D4ED8]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Permisos Únicos</p>
                <p className="text-2xl font-bold text-[#059669] mt-1">
                  {modulosDisponibles.reduce((acc, mod) => acc + mod.permisos.length, 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Settings className="h-6 w-6 text-[#059669]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roles.map((rol) => {
          const colors = getColorClasses(rol.color);
          return (
            <Card key={rol.id} className="border-[#E5E7EB] hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 ${colors.icon} rounded-xl`}>
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{rol.nombre}</CardTitle>
                      <Badge className={`${colors.bg} ${colors.text} ${colors.border} mt-1`}>
                        {rol.usuarios} {rol.usuarios === 1 ? 'usuario' : 'usuarios'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => verDetalle(rol)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {rol.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium text-[#111827] mb-2">
                    Permisos principales:
                  </p>
                  <div className="space-y-1.5">
                    {rol.permisos.slice(0, 4).map((permiso, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <CheckCircle className={`h-3.5 w-3.5 ${colors.text}`} />
                        <span>{permiso}</span>
                      </div>
                    ))}
                    {rol.permisos.length > 4 && (
                      <p className="text-xs text-[#6B7280] pl-5">
                        +{rol.permisos.length - 4} permisos más
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de detalle */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Rol</DialogTitle>
            <DialogDescription>
              Información completa y permisos del rol seleccionado.
            </DialogDescription>
          </DialogHeader>
          {rolSeleccionado && (
            <div className="space-y-4">
              <div className={`flex items-center gap-4 p-4 rounded-lg ${getColorClasses(rolSeleccionado.color).bg}`}>
                <div className={`p-3 ${getColorClasses(rolSeleccionado.color).icon} rounded-xl`}>
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{rolSeleccionado.nombre}</h3>
                  <p className="text-sm text-[#6B7280]">{rolSeleccionado.descripcion}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-[#6B7280]">Usuarios Asignados</Label>
                  <p className="font-semibold text-2xl">{rolSeleccionado.usuarios}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Total Permisos</Label>
                  <p className="font-semibold text-2xl">{rolSeleccionado.permisos.length}</p>
                </div>
              </div>

              <div>
                <Label className="text-[#111827] font-semibold">Todos los Permisos</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                  {rolSeleccionado.permisos.map((permiso: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <CheckCircle className={`h-4 w-4 ${getColorClasses(rolSeleccionado.color).text}`} />
                      <span className="text-sm">{permiso}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setModalDetalle(false)}>
                  Cerrar
                </Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Rol
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
