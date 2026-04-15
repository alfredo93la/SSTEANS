import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ClipboardList,
  FileText,
  Bell,
  CalendarDays
} from "lucide-react";

interface AlumnoInfo { id: number; nombre: string; grupo: string; grado: number | null; ciclo: string; }
interface CalData { promedio: number; }
interface AsistData { estado: string; }
interface TareaData { id: number; titulo: string; materia: string | null; fechaEntrega: string; estadoEntrega: string; }

interface DashboardTutorProps {
  onNavigate: (route: string) => void;
  hijoSeleccionado?: number | null;
  onHijoChange?: (hijoId: number | null) => void;
}

export function DashboardTutor({ onNavigate, hijoSeleccionado }: DashboardTutorProps) {
  const [alumno, setAlumno] = useState<AlumnoInfo | null>(null);
  const [calificacionesAlumno, setCalificacionesAlumno] = useState<CalData[]>([]);
  const [asistenciasAlumno, setAsistenciasAlumno] = useState<AsistData[]>([]);
  const [tareasAlumno, setTareasAlumno] = useState<TareaData[]>([]);

  useEffect(() => {
    axios.get("/tutor/alumnos-asignados")
      .then(({ data }) => {
        const lista: AlumnoInfo[] = data.data ?? [];
        const found = hijoSeleccionado ? lista.find(a => a.id === hijoSeleccionado) : lista[0];
        if (found) setAlumno(found);
      })
      .catch(() => {});
  }, [hijoSeleccionado]);

  useEffect(() => {
    if (!hijoSeleccionado) return;
    axios.get(`/api/tutor/calificaciones/${hijoSeleccionado}`)
      .then(({ data }) => setCalificacionesAlumno(data.calificaciones ?? []))
      .catch(() => {});
    axios.get(`/api/tutor/asistencias/${hijoSeleccionado}`)
      .then(({ data }) => setAsistenciasAlumno(data.asistencias ?? []))
      .catch(() => {});
    axios.get(`/api/tutor/tareas/${hijoSeleccionado}`)
      .then(({ data }) => setTareasAlumno(data.tareas ?? []))
      .catch(() => {});
  }, [hijoSeleccionado]);

  // Calcular promedio general
  const promedioActual = calificacionesAlumno.length > 0
    ? (calificacionesAlumno.reduce((sum, cal) => sum + cal.promedio, 0) / calificacionesAlumno.length).toFixed(1)
    : "0.0";

  // Calcular asistencia
  const totalAsistencias = asistenciasAlumno.length;
  const presentes = asistenciasAlumno.filter(a => a.estado === "Presente").length;
  const porcentajeAsistencia = totalAsistencias > 0
    ? Math.round((presentes / totalAsistencias) * 100)
    : 0;

  // Tareas pendientes
  const tareasPendientes = tareasAlumno.filter(t => t.estadoEntrega === "Pendiente").length;

  // Próximas entregas de tareas
  const proximasEntregas = tareasAlumno
    .filter(t => t.estadoEntrega === "Pendiente")
    .sort((a, b) => {
      const dateA = a.fechaEntrega.split('/').reverse().join('');
      const dateB = b.fechaEntrega.split('/').reverse().join('');
      return dateA.localeCompare(dateB);
    })
    .slice(0, 3);

  // Próximos exámenes y eventos: pendiente de implementar (Agenda)
  const proximosExamenes: never[] = [];
  const proximosEventos: never[] = [];

  // Últimas notificaciones (simulado)
  const notificaciones = [
    { id: 1, mensaje: "Nueva calificación en Matemáticas", fecha: "Hoy", leida: false },
    { id: 2, mensaje: "Recordatorio: Reunión con tutores", fecha: "Ayer", leida: false },
    { id: 3, mensaje: "Tarea entregada: Proyecto Ciencias", fecha: "15/11/2025", leida: true }
  ];


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Información del alumno seleccionado */}
      {alumno && (
        <Card className="bg-linear-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-linear-to-br from-[#7C3AED] to-[#1D4ED8] rounded-full flex items-center justify-center text-white font-semibold text-xl shrink-0 shadow-lg">
                {alumno.nombre.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1">
                <h3 className="text-[#111827]">{alumno.nombre}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="secondary" className="bg-white/80 text-[#000000]">
                    {alumno.grupo}
                  </Badge>
                  <span className="text-sm text-[#6B7280]">Ciclo {alumno.ciclo}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Promedio general */}
        <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/dashboard/calificaciones")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <GraduationCap className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Promedio General</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{promedioActual}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Asistencia */}
        <Card className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-green-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/dashboard/asistencia")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-[#059669]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Asistencia</p>
                <p className="text-2xl font-bold text-[#059669]">{porcentajeAsistencia}%</p>
                <p className="text-xs text-[#6B7280] mt-1">{presentes} de {totalAsistencias} días</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tareas pendientes */}
        <Card className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/dashboard/tareas")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Clock className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Tareas Pendientes</p>
                <p className="text-2xl font-bold text-[#D97706]">{tareasPendientes}</p>
                <p className="text-xs text-[#6B7280] mt-1">Ver detalles →</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reportes */}
        <Card className="border-[#E5E7EB] bg-linear-to-br from-red-50 to-red-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/dashboard/reportes")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <AlertTriangle className="h-6 w-6 text-[#E11D48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Reportes</p>
                <p className="text-2xl font-bold text-[#E11D48]">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eventos Académicos (Reuniones, Juntas) */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#7C3AED]" />
                Eventos Académicos
              </CardTitle>
              <CardDescription>Reuniones, juntas y eventos escolares</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("#/agenda")}>
              Ver agenda
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {proximosEventos.length > 0 ? (
              proximosEventos.map((_e, idx) => <div key={idx} />)
            ) : (
              <p className="text-sm text-[#6B7280] text-center py-4">No hay eventos próximos</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dos columnas: Exámenes y Entregas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Exámenes */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#E11D48]" />
                  Próximos Exámenes
                </CardTitle>
                <CardDescription>Evaluaciones programadas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proximosExamenes.length > 0 ? (
                proximosExamenes.map((_examen, idx) => (
                  <div key={idx} />
                ))
              ) : (
                <p className="text-sm text-[#6B7280] text-center py-4">No hay exámenes próximos</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Próximas Entregas */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-[#1D4ED8]" />
                  Próximas Entregas
                </CardTitle>
                <CardDescription>Tareas pendientes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proximasEntregas.length > 0 ? (
                proximasEntregas.map((tarea) => (
                    <div
                      key={tarea.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-linear-to-br from-blue-50 to-white border border-blue-200 hover:shadow-md transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-100 to-blue-200 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs text-[#1D4ED8]">
                          {tarea.fechaEntrega.split('/')[1] === "11" ? "Nov" : "Dic"}
                        </span>
                        <span className="text-lg font-bold text-[#1D4ED8]">
                          {tarea.fechaEntrega.split('/')[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#111827] truncate">{tarea.titulo}</h4>
                        <p className="text-xs text-[#6B7280] mt-1">
                          {tarea.materia} • {tarea.fechaEntrega}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-[#1D4ED8]">
                        Tarea
                      </Badge>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-[#6B7280] text-center py-4">No hay tareas pendientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notificaciones recientes */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#059669]" />
                Notificaciones
              </CardTitle>
              <CardDescription>
                {notificaciones.filter(n => !n.leida).length} mensajes sin leer
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("#/dashboard/notificaciones")}>
              Ver todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notificaciones.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                  notif.leida 
                    ? "bg-white border-[#E5E7EB]" 
                    : "bg-blue-50 border-blue-200"
                }`}
                onClick={() => onNavigate("#/dashboard/notificaciones")}
              >
                {!notif.leida && (
                  <div className="w-2 h-2 bg-[#1D4ED8] rounded-full mt-2 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notif.leida ? "text-[#6B7280]" : "text-[#111827] font-medium"}`}>
                    {notif.mensaje}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">{notif.fecha}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
