import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Minus,
  ClipboardList,
  FileText,
  Bell,
  CalendarDays
} from "lucide-react";
import { 
  alumnos, 
  calificaciones, 
  asistencias, 
  tareas,
  examenes,
  eventosAcademicos,
  getAlumnoById,
  getMateriaById
} from "../../data/mockData";

interface DashboardTutorProps {
  onNavigate: (route: string) => void;
  hijoSeleccionado?: number | null;
  onHijoChange?: (hijoId: number | null) => void;
}

export function DashboardTutor({ onNavigate, hijoSeleccionado, onHijoChange }: DashboardTutorProps) {
  // Usar el hijo seleccionado del estado global o por defecto el primero
  const alumnoSeleccionado = hijoSeleccionado || 1;
  const setAlumnoSeleccionado = (id: number) => {
    if (onHijoChange) {
      onHijoChange(id);
    }
  };
  
  const alumno = getAlumnoById(alumnoSeleccionado);
  const calificacionesAlumno = calificaciones.filter(c => c.alumnoId === alumnoSeleccionado);
  const asistenciasAlumno = asistencias.filter(a => a.alumnoId === alumnoSeleccionado);

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

  // Obtener grupo del alumno para filtrar
  const grupoId = alumno?.grupo === "2°B" ? 2 : alumno?.grupo === "3°A" ? 3 : 1;

  // Tareas del alumno
  const tareasAlumno = tareas.filter(t => t.grupoId === grupoId);
  const tareasPendientes = tareasAlumno.filter(t => {
    const entrega = t.entregas.find(e => e.alumnoId === alumnoSeleccionado);
    return entrega && entrega.estado === "Pendiente";
  }).length;

  // Próximos exámenes del alumno
  const proximosExamenes = examenes
    .filter(e => e.grupoId === grupoId)
    .sort((a, b) => {
      const dateA = a.fecha.split('/').reverse().join('');
      const dateB = b.fecha.split('/').reverse().join('');
      return dateA.localeCompare(dateB);
    })
    .slice(0, 3);

  // Próximas entregas de tareas
  const proximasEntregas = tareasAlumno
    .filter(t => {
      const entrega = t.entregas.find(e => e.alumnoId === alumnoSeleccionado);
      return entrega && entrega.estado === "Pendiente";
    })
    .sort((a, b) => {
      const dateA = a.fechaEntrega.split('/').reverse().join('');
      const dateB = b.fechaEntrega.split('/').reverse().join('');
      return dateA.localeCompare(dateB);
    })
    .slice(0, 3);

  // Eventos académicos (reuniones, juntas)
  const proximosEventos = eventosAcademicos
    .filter(e => e.destinatarios.includes("Tutor"))
    .sort((a, b) => {
      const dateA = a.fecha.split('/').reverse().join('');
      const dateB = b.fecha.split('/').reverse().join('');
      return dateA.localeCompare(dateB);
    })
    .slice(0, 3);

  // Últimas notificaciones (simulado)
  const notificaciones = [
    { id: 1, mensaje: "Nueva calificación en Matemáticas", fecha: "Hoy", leida: false },
    { id: 2, mensaje: "Recordatorio: Reunión con tutores", fecha: "Ayer", leida: false },
    { id: 3, mensaje: "Tarea entregada: Proyecto Ciencias", fecha: "15/11/2025", leida: true }
  ];

  const getTendencia = (promedio: number) => {
    if (promedio >= 9) return { icon: TrendingUp, color: "text-[#059669]", texto: "Excelente" };
    if (promedio >= 7) return { icon: Minus, color: "text-[#D97706]", texto: "Regular" };
    return { icon: TrendingDown, color: "text-[#E11D48]", texto: "Requiere atención" };
  };

  const tendencia = getTendencia(parseFloat(promedioActual));
  const TrendIcon = tendencia.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Información del alumno seleccionado */}
      {alumno && (
        <Card className="border-[#E5E7EB] bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#1D4ED8] rounded-full flex items-center justify-center text-white font-semibold text-xl flex-shrink-0 shadow-lg">
                {alumno.nombre.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1">
                <h3 className="text-[#111827]">{alumno.nombre}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="secondary" className="bg-white/80 text-[#000000]">
                    {alumno.grupo}
                  </Badge>
                  <span className="text-sm text-[#6B7280]">{alumno.grado}° Grado • Ciclo {alumno.ciclo}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Promedio general */}
        <Card className="border-[#E5E7EB] hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/dashboard/calificaciones")}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <GraduationCap className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <TrendIcon className={`h-5 w-5 ${tendencia.color}`} />
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Promedio General</p>
              <p className="text-3xl font-bold text-[#1D4ED8] mt-1">{promedioActual}</p>
              <p className={`text-xs ${tendencia.color} mt-2`}>{tendencia.texto}</p>
            </div>
          </CardContent>
        </Card>

        {/* Asistencia */}
        <Card className="border-[#E5E7EB] hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/dashboard/asistencia")}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-[#059669]" />
              </div>
              {porcentajeAsistencia >= 90 && (
                <Badge className="bg-green-100 text-[#059669]">Excelente</Badge>
              )}
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Asistencia</p>
              <p className="text-3xl font-bold text-[#059669] mt-1">{porcentajeAsistencia}%</p>
              <p className="text-xs text-[#6B7280] mt-2">{presentes} de {totalAsistencias} días</p>
            </div>
          </CardContent>
        </Card>

        {/* Tareas pendientes */}
        <Card className="border-[#E5E7EB] hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/dashboard/tareas")}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="h-6 w-6 text-[#D97706]" />
              </div>
              {tareasPendientes > 0 && (
                <Badge className="bg-amber-100 text-[#D97706]">Pendientes</Badge>
              )}
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Tareas Pendientes</p>
              <p className="text-3xl font-bold text-[#D97706] mt-1">{tareasPendientes}</p>
              <p className="text-xs text-[#6B7280] mt-2">Ver detalles →</p>
            </div>
          </CardContent>
        </Card>

        {/* Reportes */}
        <Card className="border-[#E5E7EB] hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/dashboard/reportes")}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-[#E11D48]" />
              </div>
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Reportes</p>
              <p className="text-3xl font-bold text-[#E11D48] mt-1">0</p>
              <p className="text-xs text-[#059669] mt-2">Sin incidentes</p>
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
              proximosEventos.map((evento) => (
                <div
                  key={evento.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-purple-50 to-white border border-purple-200 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs text-[#7C3AED]">
                      {evento.fecha.split('/')[1] === "11" ? "Nov" : "Dic"}
                    </span>
                    <span className="text-lg font-bold text-[#7C3AED]">
                      {evento.fecha.split('/')[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#111827] truncate">{evento.titulo}</h4>
                    <p className="text-xs text-[#6B7280] mt-1">
                      {evento.fecha} • {evento.horaInicio} - {evento.lugar}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-[#7C3AED]">
                    {evento.tipo}
                  </Badge>
                </div>
              ))
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
                proximosExamenes.map((examen) => {
                  const materia = getMateriaById(examen.materiaId);
                  return (
                    <div
                      key={examen.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-red-50 to-white border border-red-200 hover:shadow-md transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-red-200 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs text-[#E11D48]">
                          {examen.fecha.split('/')[1] === "11" ? "Nov" : "Dic"}
                        </span>
                        <span className="text-lg font-bold text-[#E11D48]">
                          {examen.fecha.split('/')[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#111827] truncate">{materia?.nombre}</h4>
                        <p className="text-xs text-[#6B7280] mt-1">
                          {examen.fecha} • {examen.horaInicio}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-red-100 text-[#E11D48]">
                        Examen
                      </Badge>
                    </div>
                  );
                })
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
                proximasEntregas.map((tarea) => {
                  const materia = getMateriaById(tarea.materiaId);
                  return (
                    <div
                      key={tarea.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-white border border-blue-200 hover:shadow-md transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col items-center justify-center flex-shrink-0">
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
                          {materia?.nombre} • {tarea.fechaEntrega}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-[#1D4ED8]">
                        Tarea
                      </Badge>
                    </div>
                  );
                })
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
                  <div className="w-2 h-2 bg-[#1D4ED8] rounded-full mt-2 flex-shrink-0" />
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
