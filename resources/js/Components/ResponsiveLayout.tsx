import { ReactNode, useState } from "react";
import { Menu, X, Bell, User, ChevronDown, Users } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "./ui/utils";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Obtener hijos del tutor (ID 2 por defecto, ajustar según usuario actual)
  const hijosDelTutor = alumnos.filter(alumno => alumno.tutorId === 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] backdrop-blur-sm bg-white/95">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Logo + Menu móvil */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm sm:text-base">SE</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-base font-semibold text-[#111827]">Escuela Secundaria No. X "Nombre"</h1>
                <p className="text-xs text-[#6B7280]">Sistema de Seguimiento a la Trayectoria Escolar</p>
              </div>
            </div>

            {/* Selector de hijo en móvil (tablets pequeñas y móviles) */}
            {userRole === "Tutor" && onHijoChange && hijosDelTutor.length > 0 && (
              <div className="md:hidden ml-2">
                <Select
                  value={hijoSeleccionado?.toString() || hijosDelTutor[0].id.toString()}
                  onValueChange={(value) => onHijoChange(parseInt(value))}
                >
                  <SelectTrigger className="h-8 w-[100px] bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 rounded-lg hover:border-[#7C3AED] transition-all text-xs">
                    <div className="flex items-center gap-1.5 w-full">
                      <Users className="h-3 w-3 text-[#7C3AED] flex-shrink-0" />
                      <SelectValue>
                        {(() => {
                          const hijoActual = hijosDelTutor.find(h => h.id === (hijoSeleccionado || hijosDelTutor[0].id));
                          return hijoActual ? (
                            <span className="truncate font-medium text-[#111827]">
                              {hijoActual.nombre.split(' ')[0]}
                            </span>
                          ) : "Hijo";
                        })()}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {hijosDelTutor.map((alumno) => (
                      <SelectItem 
                        key={alumno.id} 
                        value={alumno.id.toString()}
                        className="rounded-lg"
                      >
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span className="font-medium text-sm">{alumno.nombre}</span>
                          <span className="px-1.5 py-0.5 bg-purple-50 text-[#7C3AED] rounded text-xs">
                            {alumno.grupo}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Acciones del usuario */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Selector de hijo (solo para tutores) - VERSIÓN DESKTOP/TABLET */}
            {userRole === "Tutor" && onHijoChange && hijosDelTutor.length > 0 && (
              <div className="hidden md:flex min-w-[180px] lg:min-w-[220px] mr-2">
                <Select
                  value={hijoSeleccionado?.toString() || hijosDelTutor[0].id.toString()}
                  onValueChange={(value) => onHijoChange(parseInt(value))}
                >
                  <SelectTrigger className="h-10 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 rounded-xl hover:border-[#7C3AED] transition-all shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-2 w-full">
                      <div className="p-1 bg-white rounded-lg">
                        <Users className="h-4 w-4 text-[#7C3AED] flex-shrink-0" />
                      </div>
                      <SelectValue placeholder="Seleccionar hijo">
                        {(() => {
                          const hijoActual = hijosDelTutor.find(h => h.id === (hijoSeleccionado || hijosDelTutor[0].id));
                          return hijoActual ? (
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium text-[#111827] text-sm">
                                {hijoActual.nombre}
                              </span>
                              <span className="inline-flex px-2 py-0.5 bg-white rounded text-xs text-[#7C3AED] font-medium">
                                {hijoActual.grupo}
                              </span>
                            </div>
                          ) : "Seleccionar hijo";
                        })()}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {hijosDelTutor.map((alumno) => (
                      <SelectItem 
                        key={alumno.id} 
                        value={alumno.id.toString()}
                        className="rounded-lg"
                      >
                        <div className="flex items-center justify-between gap-3 w-full">
                          <span className="font-medium">{alumno.nombre}</span>
                          <span className="px-2 py-0.5 bg-purple-50 text-[#7C3AED] rounded text-xs font-medium">
                            {alumno.grupo}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notificaciones */}
            <button
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#E11D48] rounded-full" />
            </button>

            {/* Usuario */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#7C3AED] to-[#1D4ED8] rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-[#111827]">{userName}</p>
                  <p className="text-xs text-[#6B7280]">{userRole}</p>
                </div>
                <ChevronDown className="hidden sm:block h-4 w-4 text-gray-400" />
              </button>

              {/* Dropdown usuario */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                      <p className="text-sm font-medium text-[#111827]">{userName}</p>
                      <p className="text-xs text-[#6B7280]">{userRole}</p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-2 text-left text-sm text-[#E11D48] hover:bg-red-50 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block">
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={onNavigate}
            userRole={userRole}
          />
        </div>

        {/* Sidebar Móvil/Tablet */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu lateral */}
            <div className="fixed left-0 top-16 bottom-0 w-64 bg-white z-40 shadow-xl lg:hidden animate-slide-in-left">
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

        {/* Contenido principal */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl pb-20 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Navegación inferior móvil */}
      <BottomNav
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        userRole={userRole}
      />
    </div>
  );
}