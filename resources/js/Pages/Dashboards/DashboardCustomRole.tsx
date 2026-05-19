import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import {
  Users, GraduationCap, UserCheck,
  AlertCircle, CheckCircle2, CalendarDays, Mail, LayoutDashboard,
} from "lucide-react";

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

interface GrupoData {
  id: number;
  nombre: string;
  asignaciones_count: number;
  cicloEscolar?: { id: number; nombre: string } | null;
  grado?: { id: number; numero: number } | null;
}
interface AlumnoData {
  id: number;
  tiene_tutor: boolean;
  persona?: { nombre: string; apellidos: string } | null;
  asignaciones?: Array<{
    grupo?: { nombre: string; grado?: { numero: number } | null } | null;
  }> | null;
}
interface EventoData {
  id: number;
  fecha: string;
  titulo: string;
  horaInicio: string | null;
  horaFin: string | null;
  tipo: string;
  grupo: string | null;
}
interface CicloData { id: number; nombre: string; activo: boolean; }
interface CircularData {
  id: number;
  titulo: string;
  categoria: string;
  prioridad: string;
  fechaPublicacion: string;
}

interface Props {
  onNavigate: (route: string) => void;
  userRole: string;
  userName: string;
  permissions: string[];
}

export function DashboardCustomRole({ onNavigate, userRole, userName, permissions }: Props) {
  const has = (perm: string) => permissions.includes(perm);

  const [alumnos, setAlumnos] = useState<AlumnoData[]>([]);
  const [grupos, setGrupos] = useState<GrupoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cicloActivo, setCicloActivo] = useState<CicloData | null>(null);
  const [eventosAgenda, setEventosAgenda] = useState<EventoData[]>([]);
  const [ultimasCirculares, setUltimasCirculares] = useState<CircularData[]>([]);

  useEffect(() => {
    const fetches: Promise<void>[] = [];

    if (has("alumnos.manage") || has("tutores.manage")) {
      fetches.push(
        axios.get("/api/administrativo/alumnos")
          .then(({ data }) => setAlumnos(data.alumnos ?? []))
          .catch(() => {}),
      );
    }
    if (has("grupos.manage")) {
      fetches.push(
        axios.get("/api/administrativo/grupos")
          .then(({ data }) => setGrupos(data.grupos ?? []))
          .catch(() => {}),
      );
    }
    if (has("agenda.manage")) {
      axios.get("/api/agenda/eventos").then(({ data }) => setEventosAgenda(data.eventos ?? [])).catch(() => {});
    }
    if (has("circulares.manage")) {
      axios.get("/api/circulares").then(({ data }) => setUltimasCirculares((data.circulares ?? []).slice(0, 4))).catch(() => {});
    }
    axios.get("/api/ciclo-activo").then(({ data }) => setCicloActivo(data.ciclo_activo ?? null)).catch(() => {});

    Promise.all(fetches).finally(() => setLoading(false));
  }, []);

  const totalAlumnos = alumnos.length;
  const totalGrupos = grupos.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next30 = new Date(today);
  next30.setDate(today.getDate() + 30);
  const proximosEventos = eventosAgenda
    .filter(e => { const d = new Date(e.fecha); return d >= today && d <= next30; })
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 4);

  const formatFechaEvento = (fecha: string) => {
    const [, month, day] = fecha.split('-');
    return { dia: day, mes: MESES[parseInt(month) - 1] };
  };

  const sinTutor = alumnos.filter(a => !a.tiene_tutor).sort((a, b) => {
    const ap = (a.persona?.apellidos ?? "").localeCompare(b.persona?.apellidos ?? "", "es");
    return ap !== 0 ? ap : (a.persona?.nombre ?? "").localeCompare(b.persona?.nombre ?? "", "es");
  });
  const alumnosSinTutor = sinTutor.length;

  const resumenGrupos = grupos.slice(0, 5).map(g => ({
    id: g.id,
    nombre: g.grado ? `${g.grado.numero}°${g.nombre}` : g.nombre,
    ciclo: g.cicloEscolar?.nombre ?? "",
    alumnos: g.asignaciones_count ?? 0,
  }));

  const pendientesList = [
    ...(has("tutores.manage") && alumnosSinTutor > 0
      ? [{ tarea: `${alumnosSinTutor} alumno${alumnosSinTutor !== 1 ? "s" : ""} sin tutor vinculado`, urgente: true }]
      : []),
    ...(has("grupos.manage") && !cicloActivo && !loading
      ? [{ tarea: "No hay ciclo escolar activo configurado", urgente: true }]
      : []),
    ...(has("grupos.manage") && totalGrupos === 0 && !loading && cicloActivo
      ? [{ tarea: "No hay grupos creados para el ciclo activo", urgente: false }]
      : []),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de bienvenida */}
      <Card className="bg-linear-to-br from-blue-50 to-purple-50 border-blue-100">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <LayoutDashboard className="h-7 w-7 text-[#1D4ED8]" />
            </div>
            <div>
              <h2 className="text-[#111827]">¡Bienvenido/a, {userName}!</h2>
              <p className="text-sm text-[#6B7280] mt-1 flex items-center gap-2 flex-wrap">
                <Badge className="bg-[#DBEAFE] text-[#1D4ED8] border-0 text-xs">{userRole}</Badge>
                Acceso según permisos asignados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {has("alumnos.manage") && (
          <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/alumnos")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl"><GraduationCap className="h-6 w-6 text-[#1D4ED8]" /></div>
                <div>
                  <p className="text-sm text-[#6B7280]">Total alumnos</p>
                  <p className="text-2xl font-bold text-[#1D4ED8]">{loading ? "—" : totalAlumnos}</p>
                  <p className="text-xs text-[#6B7280] mt-1">Inscritos en el sistema</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {has("grupos.manage") && (
          <Card className="border-[#E5E7EB] bg-linear-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/asignar-alumnos")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl"><Users className="h-6 w-6 text-[#7C3AED]" /></div>
                <div>
                  <p className="text-sm text-[#6B7280]">Grupos activos</p>
                  <p className="text-2xl font-bold text-[#7C3AED]">{loading ? "—" : totalGrupos}</p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    {cicloActivo ? `Ciclo ${cicloActivo.nombre}` : "Sin ciclo activo"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {has("tutores.manage") && (
          <Card className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/alumnos")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl"><UserCheck className="h-6 w-6 text-[#D97706]" /></div>
                <div>
                  <p className="text-sm text-[#6B7280]">Sin tutor</p>
                  <p className="text-2xl font-bold text-[#D97706]">
                    {loading ? "—" : alumnosSinTutor}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">Alumnos sin tutor vinculado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {has("agenda.manage") && (
          <Card className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-green-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/agenda")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl"><CalendarDays className="h-6 w-6 text-[#059669]" /></div>
                <div>
                  <p className="text-sm text-[#6B7280]">Eventos próximos</p>
                  <p className="text-2xl font-bold text-[#059669]">{proximosEventos.length}</p>
                  <p className="text-xs text-[#6B7280] mt-1">En los próximos 30 días</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Grupos del ciclo + Alumnos sin tutor */}
      {(has("grupos.manage") || has("tutores.manage")) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {has("grupos.manage") && (
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Grupos del Ciclo</CardTitle>
                    <CardDescription>Distribución de alumnos por grupo</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={() => onNavigate("#/asignar-alumnos")}>
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
          )}

          {has("tutores.manage") && (
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Alumnos Sin Tutor</CardTitle>
                    <CardDescription>Pendientes de vincular con un tutor</CardDescription>
                  </div>
                  {sinTutor.length > 0 && (
                    <Button variant="outline" size="sm" className="rounded-lg" onClick={() => onNavigate("#/tutores")}>
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
                        <div key={alumno.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100">
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
          )}
        </div>
      )}

      {/* Agenda y Circulares */}
      {(has("agenda.manage") || has("circulares.manage")) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {has("agenda.manage") && (
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-[#059669]" />
                      Agenda Escolar
                    </CardTitle>
                    <CardDescription>Eventos y actividades próximos</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onNavigate("#/agenda")}>Ver agenda</Button>
                </div>
              </CardHeader>
              <CardContent>
                {proximosEventos.length === 0 ? (
                  <div className="text-center py-8 text-[#6B7280]">
                    <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No hay eventos en los próximos 30 días</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {proximosEventos.map(evento => {
                      const { dia, mes } = formatFechaEvento(evento.fecha);
                      return (
                        <div key={evento.id} className="flex items-center gap-3 p-3 rounded-lg bg-linear-to-br from-green-50 to-white border border-green-200 hover:shadow-md transition-all">
                          <div className="w-12 h-12 rounded-lg bg-linear-to-br from-green-100 to-green-200 flex flex-col items-center justify-center shrink-0">
                            <span className="text-xs text-[#059669]">{mes}</span>
                            <span className="text-lg font-bold text-[#059669]">{dia}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[#111827] truncate">{evento.titulo}</h4>
                            <p className="text-xs text-[#6B7280] mt-1">
                              {evento.horaInicio
                                ? `${evento.horaInicio}${evento.horaFin ? ` – ${evento.horaFin}` : ""}`
                                : "Todo el día"}
                              {evento.grupo && evento.grupo !== "General" ? ` · ${evento.grupo}` : ""}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-[#059669] shrink-0">
                            {evento.tipo}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {has("circulares.manage") && (
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-[#0284C7]" />
                      Circulares Recientes
                    </CardTitle>
                    <CardDescription>Últimas comunicaciones emitidas</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onNavigate("#/circulares")}>Ver todas</Button>
                </div>
              </CardHeader>
              <CardContent>
                {ultimasCirculares.length === 0 ? (
                  <div className="text-center py-8 text-[#6B7280]">
                    <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No hay circulares publicadas</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ultimasCirculares.map(c => (
                      <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#111827] truncate">{c.titulo}</p>
                          <p className="text-xs text-[#6B7280] mt-0.5">{c.fechaPublicacion}</p>
                        </div>
                        <Badge className={
                          c.prioridad === "alta"
                            ? "bg-red-100 text-red-700 border-0 shrink-0"
                            : c.prioridad === "media"
                              ? "bg-amber-100 text-amber-700 border-0 shrink-0"
                              : "bg-gray-100 text-gray-600 border-0 shrink-0"
                        }>
                          {c.categoria}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pendientes */}
      {pendientesList.length > 0 && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Pendientes</CardTitle>
            <CardDescription>Situaciones que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendientesList.map((item, idx) => (
                <div key={idx} className={`p-3 rounded-lg border transition-all ${item.urgente ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
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
