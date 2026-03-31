import { Home, Calendar, BookOpen, MessageSquare, Settings, ChevronRight, ChevronDown, CalendarDays, FileText, ClipboardList, CalendarCheck, GraduationCap, CheckCircle2, AlertTriangle, Bell, Users, UserCog, Building2, BookMarked, Clock, CalendarRange, BookKey, Settings2, UserCheck } from "lucide-react";
import { cn } from "../Components/ui/utils";
import { useState } from "react";

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  userRole: string;
}

interface SubMenuItem {
  id: string;
  label: string;
  icon: any;
  route: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  route?: string;
  roles: string[];
  subItems?: SubMenuItem[];
}

const getMenuItems = (userRole: string): MenuItem[] => {
  const baseItems: MenuItem[] = [
    // Menú para Tutor
    ...(userRole === "Tutor" ? [
      { id: "general", label: "Inicio", icon: Home, route: "#/dashboard", roles: ["Tutor"] },
      { id: "calificaciones", label: "Calificaciones", icon: GraduationCap, route: "#/dashboard/calificaciones", roles: ["Tutor"] },
      { id: "tareas", label: "Tareas", icon: ClipboardList, route: "#/dashboard/tareas", roles: ["Tutor"] },
      { id: "asistencia", label: "Asistencia", icon: CheckCircle2, route: "#/dashboard/asistencia", roles: ["Tutor"] },
      { id: "notificaciones", label: "Notificaciones", icon: Bell, route: "#/dashboard/notificaciones", roles: ["Tutor"] },
      { id: "reportes", label: "Reportes", icon: AlertTriangle, route: "#/dashboard/reportes", roles: ["Tutor"] },
      { id: "horario", label: "Horario", icon: CalendarDays, route: "#/dashboard/horario", roles: ["Tutor"] },
      { id: "agenda", label: "Agenda Escolar", icon: CalendarCheck, route: "#/agenda", roles: ["Tutor"] },
      { id: "circulares", label: "Circulares", icon: FileText, route: "#/circulares", roles: ["Tutor"] }
    ] : []),

    // Menú para Profesor
    ...(userRole === "Profesor" ? [
      { id: "general", label: "Inicio", icon: Home, route: "#/dashboard", roles: ["Profesor"] },
      { id: "calificaciones", label: "Calificaciones", icon: GraduationCap, route: "#/dashboard/calificaciones", roles: ["Profesor"] },
      { id: "asistencia", label: "Asistencia", icon: CheckCircle2, route: "#/dashboard/asistencia", roles: ["Profesor"] },
      { id: "asignar-tarea", label: "Asignar Tarea", icon: ClipboardList, route: "#/dashboard/asignar-tarea", roles: ["Profesor"] },
      { id: "gestionar-tareas", label: "Gestionar Tareas", icon: FileText, route: "#/dashboard/gestionar-tareas", roles: ["Profesor"] },
      { id: "notificaciones", label: "Notificaciones", icon: Bell, route: "#/notificaciones", roles: ["Profesor"] },
      { id: "agenda", label: "Agenda Escolar", icon: CalendarCheck, route: "#/agenda", roles: ["Profesor"] },
      { id: "circulares", label: "Circulares", icon: FileText, route: "#/circulares", roles: ["Profesor"] }
    ] : []),

    // Menú para Trabajador Social
    ...(userRole === "Trabajador Social" ? [
      { id: "general", label: "Inicio", icon: Home, route: "#/dashboard", roles: ["Trabajador Social"] },
      { id: "notificaciones", label: "Notificaciones", icon: Bell, route: "#/notificaciones", roles: ["Trabajador Social"] },
      { id: "reportes", label: "Reportes", icon: AlertTriangle, route: "#/trabajador-social/reportes", roles: ["Trabajador Social"] },
      { id: "alumnos", label: "Alumnos", icon: Users, route: "#/trabajador-social/alumnos", roles: ["Trabajador Social"] },
      { id: "agenda", label: "Agenda Escolar", icon: CalendarCheck, route: "#/agenda", roles: ["Trabajador Social"] },
      { id: "circulares", label: "Circulares", icon: FileText, route: "#/circulares", roles: ["Trabajador Social"] }
    ] : []),

    // Menú para Personal Administrativo
    ...(userRole === "Personal Administrativo" ? [
      { id: "general", label: "Inicio", icon: Home, route: "#/dashboard", roles: ["Personal Administrativo"] },
      { id: "alumnos", label: "Alumnos", icon: GraduationCap, route: "#/administrativo/alumnos", roles: ["Personal Administrativo"] },
      { id: "tutores", label: "Tutores", icon: Users, route: "#/administrativo/tutores", roles: ["Personal Administrativo"] },
      { id: "horarios", label: "Horarios", icon: Clock, route: "#/administrativo/horarios", roles: ["Personal Administrativo"] },
      { id: "agenda", label: "Agenda Escolar", icon: CalendarCheck, route: "#/agenda", roles: ["Personal Administrativo"] },
      { id: "circulares", label: "Circulares", icon: FileText, route: "#/circulares", roles: ["Personal Administrativo"] }
    ] : []),

    // Menú para Administrador
    ...(userRole === "Administrador" ? [
      { id: "general", label: "Inicio", icon: Home, route: "#/dashboard", roles: ["Administrador"] },
      { id: "usuarios", label: "Usuarios", icon: Users, route: "#/admin/usuarios", roles: ["Administrador"] },
      { id: "roles", label: "Roles y Permisos", icon: Settings, route: "#/admin/roles", roles: ["Administrador"] },
      { id: "materias", label: "Materias", icon: BookMarked, route: "#/administrativo/materias", roles: ["Administrador"] },
      { id: "grupos", label: "Grupos", icon: Users, route: "#/administrativo/grupos", roles: ["Administrador"] },
      { id: "alumnos", label: "Alumnos", icon: GraduationCap, route: "#/administrativo/alumnos", roles: ["Administrador"] },
      { id: "ciclos", label: "Ciclos Escolares", icon: CalendarRange, route: "#/admin/ciclos", roles: ["Administrador"] },
      { id: "periodos", label: "Periodos de Evaluación", icon: BookKey, route: "#/admin/periodos", roles: ["Administrador"] },
      { id: "configuracion", label: "Configuración General", icon: Settings2, route: "#/admin/configuracion", roles: ["Administrador"] },
    ] : []),

    // Sin item genérico de Administración - cada rol tiene su propio submenú
  ];

  return baseItems.filter(item => item.roles.includes(userRole));
};

