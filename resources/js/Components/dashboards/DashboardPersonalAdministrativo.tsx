import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Users, 
  BookMarked, 
  Clock,
  GraduationCap,
  Building2,
  Link2,
  CalendarCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { alumnos, grupos, materias, ciclosEscolares } from "../../data/mockData";

interface DashboardPersonalAdministrativoProps {
  onNavigate: (route: string) => void;
}

export function DashboardPersonalAdministrativo({ onNavigate }: DashboardPersonalAdministrativoProps) {
  const totalAlumnos = alumnos.length;
  const totalGrupos = grupos.length;
  const totalMaterias = materias.length;
  const cicloActivo = ciclosEscolares.find(c => c.activo);
  
  // Alumno sin tutor vinculado (tutorId = 0)
  const alumnosSinTutor = alumnos.filter(a => !a.tutorId || a.tutorId === 0).length;

  const pendientesList = [
    { tarea: `Asignar tutor a ${alumnosSinTutor} alumno(s) sin vincular`, urgente: alumnosSinTutor > 0 },
    { tarea: "Actualizar horarios del ciclo escolar", urgente: false },
    { tarea: "Revisar alumnos sin grupo asignado", urgente: true },
    { tarea: "Publicar calendario de eventos del mes", urgente: false }
  ];

  const actividadesRecientes = [
    { accion: "Alumno inscrito", detalle: "Luis Alberto Morales → 1°A", fecha: "Hace 1 hora", tipo: "success" },
    { accion: "Grupo creado", detalle: "3°C agregado al ciclo 2024-2025", fecha: "Hace 3 horas", tipo: "info" },
    { accion: "Horario actualizado", detalle: "Cambio en Matemáticas – 2°B", fecha: "Ayer", tipo: "info" },
    { accion: "Tutor vinculado", detalle: "Rosa Flores → Ana Martínez (2°B)", fecha: "Hace 2 días", tipo: "success" },
    { accion: "Materia registrada", detalle: "Educación Física agregada", fecha: "Hace 3 días", tipo: "info" }
  ];

  const resumenGrupos = grupos.slice(0, 5).map(g => ({
    nombre: g.nombre,
    ciclo: g.ciclo,
    alumnos: alumnos.filter(a => a.grupo === g.nombre).length
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de bienvenida */}
      <Card className="bg-gradient-to-br from-amber-50 to-blue-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Building2 className="h-7 w-7 text-[#D97706]" />
              </div>
              <div>
                <h2 className="text-[#111827]">
                  Gestión Escolar
                </h2>
                <p className="text-sm text-[#6B7280] mt-1">
                  Administración de grupos, materias, horarios, alumnos y tutores
                  {cicloActivo && (
                    <span className="ml-2">
                      <Badge className="bg-green-100 text-[#059669] border-0 text-xs">
                        Ciclo {cicloActivo.nombre} activo
                      </Badge>
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="rounded-lg border-amber-200 text-[#D97706] hover:bg-amber-50"
                onClick={() => onNavigate("#/administrativo/tutores")}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Vincular Tutor-Alumno
              </Button>
              <Button 
                className="bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg"
                onClick={() => onNavigate("#/administrativo/alumnos")}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Registrar Alumno
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs de gestión escolar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="border-[#E5E7EB] hover:shadow-lg transition-all cursor-pointer" 
          onClick={() => onNavigate("#/administrativo/alumnos")}
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <GraduationCap className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <TrendingUp className="h-5 w-5 text-[#059669]" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Total Alumnos</p>
              <p className="text-3xl font-bold text-[#1D4ED8] mt-1">{totalAlumnos}</p>
              <p className="text-xs text-[#6B7280] mt-2">
                {alumnosSinTutor > 0 
                  ? <span className="text-[#E11D48]">{alumnosSinTutor} sin tutor vinculado</span>
                  : "Todos vinculados a tutor"
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-[#E5E7EB] hover:shadow-lg transition-all cursor-pointer" 
          onClick={() => onNavigate("#/administrativo/grupos")}
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-[#7C3AED]" />
              </div>
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Grupos Activos</p>
              <p className="text-3xl font-bold text-[#7C3AED] mt-1">{totalGrupos}</p>
              <p className="text-xs text-[#6B7280] mt-2">Ciclo {cicloActivo?.nombre || "2024-2025"}</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-[#E5E7EB] hover:shadow-lg transition-all cursor-pointer" 
          onClick={() => onNavigate("#/administrativo/materias")}
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <BookMarked className="h-6 w-6 text-[#059669]" />
              </div>
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Materias</p>
              <p className="text-3xl font-bold text-[#059669] mt-1">{totalMaterias}</p>
              <p className="text-xs text-[#6B7280] mt-2">En el catálogo</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-[#E5E7EB] hover:shadow-lg transition-all cursor-pointer" 
          onClick={() => onNavigate("#/administrativo/tutores")}
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <UserCheck className="h-6 w-6 text-[#D97706]" />
              </div>
              {alumnosSinTutor > 0 && <AlertTriangle className="h-5 w-5 text-[#E11D48]" />}
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Sin Vincular</p>
              <p className={`text-3xl font-bold mt-1 ${alumnosSinTutor > 0 ? "text-[#E11D48]" : "text-[#059669]"}`}>
                {alumnosSinTutor}
              </p>
              <p className="text-xs text-[#6B7280] mt-2">Alumnos sin tutor</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grupos y alumnos por grupo */}
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
                onClick={() => onNavigate("#/administrativo/grupos")}
              >
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos cambios en la gestión escolar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actividadesRecientes.map((actividad, idx) => {
                const tipoColor = 
                  actividad.tipo === "success" ? "bg-green-100 border-green-200" :
                  "bg-blue-100 border-blue-200";

                return (
                  <div key={idx} className={`p-3 rounded-lg border ${tipoColor}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#111827] text-xs">{actividad.accion}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{actividad.detalle}</p>
                      </div>
                      <span className="text-xs text-[#6B7280] whitespace-nowrap">{actividad.fecha}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pendientes y acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pendientes */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Pendientes</CardTitle>
            <CardDescription>Tareas por atender</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendientesList.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-all ${
                    item.urgente 
                      ? "bg-red-50 border-red-200" 
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.urgente ? "bg-[#E11D48]" : "bg-[#9CA3AF]"}`} />
                    <p className="text-sm text-[#111827]">{item.tarea}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <Card className="border-[#E5E7EB] lg:col-span-2">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Acceso directo a las funciones más utilizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all"
                onClick={() => onNavigate("#/administrativo/alumnos")}
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-[#1D4ED8]" />
                </div>
                <span className="text-xs font-medium">Alumnos</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all"
                onClick={() => onNavigate("#/administrativo/grupos")}
              >
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-[#7C3AED]" />
                </div>
                <span className="text-xs font-medium">Grupos</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all"
                onClick={() => onNavigate("#/administrativo/materias")}
              >
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookMarked className="h-5 w-5 text-[#059669]" />
                </div>
                <span className="text-xs font-medium">Materias</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                onClick={() => onNavigate("#/administrativo/horarios")}
              >
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Clock className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="text-xs font-medium">Horarios</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-all"
                onClick={() => onNavigate("#/administrativo/tutores")}
              >
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Link2 className="h-5 w-5 text-[#D97706]" />
                </div>
                <span className="text-xs font-medium">Tutores</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 rounded-xl hover:bg-teal-50 hover:border-teal-200 transition-all"
                onClick={() => onNavigate("#/agenda")}
              >
                <div className="p-2 bg-teal-100 rounded-lg">
                  <CalendarCheck className="h-5 w-5 text-teal-600" />
                </div>
                <span className="text-xs font-medium">Agenda</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
