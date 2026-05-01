import { DashboardTutor } from "./Dashboards/DashboardTutor";
import { DashboardProfesor } from "./Dashboards/DashboardProfesor";
import { DashboardTrabajadorSocial } from "./Dashboards/DashboardTrabajadorSocial";
import { DashboardAdmin } from "./Dashboards/DashboardAdmin";
import { DashboardPersonalAdministrativo } from "./Dashboards/DashboardPersonalAdministrativo";
import { DashboardCustomRole } from "./Dashboards/DashboardCustomRole";

const SYSTEM_ROLES = ["Tutor", "Profesor", "Trabajador Social", "Administrador", "Personal Administrativo"];

interface DashboardProps {
  onNavigate: (route: string) => void;
  userRole: string;
  userName?: string;
  permissions?: string[];
  hijoSeleccionado?: number | null;
  onHijoChange?: (hijoId: number | null) => void;
}

export function Dashboard({ onNavigate, userRole, userName = "", permissions = [], hijoSeleccionado, onHijoChange }: DashboardProps) {
  if (!SYSTEM_ROLES.includes(userRole)) {
    return <DashboardCustomRole onNavigate={onNavigate} userRole={userRole} userName={userName} permissions={permissions} />;
  }

  // Si es Tutor, mostrar dashboard específico
  if (userRole === "Tutor") {
    return <DashboardTutor onNavigate={onNavigate} hijoSeleccionado={hijoSeleccionado} onHijoChange={onHijoChange} />;
  }

  // Si es Profesor, mostrar dashboard específico
  if (userRole === "Profesor") {
    return <DashboardProfesor onNavigate={onNavigate} />;
  }

  // Si es Trabajador Social, mostrar dashboard específico
  if (userRole === "Trabajador Social") {
    return <DashboardTrabajadorSocial onNavigate={onNavigate} />;
  }

  // Si es Administrador del sistema, mostrar dashboard de admin
  if (userRole === "Administrador") {
    return <DashboardAdmin onNavigate={onNavigate} />;
  }

  // Si es Personal Administrativo, mostrar dashboard de gestión escolar
  if (userRole === "Personal Administrativo") {
    return <DashboardPersonalAdministrativo onNavigate={onNavigate} />;
  }
}