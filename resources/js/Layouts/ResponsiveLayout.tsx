import { ReactNode, useState } from "react";
import { usePage } from "@inertiajs/react";
import { Menu, X, Bell, User, ChevronDown, Users, IdCard, LogOut } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { Button } from "../Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { alumnos } from "../data/mockData";

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

const routeLabels: Record<string, string> = {
  "#/dashboard": "Inicio",
  "#/dashboard/calificaciones": "Calificaciones",
  "#/dashboard/tareas": "Tareas",
  "#/dashboard/asistencia": "Asistencia",
  "#/dashboard/reportes": "Reportes",
  "#/dashboard/notificaciones": "Notificaciones",
  "#/dashboard/horario": "Horario",
  "#/dashboard/asignar-tarea": "Asignar tarea",
  "#/dashboard/gestionar-tareas": "Gestionar tareas",
  "#/dashboard/mensajeria": "Mensajeria",
  "#/agenda": "Agenda",
  "#/agenda/eventos": "Eventos",
  "#/agenda/examenes": "Examenes",
  "#/agenda/entregas": "Entregas",
  "#/circulares": "Circulares",
  "#/perfil": "Mi perfil",
  "#/trabajador-social/notificaciones": "Notificaciones TS",
  "#/trabajador-social/reportes": "Reportes TS",
  "#/trabajador-social/alumnos": "Alumnos",
  "#/admin/usuarios": "Usuarios",
  "#/admin/roles": "Roles y permisos",
  "#/administrativo/grupos": "Grupos",
  "#/administrativo/materias": "Materias",
  "#/administrativo/horarios": "Horarios",
  "#/administrativo/alumnos": "Alumnos",
  "#/administrativo/tutores": "Tutores",
  "#/admin/ciclos": "Ciclos escolares",
  "#/admin/periodos": "Periodos de evaluacion",
  "#/admin/configuracion": "Configuracion general",
  "#/admin/validar-usuarios": "Validar usuarios",
};

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
  const { escuela } = usePage().props as { escuela: { nombre: string; numero: string } };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Obtener hijos del tutor (ID 2 por defecto, ajustar segun usuario actual)
  const hijosDelTutor = alumnos.filter((alumno) => alumno.tutorId === 2);

  const handleProfileClick = () => {
    onNavigate("#/perfil");
    setShowUserMenu(false);
  };

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    onLogout();
  };

  const showPageNavigation = currentRoute !== "#/dashboard";
  const currentPageLabel = routeLabels[currentRoute] ?? "Modulo";

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
                  {escuela?.nombre
                    ? `Escuela Secundaria${escuela.numero ? ` No. ${escuela.numero}` : ""} "${escuela.nombre}"`
                    : "Escuela Secundaria"}
                </h1>
                <p className="text-xs text-[#6B7280]">Sistema de Seguimiento a la Trayectoria Escolar</p>
              </div>
            </div>

            {userRole === "Tutor" && onHijoChange && hijosDelTutor.length > 0 && (
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
            {userRole === "Tutor" && onHijoChange && hijosDelTutor.length > 0 && (
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

            <button className="relative rounded-lg p-2 transition-colors hover:bg-gray-100" aria-label="Notificaciones">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#E11D48]" />
            </button>

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
          <Sidebar currentRoute={currentRoute} onNavigate={onNavigate} userRole={userRole} />
        </div>

        {isMobileMenuOpen && (
          <>
            <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed bottom-0 left-0 top-16 z-40 w-64 animate-slide-in-left bg-white shadow-xl lg:hidden">
              <Sidebar
                currentRoute={currentRoute}
                onNavigate={(route) => {
                  onNavigate(route);
                  setIsMobileMenuOpen(false);
                }}
                userRole={userRole}
              />
            </div>
          </>
        )}

        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="container mx-auto max-w-7xl p-4 pb-20 sm:p-6 lg:p-8 lg:pb-8">
            {showPageNavigation && (
              <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white/80 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Navegacion</p>
                  <p className="mt-1 text-sm text-[#111827]">{currentPageLabel}</p>
                </div>
                <Button variant="ghost" className="justify-start px-0 text-[#1D4ED8] sm:justify-center" onClick={() => onNavigate("#/dashboard")}>
                  Volver al inicio
                </Button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      <BottomNav currentRoute={currentRoute} onNavigate={onNavigate} userRole={userRole} />
    </div>
  );
}
