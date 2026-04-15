import { useEffect, useState } from "react";
import axios from "axios";
import { Badge } from "../Components/ui/badge";
import { Bell, GraduationCap, Users, Mail, MailOpen, ChevronRight } from "lucide-react";
import { Button } from "../Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../Components/ui/popover";

interface Hijo { id: number; nombre: string; grupo: string; }

interface NotifReciente {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  hora: string;
  leida: boolean;
  categoria: string;
  alumno: string | null;
}

interface TopbarProps {
  userName: string;
  userRole: string;
  hijoSeleccionado?: number | null;
  onHijoChange?: (hijoId: number) => void;
  onNavigate?: (route: string) => void;
}

export function Topbar({ userName, userRole, hijoSeleccionado, onHijoChange, onNavigate }: TopbarProps) {
  const [hijos, setHijos] = useState<Hijo[]>([]);
  const [notifs, setNotifs] = useState<NotifReciente[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    if (userRole !== "Tutor") return;
    axios.get("/tutor/alumnos-asignados")
      .then(({ data }) => {
        const lista: Hijo[] = (data.data ?? []).map((a: any) => ({
          id: a.id,
          nombre: a.nombre,
          grupo: a.grupo ?? "",
        }));
        setHijos(lista);
        if (lista.length > 0 && !hijoSeleccionado && onHijoChange) {
          onHijoChange(lista[0].id);
        }
      })
      .catch(() => {});
  }, [userRole]);

  // Cargar notificaciones recientes al abrir el popover
  const handleBellOpen = (open: boolean) => {
    setPopoverOpen(open);
    if (open && userRole === "Tutor") {
      axios.get("/api/notificaciones")
        .then(({ data }) => setNotifs((data.notificaciones ?? []).slice(0, 7)))
        .catch(() => {});
    }
  };

  const marcarLeida = (id: number) => {
    axios.patch(`/api/notificaciones/${id}/leer`).catch(() => {});
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n));
  };

  const noLeidas = notifs.filter((n) => !n.leida).length;
  const hijoActual = hijos.find(h => h.id === hijoSeleccionado);

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "Académico":      return "bg-blue-100 text-[#1D4ED8]";
      case "Administrativo": return "bg-purple-100 text-[#7C3AED]";
      case "Evento":         return "bg-amber-100 text-[#D97706]";
      case "Conducta":       return "bg-green-100 text-[#059669]";
      default:               return "bg-gray-100 text-[#6B7280]";
    }
  };

  return (
    <div className="h-16 bg-white/90 backdrop-blur-lg border-b border-[#E5E7EB]/60 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl relative overflow-hidden group"
          style={{ background: "var(--gradient-primary)" }}
        >
          <span className="text-white font-semibold text-sm relative z-10">Escudo</span>
          <GraduationCap className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-white/40" />
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="font-semibold text-[#111827] bg-linear-to-r from-[#111827] to-[#6B7280] bg-clip-text">
          Sistema de Seguimiento a la Trayectoria Escolar
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Selector de hijo para Tutores */}
        {userRole === "Tutor" && hijos.length > 0 && onHijoChange && (
          <div className="flex items-center gap-3 px-4 py-2 bg-linear-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200/50">
            <Users className="h-4 w-4 text-[#7C3AED]" />
            <Select
              value={hijoSeleccionado?.toString() || hijos[0].id.toString()}
              onValueChange={(value) => onHijoChange(parseInt(value))}
            >
              <SelectTrigger className="h-8 border-0 bg-transparent focus:ring-0 focus:ring-offset-0 min-w-35">
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

        {/* Campana de notificaciones */}
        <Popover open={popoverOpen} onOpenChange={handleBellOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gray-100 rounded-xl transition-all group"
            >
              <Bell className="h-5 w-5 text-[#6B7280] group-hover:text-[#1D4ED8] transition-colors" />
              {/* Badge con contador — siempre visible para Tutor, estático para otros */}
              {userRole === "Tutor" ? (
                noLeidas > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 bg-[#E11D48] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {noLeidas > 9 ? "9+" : noLeidas}
                  </span>
                )
              ) : (
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#E11D48] rounded-full animate-pulse">
                  <span className="absolute inset-0 bg-[#E11D48] rounded-full animate-ping opacity-75" />
                </span>
              )}
            </Button>
          </PopoverTrigger>

          {userRole === "Tutor" && (
            <PopoverContent align="end" className="w-96 p-0 shadow-xl rounded-xl overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 bg-linear-to-r from-[#1D4ED8] to-[#7C3AED] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-white" />
                  <span className="font-semibold text-white text-sm">Notificaciones</span>
                </div>
                {noLeidas > 0 && (
                  <Badge className="bg-white/20 text-white border-0 text-xs">
                    {noLeidas} sin leer
                  </Badge>
                )}
              </div>

              {/* Lista */}
              <div className="divide-y divide-[#F3F4F6] max-h-105 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="h-8 w-8 text-[#D1D5DB] mx-auto mb-2" />
                    <p className="text-sm text-[#6B7280]">Sin notificaciones recientes</p>
                  </div>
                ) : (
                  notifs.map((notif) => (
                    <button
                      key={notif.id}
                      type="button"
                      onClick={() => marcarLeida(notif.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 items-start ${
                        !notif.leida ? "bg-blue-50/60" : ""
                      }`}
                    >
                      {/* Icono leída/no leída */}
                      <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        !notif.leida ? "bg-blue-100" : "bg-gray-100"
                      }`}>
                        {!notif.leida
                          ? <Mail className="h-4 w-4 text-[#1D4ED8]" />
                          : <MailOpen className="h-4 w-4 text-[#9CA3AF]" />
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-tight truncate ${!notif.leida ? "font-semibold text-[#111827]" : "font-medium text-[#374151]"}`}>
                            {notif.titulo}
                          </p>
                          {!notif.leida && (
                            <span className="shrink-0 w-2 h-2 bg-[#1D4ED8] rounded-full mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280] line-clamp-1 mt-0.5">{notif.mensaje}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getCategoriaColor(notif.categoria)}`}>
                            {notif.categoria}
                          </span>
                          {notif.alumno && (
                            <span className="text-[10px] text-[#6B7280]">· {notif.alumno}</span>
                          )}
                          <span className="text-[10px] text-[#9CA3AF] ml-auto">{notif.fecha}</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-[#E5E7EB] bg-gray-50">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-[#1D4ED8] hover:bg-blue-50 h-8 text-sm font-medium"
                  onClick={() => {
                    setPopoverOpen(false);
                    onNavigate?.("#/dashboard/notificaciones");
                  }}
                >
                  Ver todas las notificaciones
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </PopoverContent>
          )}
        </Popover>

        <div className="flex items-center gap-3 pl-4 border-l border-[#E5E7EB]">
          <div className="text-right">
            <p className="text-sm font-medium text-[#111827]">{userName}</p>
            <Badge
              variant="secondary"
              className="mt-0.5 bg-linear-to-r from-[#F3F4F6] to-[#E5E7EB] text-[#6B7280] text-xs h-5 border-0"
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
