import { ReactNode, useCallback, useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { useEcho } from "@laravel/echo-react";
import { Menu, X, Bell, User, ChevronDown, Users, IdCard, LogOut, ArrowLeft, Mail, MailOpen, ChevronRight } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Button } from "../Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../Components/ui/popover";
import { Badge } from "../Components/ui/badge";
import axios from "axios";

interface Hijo { id: number; nombre: string; grupo: string; }

interface ResponsiveLayoutProps {
  children: ReactNode;
  currentRoute: string;
  onNavigate: (route: string) => void;
  userRole: string;
  userName: string;
  onLogout: () => void;
  hijoSeleccionado?: number | null;
  onHijoChange?: (hijoId: number | null) => void;
}

export function ResponsiveLayout({
  children,
  currentRoute,
  onNavigate,
  userRole,
  userName,
  onLogout,
  hijoSeleccionado,
  onHijoChange,
}: ResponsiveLayoutProps) {
  const { escuela, auth } = usePage().props as {
    escuela: { nombre: string; servicio_educativo: string; numero: string };
    auth: { user?: { id?: number; permissions?: string[] } };
  };
  const permissions = auth?.user?.permissions ?? [];
  const userId = auth?.user?.id ?? 0;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hijosDelTutor, setHijosDelTutor] = useState<Hijo[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [circularesSinLeer, setCircularesSinLeer] = useState(0);
  const [notifsSinLeer, setNotifsSinLeer] = useState(0);
  const [agendaSinLeer, setAgendaSinLeer] = useState(0);
  const [tareasSinLeer, setTareasSinLeer] = useState(0);
  const [reportesSinLeer, setReportesSinLeer] = useState(0);
  const [examenesSinLeer, setExamenesSinLeer] = useState(0);
  const [notifs, setNotifs] = useState<{
    id: number; titulo: string; mensaje: string;
    fecha: string; leida: boolean; categoria: string; alumno: string | null;
  }[]>([]);

  // Helpers para persistir conteos vistos
  const getSeenCount = (key: string) => parseInt(localStorage.getItem(key) ?? "0");
  const markAsSeen  = (key: string, count: number) => localStorage.setItem(key, String(count));

  const TIPOS_EXAMEN = ["Parcial", "Final", "Extraordinario", "Examen"];

  // ── Fetch callbacks (llamados por useEffect y por WebSocket) ──────────────

  const fetchCirculares = useCallback(() => {
    if (userRole === "Administrador") return;
    axios.get<{ circulares: { leida: boolean }[] }>("/api/circulares")
      .then(({ data }) => setCircularesSinLeer((data.circulares ?? []).filter(c => !c.leida).length))
      .catch(() => {});
  }, [userRole]);

  const fetchNotificaciones = useCallback(() => {
    if (userRole !== "Tutor") return;
    axios.get<{ notificaciones: { leida: boolean }[] }>("/api/notificaciones")
      .then(({ data }) => setNotifsSinLeer((data.notificaciones ?? []).filter(n => !n.leida).length))
      .catch(() => {});
  }, [userRole]);

  const fetchAgenda = useCallback(() => {
    if (currentRoute === "#/agenda") return;
    const hasAgenda = permissions.includes("agenda.view") || permissions.includes("agenda.manage");
    if (!hasAgenda) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const next7 = new Date(today); next7.setDate(today.getDate() + 7);
    axios.get<{ eventos: { fecha: string; tipo: string }[] }>("/api/agenda/eventos")
      .then(({ data }) => {
        const eventos = data.eventos ?? [];
        const agendaCount = eventos.filter(e => { const d = new Date(e.fecha); return d >= today && d <= next7; }).length;
        const examenCount = eventos.filter(e => { const d = new Date(e.fecha); return d >= today && d <= next7 && TIPOS_EXAMEN.includes(e.tipo); }).length;
        setAgendaSinLeer(agendaCount > getSeenCount("badge_agenda_seen") ? agendaCount : 0);
        setExamenesSinLeer(examenCount > getSeenCount("badge_examenes_seen") ? examenCount : 0);
      })
      .catch(() => {});
  }, [currentRoute, permissions]);

  const fetchTareas = useCallback(() => {
    if (currentRoute === "#/tareas") return;
    if (userRole === "Tutor") {
      if (!hijoSeleccionado) return;
      axios.get<{ tareas: { estadoEntrega: string }[] }>(`/api/tutor/tareas/${hijoSeleccionado}`)
        .then(({ data }) => {
          const count = (data.tareas ?? []).filter(t => t.estadoEntrega === "Pendiente").length;
          setTareasSinLeer(count > getSeenCount("badge_tareas_seen") ? count : 0);
        })
        .catch(() => {});
    } else if (permissions.includes("tareas.manage")) {
      axios.get<{ tareas: { entregadasCount: number; totalAlumnos: number }[] }>("/api/tareas")
        .then(({ data }) => {
          const count = (data.tareas ?? []).filter(t => t.entregadasCount < t.totalAlumnos).length;
          setTareasSinLeer(count > getSeenCount("badge_tareas_seen") ? count : 0);
        })
        .catch(() => {});
    }
  }, [currentRoute, userRole, hijoSeleccionado, permissions]);

  const fetchReportes = useCallback(() => {
    const onPage = currentRoute === "#/reportes";
    if (userRole === "Tutor") {
      if (!hijoSeleccionado) return;
      axios.get<{ reportes: { estatus: string }[] }>(`/api/tutor/reportes-conducta/${hijoSeleccionado}`)
        .then(({ data }) => {
          const count = (data.reportes ?? []).filter(r => r.estatus === "Abierto").length;
          if (onPage) {
            markAsSeen("badge_reportes_seen", count);
          } else {
            const seen = getSeenCount("badge_reportes_seen");
            setReportesSinLeer(count > seen ? count - seen : 0);
          }
        })
        .catch(() => {});
    } else if (permissions.includes("reportes.manage")) {
      axios.get<{ reportes: { estatus: string }[] }>("/api/reportes-conducta")
        .then(({ data }) => {
          const count = (data.reportes ?? []).filter(r => r.estatus === "Abierto").length;
          if (onPage) {
            markAsSeen("badge_reportes_seen", count);
          } else {
            const seen = getSeenCount("badge_reportes_seen");
            setReportesSinLeer(count > seen ? count - seen : 0);
          }
        })
        .catch(() => {});
    }
  }, [currentRoute, userRole, hijoSeleccionado, permissions]);

  // ── useEffect: fetch en cada cambio de ruta ───────────────────────────────
  useEffect(() => { fetchCirculares(); },    [currentRoute, fetchCirculares]);
  useEffect(() => { fetchNotificaciones(); }, [currentRoute, fetchNotificaciones]);
  useEffect(() => { fetchAgenda(); },        [currentRoute, fetchAgenda]);
  useEffect(() => { fetchTareas(); },        [currentRoute, fetchTareas]);
  useEffect(() => { fetchReportes(); },      [currentRoute, fetchReportes]);

  // Al visitar una sección: hacer fetch real para guardar el conteo exacto y limpiar badge
  useEffect(() => {
    if (currentRoute === "#/agenda") {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const next7 = new Date(today); next7.setDate(today.getDate() + 7);
      axios.get<{ eventos: { fecha: string; tipo: string }[] }>("/api/agenda/eventos")
        .then(({ data }) => {
          const eventos = data.eventos ?? [];
          markAsSeen("badge_agenda_seen", eventos.filter(e => { const d = new Date(e.fecha); return d >= today && d <= next7; }).length);
          markAsSeen("badge_examenes_seen", eventos.filter(e => { const d = new Date(e.fecha); return d >= today && d <= next7 && TIPOS_EXAMEN.includes(e.tipo); }).length);
        }).catch(() => {});
      setAgendaSinLeer(0);
      setExamenesSinLeer(0);
    }
    if (currentRoute === "#/examenes") {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const next7 = new Date(today); next7.setDate(today.getDate() + 7);
      axios.get<{ eventos: { fecha: string; tipo: string }[] }>("/api/agenda/eventos")
        .then(({ data }) => {
          const count = (data.eventos ?? []).filter(e => { const d = new Date(e.fecha); return d >= today && d <= next7 && TIPOS_EXAMEN.includes(e.tipo); }).length;
          markAsSeen("badge_examenes_seen", count);
        }).catch(() => {});
      setExamenesSinLeer(0);
    }
    if (currentRoute === "#/tareas") {
      if (userRole === "Tutor" && hijoSeleccionado) {
        axios.get<{ tareas: { estadoEntrega: string }[] }>(`/api/tutor/tareas/${hijoSeleccionado}`)
          .then(({ data }) => markAsSeen("badge_tareas_seen", (data.tareas ?? []).filter(t => t.estadoEntrega === "Pendiente").length))
          .catch(() => {});
      } else if (permissions.includes("tareas.manage")) {
        axios.get<{ tareas: { entregadasCount: number; totalAlumnos: number }[] }>("/api/tareas")
          .then(({ data }) => markAsSeen("badge_tareas_seen", (data.tareas ?? []).filter(t => t.entregadasCount < t.totalAlumnos).length))
          .catch(() => {});
      }
      setTareasSinLeer(0);
    }
    if (currentRoute === "#/reportes") {
      setReportesSinLeer(0);
      // markAsSeen es manejado por fetchReportes (llamado por el efecto [currentRoute, fetchReportes])
    }
  }, [currentRoute]);

  // ── WebSocket: actualizar badges al recibir evento ────────────────────────
  useEcho(
    `usuario.${userId}`,
    ".badge.actualizado",
    (data: { seccion: string }) => {
      if (data.seccion === "circulares")     fetchCirculares();
      if (data.seccion === "notificaciones") fetchNotificaciones();
      if (data.seccion === "agenda")         fetchAgenda();
      if (data.seccion === "tareas")         fetchTareas();
      if (data.seccion === "reportes")       fetchReportes();
    },
    [fetchCirculares, fetchNotificaciones, fetchAgenda, fetchTareas, fetchReportes],
  );

  useEffect(() => {
    if (userRole !== "Tutor") return;
    axios.get("/tutor/alumnos-asignados")
      .then(({ data }) => {
        const lista: Hijo[] = (data.data ?? []).map((a: any) => ({
          id: a.id,
          nombre: a.nombre,
          grupo: a.grupo ?? "",
        }));
        setHijosDelTutor(lista);
        if (lista.length > 0 && !hijoSeleccionado && onHijoChange) {
          onHijoChange(lista[0].id);
        }
      })
      .catch(() => {});
  }, [userRole]);

  const handleProfileClick = () => {
    onNavigate("#/perfil");
    setShowUserMenu(false);
  };

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    onLogout();
  };

  const showPageNavigation = currentRoute !== "#/dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 lg:hidden"
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#1D4ED8] to-[#7C3AED] shadow-lg sm:h-10 sm:w-10">
                <span className="text-sm font-bold text-white sm:text-base">ESC</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-base font-semibold text-[#111827]">
                  {escuela.servicio_educativo === "General"
                    ? `Escuela Secundaria${escuela.numero ? ` No. ${escuela.numero}` : ""} "${escuela.nombre}"`
                    : escuela.servicio_educativo === "Técnica"
                    ? `Escuela Secundaria Técnica No. ${escuela.numero} "${escuela.nombre}"`
                    : escuela.servicio_educativo === "Telesecundaria"
                    ? `Telesecundaria No. ${escuela.numero} "${escuela.nombre}"`
                    : "Escuela Secundaria"
                    }
                </h1>
                <p className="text-xs text-[#6B7280]">Sistema de Seguimiento a la Trayectoria Escolar</p>
              </div>
            </div>

            {userRole === "Tutor" && onHijoChange && hijosDelTutor.length > 0 && currentRoute !== "#/agenda" && currentRoute !== "#/circulares" && currentRoute !== "#/dashboard" && (
              <div className="ml-2 md:hidden">
                <Select
                  value={hijoSeleccionado?.toString() || hijosDelTutor[0].id.toString()}
                  onValueChange={(value) => onHijoChange(parseInt(value))}
                >
                  <SelectTrigger className="h-8 w-25 rounded-lg border-purple-200 bg-linear-to-r from-purple-50 to-blue-50 text-xs transition-all hover:border-[#7C3AED]">
                    <div className="flex w-full items-center gap-1.5">
                      <Users className="h-3 w-3 shrink-0 text-[#7C3AED]" />
                      <SelectValue>
                        {(() => {
                          const hijoActual = hijosDelTutor.find((h) => h.id === (hijoSeleccionado || hijosDelTutor[0].id));
                          return hijoActual ? (
                            <span className="truncate font-medium text-[#111827]">{hijoActual.nombre.split(" ")[0]}</span>
                          ) : (
                            "Hijo"
                          );
                        })()}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {hijosDelTutor.map((alumno) => (
                      <SelectItem key={alumno.id} value={alumno.id.toString()} className="rounded-lg">
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="text-sm font-medium">{alumno.nombre}</span>
                          <span className="rounded bg-purple-50 px-1.5 py-0.5 text-xs text-[#7C3AED]">{alumno.grupo}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {userRole === "Tutor" && onHijoChange && hijosDelTutor.length > 0 && currentRoute !== "#/agenda" && currentRoute !== "#/circulares" && currentRoute !== "#/dashboard" && (
              <div className="mr-2 hidden min-w-45 md:flex lg:min-w-55">
                <Select
                  value={hijoSeleccionado?.toString() || hijosDelTutor[0].id.toString()}
                  onValueChange={(value) => onHijoChange(parseInt(value))}
                >
                  <SelectTrigger className="h-10 rounded-xl border-purple-200 bg-linear-to-r from-purple-50 to-blue-50 shadow-sm transition-all hover:border-[#7C3AED] hover:shadow-md">
                    <div className="flex w-full items-center gap-2">
                      <div className="rounded-lg bg-white p-1">
                        <Users className="h-4 w-4 shrink-0 text-[#7C3AED]" />
                      </div>
                      <SelectValue placeholder="Seleccionar hijo">
                        {(() => {
                          const hijoActual = hijosDelTutor.find((h) => h.id === (hijoSeleccionado || hijosDelTutor[0].id));
                          return hijoActual ? (
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium text-[#111827]">{hijoActual.nombre}</span>
                              <span className="inline-flex rounded bg-white px-2 py-0.5 text-xs font-medium text-[#7C3AED]">
                                {hijoActual.grupo}
                              </span>
                            </div>
                          ) : (
                            "Seleccionar hijo"
                          );
                        })()}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {hijosDelTutor.map((alumno) => (
                      <SelectItem key={alumno.id} value={alumno.id.toString()} className="rounded-lg">
                        <div className="flex w-full items-center justify-between gap-3">
                          <span className="font-medium">{alumno.nombre}</span>
                          <span className="rounded bg-purple-50 px-2 py-0.5 text-xs font-medium text-[#7C3AED]">
                            {alumno.grupo}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {userRole === "Tutor" && (
              <Popover open={bellOpen} onOpenChange={(open) => {
                setBellOpen(open);
                if (open) {
                  axios.get<{ notificaciones: { leida: boolean }[] }>("/api/notificaciones")
                    .then(({ data }) => {
                      const lista = data.notificaciones ?? [];
                      setNotifs(lista.slice(0, 7) as any);
                      setNotifsSinLeer(lista.filter(n => !n.leida).length);
                    })
                    .catch(() => {});
                }
              }}>
                <PopoverTrigger asChild>
                  <button className="relative rounded-lg p-2 transition-colors hover:bg-gray-100" aria-label="Notificaciones">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {notifsSinLeer > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-[#E11D48] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                        {notifsSinLeer > 9 ? "9+" : notifsSinLeer}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>

                <PopoverContent align="end" className="w-96 p-0 shadow-xl rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 bg-linear-to-r from-[#1D4ED8] to-[#7C3AED] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-white" />
                      <span className="font-semibold text-white text-sm">Notificaciones recientes</span>
                    </div>
                    {notifs.filter(n => !n.leida).length > 0 && (
                      <Badge className="bg-white/20 text-white border-0 text-xs">
                        {notifs.filter(n => !n.leida).length} sin leer
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
                    ) : notifs.map((notif) => (
                      <button
                        key={notif.id}
                        type="button"
                        onClick={() => {
                          if (!notif.leida) {
                            axios.patch(`/api/notificaciones/${notif.id}/leer`).catch(() => {});
                            setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, leida: true } : n));
                            setNotifsSinLeer(prev => Math.max(0, prev - 1));
                          }
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 items-start ${!notif.leida ? "bg-blue-50/60" : ""}`}
                      >
                        <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${!notif.leida ? "bg-blue-100" : "bg-gray-100"}`}>
                          {!notif.leida
                            ? <Mail className="h-4 w-4 text-[#1D4ED8]" />
                            : <MailOpen className="h-4 w-4 text-[#9CA3AF]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm leading-tight truncate ${!notif.leida ? "font-semibold text-[#111827]" : "font-medium text-[#374151]"}`}>
                              {notif.titulo}
                            </p>
                            {!notif.leida && <span className="shrink-0 w-2 h-2 bg-[#1D4ED8] rounded-full mt-1" />}
                          </div>
                          <p className="text-xs text-[#6B7280] line-clamp-1 mt-0.5">{notif.mensaje}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                              notif.categoria === "Académico" ? "bg-blue-100 text-[#1D4ED8]" :
                              notif.categoria === "Conducta" ? "bg-green-100 text-[#059669]" :
                              notif.categoria === "Evento" ? "bg-amber-100 text-[#D97706]" :
                              "bg-purple-100 text-[#7C3AED]"
                            }`}>{notif.categoria}</span>
                            {notif.alumno && <span className="text-[10px] text-[#6B7280]">· {notif.alumno}</span>}
                            <span className="text-[10px] text-[#9CA3AF] ml-auto">{notif.fecha}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-[#E5E7EB] bg-gray-50">
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-[#1D4ED8] hover:bg-blue-50 h-8 text-sm font-medium"
                      onClick={() => { setBellOpen(false); onNavigate("#/dashboard/notificaciones"); }}
                    >
                      Ver todas las notificaciones
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-100 sm:gap-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-[#7C3AED] to-[#1D4ED8]">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-[#111827]">{userName}</p>
                  <p className="text-xs text-[#6B7280]">{userRole}</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-2 sm:hidden">
                      <p className="text-sm font-medium text-[#111827]">{userName}</p>
                      <p className="text-xs text-[#6B7280]">{userRole}</p>
                    </div>
                    <button
                      onClick={handleProfileClick}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[#111827] transition-colors hover:bg-blue-50"
                    >
                      <IdCard className="h-4 w-4 text-[#1D4ED8]" />
                      Mi perfil
                    </button>
                    <button
                      onClick={handleLogoutClick}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[#E11D48] transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesion
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <div className="hidden lg:block">
          <Sidebar currentRoute={currentRoute} onNavigate={onNavigate} permissions={permissions} circularesSinLeer={circularesSinLeer} notifsSinLeer={notifsSinLeer} agendaSinLeer={agendaSinLeer} tareasSinLeer={tareasSinLeer} reportesSinLeer={reportesSinLeer} examenesSinLeer={examenesSinLeer} />
        </div>

        {isMobileMenuOpen && (
          <>
            <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed bottom-0 left-0 top-16 z-40 w-72 animate-slide-in-left bg-white shadow-xl lg:hidden">
              <Sidebar
                currentRoute={currentRoute}
                onNavigate={(route) => {
                  onNavigate(route);
                  setIsMobileMenuOpen(false);
                }}
                permissions={permissions}
                circularesSinLeer={circularesSinLeer}
                notifsSinLeer={notifsSinLeer}
                agendaSinLeer={agendaSinLeer}
                tareasSinLeer={tareasSinLeer}
                reportesSinLeer={reportesSinLeer}
                examenesSinLeer={examenesSinLeer}
              />
            </div>
          </>
        )}

        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="container mx-auto max-w-7xl p-4 pb-20 sm:p-6 lg:p-8 lg:pb-8">
            {showPageNavigation && (
              <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white/80 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <Button variant="ghost" className="justify-start px-0 text-[#1D4ED8] sm:justify-center" onClick={() => onNavigate("#/dashboard")}>
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio
                </Button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      {/* <BottomNav currentRoute={currentRoute} onNavigate={onNavigate} userRole={userRole} /> */}
    </div>
  );
}
