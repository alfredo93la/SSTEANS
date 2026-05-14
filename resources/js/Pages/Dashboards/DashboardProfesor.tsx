import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import {
  Users,
  Calendar,
  ClipboardCheck,
  FileText,
  AlertCircle,
} from "lucide-react";
import type { PageProps } from "../../types";

interface GrupoData {
  id: number;
  nombre: string;
  turno: string;
  alumnos: number;
}

interface ClaseHorario {
  id: number;
  grupoId: number;
  grupo: string;
  materiaId: number;
  materia: string;
  horaInicio: string;
  horaFin: string;
  salon: string;
  diaSemana: string;
}

interface TareaData {
  id: number;
  titulo: string;
  grupo: string | null;
  grupoId: number;
  fechaEntrega: string;
  entregadasCount: number;
  totalAlumnos: number;
}

interface DashboardProfesorProps {
  onNavigate: (route: string) => void;
}

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function fechaHoyLabel(): string {
  const d = new Date();
  return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

function diasHastaVencimiento(fechaEntrega: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  // fechaEntrega puede venir en formato "dd/mm/yyyy" o "yyyy-mm-dd"
  let fecha: Date;
  if (fechaEntrega.includes("/")) {
    const [d, m, y] = fechaEntrega.split("/");
    fecha = new Date(Number(y), Number(m) - 1, Number(d));
  } else {
    const [y, m, d] = fechaEntrega.split("-");
    fecha = new Date(Number(y), Number(m) - 1, Number(d));
  }
  return Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

export function DashboardProfesor({ onNavigate }: DashboardProfesorProps) {
  const { auth } = usePage<PageProps>().props;
  const userName = auth.user?.name ?? "Profesor";
  const userRole = auth.user?.role ?? "Profesor";

  const [grupos, setGrupos] = useState<GrupoData[]>([]);
  const [clasesHoy, setClasesHoy] = useState<ClaseHorario[]>([]);
  const [tareas, setTareas] = useState<TareaData[]>([]);

  useEffect(() => {
    const diaSemanaHoy = DIAS_SEMANA[new Date().getDay()];

    Promise.all([
      axios.get("/api/profesor/grupos"),
      axios.get("/api/profesor/horario"),
      axios.get("/api/tareas"),
    ])
      .then(([gruposRes, horarioRes, tareasRes]) => {
        setGrupos(gruposRes.data.grupos ?? []);

        const horario: ClaseHorario[] = horarioRes.data.horario ?? [];
        const hoy = horario
          .filter((c) => c.diaSemana === diaSemanaHoy)
          .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
        setClasesHoy(hoy);

        setTareas(tareasRes.data.tareas ?? []);
      })
      .catch(() => {});
  }, []);

  const totalAlumnos = grupos.reduce((sum, g) => sum + (g.alumnos ?? 0), 0);

  const tareasProximas = [...tareas]
    .filter((t) => t.totalAlumnos === 0 || t.entregadasCount < t.totalAlumnos)
    .sort((a, b) => {
      const da = diasHastaVencimiento(a.fechaEntrega);
      const db = diasHastaVencimiento(b.fechaEntrega);
      return da - db;
    })
    .slice(0, 3);

  const pendientes = tareas
    .filter((t) => {
      const pct = t.totalAlumnos > 0 ? (t.entregadasCount / t.totalAlumnos) * 100 : 0;
      return pct < 80;
    })
    .sort((a, b) => diasHastaVencimiento(a.fechaEntrega) - diasHastaVencimiento(b.fechaEntrega))
    .slice(0, 5)
    .map((t) => {
      const pct = t.totalAlumnos > 0 ? (t.entregadasCount / t.totalAlumnos) * 100 : 0;
      const dias = diasHastaVencimiento(t.fechaEntrega);
      return {
        tipo: "Tarea",
        descripcion: `${t.grupo ? t.grupo + ": " : ""}${t.titulo} — ${t.totalAlumnos - t.entregadasCount} sin entregar`,
        urgente: pct < 50 || dias <= 2,
      };
    });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de bienvenida */}
      <Card className="bg-linear-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div>
            <h2 className="text-[#111827]">¡Bienvenido/a, {userName}!</h2>
            <p className="text-sm text-[#6B7280] mt-1 flex items-center gap-2 flex-wrap">
              <Badge className="bg-purple-100 text-[#7C3AED] border-0 text-xs">{userRole}</Badge>
              Registro de asistencia, calificaciones y tareas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="border-[#E5E7EB] bg-linear-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onNavigate("#/horario")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Users className="h-6 w-6 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Grupos Asignados</p>
                <p className="text-2xl font-bold text-[#7C3AED]">{grupos.length}</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  {totalAlumnos > 0 ? `${totalAlumnos} alumnos total` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onNavigate("#/horario")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Calendar className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Sesiones Hoy</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{clasesHoy.length}</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  {clasesHoy[0] ? `Próxima: ${clasesHoy[0].horaInicio}` : "Sin sesiones"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onNavigate("#/tareas")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <FileText className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Tareas Activas</p>
                <p className="text-2xl font-bold text-[#D97706]">{tareas.length}</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  {tareasProximas.filter((t) => diasHastaVencimiento(t.fechaEntrega) <= 7).length} vencen esta semana
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-red-50 to-red-100 hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <AlertCircle className="h-6 w-6 text-[#E11D48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Pendientes</p>
                <p className="text-2xl font-bold text-[#E11D48]">{pendientes.length}</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  {pendientes.filter((p) => p.urgente).length} urgentes
                </p>
              </div>
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
            <CardDescription>{fechaHoyLabel()}</CardDescription>
          </CardHeader>
          <CardContent>
            {clasesHoy.length === 0 ? (
              <div className="text-center py-8 text-[#6B7280]">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay sesiones programadas para hoy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clasesHoy.map((clase) => (
                  <div
                    key={clase.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-linear-to-br from-gray-50 to-white border border-[#E5E7EB] hover:shadow-md transition-all"
                  >
                    <div className="shrink-0 w-16 text-center">
                      <p className="text-xs text-[#6B7280]">Hora</p>
                      <p className="text-sm font-semibold text-[#111827]">{clase.horaInicio}</p>
                    </div>
                    <div className="w-px h-12 bg-gray-200" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#111827]">{clase.materia}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {clase.grupo}
                        </Badge>
                        {clase.salon && (
                          <span className="text-xs text-[#6B7280]">Aula {clase.salon}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onNavigate("#/asistencia")}
                      title="Registrar asistencia"
                    >
                      <ClipboardCheck className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tareas por revisar */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tareas por Revisar</CardTitle>
                <CardDescription>Entregas pendientes de revisión</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("#/tareas")}>
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tareasProximas.length === 0 ? (
              <div className="text-center py-8 text-[#6B7280]">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay tareas activas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tareasProximas.map((tarea) => {
                  const porcentaje =
                    tarea.totalAlumnos > 0
                      ? Math.round((tarea.entregadasCount / tarea.totalAlumnos) * 100)
                      : 0;
                  return (
                    <div
                      key={tarea.id}
                      className="p-3 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all cursor-pointer"
                      onClick={() => onNavigate("#/tareas")}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-[#111827] text-sm">{tarea.titulo}</h4>
                          <p className="text-xs text-[#6B7280] mt-1">
                            {tarea.grupo} • Vence: {tarea.fechaEntrega}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            porcentaje >= 80
                              ? "bg-green-100 text-[#059669]"
                              : "bg-amber-100 text-[#D97706]"
                          }
                        >
                          {porcentaje}%
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
                          <span>
                            {tarea.entregadasCount} de {tarea.totalAlumnos} entregadas
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              porcentaje >= 80 ? "bg-[#059669]" : "bg-[#D97706]"
                            }`}
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
