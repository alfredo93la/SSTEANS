import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { ResponsiveLayout } from "../Components/ResponsiveLayout";
import { Login } from "../Pages/Login";
import { Dashboard } from "../Pages/Dashboard";
import { Agenda } from "../Pages/Agenda";
import { Circulares } from "../Pages/Circulares";
import { EventosAcademicos } from "../Components/agenda/EventosAcademicos";
import { ExamenesView } from "../Components/agenda/ExamenesView";
import { EntregasView } from "../Components/agenda/EntregasView";
import { CalificacionesTutor } from "../Components/tutor/CalificacionesTutor";
import { TareasTutor } from "../Components/tutor/TareasTutor";
import { AsistenciaTutor } from "../Components/tutor/AsistenciaTutor";
import { ReportesConductaTutor } from "../Components/tutor/ReportesConductaTutor";
import { NotificacionesTutor } from "../Components/tutor/NotificacionesTutor";
import { HorarioTutor } from "../Components/tutor/HorarioTutor";
import { RegistrarCalificaciones } from "../Components/profesor/RegistrarCalificaciones";
import { ControlAsistencia } from "../Components/profesor/ControlAsistencia";
import { AsignarTarea } from "../Components/profesor/AsignarTarea";
import { GestionarTareas } from "../Components/profesor/GestionarTareas";
import { MensajeriaProfesor } from "../Components/profesor/MensajeriaProfesor";
import { HorarioDocente } from "../Components/profesor/HorarioDocente";
import { NotificacionesTS } from "../Components/trabajador-social/NotificacionesTS";
import { ReportesTS } from "../Components/trabajador-social/ReportesTS";
import { AlumnosTS } from "../Components/trabajador-social/AlumnosTS";
import { Usuarios } from "../Components/admin/Usuarios";
import { Roles } from "../Components/admin/Roles";
import { Grupos } from "../Components/admin/Grupos";
import { Materias } from "../Components/admin/Materias";
import { Horarios } from "../Components/admin/Horarios";
import { AlumnosAdmin } from "../Components/admin/AlumnosAdmin";
import { TutoresAdmin } from "../Components/admin/TutoresAdmin";
import { CiclosEscolares } from "../Components/admin/CiclosEscolares";
import { PeriodosEvaluacion } from "../Components/admin/PeriodosEvaluacion";
import { ConfiguracionGeneral } from "../Components/admin/ConfiguracionGeneral";
import { ValidarUsuarios } from "../Components/admin/ValidarUsuarios";

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || "#/login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [hijoSeleccionado, setHijoSeleccionado] = useState<number | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || "#/login");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavigate = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
  };

  const handleLogin = (userData: { nombre: string; rol: string; usuario: string }) => {
    setIsAuthenticated(true);
    setUserRole(userData.rol);
    setUserName(userData.nombre);
    
    // Si es tutor, seleccionar automáticamente el primer hijo (ID 2 es el tutor por defecto)
    if (userData.rol === "Tutor") {
      setHijoSeleccionado(1); // Juan Pérez (primer hijo del tutor ID 2)
    }
    
    handleNavigate("#/dashboard");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("");
    setUserName("");
    setHijoSeleccionado(null);
    handleNavigate("#/login");
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <>
      <ResponsiveLayout
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        userRole={userRole}
        userName={userName}
        onLogout={handleLogout}
        hijoSeleccionado={hijoSeleccionado}
        onHijoChange={setHijoSeleccionado}
      >
        {currentRoute === "#/dashboard" && (
          <Dashboard 
            onNavigate={handleNavigate} 
            userRole={userRole}
            hijoSeleccionado={hijoSeleccionado}
            onHijoChange={setHijoSeleccionado}
          />
        )}
        
        {/* Rutas del Tutor */}
        {currentRoute === "#/dashboard/calificaciones" && userRole === "Tutor" && (
          <CalificacionesTutor alumnoId={hijoSeleccionado || 1} />
        )}
        {currentRoute === "#/dashboard/tareas" && userRole === "Tutor" && (
          <TareasTutor alumnoId={hijoSeleccionado || 1} />
        )}
        {currentRoute === "#/dashboard/asistencia" && userRole === "Tutor" && (
          <AsistenciaTutor alumnoId={hijoSeleccionado || 1} />
        )}
        {currentRoute === "#/dashboard/reportes" && (
          <ReportesConductaTutor alumnoId={hijoSeleccionado || 1} />
        )}
        {currentRoute === "#/dashboard/notificaciones" && userRole === "Tutor" && (
          <NotificacionesTutor alumnoId={hijoSeleccionado || 1} />
        )}
        {currentRoute === "#/dashboard/horario" && userRole === "Tutor" && (
          <HorarioTutor alumnoId={hijoSeleccionado || 1} />
        )}
        
        {/* Rutas del Profesor */}
        {currentRoute === "#/dashboard/calificaciones" && userRole === "Profesor" && (
          <RegistrarCalificaciones />
        )}
        {currentRoute === "#/dashboard/asistencia" && userRole === "Profesor" && (
          <ControlAsistencia />
        )}
        {currentRoute === "#/dashboard/asignar-tarea" && (
          <AsignarTarea />
        )}
        {currentRoute === "#/dashboard/gestionar-tareas" && (
          <GestionarTareas />
        )}
        {currentRoute === "#/dashboard/mensajeria" && (
          <MensajeriaProfesor />
        )}
        {currentRoute === "#/dashboard/horario" && userRole === "Profesor" && (
          <HorarioDocente />
        )}
        
        {/* Rutas compartidas */}
        {currentRoute === "#/agenda" && <Agenda userRole={userRole} />}
        {currentRoute === "#/agenda/eventos" && (
          <EventosAcademicos 
            userRole={userRole} 
            onNavigate={handleNavigate}
          />
        )}
        {currentRoute === "#/agenda/examenes" && (
          <ExamenesView 
            userRole={userRole}
            hijoSeleccionado={hijoSeleccionado}
            onNavigate={handleNavigate}
          />
        )}
        {currentRoute === "#/agenda/entregas" && (
          <EntregasView 
            userRole={userRole}
            hijoSeleccionado={hijoSeleccionado}
            onNavigate={handleNavigate}
          />
        )}
        
        {currentRoute === "#/circulares" && <Circulares userRole={userRole} />}
        
        {/* Rutas del Trabajador Social */}
        {currentRoute === "#/trabajador-social/notificaciones" && (
          <NotificacionesTS />
        )}
        {currentRoute === "#/trabajador-social/reportes" && (
          <ReportesTS />
        )}
        {currentRoute === "#/trabajador-social/alumnos" && (
          <AlumnosTS onNavigate={handleNavigate} />
        )}
        
        {/* Rutas del Administrador */}
        {currentRoute === "#/admin/usuarios" && (
          <Usuarios />
        )}
        {currentRoute === "#/admin/roles" && (
          <Roles />
        )}
        {currentRoute === "#/admin/grupos" && (
          <Grupos />
        )}
        {currentRoute === "#/admin/materias" && (
          <Materias />
        )}
        {currentRoute === "#/admin/horarios" && (
          <Horarios />
        )}
        {currentRoute === "#/admin/alumnos" && (
          <AlumnosAdmin />
        )}
        {currentRoute === "#/admin/tutores" && (
          <TutoresAdmin />
        )}
        {currentRoute === "#/admin/ciclos" && (
          <CiclosEscolares />
        )}
        {currentRoute === "#/admin/periodos" && (
          <PeriodosEvaluacion />
        )}
        {currentRoute === "#/admin/configuracion" && (
          <ConfiguracionGeneral />
        )}
        {currentRoute === "#/admin/validar-usuarios" && (
          <ValidarUsuarios />
        )}
      </ResponsiveLayout>
      <Toaster position="top-right" />
    </>
  );
}