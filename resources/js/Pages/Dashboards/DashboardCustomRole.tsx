import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import {
  Users, BookMarked, Clock, GraduationCap, Link2,
  CalendarCheck, UserCheck, Building2, LayoutDashboard,
} from "lucide-react";

interface GrupoData { id: number; nombre: string; asignaciones_count: number; cicloEscolar?: { nombre: string } | null; }
interface CicloData { id: number; nombre: string; activo: boolean; }

interface Props {
  onNavigate: (route: string) => void;
  userRole: string;
  userName: string;
  permissions: string[];
}

export function DashboardCustomRole({ onNavigate, userRole, userName, permissions }: Props) {
  const has = (perm: string) => permissions.includes(perm);
  const [totalAlumnos, setTotalAlumnos] = useState(0);
  const [grupos, setGrupos] = useState<GrupoData[]>([]);
  const [totalMaterias, setTotalMaterias] = useState(0);
  const [cicloActivo, setCicloActivo] = useState<CicloData | null>(null);

  useEffect(() => {
    axios.get("/api/administrativo/alumnos")
      .then(({ data }) => setTotalAlumnos((data.alumnos ?? []).length))
      .catch(() => {});
    axios.get("/api/administrativo/grupos")
      .then(({ data }) => setGrupos(data.grupos ?? []))
      .catch(() => {});
    axios.get("/api/materias")
      .then(({ data }) => setTotalMaterias((data.materias ?? []).length))
      .catch(() => {});
    axios.get("/api/ciclos")
      .then(({ data }) => setCicloActivo(data.ciclo_activo ?? null))
      .catch(() => {});
  }, []);

  const totalGrupos = grupos.length;
  const resumenGrupos = grupos.slice(0, 5).map(g => ({
    nombre: g.nombre,
    ciclo: g.cicloEscolar?.nombre ?? "",
    alumnos: g.asignaciones_count ?? 0,
  }));

  const firstName = userName.split(" ")[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Bienvenida personalizada */}
      <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100/50">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <LayoutDashboard className="h-6 w-6 text-[#1D4ED8]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#111827]">Bienvenido, {firstName}</h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Estás accediendo como{" "}
              <Badge className="bg-[#DBEAFE] text-[#1D4ED8] border-0 text-xs ml-1">{userRole}</Badge>
              {cicloActivo && (
                <Badge className="bg-green-100 text-[#059669] border-0 text-xs ml-2">
                  Ciclo {cicloActivo.nombre} activo
                </Badge>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {has("alumnos.manage") && (
          <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/alumnos")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl"><GraduationCap className="h-6 w-6 text-[#1D4ED8]" /></div>
                <div>
                  <p className="text-sm text-[#6B7280]">Total Alumnos</p>
                  <p className="text-2xl font-bold text-[#1D4ED8]">{totalAlumnos}</p>
                  <p className="text-xs text-[#6B7280] mt-1">Inscritos en el ciclo activo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {has("grupos.manage") && (
          <Card className="border-[#E5E7EB] bg-linear-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/grupos")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl"><Users className="h-6 w-6 text-[#7C3AED]" /></div>
                <div>
                  <p className="text-sm text-[#6B7280]">Grupos Activos</p>
                  <p className="text-2xl font-bold text-[#7C3AED]">{totalGrupos}</p>
                  <p className="text-xs text-[#6B7280] mt-1">Ciclo {cicloActivo?.nombre || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {has("grupos.manage") && (
          <Card className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-green-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/materias")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl"><BookMarked className="h-6 w-6 text-[#059669]" /></div>
                <div>
                  <p className="text-sm text-[#6B7280]">Materias</p>
                  <p className="text-2xl font-bold text-[#059669]">{totalMaterias}</p>
                  <p className="text-xs text-[#6B7280] mt-1">En el catálogo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {has("tutores.manage") && (
          <Card className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/tutores")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl"><UserCheck className="h-6 w-6 text-[#D97706]" /></div>
                <div>
                  <p className="text-sm text-[#6B7280]">Tutores</p>
                  <p className="text-2xl font-bold text-[#D97706]">—</p>
                  <p className="text-xs text-[#6B7280] mt-1">Vinculaciones activas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Grupos + Acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {has("grupos.manage") && (
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Grupos del Ciclo</CardTitle>
                  <CardDescription>Distribución de alumnos por grupo</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg" onClick={() => onNavigate("#/grupos")}>
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {resumenGrupos.length === 0 ? (
                <p className="text-sm text-[#9CA3AF] text-center py-4">No hay grupos registrados.</p>
              ) : (
                <div className="space-y-3">
                  {resumenGrupos.map((grupo, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <Users className="h-4 w-4 text-[#1D4ED8]" />
                        </div>
                        <div>
                          <p className="font-medium text-[#111827] text-sm">Grupo {grupo.nombre}</p>
                          <p className="text-xs text-[#6B7280]">Ciclo {grupo.ciclo}</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-50 text-[#1D4ED8] border border-blue-200">
                        {grupo.alumnos} alumnos
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(() => {
          const acciones = [
            { label: "Alumnos",  route: "#/alumnos",  perm: "alumnos.manage",  icon: GraduationCap, bg: "bg-blue-100",   text: "text-[#1D4ED8]",  hover: "hover:bg-blue-50 hover:border-blue-200" },
            { label: "Grupos",   route: "#/grupos",   perm: "grupos.manage",   icon: Users,         bg: "bg-purple-100", text: "text-[#7C3AED]",  hover: "hover:bg-purple-50 hover:border-purple-200" },
            { label: "Horarios", route: "#/horarios", perm: "horarios.manage", icon: Clock,         bg: "bg-indigo-100", text: "text-indigo-600", hover: "hover:bg-indigo-50 hover:border-indigo-200" },
            { label: "Tutores",  route: "#/tutores",  perm: "tutores.manage",  icon: Link2,         bg: "bg-amber-100",  text: "text-[#D97706]",  hover: "hover:bg-amber-50 hover:border-amber-200" },
            { label: "Agenda",   route: "#/agenda",   perm: "agenda.manage",   icon: CalendarCheck, bg: "bg-teal-100",   text: "text-teal-600",   hover: "hover:bg-teal-50 hover:border-teal-200" },
            { label: "Circulares", route: "#/circulares", perm: "circulares.manage", icon: BookMarked, bg: "bg-rose-100", text: "text-rose-600", hover: "hover:bg-rose-50 hover:border-rose-200" },
          ].filter(({ perm }) => has(perm));

          if (acciones.length === 0) return null;

          return (
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Acceso directo a las funciones más utilizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {acciones.map(({ label, route, icon: Icon, bg, text, hover }) => (
                    <Button key={route} variant="outline" className={`h-auto flex-col gap-2 py-4 rounded-xl transition-all ${hover}`} onClick={() => onNavigate(route)}>
                      <div className={`p-2 ${bg} rounded-lg`}><Icon className={`h-5 w-5 ${text}`} /></div>
                      <span className="text-xs font-medium">{label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })()}
      </div>

      {/* Gestión escolar banner — solo si tiene al menos uno de estos permisos */}
      {(has("alumnos.manage") || has("tutores.manage")) && (
        <Card className="bg-linear-to-br from-amber-50 to-blue-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Building2 className="h-7 w-7 text-[#D97706]" />
                </div>
                <div>
                  <h2 className="text-[#111827]">Gestión Escolar</h2>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Administración de grupos, materias, horarios, alumnos y tutores
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {has("tutores.manage") && (
                  <Button variant="outline" className="rounded-lg border-amber-200 text-[#D97706] hover:bg-amber-50" onClick={() => onNavigate("#/tutores")}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Vincular Tutor-Alumno
                  </Button>
                )}
                {has("alumnos.manage") && (
                  <Button className="bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg" onClick={() => onNavigate("#/alumnos")}>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Registrar Alumno
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
