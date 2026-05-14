import { useEffect, useState } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import type { PageProps } from "../../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { AlertTriangle, Users, Clock, CheckCircle2 } from "lucide-react";

interface AlumnoData {
  id: number;
  nombre: string;
  grupo: string;

}

interface ReporteData {
  id: number;
  alumnoId: number;
  descripcion: string;
  fecha: string;
  estatus: string;
}

interface DashboardTrabajadorSocialProps {
  onNavigate: (route: string) => void;
}

export function DashboardTrabajadorSocial({ onNavigate }: DashboardTrabajadorSocialProps) {
  const { auth } = usePage<PageProps>().props;
  const userName = auth.user?.name ?? "Trabajador(a) Social";
  const userRole = auth.user?.role ?? "Trabajador Social";
  const [alumnos, setAlumnos] = useState<AlumnoData[]>([]);
  const [reportesConducta, setReportesConducta] = useState<ReporteData[]>([]);

  useEffect(() => {
    axios.get("/api/trabajador-social/alumnos")
      .then(({ data }) => setAlumnos(data.alumnos ?? []))
      .catch(() => {});
    axios.get("/api/reportes-conducta")
      .then(({ data }) => setReportesConducta(data.reportes ?? []))
      .catch(() => {});
  }, []);

  const getAlumnoById = (id: number) => alumnos.find(a => a.id === id);

  const reportesAbiertos = reportesConducta.filter(r => r.estatus === "Abierto");
  const reportesEnSeguimiento = reportesConducta.filter(r => r.estatus === "En seguimiento");
  const alumnosConReportes = [...new Set(reportesConducta.map(r => r.alumnoId))].length;

  const reportesRecientes = reportesConducta.slice(0, 5);

  // Casos prioritarios (alumnos con múltiples reportes)
  const conteoReportesPorAlumno = reportesConducta.reduce((acc, reporte) => {
    acc[reporte.alumnoId] = (acc[reporte.alumnoId] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const casosPrioritarios = Object.entries(conteoReportesPorAlumno)
    .filter(([, count]) => count >= 2)
    .map(([alumnoId, count]) => ({
      alumno: getAlumnoById(parseInt(alumnoId)),
      reportes: count
    }))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de bienvenida */}
      <Card className="bg-linear-to-br from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[#111827]">¡Bienvenido/a, {userName}!</h2>
              <p className="text-sm text-[#6B7280] mt-1 flex items-center gap-2 flex-wrap">
                <Badge className="bg-green-100 text-[#059669] border-0 text-xs">{userRole}</Badge>
                Gestión de casos y reportes de conducta
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-red-50 to-red-100 hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <AlertTriangle className="h-6 w-6 text-[#E11D48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Reportes Abiertos</p>
                <p className="text-2xl font-bold text-[#E11D48]">{reportesAbiertos.length}</p>
                <p className="text-xs text-[#6B7280] mt-1">Requieren atención</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100 hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Clock className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">En Seguimiento</p>
                <p className="text-2xl font-bold text-[#D97706]">{reportesEnSeguimiento.length}</p>
                <p className="text-xs text-[#6B7280] mt-1">Casos activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Users className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Alumnos con Reportes</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{alumnosConReportes}</p>
                <p className="text-xs text-[#6B7280] mt-1">Historial registrado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-green-100 hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-[#059669]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Casos Cerrados</p>
                <p className="text-2xl font-bold text-[#059669]">
                  {reportesConducta.filter(r => r.estatus === "Cerrado").length}
                </p>
                <p className="text-xs text-[#6B7280] mt-1">Este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reportes recientes */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Reportes Recientes</CardTitle>
                <CardDescription>Últimos incidentes registrados</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigate("#/trabajador-social/reportes")}>
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportesRecientes.map((reporte) => {
                const alumno = getAlumnoById(reporte.alumnoId);

                return (
                  <button
                    key={reporte.id}
                    onClick={() => onNavigate("")}
                    className="w-full text-left p-3 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#111827] truncate">{alumno?.nombre}</h4>
                        <p className="text-sm text-[#6B7280] mt-1 line-clamp-1">{reporte.descripcion}</p>
                        <p className="text-xs text-[#6B7280] mt-2">{reporte.fecha}</p>
                      </div>
                      <Badge variant="secondary">
                        {reporte.estatus}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

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
                    className="w-full text-left p-4 rounded-lg bg-linear-to-br from-red-50 to-white border border-red-200 hover:shadow-lg transition-all"
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
      </div>
    </div>
  );
}
