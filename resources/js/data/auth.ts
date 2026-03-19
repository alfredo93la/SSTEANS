export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "#/dashboard": ["dashboard.view"],
  "#/dashboard/calificaciones": ["calificaciones.view", "calificaciones.manage"],
  "#/dashboard/tareas": ["tareas.view"],
  "#/dashboard/asistencia": ["asistencia.view", "asistencia.manage"],
  "#/dashboard/reportes": ["reportes.view", "reportes.manage"],
  "#/dashboard/notificaciones": ["notificaciones.view", "notificaciones.manage"],
  "#/dashboard/horario": ["horario.view"],
  "#/dashboard/asignar-tarea": ["tareas.manage"],
  "#/dashboard/gestionar-tareas": ["tareas.manage"],
  "#/dashboard/mensajeria": ["notificaciones.manage"],
  "#/agenda": ["agenda.view"],
  "#/agenda/eventos": ["agenda.view"],
  "#/agenda/examenes": ["agenda.view"],
  "#/agenda/entregas": ["agenda.view"],
  "#/circulares": ["circulares.view"],
  "#/trabajador-social/notificaciones": ["notificaciones.manage"],
  "#/trabajador-social/reportes": ["reportes.manage"],
  "#/trabajador-social/alumnos": ["alumnos.view"],
  "#/admin/usuarios": ["usuarios.manage"],
  "#/admin/roles": ["roles.manage"],
  "#/admin/grupos": ["grupos.manage"],
  "#/admin/materias": ["materias.manage"],
  "#/admin/horarios": ["horarios.manage"],
  "#/admin/alumnos": ["alumnos.manage"],
  "#/admin/tutores": ["tutores.manage"],
  "#/admin/ciclos": ["ciclos.manage"],
  "#/admin/periodos": ["periodos.manage"],
  "#/admin/configuracion": ["configuracion.manage"],
  "#/admin/validar-usuarios": ["usuarios.validate"],
};

export function canAccessRoute(route: string, permissions: string[]): boolean {
  const requiredPermissions = ROUTE_PERMISSIONS[route];

  if (!requiredPermissions) {
    return false;
  }

  return requiredPermissions.some((permission) => permissions.includes(permission));
}

export function getDefaultRoute(permissions: string[]): string {
  if (canAccessRoute("#/dashboard", permissions)) {
    return "#/dashboard";
  }

  const [firstAllowedRoute] = Object.keys(ROUTE_PERMISSIONS).filter((route) =>
    canAccessRoute(route, permissions),
  );

  return firstAllowedRoute ?? "#/dashboard";
}
