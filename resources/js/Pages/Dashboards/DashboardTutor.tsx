import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../Components/ui/dialog";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Loader2,
  Mail,
  Plus,
  Users,
} from "lucide-react";
import type { PageProps } from "../../types";

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const TIPOS_EXAMEN = ["Parcial", "Final", "Extraordinario", "Examen"];

type CurpStatus = "idle" | "checking" | "exists" | "ok";

const PARENTESCO_OPCIONES = ["Padre", "Madre", "Abuelo", "Abuela", "Tío", "Tía", "Hermano", "Hermana", "Tutor legal", "Otro"];

const formAlumnoVacio = { nombre: "", apellidos: "", curp: "", fecha_nacimiento: "", sexo: "", parentesco: "" };

interface TareaData { id: number; titulo: string; materia: string | null; fechaEntrega: string; estadoEntrega: string; }
interface EventoData {
  id: number;
  fecha: string;
  titulo: string;
  descripcion: string | null;
  horaInicio: string | null;
  horaFin: string | null;
  tipo: string;
  materia: string | null;
  grupo: string | null;
}

interface DashboardTutorProps {
  onNavigate: (route: string) => void;
  hijoSeleccionado?: number | null;
  onHijoChange?: (hijoId: number | null) => void;
}

export function DashboardTutor({ onNavigate, hijoSeleccionado }: DashboardTutorProps) {
  const { auth, escuela } = usePage<PageProps>().props;
  const userName = auth.user?.name ?? "Tutor";
  const inscripcionesAbiertas = (escuela as any)?.registro_tutores_activo === true;

  const [tareasAlumno, setTareasAlumno] = useState<TareaData[]>([]);
  const [eventosAgenda, setEventosAgenda] = useState<EventoData[]>([]);
  const [circularesSinLeer, setCircularesSinLeer] = useState(0);
  const [notifsSinLeer, setNotifsSinLeer] = useState(0);

  // Solicitar nuevo alumno
  const [modalSolicitar, setModalSolicitar] = useState(false);
  const [formAlumno, setFormAlumno] = useState(formAlumnoVacio);
  const [savingAlumno, setSavingAlumno] = useState(false);
  const [curpStatus, setCurpStatus] = useState<CurpStatus>("idle");
  const [pendientes, setPendientes] = useState<{ id: number; nombre: string; parentesco: string }[]>([]);

  const checkCurp = useCallback(async (curp: string) => {
    if (curp.length !== 18) return;
    setCurpStatus("checking");
    try {
      const { data } = await axios.get("/api/check-curp", { params: { curp: curp.toUpperCase() } });
      setCurpStatus(data.exists ? "exists" : "ok");
    } catch {
      setCurpStatus("idle");
    }
  }, []);

  const cargarPendientes = () => {
    axios.get("/api/tutor/solicitudes-pendientes")
      .then(({ data }) => setPendientes(data.pendientes ?? []))
      .catch(() => {});
  };

  const handleSolicitar = () => {
    if (!formAlumno.nombre || !formAlumno.apellidos || !formAlumno.curp || !formAlumno.fecha_nacimiento || !formAlumno.sexo || !formAlumno.parentesco) return;
    setSavingAlumno(true);
    axios.post("/api/tutor/solicitar-alumno", { ...formAlumno, curp: formAlumno.curp.toUpperCase() })
      .then(() => {
        setModalSolicitar(false);
        setFormAlumno(formAlumnoVacio);
        setCurpStatus("idle");
        cargarPendientes();
      })
      .catch((err) => {
        const errors = err.response?.data?.errors;
        const msg = errors ? Object.values(errors).flat().join(" ") : (err.response?.data?.message ?? "Error al enviar la solicitud.");
        alert(msg);
      })
      .finally(() => setSavingAlumno(false));
  };

  useEffect(() => {
    if (!hijoSeleccionado) return;
    axios.get(`/api/tutor/tareas/${hijoSeleccionado}`)
      .then(({ data }) => setTareasAlumno(data.tareas ?? []))
      .catch(() => {});
  }, [hijoSeleccionado]);

  useEffect(() => {
    axios.get("/api/agenda/eventos")
      .then(({ data }) => setEventosAgenda(data.eventos ?? []))
      .catch(() => {});
    axios.get("/api/circulares")
      .then(({ data }) => setCircularesSinLeer((data.circulares ?? []).filter((c: { leida: boolean }) => !c.leida).length))
      .catch(() => {});
    axios.get("/api/notificaciones")
      .then(({ data }) => setNotifsSinLeer((data.notificaciones ?? []).filter((n: { leida: boolean }) => !n.leida).length))
      .catch(() => {});
    cargarPendientes();
  }, []);

  const tareasPendientes = tareasAlumno.filter(t => t.estadoEntrega === "Pendiente").length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next30 = new Date(today);
  next30.setDate(today.getDate() + 30);
  const eventosProximos = eventosAgenda
    .filter(e => { const d = new Date(e.fecha); return d >= today && d <= next30; })
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const proximosEventos = eventosProximos.filter(e => !TIPOS_EXAMEN.includes(e.tipo)).slice(0, 3);
  const proximosExamenes = eventosProximos.filter(e => TIPOS_EXAMEN.includes(e.tipo)).slice(0, 3);

  const proximasEntregas = tareasAlumno
    .filter(t => t.estadoEntrega === "Pendiente")
    .sort((a, b) => {
      const toISO = (s: string) => s.split('/').reverse().join('');
      return toISO(a.fechaEntrega).localeCompare(toISO(b.fechaEntrega));
    })
    .slice(0, 3);

  const formatFechaEvento = (fecha: string) => {
    const [, month, day] = fecha.split('-');
    return { dia: day, mes: MESES[parseInt(month) - 1] };
  };

  const formatFechaTarea = (fechaEntrega: string) => {
    const parts = fechaEntrega.split('/');
    return { dia: parts[0], mes: MESES[parseInt(parts[1]) - 1] };
  };

  const primerNombre = userName.split(" ")[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de bienvenida */}
      <Card className="bg-linear-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-7 w-7 text-[#1D4ED8]" />
              </div>
              <div>
                <h2 className="text-[#111827]">¡Bienvenido/a, {primerNombre}!</h2>
                <p className="text-sm text-[#6B7280] mt-1">
                  {notifsSinLeer > 0
                    ? `Tienes ${notifsSinLeer} notificación${notifsSinLeer > 1 ? "es" : ""} sin leer`
                    : "No tienes notificaciones pendientes"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                className="rounded-lg border-blue-200 text-[#1D4ED8] hover:bg-blue-50"
                onClick={() => onNavigate("#/notificaciones")}
              >
                <Bell className="h-4 w-4 mr-2" />
                Ver notificaciones
              </Button>
              {inscripcionesAbiertas && (
                <Button
                  className="rounded-lg text-white"
                  style={{ background: "var(--gradient-primary)" }}
                  onClick={() => setModalSolicitar(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Solicitar nuevo alumno
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Solicitudes pendientes */}
      {pendientes.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  {pendientes.length === 1 ? "Tienes una solicitud pendiente de aprobación:" : `Tienes ${pendientes.length} solicitudes pendientes de aprobación:`}
                </p>
                <ul className="mt-1 space-y-0.5">
                  {pendientes.map((p) => (
                    <li key={p.id} className="text-sm text-amber-700">
                      · {p.nombre} <span className="text-amber-500">({p.parentesco})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/notificaciones")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Bell className="h-6 w-6 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Notificaciones</p>
                <p className="text-2xl font-bold text-[#7C3AED]">{notifsSinLeer}</p>
                <p className="text-xs text-[#6B7280] mt-1">Sin leer</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-red-50 to-red-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/examenes")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <FileText className="h-6 w-6 text-[#E11D48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Exámenes próximos</p>
                <p className="text-2xl font-bold text-[#E11D48]">{proximosExamenes.length}</p>
                <p className="text-xs text-[#6B7280] mt-1">En los próximos 30 días</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/tareas")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Clock className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Tareas pendientes</p>
                <p className="text-2xl font-bold text-[#D97706]">{tareasPendientes}</p>
                <p className="text-xs text-[#6B7280] mt-1">Sin entregar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate("#/circulares")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Mail className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Circulares sin leer</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{circularesSinLeer}</p>
                <p className="text-xs text-[#6B7280] mt-1">Comunicados escolares</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eventos Académicos */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#7C3AED]" />
                Eventos Académicos
              </CardTitle>
              <CardDescription>Reuniones, juntas y eventos escolares próximos</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("#/agenda")}>
              Ver agenda
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {proximosEventos.length > 0 ? (
              proximosEventos.map((evento) => {
                const { dia, mes } = formatFechaEvento(evento.fecha);
                return (
                  <div
                    key={evento.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-linear-to-br from-purple-50 to-white border border-purple-200 hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 rounded-lg bg-linear-to-br from-purple-100 to-purple-200 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs text-[#7C3AED]">{mes}</span>
                      <span className="text-lg font-bold text-[#7C3AED]">{dia}</span>
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
                    <Badge variant="secondary" className="bg-purple-100 text-[#7C3AED] shrink-0">
                      {evento.tipo}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[#6B7280] text-center py-4">No hay eventos próximos</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dos columnas: Exámenes y Entregas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#E11D48]" />
              Próximos Exámenes
            </CardTitle>
            <CardDescription>Evaluaciones programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proximosExamenes.length > 0 ? (
                proximosExamenes.map((examen) => {
                  const { dia, mes } = formatFechaEvento(examen.fecha);
                  return (
                    <div
                      key={examen.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-linear-to-br from-red-50 to-white border border-red-200 hover:shadow-md transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-linear-to-br from-red-100 to-red-200 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs text-[#E11D48]">{mes}</span>
                        <span className="text-lg font-bold text-[#E11D48]">{dia}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#111827] truncate">{examen.titulo}</h4>
                        <p className="text-xs text-[#6B7280] mt-1">
                          {examen.materia && examen.materia !== "-" ? `${examen.materia} · ` : ""}
                          {examen.horaInicio ?? "Hora por confirmar"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-red-100 text-[#E11D48] shrink-0">
                        {examen.tipo}
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

        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[#1D4ED8]" />
              Próximas Entregas
            </CardTitle>
            <CardDescription>Tareas pendientes de tu hijo/a</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proximasEntregas.length > 0 ? (
                proximasEntregas.map((tarea) => {
                  const { dia, mes } = formatFechaTarea(tarea.fechaEntrega);
                  return (
                    <div
                      key={tarea.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-linear-to-br from-blue-50 to-white border border-blue-200 hover:shadow-md transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-100 to-blue-200 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs text-[#1D4ED8]">{mes}</span>
                        <span className="text-lg font-bold text-[#1D4ED8]">{dia}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#111827] truncate">{tarea.titulo}</h4>
                        <p className="text-xs text-[#6B7280] mt-1">
                          {tarea.materia} · {tarea.fechaEntrega}
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
      {/* Dialog: solicitar nuevo alumno */}
      <Dialog open={modalSolicitar} onOpenChange={(open) => { setModalSolicitar(open); if (!open) { setFormAlumno(formAlumnoVacio); setCurpStatus("idle"); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Solicitar registro de nuevo alumno</DialogTitle>
            <DialogDescription>El administrador validará la solicitud antes de activar el alumno.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nombre(s) *</Label>
                <Input value={formAlumno.nombre} onChange={(e) => setFormAlumno({ ...formAlumno, nombre: e.target.value })} className="h-10 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label>Apellidos *</Label>
                <Input value={formAlumno.apellidos} onChange={(e) => setFormAlumno({ ...formAlumno, apellidos: e.target.value })} className="h-10 rounded-lg" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>CURP *</Label>
              <div className="relative">
                <Input
                  value={formAlumno.curp}
                  maxLength={18}
                  onChange={(e) => { setFormAlumno({ ...formAlumno, curp: e.target.value.toUpperCase() }); setCurpStatus("idle"); }}
                  onBlur={() => checkCurp(formAlumno.curp)}
                  className={`h-10 rounded-lg pr-9 ${curpStatus === "exists" ? "border-red-500" : curpStatus === "ok" ? "border-green-500" : ""}`}
                />
                {curpStatus === "checking" && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-gray-400" />}
                {curpStatus === "ok"       && <CheckCircle2 className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />}
                {curpStatus === "exists"   && <AlertCircle  className="absolute right-3 top-2.5 w-4 h-4 text-red-500" />}
              </div>
              {curpStatus === "exists" && <p className="text-xs text-red-500">Este CURP ya está registrado.</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fecha de nacimiento *</Label>
                <Input type="date" value={formAlumno.fecha_nacimiento} onChange={(e) => setFormAlumno({ ...formAlumno, fecha_nacimiento: e.target.value })} className="h-10 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label>Sexo *</Label>
                <Select value={formAlumno.sexo} onValueChange={(v) => setFormAlumno({ ...formAlumno, sexo: v, parentesco: "" })}>
                  <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="No especificado">No especificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Parentesco *</Label>
              <Select value={formAlumno.parentesco} onValueChange={(v) => setFormAlumno({ ...formAlumno, parentesco: v })}>
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {PARENTESCO_OPCIONES.map((op) => (
                    <SelectItem key={op} value={op}>{op}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalSolicitar(false)}>Cancelar</Button>
            <Button
              onClick={handleSolicitar}
              disabled={savingAlumno || curpStatus === "exists" || !formAlumno.nombre || !formAlumno.apellidos || !formAlumno.curp || !formAlumno.fecha_nacimiento || !formAlumno.sexo || !formAlumno.parentesco}
              className="text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              {savingAlumno ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando…</> : "Enviar solicitud"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
