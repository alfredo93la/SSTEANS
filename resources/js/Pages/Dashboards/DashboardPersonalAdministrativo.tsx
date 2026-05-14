import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import {
  Users,
  GraduationCap,
  Building2,
  UserCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { PageProps } from "../../types";

interface GradoData { id: number; numero: number; }
interface GrupoData {
  id: number;
  nombre: string;
  asignaciones_count: number;
  cicloEscolar?: { id: number; nombre: string } | null;
  grado?: GradoData | null;
}
interface AlumnoData {
  id: number;
  tiene_tutor: boolean;
  persona?: { nombre: string; apellidos: string } | null;
  asignaciones?: Array<{
    grupo?: { nombre: string; grado?: { numero: number } | null } | null;
  }> | null;
}

interface DashboardPersonalAdministrativoProps {
  onNavigate: (route: string) => void;
}

export function DashboardPersonalAdministrativo({ onNavigate }: DashboardPersonalAdministrativoProps) {
  const { auth, cicloActivo: cicloActivoProp } = usePage<PageProps>().props;
  const userName = auth.user?.name ?? "Personal Administrativo";
  const userRole = auth.user?.role ?? "Personal Administrativo";

  const [alumnos, setAlumnos] = useState<AlumnoData[]>([]);
  const [grupos, setGrupos] = useState<GrupoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/administrativo/alumnos"),
      axios.get("/api/administrativo/grupos"),
    ])
      .then(([alumnosRes, gruposRes]) => {
        setAlumnos(alumnosRes.data.alumnos ?? []);
        setGrupos(gruposRes.data.grupos ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalAlumnos = alumnos.length;
  const totalGrupos = grupos.length;
  const sinTutor = alumnos.filter(a => !a.tiene_tutor).sort((a, b) => {
    const ap = (a.persona?.apellidos ?? "").localeCompare(b.persona?.apellidos ?? "", "es");
    return ap !== 0 ? ap : (a.persona?.nombre ?? "").localeCompare(b.persona?.nombre ?? "", "es");
  });
  const alumnosSinTutor = sinTutor.length;

  const pendientesList = [
    ...(alumnosSinTutor > 0
      ? [{ tarea: `${alumnosSinTutor} alumno${alumnosSinTutor !== 1 ? "s" : ""} sin tutor vinculado`, urgente: true }]
      : []),
    ...(!cicloActivoProp && !loading
      ? [{ tarea: "No hay ciclo escolar activo configurado", urgente: true }]
      : []),
    ...(totalGrupos === 0 && !loading && cicloActivoProp
      ? [{ tarea: "No hay grupos creados para el ciclo activo", urgente: false }]
      : []),
  ];

  const resumenGrupos = grupos.slice(0, 5).map(g => ({
    id: g.id,
    nombre: g.grado ? `${g.grado.numero}°${g.nombre}` : g.nombre,
    ciclo: g.cicloEscolar?.nombre ?? "",
    alumnos: g.asignaciones_count ?? 0,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de bienvenida */}
      <Card className="bg-linear-to-br from-amber-50 to-blue-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Building2 className="h-7 w-7 text-[#D97706]" />
            </div>
            <div>
              <h2 className="text-[#111827]">¡Bienvenido/a, {userName}!</h2>
              <p className="text-sm text-[#6B7280] mt-1 flex items-center gap-2 flex-wrap">
                <Badge className="bg-amber-100 text-[#D97706] border-0 text-xs">{userRole}</Badge>
                Administración de grupos, alumnos y horarios
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onNavigate("#/alumnos")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <GraduationCap className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total Alumnos</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{loading ? "—" : totalAlumnos}</p>
                <p className="text-xs text-[#6B7280] mt-1">Inscritos en el sistema</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-[#E5E7EB] bg-linear-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onNavigate("#/asignar-alumnos")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Users className="h-6 w-6 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Grupos Activos</p>
                <p className="text-2xl font-bold text-[#7C3AED]">{loading ? "—" : totalGrupos}</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  {cicloActivoProp ? `Ciclo ${cicloActivoProp.nombre}` : "Sin ciclo activo"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onNavigate("#/tutores")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <UserCheck className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Sin Tutor</p>
                <p className={`text-2xl font-bold ${alumnosSinTutor > 0 ? "text-[#E11D48]" : "text-[#059669]"}`}>
                  {loading ? "—" : alumnosSinTutor}
                </p>
                <p className="text-xs text-[#6B7280] mt-1">Alumnos sin tutor vinculado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grupos del ciclo */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Grupos del Ciclo</CardTitle>
                <CardDescription>Distribución de alumnos por grupo</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => onNavigate("#/asignar-alumnos")}
              >
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-[#6B7280]">
                <p className="text-sm">Cargando grupos...</p>
              </div>
            ) : resumenGrupos.length === 0 ? (
              <div className="text-center py-8 text-[#6B7280]">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay grupos en el ciclo activo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resumenGrupos.map(grupo => (
                  <div key={grupo.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
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

        {/* Alumnos sin tutor */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Alumnos Sin Tutor</CardTitle>
                <CardDescription>Pendientes de vincular con un tutor</CardDescription>
              </div>
              {sinTutor.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => onNavigate("#/tutores")}
                >
                  Gestionar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-[#6B7280]">
                <p className="text-sm">Cargando alumnos...</p>
              </div>
            ) : sinTutor.length === 0 ? (
              <div className="text-center py-8 text-[#059669]">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-60" />
                <p className="text-sm font-medium">Todos los alumnos tienen tutor asignado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sinTutor.slice(0, 6).map(alumno => {
                  const asignacion = alumno.asignaciones?.[0];
                  const grupo = asignacion?.grupo;
                  const grupoLabel = grupo
                    ? `${grupo.grado?.numero ?? ""}°${grupo.nombre}`
                    : "Sin grupo asignado";
                  return (
                    <div
                      key={alumno.id}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100"
                    >
                      <AlertCircle className="h-4 w-4 text-[#E11D48] shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-[#111827]">
                          {alumno.persona?.nombre ?? ""} {alumno.persona?.apellidos ?? ""}
                        </p>
                        <p className="text-xs text-[#6B7280]">{grupoLabel}</p>
                      </div>
                    </div>
                  );
                })}
                {sinTutor.length > 6 && (
                  <p className="text-xs text-center text-[#6B7280] pt-1">
                    y {sinTutor.length - 6} más...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pendientes: solo si hay algo que atender */}
      {pendientesList.length > 0 && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Pendientes</CardTitle>
            <CardDescription>Situaciones que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendientesList.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-all ${
                    item.urgente ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.urgente ? "bg-[#E11D48]" : "bg-[#9CA3AF]"}`} />
                    <p className="text-sm text-[#111827]">{item.tarea}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
