import { Badge } from "./ui/badge";
import { Bell, GraduationCap, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { alumnos } from "../data/mockData";

interface TopbarProps {
  userName: string;
  userRole: string;
  hijoSeleccionado?: number | null;
  onHijoChange?: (hijoId: number) => void;
}

export function Topbar({ userName, userRole, hijoSeleccionado, onHijoChange }: TopbarProps) {
  // Obtener hijos del tutor (asumiendo tutorId: 2 para el tutor de ejemplo)
  const hijos = userRole === "Tutor" ? alumnos.filter(a => a.tutorId === 2) : [];
  const hijoActual = hijos.find(h => h.id === hijoSeleccionado);

  return (
    <div className="h-16 bg-white/90 backdrop-blur-lg border-b border-[#E5E7EB]/60 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        <div 
          className="flex items-center justify-center w-10 h-10 rounded-xl relative overflow-hidden group"
          style={{ background: "var(--gradient-primary)" }}
        >
          <span className="text-white font-semibold text-sm relative z-10">SE</span>
          <GraduationCap className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-white/40" />
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="font-semibold text-[#111827] bg-gradient-to-r from-[#111827] to-[#6B7280] bg-clip-text">
          Sistema de Seguimiento a la Trayectoria Escolar
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Selector de hijo para Tutores */}
        {userRole === "Tutor" && hijos.length > 0 && onHijoChange && (
          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200/50">
            <Users className="h-4 w-4 text-[#7C3AED]" />
            <Select 
              value={hijoSeleccionado?.toString() || hijos[0].id.toString()}
              onValueChange={(value) => onHijoChange(parseInt(value))}
            >
              <SelectTrigger className="h-8 border-0 bg-transparent focus:ring-0 focus:ring-offset-0 min-w-[140px]">
                <SelectValue>
                  <span className="font-medium text-[#111827]">
                    {hijoActual?.nombre || hijos[0].nombre}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {hijos.map((hijo) => (
                  <SelectItem key={hijo.id} value={hijo.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{hijo.nombre}</span>
                      <Badge variant="outline" className="text-xs">
                        {hijo.grupo}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-gray-100 rounded-xl transition-all group"
        >
          <Bell className="h-5 w-5 text-[#6B7280] group-hover:text-[#1D4ED8] transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#E11D48] rounded-full animate-pulse">
            <span className="absolute inset-0 bg-[#E11D48] rounded-full animate-ping opacity-75" />
          </span>
        </Button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-[#E5E7EB]">
          <div className="text-right">
            <p className="text-sm font-medium text-[#111827]">{userName}</p>
            <Badge 
              variant="secondary" 
              className="mt-0.5 bg-gradient-to-r from-[#F3F4F6] to-[#E5E7EB] text-[#6B7280] text-xs h-5 border-0"
            >
              {userRole}
            </Badge>
          </div>
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer"
            style={{ background: "var(--gradient-secondary)" }}
          >
            <span className="text-white text-sm font-medium relative z-10">{userName.charAt(0)}</span>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
}