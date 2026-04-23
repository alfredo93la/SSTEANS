export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // ── Compartido ───────────────────────────────────────────────────────────────
  "#/dashboard":        ["dashboard.view"],
  "#/perfil":           ["dashboard.view"],
  "#/agenda":           ["agenda.view", "agenda.manage"],
  "#/circulares":       ["circulares.view", "circulares.manage"],

  // ── Módulos académicos (view = tutor, manage = profesor u otro rol con gestión) ─
  "#/calificaciones":   ["calificaciones.view", "calificaciones.manage"],
  "#/tareas":           ["tareas.view", "tareas.manage"],
  "#/asistencia":       ["asistencia.view", "asistencia.manage"],
  "#/examenes":         ["examenes.view", "examenes.manage"],
  "#/reportes":         ["reportes.view", "reportes.manage"],
  "#/notificaciones":   ["notificaciones.view", "notificaciones.manage"],
  "#/horario":          ["horario.view"],

  // ── Gestión escolar ───────────────────────────────────────────────────────────
  "#/alumnos":          ["alumnos.view", "alumnos.manage"],
  "#/alumnos/perfil/":  ["alumnos.view"],
  "#/tutores":          ["tutores.manage"],
  "#/grupos":           ["grupos.manage"],
  "#/materias":         ["materias.manage"],
  "#/horarios":         ["horarios.manage"],

  // ── Administración ────────────────────────────────────────────────────────────
  "#/usuarios":         ["usuarios.manage"],
  "#/roles":            ["roles.manage"],
  "#/ciclos":           ["ciclos.manage"],
  "#/periodos":         ["periodos.manage"],
  "#/configuracion":    ["configuracion.manage"],
};

export function canAccessRoute(route: string, permissions: string[]): boolean {
  if (ROUTE_PERMISSIONS[route]) {
    return ROUTE_PERMISSIONS[route].some((p) => permissions.includes(p));
  }

  // Prefix match para rutas dinámicas (ej. "#/alumnos/perfil/5")
  const prefixEntry = Object.entries(ROUTE_PERMISSIONS).find(
    ([key]) => key.endsWith("/") && route.startsWith(key),
  );
  if (prefixEntry) {
    return prefixEntry[1].some((p) => permissions.includes(p));
  }

  return false;
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
