import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import {
  Users,
  Search,
  Filter,
  User,
  AlertTriangle,
  FileText,
  Eye,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import { PageTitle } from "../../Layouts/PageTitle";

interface AlumnosTSProps {
  onNavigate?: (route: string) => void;
}

export function AlumnosTS({ onNavigate }: AlumnosTSProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string | null>(null);

  // Datos de ejemplo - Grupos
  const grupos = [
    { id: "1A", nombre: "1°A", alumnos: 28, conReportes: 3, promedio: 8.5 },
    { id: "1B", nombre: "1°B", alumnos: 30, conReportes: 2, promedio: 8.8 },
    { id: "2A", nombre: "2°A", alumnos: 26, conReportes: 1, promedio: 9.0 },
    { id: "2B", nombre: "2°B", alumnos: 29, conReportes: 4, promedio: 8.2 },
    { id: "3A", nombre: "3°A", alumnos: 25, conReportes: 2, promedio: 8.7 },
    { id: "3B", nombre: "3°B", alumnos: 27, conReportes: 1, promedio: 8.9 }
  ];

  // Datos de ejemplo - Alumnos
  const alumnos = [
    {
      id: 1,
      nombre: "Juan Pérez García",
      grupo: "1°A",
      matricula: "2024001",
      tutor: "María Pérez",
      telefono: "555-0101",
      email: "maria.perez@example.com",
      promedio: 8.5,
      asistencia: 92,
      reportes: 2,
      estado: "atencion",
      ultimoReporte: "23/02/2026"
    },
    {
      id: 2,
      nombre: "Ana García López",
      grupo: "2°B",
      matricula: "2023045",
      tutor: "Carlos García",
      telefono: "555-0202",
      email: "carlos.garcia@example.com",
      promedio: 7.8,
      asistencia: 75,
      reportes: 3,
      estado: "critico",
      ultimoReporte: "22/02/2026"
    },
    {
      id: 3,
      nombre: "Luis Martínez Ruiz",
      grupo: "3°A",
      matricula: "2022089",
      tutor: "Sandra Martínez",
      telefono: "555-0303",
      email: "sandra.martinez@example.com",
      promedio: 9.2,
      asistencia: 98,
      reportes: 0,
      estado: "normal",
      ultimoReporte: null
    },
    {
      id: 4,
      nombre: "María Rodríguez Cruz",
      grupo: "1°B",
      matricula: "2024012",
      tutor: "Jorge Rodríguez",
      telefono: "555-0404",
      email: "jorge.rodriguez@example.com",
      promedio: 8.0,
      asistencia: 88,
      reportes: 1,
      estado: "atencion",
      ultimoReporte: "18/02/2026"
    },
    {
      id: 5,
      nombre: "Carlos Hernández Díaz",
      grupo: "2°A",
      matricula: "2023067",
      tutor: "Laura Hernández",
      telefono: "555-0505",
      email: "laura.hernandez@example.com",
      promedio: 9.5,
      asistencia: 100,
      reportes: 0,
      estado: "normal",
      ultimoReporte: null
    },
    {
      id: 6,
      nombre: "Sofía López Morales",
      grupo: "1°A",
      matricula: "2024023",
      tutor: "Pedro López",
      telefono: "555-0606",
      email: "pedro.lopez@example.com",
      promedio: 8.8,
      asistencia: 95,
      reportes: 0,
      estado: "normal",
      ultimoReporte: null
    }
  ];

  const estadisticas = {
    totalAlumnos: 165,
    conReportes: 13,
    promedioGeneral: 8.6,
    asistenciaPromedio: 91
  };

  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case "critico": return "bg-red-100 text-red-700 border-red-200";
      case "atencion": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "normal": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case "critico": return "Crítico";
      case "atencion": return "Requiere Atención";
      case "normal": return "Normal";
      default: return estado;
    }
  };

  const verPerfilAlumno = (alumnoId: number) => {
    if (onNavigate) {
      onNavigate(`#/trabajador-social/alumno/${alumnoId}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={Users} title="Gestión de Alumnos" description="Consulta información y expedientes de alumnos por grupo" color="bg-[#1D4ED8]" />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Total Alumnos</p>
                <p className="text-2xl font-bold text-[#7C3AED] mt-1">{estadisticas.totalAlumnos}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-[#7C3AED]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Con Reportes</p>
                <p className="text-2xl font-bold text-[#E11D48] mt-1">{estadisticas.conReportes}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-[#E11D48]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Promedio General</p>
                <p className="text-2xl font-bold text-[#059669] mt-1">{estadisticas.promedioGeneral}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-[#059669]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Asistencia Prom.</p>
                <p className="text-2xl font-bold text-[#1D4ED8] mt-1">{estadisticas.asistenciaPromedio}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="h-6 w-6 text-[#1D4ED8]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vista de Grupos */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Grupos Escolares</CardTitle>
          <CardDescription>Selecciona un grupo para ver sus alumnos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grupos.map((grupo) => (
              <button
                key={grupo.id}
                onClick={() => setGrupoSeleccionado(grupo.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-lg ${grupoSeleccionado === grupo.id
                    ? "border-[#1D4ED8] bg-blue-50"
                    : "border-[#E5E7EB] bg-white hover:border-[#7C3AED]"
                  }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-linear-to-br from-[#7C3AED] to-[#1D4ED8] rounded-lg flex items-center justify-center text-white font-bold">
                    {grupo.nombre.split('°')[0]}
                  </div>
                  {grupo.conReportes > 0 && (
                    <Badge className="bg-red-100 text-red-700">
                      {grupo.conReportes} reportes
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold text-[#111827] text-lg mb-1">{grupo.nombre}</h4>
                <div className="space-y-1 text-sm text-[#6B7280]">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{grupo.alumnos} alumnos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Promedio: {grupo.promedio}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros y búsqueda */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Buscar por nombre, matrícula, tutor..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {grupos.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="atencion">Requiere Atención</SelectItem>
                <SelectItem value="critico">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Listado de Alumnos</CardTitle>
          <CardDescription>
            {grupoSeleccionado
              ? `Mostrando alumnos del grupo ${grupos.find(g => g.id === grupoSeleccionado)?.nombre}`
              : "Mostrando todos los alumnos"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alumnos
              .filter(a => !grupoSeleccionado || a.grupo === grupos.find(g => g.id === grupoSeleccionado)?.nombre)
              .map((alumno) => (
                <div
                  key={alumno.id}
                  className="p-4 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all cursor-pointer"
                  onClick={() => verPerfilAlumno(alumno.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-linear-to-br from-[#7C3AED] to-[#1D4ED8] rounded-lg flex items-center justify-center text-white font-bold shrink-0">
                        {alumno.nombre.split(' ')[0][0]}{alumno.nombre.split(' ')[1][0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-[#111827]">{alumno.nombre}</h4>
                          <Badge variant="outline">{alumno.grupo}</Badge>
                          <Badge className={getBadgeEstado(alumno.estado)}>
                            {getEstadoTexto(alumno.estado)}
                          </Badge>
                          {alumno.reportes > 0 && (
                            <Badge className="bg-red-100 text-red-700">
                              {alumno.reportes} reporte(s)
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#6B7280] mb-2">
                          <div>
                            <span className="font-medium">Matrícula:</span> {alumno.matricula}
                          </div>
                          <div>
                            <span className="font-medium">Promedio:</span> {alumno.promedio}
                          </div>
                          <div>
                            <span className="font-medium">Asistencia:</span> {alumno.asistencia}%
                          </div>
                          {alumno.ultimoReporte && (
                            <div>
                              <span className="font-medium">Último reporte:</span> {alumno.ultimoReporte}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Tutor: {alumno.tutor}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{alumno.telefono}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{alumno.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          verPerfilAlumno(alumno.id);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Perfil
                      </Button>
                      <ChevronRight className="h-5 w-5 text-[#6B7280]" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
