import { Home, Calendar, FileText, Settings, Bell } from "lucide-react";
import { cn } from "./ui/utils";

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  userRole: string;
}

const navItems = [
  { id: "dashboard", label: "Inicio", icon: Home, route: "#/dashboard", roles: ["Tutor", "Profesor", "Trabajador Social", "Administrador", "Personal Administrativo"] },
  { id: "agenda", label: "Agenda", icon: Calendar, route: "#/agenda", roles: ["Tutor", "Profesor", "Trabajador Social", "Personal Administrativo"] },
  { id: "circulares", label: "Circulares", icon: FileText, route: "#/circulares", roles: ["Tutor", "Profesor", "Trabajador Social", "Personal Administrativo"] },
  { id: "social", label: "Social", icon: Bell, route: "#/trabajador-social/notificaciones", roles: ["Trabajador Social"] },
  { id: "admin", label: "Admin", icon: Settings, route: "#/admin/usuarios", roles: ["Administrador"] },
  { id: "control", label: "Escolar", icon: Settings, route: "#/administrativo/grupos", roles: ["Personal Administrativo"] },
];

export function BottomNav({ currentRoute, onNavigate, userRole }: BottomNavProps) {
  const filteredItems = navItems.filter((item) => item.roles.includes(userRole)).slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E7EB] safe-area-inset-bottom lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.route;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.route)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 max-w-[80px]",
                isActive ? "text-[#1D4ED8]" : "text-[#6B7280] hover:text-[#111827] hover:bg-gray-50",
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1D4ED8] rounded-full" />}
              </div>
              <span className={cn("text-xs font-medium truncate w-full text-center", isActive && "font-semibold")}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
