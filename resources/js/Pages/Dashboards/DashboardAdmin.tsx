import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import {
  Users,
  UserCheck,
  UserX,
  Settings,
  Shield,
  Lock,
  Key,
  Activity,
  CheckCircle2,
  Clock
} from "lucide-react";

interface UsuarioData { id: number; name: string; email: string; role: string; status: string; }

interface DashboardAdminProps {
  onNavigate: (route: string) => void;
}

export function DashboardAdmin({ onNavigate }: DashboardAdminProps) {
  const [usuarios, setUsuarios] = useState<UsuarioData[]>([]);

  useEffect(() => {
    axios.get("/admin/usuarios")
      .then(({ data }) => setUsuarios(data.users ?? []))
      .catch(() => {});
  }, []);

  const usuariosActivos = usuarios.filter(u => u.status === "Activo").length;
  const usuariosInactivos = usuarios.filter(u => u.status === "Inactivo").length;
  const totalUsuarios = usuarios.length;
  const rolesUnicos = [...new Set(usuarios.map(u => u.role))].length;

  const distribucionRoles = [
    { rol: "Tutor", cantidad: usuarios.filter(u => u.role === "Tutor").length, color: "bg-blue-100 text-[#1D4ED8]" },
    { rol: "Profesor", cantidad: usuarios.filter(u => u.role === "Profesor").length, color: "bg-purple-100 text-[#7C3AED]" },
    { rol: "Trabajador Social", cantidad: usuarios.filter(u => u.role === "Trabajador Social").length, color: "bg-green-100 text-[#059669]" },
    { rol: "Personal Administrativo", cantidad: usuarios.filter(u => u.role === "Personal Administrativo").length, color: "bg-amber-100 text-[#D97706]" },
    { rol: "Administrador", cantidad: usuarios.filter(u => u.role === "Administrador").length, color: "bg-red-100 text-[#E11D48]" }
  ];

  const actividadesRecientes = [
    { accion: "Usuario creado", detalle: "Nuevo profesor registrado: Prof. Ramírez", fecha: "Hace 2 horas" },
    { accion: "Contraseña restablecida", detalle: "Usuario: m.lopez@esc.edu.mx", fecha: "Hace 4 horas" },
    { accion: "Usuario desactivado", detalle: "Cuenta suspendida: jgomez", fecha: "Ayer" },
    { accion: "Rol modificado", detalle: "Personal Administrativo → Trabajador Social", fecha: "Hace 2 días" },
    { accion: "Acceso denegado", detalle: "Intento fallido en: admin@esc.edu.mx (3x)", fecha: "Hace 3 días" }
  ];

  const tareasAdmin = [
    { tarea: "Revisar solicitudes de acceso pendientes (2)", urgente: true },
    { tarea: "Actualizar permisos del rol Trabajador Social", urgente: true },
    { tarea: "Validar cuentas sin actividad (+30 días)", urgente: false },
    { tarea: "Revisar log de intentos fallidos de sesión", urgente: false }
  ];

  const permisosResumen = [
    { modulo: "Calificaciones", roles: ["Tutor (ver)", "Profesor (editar)"], activo: true },
    { modulo: "Asistencia", roles: ["Tutor (ver)", "Profesor (editar)"], activo: true },
    { modulo: "Reportes de Conducta", roles: ["Trabajador Social", "Tutor (ver)"], activo: true },
    { modulo: "Gestión Escolar", roles: ["Personal Administrativo"], activo: true },
    { modulo: "Usuarios y Roles", roles: ["Administrador"], activo: true }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de bienvenida */}
      <Card className="bg-linear-to-br from-red-50 to-purple-50 border-red-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <Shield className="h-7 w-7 text-[#E11D48]" />
              </div>
              <div>
                <h2 className="text-[#111827]">
                  Administración del Sistema
                </h2>
                <p className="text-sm text-[#6B7280] mt-1">
                  Control de usuarios, roles y permisos de acceso
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs del sistema */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-green-100 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onNavigate("#/admin/usuarios")}
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
          onClick={() => onNavigate("#/admin/usuarios")}
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
          onClick={() => onNavigate("#/admin/roles")}
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
          onClick={() => onNavigate("#/admin/usuarios")}
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

      {/* Dos columnas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por roles */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Distribución por Roles</CardTitle>
            <CardDescription>Usuarios registrados por perfil de acceso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
                        style={{ width: `${(item.cantidad / totalUsuarios) * 100}%` }}
                      />
                    </div>
                    <Badge className={item.color}>{item.cantidad}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4 rounded-lg"
              onClick={() => onNavigate("#/admin/usuarios")}
            >
              Ver todos los usuarios
            </Button>
          </CardContent>
        </Card>

        {/* Actividad reciente del sistema */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos cambios y eventos de seguridad</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Permisos por módulo y tareas pendientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa de permisos */}
        <Card className="border-[#E5E7EB] lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mapa de Accesos por Módulo</CardTitle>
                <CardDescription>Roles con acceso a cada sección del sistema</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg"
                onClick={() => onNavigate("#/admin/roles")}
              >
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                Configurar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {permisosResumen.map((permiso, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 w-44 shrink-0">
                    <Lock className="h-4 w-4 text-[#1D4ED8]" />
                    <span className="font-medium text-[#111827] text-sm">{permiso.modulo}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {permiso.roles.map((rol, rIdx) => (
                      <Badge key={rIdx} className="bg-blue-50 text-[#1D4ED8] border border-blue-200 text-xs font-normal">
                        {rol}
                      </Badge>
                    ))}
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tareas pendientes del administrador */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Pendientes</CardTitle>
            <CardDescription>Acciones requeridas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tareasAdmin.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-all ${
                    item.urgente 
                      ? "bg-red-50 border-red-200" 
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {item.urgente && (
                      <div className="w-2 h-2 bg-[#E11D48] rounded-full mt-1.5 shrink-0" />
                    )}
                    {!item.urgente && (
                      <div className="w-2 h-2 bg-[#9CA3AF] rounded-full mt-1.5 shrink-0" />
                    )}
                    <p className="text-sm text-[#111827]">{item.tarea}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4 rounded-lg"
              onClick={() => onNavigate("#/admin/usuarios")}
            >
              Ir a Usuarios
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
