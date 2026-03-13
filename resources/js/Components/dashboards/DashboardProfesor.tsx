import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { 
  Users, 
  Calendar, 
  ClipboardCheck, 
  BookOpen,
  FileText,
  AlertCircle,
  TrendingUp,
  Home,
  Edit,
  Send,
  CalendarDays
} from "lucide-react";
import { RegistrarCalificaciones } from "../profesor/RegistrarCalificaciones";
import { ControlAsistencia } from "../profesor/ControlAsistencia";
import { AsignarTarea } from "../profesor/AsignarTarea";
import { GestionarTareas } from "../profesor/GestionarTareas";
import { MensajeriaProfesor } from "../profesor/MensajeriaProfesor";
import { HorarioDocente } from "../profesor/HorarioDocente";

interface DashboardProfesorProps {
  onNavigate: (route: string) => void;
}

export function DashboardProfesor({ onNavigate }: DashboardProfesorProps) {
  const [tabActiva, setTabActiva] = useState("general");

  // Datos simulados para el profesor
  const gruposAsignados = [
    { id: 1, nombre: "1°A", alumnos: 28, materia: "Matemáticas" },
    { id: 2, nombre: "2°B", alumnos: 30, materia: "Matemáticas" },
    { id: 3, nombre: "3°A", alumnos: 25, materia: "Física" }
  ];

  const sesionesHoy = [
    { hora: "08:00 - 09:00", grupo: "1°A", materia: "Matemáticas", aula: "201" },
    { hora: "10:00 - 11:00", grupo: "2°B", materia: "Matemáticas", aula: "203" },
    { hora: "13:00 - 14:00", grupo: "3°A", materia: "Física", aula: "Lab 1" }
  ];

  const tareasProximasAVencer = [
    { grupo: "1°A", titulo: "Ejercicios unidad 3", vence: "20/11/2025", entregadas: 18, total: 28 },
    { grupo: "2°B", titulo: "Proyecto final", vence: "22/11/2025", entregadas: 25, total: 30 },
    { grupo: "3°A", titulo: "Reporte laboratorio", vence: "25/11/2025", entregadas: 20, total: 25 }
  ];

  const pendientes = [
    { tipo: "Calificaciones", descripcion: "Registrar calificaciones parciales 2°B", urgente: true },
    { tipo: "Asistencia", descripcion: "Confirmar asistencia del viernes", urgente: false },
    { tipo: "Observaciones", descripcion: "Revisar observaciones pendientes", urgente: false }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de bienvenida */}
      <Card className="border-[#E5E7EB] bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[#111827]">
                ¡Buen día, Profesor!
              </h2>
              <p className="text-sm text-[#6B7280] mt-1">
                Tienes {sesionesHoy.length} sesiones programadas hoy
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB] hover:shadow-lg transition-all cursor-pointer" onClick={() => setTabActiva("horario")}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-[#7C3AED]" />
              </div>
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Grupos Asignados</p>
              <p className="text-3xl font-bold text-[#7C3AED] mt-1">{gruposAsignados.length}</p>
              <p className="text-xs text-[#6B7280] mt-2">
                {gruposAsignados.reduce((sum, g) => sum + g.alumnos, 0)} alumnos total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] hover:shadow-lg transition-all cursor-pointer" onClick={() => setTabActiva("horario")}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="h-6 w-6 text-[#1D4ED8]" />
              </div>
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Sesiones Hoy</p>
              <p className="text-3xl font-bold text-[#1D4ED8] mt-1">{sesionesHoy.length}</p>
              <p className="text-xs text-[#6B7280] mt-2">Próxima: {sesionesHoy[0]?.hora}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] hover:shadow-lg transition-all cursor-pointer" onClick={() => setTabActiva("gestionar-tareas")}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <FileText className="h-6 w-6 text-[#D97706]" />
              </div>
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Tareas Activas</p>
              <p className="text-3xl font-bold text-[#D97706] mt-1">{tareasProximasAVencer.length}</p>
              <p className="text-xs text-[#6B7280] mt-2">Por vencer esta semana</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-[#E11D48]" />
              </div>
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Pendientes</p>
              <p className="text-3xl font-bold text-[#E11D48] mt-1">{pendientes.length}</p>
              <p className="text-xs text-[#6B7280] mt-2">
                {pendientes.filter(p => p.urgente).length} urgentes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sesiones de hoy */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Sesiones de Hoy</CardTitle>
            <CardDescription>Miércoles, 27 de noviembre 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sesionesHoy.map((sesion, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-[#E5E7EB] hover:shadow-md transition-all"
                >
                  <div className="flex-shrink-0 w-16 text-center">
                    <p className="text-xs text-[#6B7280]">Hora</p>
                    <p className="text-sm font-semibold text-[#111827]">{sesion.hora.split(' - ')[0]}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#111827]">{sesion.materia}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {sesion.grupo}
                      </Badge>
                      <span className="text-xs text-[#6B7280]">Aula {sesion.aula}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setTabActiva("asistencia")}>
                    <ClipboardCheck className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tareas próximas a vencer */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tareas por Vencer</CardTitle>
                <CardDescription>Seguimiento de entregas</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setTabActiva("gestionar-tareas")}>
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tareasProximasAVencer.map((tarea, idx) => {
                const porcentaje = Math.round((tarea.entregadas / tarea.total) * 100);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setTabActiva("gestionar-tareas")}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-[#111827] text-sm">{tarea.titulo}</h4>
                        <p className="text-xs text-[#6B7280] mt-1">{tarea.grupo} • Vence: {tarea.vence}</p>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={porcentaje >= 80 ? "bg-green-100 text-[#059669]" : "bg-amber-100 text-[#D97706]"}
                      >
                        {porcentaje}%
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
                        <span>{tarea.entregadas} de {tarea.total} entregadas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${porcentaje >= 80 ? "bg-[#059669]" : "bg-[#D97706]"}`}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grupos asignados y pendientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grupos asignados */}
        <Card className="border-[#E5E7EB] lg:col-span-2">
          <CardHeader>
            <CardTitle>Mis Grupos</CardTitle>
            <CardDescription>Grupos bajo tu responsabilidad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {gruposAsignados.map((grupo) => (
                <button
                  key={grupo.id}
                  onClick={() => setTabActiva("horario")}
                  className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 hover:shadow-lg transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#1D4ED8] rounded-lg flex items-center justify-center text-white font-bold">
                      {grupo.nombre.split('°')[0]}
                    </div>
                    <TrendingUp className="h-5 w-5 text-[#059669]" />
                  </div>
                  <h4 className="font-semibold text-[#111827]">{grupo.nombre}</h4>
                  <p className="text-sm text-[#6B7280] mt-1">{grupo.materia}</p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-purple-200">
                    <Users className="h-4 w-4 text-[#7C3AED]" />
                    <span className="text-sm font-medium text-[#7C3AED]">{grupo.alumnos} alumnos</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pendientes */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Por Hacer</CardTitle>
            <CardDescription>Tareas pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendientes.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                    item.urgente 
                      ? "bg-red-50 border-red-200" 
                      : "bg-white border-[#E5E7EB]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {item.urgente && (
                      <AlertCircle className="h-4 w-4 text-[#E11D48] flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[#7C3AED]">{item.tipo}</p>
                      <p className="text-sm text-[#111827] mt-1">{item.descripcion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              onClick={() => setTabActiva("asistencia")}
            >
              <ClipboardCheck className="h-6 w-6 text-[#1D4ED8]" />
              <span className="text-sm">Registrar Asistencia</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => setTabActiva("calificaciones")}
            >
              <BookOpen className="h-6 w-6 text-[#7C3AED]" />
              <span className="text-sm">Calificaciones</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => setTabActiva("asignar-tarea")}
            >
              <FileText className="h-6 w-6 text-[#D97706]" />
              <span className="text-sm">Asignar Tarea</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => setTabActiva("mensajeria")}
            >
              <Send className="h-6 w-6 text-[#E11D48]" />
              <span className="text-sm">Enviar Notificación</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}