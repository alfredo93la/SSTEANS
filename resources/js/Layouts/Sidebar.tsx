import { Home, ScrollText, ClipboardList, GraduationCap, CheckCircle2, AlertTriangle, Inbox, Users, BookMarked, Clock, CalendarRange, BookKey, Settings2, ClipboardCheck, CalendarDays, ChevronRight, ChevronDown, Send, BookA, ShieldUser, Shield, UserPen, UserCheck, UserPlus } from "lucide-react";
import { cn } from "../Components/ui/utils";
import { useState } from "react";

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  permissions: string[];
  circularesSinLeer?: number;
  notifsSinLeer?: number;
  agendaSinLeer?: number;
  tareasSinLeer?: number;
  reportesSinLeer?: number;
  examenesSinLeer?: number;
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
  permission: string | string[];
  subItems?: SubMenuItem[];
}

const hasAny = (userPermissions: string[], required: string | string[]): boolean =>
  Array.isArray(required)
    ? required.some(p => userPermissions.includes(p))
    : userPermissions.includes(required);

export const allMenuItems: MenuItem[] = [
  // ── Compartido ────────────────────────────────────────────────────────────────
  { id: "general",        label: "Inicio",                icon: Home,           route: "#/dashboard",    permission: "dashboard.view" },
  { id: "agenda",         label: "Agenda Escolar",        icon: CalendarDays,  route: "#/agenda",       permission: ["agenda.view", "agenda.manage"] },
  { id: "circulares",     label: "Circulares",            icon: ScrollText,       route: "#/circulares",   permission: ["circulares.view", "circulares.manage"] },

  // ── Módulos Tutor ────────────────────────────────────────────────────────
  { id: "calificaciones", label: "Calificaciones",            icon: BookA,  route: "#/calificaciones", permission: ["calificaciones.view"] },
  { id: "tareas",         label: "Tareas",                    icon: ClipboardList,  route: "#/tareas",         permission: ["tareas.view"] },
  { id: "asistencia",     label: "Asistencia",                icon: CheckCircle2,   route: "#/asistencia",     permission: ["asistencia.view"] },
  { id: "examenes",       label: "Exámenes Programados",      icon: ClipboardCheck, route: "#/examenes",       permission: ["examenes.view"] },
  { id: "horario",        label: "Horario de Clases",         icon: Clock,   route: "#/horario",        permission: "horario.view" },
  { id: "reportes",       label: "Reportes de Conducta",      icon: AlertTriangle,  route: "#/reportes",       permission: ["reportes.view"] },
  { id: "notificaciones", label: "Bandeja de Notificaciones", icon: Inbox,       route: "#/notificaciones", permission: ["notificaciones.view"] },

  // ── Módulos Profesor y Trabajador Social ────────────────────────────────────────────────────────
  { id: "calificaciones", label: "Registro de Calificaciones",            icon: BookA,  route: "#/calificaciones", permission: ["calificaciones.manage"] },
  { id: "tareas",         label: "Gestión de Tareas",                    icon: ClipboardList,  route: "#/tareas",         permission: ["tareas.manage"] },
  { id: "asistencia",     label: "Control de Asistencia",                icon: CheckCircle2,   route: "#/asistencia",     permission: ["asistencia.manage"] },
  { id: "examenes",       label: "Exámenes Programados",      icon: ClipboardCheck, route: "#/examenes",       permission: ["examenes.manage"] },
  //{ id: "horario",        label: "Horario de Clases",         icon: CalendarRange,   route: "#/horario",        permission: "horario.view" },
  { id: "reportes",       label: "Reportes de Conducta",      icon: AlertTriangle,  route: "#/reportes",       permission: ["reportes.manage"] },
  { id: "notificaciones", label: "Enviar Notificaciones",     icon: Send,           route: "#/notificaciones", permission: ["notificaciones.manage"] },
  { id: "alumnos",        label: "Listado de Alumnos",    icon: Users,  route: "#/alumnos",    permission: ["alumnos.view"] },

  // ── Gestión escolar ───────────────────────────────────────────────────────────
  { id: "alumnos",         label: "Gestión de Alumnos",       icon: GraduationCap, route: "#/alumnos",          permission: ["alumnos.manage"] },
  { id: "asignar-alumnos", label: "Asignar Alumnos a Grupos", icon: UserPlus,      route: "#/asignar-alumnos",  permission: ["alumnos.manage"] },
  { id: "tutores",         label: "Gestión de Tutores",       icon: ShieldUser,    route: "#/tutores",          permission: "tutores.manage" },
  { id: "grupos",          label: "Gestión de Grupos",        icon: Users,         route: "#/grupos",           permission: "grupos.manage" },
  { id: "horarios",        label: "Asignación de Horarios",   icon: Clock,         route: "#/horarios",         permission: "horarios.manage" },

  // ── Administración ────────────────────────────────────────────────────────────
  { id: "validacion",     label: "Validación de Cuentas", icon: UserCheck,        route: "#/validacion",       permission: "usuarios.validate" },
  { id: "usuarios",       label: "Gestión de Usuarios",   icon: UserPen,          route: "#/usuarios",         permission: "usuarios.manage" },
  { id: "roles",          label: "Roles y Permisos",      icon: Shield,       route: "#/roles",            permission: "roles.manage" },
  { id: "materias",       label: "Gestión de Materias",   icon: BookMarked,     route: "#/materias",   permission: "materias.manage" },
  { id: "ciclos",         label: "Ciclos Escolares",      icon: CalendarRange,  route: "#/ciclos",           permission: "ciclos.manage" },
  { id: "periodos",       label: "Periodos de Evaluación",icon: BookKey,        route: "#/periodos",         permission: "periodos.manage" },
  { id: "configuracion",  label: "Configuración General", icon: Settings2,      route: "#/configuracion",    permission: "configuracion.manage" },
];

