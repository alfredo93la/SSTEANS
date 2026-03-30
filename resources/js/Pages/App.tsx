import { useEffect, useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Toaster, toast } from "sonner";
import { ResponsiveLayout } from "../Components/ResponsiveLayout";
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
import { Grupos } from "../Components/administrativo/Grupos";
import { Materias } from "../Components/administrativo/Materias";
import { Horarios } from "../Components/administrativo/Horarios";
import { AlumnosAdmin } from "../Components/administrativo/AlumnosAdmin";
import { TutoresAdmin } from "../Components/administrativo/TutoresAdmin";
import { CiclosEscolares } from "../Components/admin/CiclosEscolares";
import { PeriodosEvaluacion } from "../Components/admin/PeriodosEvaluacion";
import { ConfiguracionGeneral } from "../Components/admin/ConfiguracionGeneral";
import { ValidarUsuarios } from "../Components/admin/ValidarUsuarios";
import { MyProfile } from "../Components/profile/MyProfile";
import type { PageProps } from "../types";
import { canAccessRoute, getDefaultRoute } from "../data/auth";

export default function App() {
  const { auth } = usePage<PageProps>().props;
  const user = auth.user;

  const permissions = useMemo(() => user?.permissions ?? [], [user?.permissions]);
  const userRole = user?.role ?? "";
  const userName = user?.name ?? "";

  const [currentRoute, setCurrentRoute] = useState(window.location.hash || "#/dashboard");
  const [hijoSeleccionado, setHijoSeleccionado] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.visit(route("login"));
      return;
    }

    if (userRole === "Tutor") {
      setHijoSeleccionado(1);
    }

    const initialRoute = window.location.hash || getDefaultRoute(permissions);
    if (canAccessRoute(initialRoute, permissions)) {
      setCurrentRoute(initialRoute);
      return;
    }

    const fallbackRoute = getDefaultRoute(permissions);
    window.location.hash = fallbackRoute;
    setCurrentRoute(fallbackRoute);
  }, [permissions, user, userRole]);

  useEffect(() => {
    const handleHashChange = () => {
      const routeToNavigate = window.location.hash || "#/dashboard";

      if (!canAccessRoute(routeToNavigate, permissions)) {
        const fallbackRoute = getDefaultRoute(permissions);
        toast.error("No tienes permisos para acceder a ese módulo.");
        window.location.hash = fallbackRoute;
        setCurrentRoute(fallbackRoute);
        return;
      }

      setCurrentRoute(routeToNavigate);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [permissions]);

  const handleNavigate = (routeToNavigate: string) => {
    if (!canAccessRoute(routeToNavigate, permissions)) {
      toast.error("Acceso denegado: tu rol no tiene permisos para esta sección.");
      return;
    }

    window.location.hash = routeToNavigate;
    setCurrentRoute(routeToNavigate);
  };

  const handleLogout = () => {
    router.post(route("logout"));
  };

  const pageTitles: Record<string, string> = {
    "#/dashboard": "Inicio",
    "#/dashboard/calificaciones": "Calificaciones",
    "#/dashboard/tareas": "Tareas",
    "#/dashboard/asistencia": "Asistencia",
    "#/dashboard/reportes": "Reportes",
    "#/dashboard/notificaciones": "Notificaciones",
    "#/dashboard/horario": "Horario",
    "#/dashboard/asignar-tarea": "Asignar Tarea",
    "#/dashboard/gestionar-tareas": "Gestionar Tareas",
    "#/dashboard/mensajeria": "Mensajería",
    "#/agenda": "Agenda",
    "#/agenda/eventos": "Eventos Académicos",
    "#/agenda/examenes": "Exámenes",
    "#/agenda/entregas": "Entregas",
    "#/circulares": "Circulares",
    "#/perfil": "Mi Perfil",
    "#/trabajador-social/notificaciones": "Notificaciones",
    "#/trabajador-social/reportes": "Reportes",
    "#/trabajador-social/alumnos": "Alumnos",
    "#/admin/usuarios": "Usuarios",
    "#/admin/roles": "Roles",
    "#/administrativo/grupos": "Grupos",
    "#/administrativo/materias": "Materias",
    "#/administrativo/horarios": "Horarios",
    "#/administrativo/alumnos": "Alumnos",
    "#/administrativo/tutores": "Tutores",
    "#/admin/ciclos": "Ciclos Escolares",
    "#/admin/periodos": "Períodos de Evaluación",
    "#/admin/configuracion": "Configuración",
    "#/admin/validar-usuarios": "Validar Usuarios",
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Head title={pageTitles[currentRoute] ?? "Inicio"} />
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

        {currentRoute === "#/dashboard/calificaciones" && userRole === "Tutor" && (
          <CalificacionesTutor alumnoId={hijoSeleccionado || 1} />
        )}
        {currentRoute === "#/dashboard/tareas" && userRole === "Tutor" && (
          <TareasTutor alumnoId={hijoSeleccionado || 1} />
        )}
        {currentRoute === "#/dashboard/asistencia" && userRole === "Tutor" && (
          <AsistenciaTutor alumnoId={hijoSeleccionado || 1} />
        )}
        {currentRoute === "#/dashboard/reportes" && <ReportesConductaTutor alumnoId={hijoSeleccionado || 1} />}
        {currentRoute === "#/dashboard/notificaciones" && userRole === "Tutor" && (
          <NotificacionesTutor alumnoId={hijoSeleccionado || 1} />
        )}
        {currentRoute === "#/dashboard/horario" && userRole === "Tutor" && (
          <HorarioTutor alumnoId={hijoSeleccionado || 1} />
        )}

        {currentRoute === "#/dashboard/calificaciones" && userRole === "Profesor" && <RegistrarCalificaciones />}
        {currentRoute === "#/dashboard/asistencia" && userRole === "Profesor" && <ControlAsistencia />}
        {currentRoute === "#/dashboard/asignar-tarea" && <AsignarTarea />}
        {currentRoute === "#/dashboard/gestionar-tareas" && <GestionarTareas />}
        {currentRoute === "#/dashboard/mensajeria" && <MensajeriaProfesor />}
        {currentRoute === "#/dashboard/horario" && userRole === "Profesor" && <HorarioDocente />}

        {currentRoute === "#/agenda" && <Agenda permissions={permissions} />}
        {currentRoute === "#/agenda/eventos" && <EventosAcademicos userRole={userRole} onNavigate={handleNavigate} />}
        {currentRoute === "#/agenda/examenes" && (
          <ExamenesView userRole={userRole} hijoSeleccionado={hijoSeleccionado} onNavigate={handleNavigate} />
        )}
        {currentRoute === "#/agenda/entregas" && (
          <EntregasView userRole={userRole} hijoSeleccionado={hijoSeleccionado} onNavigate={handleNavigate} />
        )}

        {currentRoute === "#/circulares" && <Circulares permissions={permissions} />}
        {currentRoute === "#/perfil" && <MyProfile user={user} />}

        {currentRoute === "#/trabajador-social/notificaciones" && <NotificacionesTS />}
        {currentRoute === "#/trabajador-social/reportes" && <ReportesTS />}
        {currentRoute === "#/trabajador-social/alumnos" && <AlumnosTS onNavigate={handleNavigate} />}

        {currentRoute === "#/admin/usuarios" && <Usuarios />}
        {currentRoute === "#/admin/roles" && <Roles />}
        {currentRoute === "#/administrativo/grupos" && <Grupos />}
        {currentRoute === "#/administrativo/materias" && <Materias />}
        {currentRoute === "#/administrativo/horarios" && <Horarios />}
        {currentRoute === "#/administrativo/alumnos" && <AlumnosAdmin userRole={userRole} />}
        {currentRoute === "#/administrativo/tutores" && <TutoresAdmin />}
        {currentRoute === "#/admin/ciclos" && <CiclosEscolares />}
        {currentRoute === "#/admin/periodos" && <PeriodosEvaluacion />}
        {currentRoute === "#/admin/configuracion" && <ConfiguracionGeneral />}
        {currentRoute === "#/admin/validar-usuarios" && <ValidarUsuarios />}
      </ResponsiveLayout>
      <Toaster position="top-right" />
    </>
  );
}
