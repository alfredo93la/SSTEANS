import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Search, 
  AlertTriangle, 
  TrendingDown,
  Users,
  FileText,
  Clock,
  CheckCircle2
} from "lucide-react";
import { alumnos, reportesConducta, getAlumnoById } from "../../data/mockData";

interface DashboardTrabajadorSocialProps {
  onNavigate: (route: string) => void;
}

export function DashboardTrabajadorSocial({ onNavigate }: DashboardTrabajadorSocialProps) {
  const [busqueda, setBusqueda] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<number | null>(null);

  const reportesAbiertos = reportesConducta.filter(r => r.estatus === "Abierto");
  const reportesEnSeguimiento = reportesConducta.filter(r => r.estatus === "En seguimiento");
  const alumnosConReportes = [...new Set(reportesConducta.map(r => r.alumnoId))].length;

  const alumnosFiltrados = alumnos.filter(a => 
    a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.grupo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const reportesRecientes = reportesConducta.slice(0, 5);

  // Casos prioritarios (alumnos con múltiples reportes)
  const conteoReportesPorAlumno = reportesConducta.reduce((acc, reporte) => {
    acc[reporte.alumnoId] = (acc[reporte.alumnoId] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const casosPrioritarios = Object.entries(conteoReportesPorAlumno)
    .filter(([_, count]) => count >= 2)
    .map(([alumnoId, count]) => ({
      alumno: getAlumnoById(parseInt(alumnoId)),
      reportes: count
    }))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de bienvenida */}
      <Card className="border-[#E5E7EB] bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[#111827]">
                Panel de Trabajo Social 👥
              </h2>
              <p className="text-sm text-[#6B7280] mt-1">
                {reportesAbiertos.length} casos requieren atención inmediata
              </p>
            </div>
            <Button className="bg-[#E11D48] hover:bg-[#BE123C]" onClick={() => onNavigate("#/comunicacion")}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Nuevo reporte
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Buscador de alumno */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Buscar Alumno</CardTitle>
          <CardDescription>Consulta el expediente completo de cualquier alumno</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <Input
                placeholder="Buscar por nombre o grupo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
            <Select value={alumnoSeleccionado?.toString() || ""} onValueChange={(v) => setAlumnoSeleccionado(parseInt(v))}>
              <SelectTrigger className="w-full sm:w-64 rounded-lg">
                <SelectValue placeholder="O selecciona un alumno" />
              </SelectTrigger>
              <SelectContent>
                {alumnosFiltrados.slice(0, 10).map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.nombre} - {a.grupo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {alumnoSeleccionado && (
              <Button onClick={() => onNavigate("#/academico")}>
                Ver expediente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB] hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-[#E11D48]" />
              </div>
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Reportes Abiertos</p>
              <p className="text-3xl font-bold text-[#E11D48] mt-1">{reportesAbiertos.length}</p>
              <p className="text-xs text-[#6B7280] mt-2">Requieren atención</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="h-6 w-6 text-[#D97706]" />
              </div>
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">En Seguimiento</p>
              <p className="text-3xl font-bold text-[#D97706] mt-1">{reportesEnSeguimiento.length}</p>
              <p className="text-xs text-[#6B7280] mt-2">Casos activos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-[#1D4ED8]" />
              </div>
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Alumnos con Reportes</p>
              <p className="text-3xl font-bold text-[#1D4ED8] mt-1">{alumnosConReportes}</p>
              <p className="text-xs text-[#6B7280] mt-2">Historial registrado</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-[#059669]" />
              </div>
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Casos Cerrados</p>
              <p className="text-3xl font-bold text-[#059669] mt-1">
                {reportesConducta.filter(r => r.estatus === "Cerrado").length}
              </p>
              <p className="text-xs text-[#6B7280] mt-2">Este mes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Casos prioritarios */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Casos Prioritarios</CardTitle>
                <CardDescription>Alumnos que requieren atención inmediata</CardDescription>
              </div>
              <AlertTriangle className="h-5 w-5 text-[#E11D48]" />
            </div>
          </CardHeader>
          <CardContent>
            {casosPrioritarios.length > 0 ? (
              <div className="space-y-3">
                {casosPrioritarios.map((caso, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate("#/comunicacion")}
                    className="w-full text-left p-4 rounded-lg bg-gradient-to-br from-red-50 to-white border border-red-200 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#111827]">{caso.alumno?.nombre}</h4>
                        <p className="text-sm text-[#6B7280] mt-1">{caso.alumno?.grupo}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-red-100 text-[#E11D48]">
                          {caso.reportes} reportes
                        </Badge>
                        <p className="text-xs text-[#E11D48] mt-1 font-medium">Alta prioridad</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#6B7280]">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-[#059669] opacity-50" />
                <p>No hay casos prioritarios</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reportes recientes */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Reportes Recientes</CardTitle>
                <CardDescription>Últimos incidentes registrados</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("#/comunicacion")}>
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportesRecientes.map((reporte) => {
                const alumno = getAlumnoById(reporte.alumnoId);
                const estatusColor = 
                  reporte.estatus === "Abierto" ? "bg-red-100 text-[#E11D48]" :
                  reporte.estatus === "En seguimiento" ? "bg-amber-100 text-[#D97706]" :
                  "bg-gray-100 text-[#6B7280]";

                return (
                  <button
                    key={reporte.id}
                    onClick={() => onNavigate("#/comunicacion")}
                    className="w-full text-left p-3 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#111827] truncate">{alumno?.nombre}</h4>
                        <p className="text-sm text-[#6B7280] mt-1 line-clamp-1">{reporte.descripcion}</p>
                        <p className="text-xs text-[#6B7280] mt-2">{reporte.fecha}</p>
                      </div>
                      <Badge className={estatusColor}>
                        {reporte.estatus}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => onNavigate("#/comunicacion")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver todos los reportes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Accesos rápidos */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onNavigate("#/comunicacion")}
            >
              <AlertTriangle className="h-6 w-6 text-[#E11D48]" />
              <span className="text-sm">Nuevo Reporte</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onNavigate("#/comunicacion")}
            >
              <FileText className="h-6 w-6 text-[#D97706]" />
              <span className="text-sm">Ver Reportes</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onNavigate("#/academico")}
            >
              <Users className="h-6 w-6 text-[#1D4ED8]" />
              <span className="text-sm">Buscar Alumno</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onNavigate("#/admin")}
            >
              <TrendingDown className="h-6 w-6 text-[#7C3AED]" />
              <span className="text-sm">Estadísticas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
