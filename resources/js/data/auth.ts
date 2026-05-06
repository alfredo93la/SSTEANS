import { allMenuItems } from "../Layouts/Sidebar";

// Construye el mapa ruta→permisos automáticamente desde los items del Sidebar.
// Así no hay que mantener esta lista a mano: agregar un item al Sidebar
// es suficiente para que la ruta quede protegida aquí también.
const ROUTE_PERMISSIONS: Record<string, string[]> = {};

for (const item of allMenuItems) {
  if (!item.route) continue;
  const perms = Array.isArray(item.permission) ? item.permission : [item.permission];
  if (!ROUTE_PERMISSIONS[item.route]) ROUTE_PERMISSIONS[item.route] = [];
  for (const p of perms) {
    if (!ROUTE_PERMISSIONS[item.route].includes(p)) ROUTE_PERMISSIONS[item.route].push(p);
  }
}

// Rutas que no aparecen en el Sidebar (acceso directo por URL o menú de usuario)
const EXTRA_PERMISSIONS: Record<string, string[]> = {
  "#/perfil":           ["dashboard.view"],
  "#/alumnos/perfil/":  ["alumnos.view"],
};

export function canAccessRoute(route: string, permissions: string[]): boolean {
  if (ROUTE_PERMISSIONS[route]) {
    return ROUTE_PERMISSIONS[route].some((p) => permissions.includes(p));
  }
  const prefixEntry = Object.entries(EXTRA_PERMISSIONS).find(
    ([key]) => route.startsWith(key),
  );
  if (prefixEntry) {
    return prefixEntry[1].some((p) => permissions.includes(p));
  }
  return false;
}

export function getDefaultRoute(permissions: string[]): string {
  if (canAccessRoute("#/dashboard", permissions)) return "#/dashboard";
  const [firstAllowed] = Object.keys(ROUTE_PERMISSIONS).filter((route) =>
    canAccessRoute(route, permissions),
  );
  return firstAllowed ?? "#/dashboard";
}