export function Sidebar({ currentRoute, onNavigate, permissions, circularesSinLeer = 0, notifsSinLeer = 0, agendaSinLeer = 0, tareasSinLeer = 0, reportesSinLeer = 0, examenesSinLeer = 0 }: SidebarProps) {
  const filteredItems = allMenuItems.filter(item => hasAny(permissions, item.permission));
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (itemId: string) => {
    setExpandedMenus(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const isSubItemActive = (item: MenuItem) =>
    item.subItems?.some(sub => currentRoute === sub.route) ?? false;

  return (
    <aside className="w-72 bg-linear-to-b from-white to-gray-50/50 border-r border-[#E5E7EB]/60 h-[calc(100vh-4rem)] sticky top-16 backdrop-blur-sm overflow-y-auto">
      <nav className="p-4 space-y-2">
        {filteredItems.map((item, index) => {
          const Icon = item.icon;
          const isExpanded = expandedMenus.includes(item.id);
          const hasSubItems = !!(item.subItems?.length);
          const isActive = currentRoute === item.route;
          const hasActiveSubItem = isSubItemActive(item);

          return (
            <div key={item.id} className="animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
              <button
                onClick={() => {
                  if (hasSubItems) toggleMenu(item.id);
                  else if (item.route) onNavigate(item.route);
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "text-white shadow-lg shadow-blue-500/20"
                    : hasActiveSubItem
                      ? "text-[#1D4ED8] bg-blue-50/50"
                      : "text-[#6B7280] hover:bg-white/80 hover:text-[#111827] hover:shadow-sm"
                )}
                style={{ background: isActive ? "var(--gradient-primary)" : "transparent" }}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                )}
                <div className="flex items-center gap-3 relative z-10">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-all",
                    isActive ? "bg-white/20" : hasActiveSubItem ? "bg-blue-100" : "bg-gray-100 group-hover:bg-gray-200"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                  {item.id === "agenda" && agendaSinLeer > 0 && (
                    <span className="ml-auto mr-1 min-w-5 h-5 bg-[#E11D48] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                      {agendaSinLeer > 9 ? "9+" : agendaSinLeer}
                    </span>
                  )}
                  {item.id === "circulares" && circularesSinLeer > 0 && (
                    <span className="ml-auto mr-1 min-w-5 h-5 bg-[#E11D48] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                      {circularesSinLeer > 9 ? "9+" : circularesSinLeer}
                    </span>
                  )}
                  {item.id === "examenes" && examenesSinLeer > 0 && (
                    <span className="ml-auto mr-1 min-w-5 h-5 bg-[#E11D48] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                      {examenesSinLeer > 9 ? "9+" : examenesSinLeer}
                    </span>
                  )}
                  {item.id === "tareas" && tareasSinLeer > 0 && (
                    <span className="ml-auto mr-1 min-w-5 h-5 bg-[#E11D48] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                      {tareasSinLeer > 9 ? "9+" : tareasSinLeer}
                    </span>
                  )}
                  {item.id === "reportes" && reportesSinLeer > 0 && (
                    <span className="ml-auto mr-1 min-w-5 h-5 bg-[#E11D48] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                      {reportesSinLeer > 9 ? "9+" : reportesSinLeer}
                    </span>
                  )}
                  {item.id === "notificaciones" && notifsSinLeer > 0 && (
                    <span className="ml-auto mr-1 min-w-5 h-5 bg-[#E11D48] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                      {notifsSinLeer > 9 ? "9+" : notifsSinLeer}
                    </span>
                  )}
                </div>
                {hasSubItems ? (
                  <ChevronDown className={cn("h-4 w-4 transition-all duration-200", isExpanded && "rotate-180")} />
                ) : (
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-all duration-200",
                    isActive ? "opacity-100" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                  )} />
                )}
                {!isActive && !hasActiveSubItem && (
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                )}
              </button>

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
                          isSubActive ? "text-[#1D4ED8] bg-blue-50 shadow-sm" : "text-[#6B7280] hover:bg-white/80 hover:text-[#111827]"
                        )}
                      >
                        {isSubActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#1D4ED8] rounded-r-full" />}
                        <div className={cn("p-1 rounded-md transition-all", isSubActive ? "bg-blue-100" : "bg-gray-50 group-hover:bg-gray-100")}>
                          <SubIcon className="h-3.5 w-3.5" />
                        </div>
                        <span className={cn("font-medium", isSubActive && "font-semibold")}>{subItem.label}</span>
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