export function Sidebar({ currentRoute, onNavigate, userRole }: SidebarProps) {
  // Obtener items del menú según el rol del usuario
  const filteredItems = getMenuItems(userRole);

  // Estado para controlar qué menús están expandidos
  // Para Tutor, expandir "dashboard" por defecto, para otros "agenda"
  const defaultExpanded = userRole === "Tutor" ? ["dashboard"] : ["agenda"];
  const [expandedMenus, setExpandedMenus] = useState<string[]>(defaultExpanded);

  const toggleMenu = (itemId: string) => {
    setExpandedMenus(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Verificar si algún subitem está activo
  const isSubItemActive = (item: MenuItem) => {
    if (!item.subItems) return false;
    return item.subItems.some(sub => currentRoute === sub.route);
  };

  return (
    <aside className="w-64 bg-linear-to-b from-white to-gray-50/50 border-r border-[#E5E7EB]/60 h-[calc(100vh-4rem)] sticky top-16 backdrop-blur-sm overflow-y-auto">
      <nav className="p-4 space-y-2 bg-[rgba(114,174,253,0)]">
        {filteredItems.map((item, index) => {
          const Icon = item.icon;
          const isExpanded = expandedMenus.includes(item.id);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isActive = currentRoute === item.route;
          const hasActiveSubItem = isSubItemActive(item);

          return (
            <div key={item.id} className="animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
              {/* Item principal */}
              <button
                onClick={() => {
                  if (hasSubItems) {
                    toggleMenu(item.id);
                  } else if (item.route) {
                    onNavigate(item.route);
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "text-white shadow-lg shadow-blue-500/20"
                    : hasActiveSubItem
                      ? "text-[#1D4ED8] bg-blue-50/50"
                      : "text-[#6B7280] hover:bg-white/80 hover:text-[#111827] hover:shadow-sm"
                )}
                style={{
                  background: isActive ? "var(--gradient-primary)" : hasActiveSubItem ? "transparent" : "transparent"
                }}
              >
                {/* Indicador activo */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                )}

                <div className="flex items-center gap-3 relative z-10">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-all",
                    isActive
                      ? "bg-white/20"
                      : hasActiveSubItem
                        ? "bg-blue-100"
                        : "bg-gray-100 group-hover:bg-gray-200"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>

                {hasSubItems ? (
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-all duration-200",
                    isExpanded ? "rotate-180" : "rotate-0"
                  )} />
                ) : (
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-all duration-200",
                    isActive
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                  )} />
                )}

                {/* Efecto hover para items inactivos */}
                {!isActive && !hasActiveSubItem && (
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                )}
              </button>

              {/* Sub-items */}
              {hasSubItems && isExpanded && (
                <div className="ml-4 mt-1 space-y-1 animate-fade-in">
                  {item.subItems!.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = currentRoute === subItem.route;

                    return (
                      <button
                        key={subItem.id}
                        onClick={() => onNavigate(subItem.route)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden text-sm",
                          isSubActive
                            ? "text-[#1D4ED8] bg-blue-50 shadow-sm"
                            : "text-[#6B7280] hover:bg-white/80 hover:text-[#111827]"
                        )}
                      >
                        {isSubActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#1D4ED8] rounded-r-full" />
                        )}

                        <div className={cn(
                          "p-1 rounded-md transition-all",
                          isSubActive
                            ? "bg-blue-100"
                            : "bg-gray-50 group-hover:bg-gray-100"
                        )}>
                          <SubIcon className="h-3.5 w-3.5" />
                        </div>
                        <span className={cn(
                          "font-medium",
                          isSubActive && "font-semibold"
                        )}>
                          {subItem.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}