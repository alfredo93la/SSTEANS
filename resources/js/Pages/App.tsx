import { useEffect, useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Toaster, toast } from "sonner";
import { ResponsiveLayout } from "../Layouts/ResponsiveLayout";
import { Dashboard } from "./Dashboard";
import { Agenda } from "./Agenda";
import { Circulares } from "./Circulares";
import { ExamenesView } from "./ExamenesView";
import { CalificacionesTutor } from "./Tutor/CalificacionesTutor";
import { TareasTutor } from "./Tutor/TareasTutor";
import { AsistenciaTutor } from "./Tutor/AsistenciaTutor";
import { ReportesConductaTutor } from "./Tutor/ReportesConductaTutor";
import { NotificacionesTutor } from "./Tutor/NotificacionesTutor";
import { HorarioTutor } from "./Tutor/HorarioTutor";
import { RegistrarCalificaciones } from "./Profesor/RegistrarCalificaciones";
import { ControlAsistencia } from "./Profesor/ControlAsistencia";
import { GestionarTareas } from "./Profesor/GestionarTareas";
import { HorarioDocente } from "./Profesor/HorarioProfesor";
import { Notificaciones } from "./Notificaciones";
import { ReportesTS } from "./TrabSocial/ReportesTS";
import { AlumnosTS } from "./TrabSocial/AlumnosTS";
import { PerfilAlumnoTS } from "./TrabSocial/PerfilAlumnoTS";
import { Usuarios } from "./Admin/Usuarios";
import { Roles } from "./Admin/Roles";
import { Grupos } from "./Administrativo/Grupos";
import { Materias } from "./Admin/Materias";
import { Horarios } from "./Administrativo/Horarios";
import { AlumnosAdmin } from "./Administrativo/AlumnosAdmin";
import { TutoresAdmin } from "./Administrativo/TutoresAdmin";
import { CiclosEscolares } from "./Admin/CiclosEscolares";
import { PeriodosEvaluacion } from "./Admin/PeriodosEvaluacion";
import { ConfiguracionGeneral } from "./Admin/ConfiguracionGeneral";
import { MyProfile } from "./MiPerfil";
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
        toast.error("No tienes permisos para acceder a ese módulo.");
        const fallbackRoute = getDefaultRoute(permissions);
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

  const has = (permission: string) => permissions.includes(permission);

  const pageTitles: Record<string, string> = {
    "#/dashboard":        "Inicio",
    "#/calificaciones":   "Calificaciones",
    "#/tareas":           "Tareas",
    "#/asistencia":       "Asistencia",
    "#/examenes":         "Exámenes",
    "#/reportes":         "Reportes",
    "#/notificaciones":   "Notificaciones",
    "#/horario":          "Horario",
    "#/agenda":           "Agenda",
    "#/circulares":       "Circulares",
    "#/perfil":           "Mi Perfil",
    "#/alumnos":          "Alumnos",
    "#/alumnos/perfil/":  "Perfil Alumno",
    "#/tutores":          "Tutores",
    "#/grupos":           "Grupos",
    "#/materias":         "Materias",
    "#/horarios":         "Horarios",
    "#/usuarios":         "Usuarios",
    "#/roles":            "Roles y Permisos",
    "#/ciclos":           "Ciclos Escolares",
    "#/periodos":         "Periodos de Evaluación",
    "#/configuracion":    "Configuración",
  };

  if (!user) return null;

  return (
    <>
      <Head title={
        pageTitles[currentRoute] ??
        Object.entries(pageTitles).find(([k]) => k.endsWith("/") && currentRoute.startsWith(k))?.[1] ??
        "Inicio"
      } />
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
            userName={userName}
            permissions={permissions}
            hijoSeleccionado={hijoSeleccionado}
            onHijoChange={setHijoSeleccionado}
          />
        )}

        {/* Calificaciones: view → tutor, manage → profesor */}
        {currentRoute === "#/calificaciones" && (
          has("calificaciones.view")
            ? <CalificacionesTutor alumnoId={hijoSeleccionado || 1} />
            : <RegistrarCalificaciones />
        )}

        {/* Tareas: view → tutor, manage → profesor */}
        {currentRoute === "#/tareas" && (
          has("tareas.view")
            ? <TareasTutor alumnoId={hijoSeleccionado || 1} />
            : <GestionarTareas />
        )}

        {/* Asistencia: view → tutor, manage → profesor */}
        {currentRoute === "#/asistencia" && (
          has("asistencia.view")
            ? <AsistenciaTutor alumnoId={hijoSeleccionado || 1} />
            : <ControlAsistencia />
        )}

        {/* Exámenes: view → tutor, manage → profesor */}
        {currentRoute === "#/examenes" && (
          <ExamenesView permissions={permissions} />
        )}

        {/* Reportes: view → tutor, manage → trabajador social */}
        {currentRoute === "#/reportes" && (
          has("reportes.view")
            ? <ReportesConductaTutor alumnoId={hijoSeleccionado || 1} />
            : <ReportesTS />
        )}

        {/* Notificaciones: view → tutor, manage → profesor / trabajador social */}
        {currentRoute === "#/notificaciones" && (
          has("notificaciones.view")
            ? <NotificacionesTutor alumnoId={hijoSeleccionado || 1} />
            : <Notificaciones />
        )}

        {/* Horario: tutor_profile → horario del alumno, sin perfil → horario docente */}
        {currentRoute === "#/horario" && (
          user.tutor_profile
            ? <HorarioTutor alumnoId={hijoSeleccionado || 1} />
            : <HorarioDocente />
        )}

        {currentRoute === "#/agenda" && <Agenda permissions={permissions} />}
        {currentRoute === "#/circulares" && <Circulares permissions={permissions} />}
        {currentRoute === "#/perfil" && <MyProfile user={user} />}

        {/* Alumnos: view → trabajador social, manage → personal administrativo */}
        {currentRoute === "#/alumnos" && (
          has("alumnos.view") ? <AlumnosTS onNavigate={handleNavigate} /> : <AlumnosAdmin userRole={userRole} permissions={permissions} />
        )}
        {currentRoute.startsWith("#/alumnos/perfil/") && (
          <PerfilAlumnoTS
            alumnoId={Number(currentRoute.split("/").at(-1))}
            onNavigate={handleNavigate}
          />
        )}

        {/* Gestión escolar */}
        {currentRoute === "#/tutores" && <TutoresAdmin />}
        {currentRoute === "#/grupos" && <Grupos />}
        {currentRoute === "#/materias" && <Materias />}
        {currentRoute === "#/horarios" && <Horarios />}

        {/* Administración */}
        {currentRoute === "#/usuarios" && <Usuarios />}
        {currentRoute === "#/roles" && <Roles />}
        {currentRoute === "#/ciclos" && <CiclosEscolares />}
        {currentRoute === "#/periodos" && <PeriodosEvaluacion />}
        {currentRoute === "#/configuracion" && <ConfiguracionGeneral />}
      </ResponsiveLayout>
      <Toaster position="top-right" />
    </>
  );
}
