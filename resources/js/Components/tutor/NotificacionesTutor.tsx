import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Mail, MailOpen, Bell, Calendar, FileText, CheckCircle } from "lucide-react";
import { PageTitle } from "../PageTitle";

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  hora: string;
  leida: boolean;
  categoria: "Académico" | "Administrativo" | "Evento" | "Conducta";
  prioridad: "Alta" | "Media" | "Baja";
  remitente: string;
}

interface NotificacionesTutorProps {
  alumnoId: number;
}

export function NotificacionesTutor({ alumnoId }: NotificacionesTutorProps) {
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState<Notificacion | null>(null);
  const [dialogAbierto, setDialogAbierto] = useState(false);

  // Datos de ejemplo de notificaciones
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([
    {
      id: 1,
      titulo: "Nueva calificación registrada",
      mensaje: "Se ha registrado una nueva calificación en la materia de Matemáticas. El alumno obtuvo 8.5 en el examen del segundo parcial. Se recomienda continuar con el apoyo en casa.",
      fecha: "27/11/2025",
      hora: "10:30",
      leida: false,
      categoria: "Académico",
      prioridad: "Media",
      remitente: "Prof. García"
    },
    {
      id: 2,
      titulo: "Recordatorio: Reunión de tutores",
      mensaje: "Le recordamos que el próximo viernes 29 de noviembre se llevará a cabo la reunión trimestral de tutores. La cita es a las 16:00 hrs en el aula de reuniones del plantel.",
      fecha: "26/11/2025",
      hora: "14:15",
      leida: false,
      categoria: "Evento",
      prioridad: "Alta",
      remitente: "Dirección Académica"
    },
    {
      id: 3,
      titulo: "Tarea entregada",
      mensaje: "Su hijo entregó exitosamente la tarea 'Guía ejercicios 5-7' de la materia de Matemáticas el día 09/11/2025.",
      fecha: "25/11/2025",
      hora: "16:45",
      leida: true,
      categoria: "Académico",
      prioridad: "Baja",
      remitente: "Sistema Escolar"
    },
    {
      id: 4,
      titulo: "Próximo vencimiento de tarea",
      mensaje: "La tarea 'Lectura capítulo 3' de Español vence el 12/11/2025. Recuerde apoyar a su hijo para completarla a tiempo.",
      fecha: "24/11/2025",
      hora: "09:00",
      leida: true,
      categoria: "Académico",
      prioridad: "Media",
      remitente: "Sistema Escolar"
    },
    {
      id: 5,
      titulo: "Actualización de calendario escolar",
      mensaje: "Se ha actualizado el calendario escolar con nuevas fechas importantes. Le sugerimos revisarlo en la sección de Agenda.",
      fecha: "23/11/2025",
      hora: "11:20",
      leida: true,
      categoria: "Administrativo",
      prioridad: "Baja",
      remitente: "Secretaría Académica"
    },
    {
      id: 6,
      titulo: "Excelente comportamiento",
      mensaje: "Nos complace informarle que su hijo ha mostrado un comportamiento ejemplar durante este mes. ¡Felicidades!",
      fecha: "20/11/2025",
      hora: "13:30",
      leida: true,
      categoria: "Conducta",
      prioridad: "Media",
      remitente: "Prof. Ortega"
    }
  ]);

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones.filter((notif) => {
    const cumpleEstado = filtroEstado === "todas" ||
      (filtroEstado === "no_leidas" && !notif.leida) ||
      (filtroEstado === "leidas" && notif.leida);
    
    const cumpleCategoria = filtroCategoria === "todas" || notif.categoria === filtroCategoria;
    
    return cumpleEstado && cumpleCategoria;
  });

  // Estadísticas
  const totalNotificaciones = notificaciones.length;
  const noLeidas = notificaciones.filter((n) => !n.leida).length;
  const leidas = notificaciones.filter((n) => n.leida).length;

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "Académico":
        return "bg-blue-100 text-[#1D4ED8]";
      case "Administrativo":
        return "bg-purple-100 text-[#7C3AED]";
      case "Evento":
        return "bg-amber-100 text-[#D97706]";
      case "Conducta":
        return "bg-green-100 text-[#059669]";
      default:
        return "bg-gray-100 text-[#6B7280]";
    }
  };

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case "Alta":
        return "bg-[#E11D48] text-white";
      case "Media":
        return "bg-[#D97706] text-white";
      case "Baja":
        return "bg-[#6B7280] text-white";
      default:
        return "bg-gray-100 text-[#6B7280]";
    }
  };

  const marcarComoLeida = (id: number) => {
    setNotificaciones(
      notificaciones.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  };

  const marcarTodasComoLeidas = () => {
    setNotificaciones(notificaciones.map((n) => ({ ...n, leida: true })));
  };

  const verDetalle = (notificacion: Notificacion) => {
    setNotificacionSeleccionada(notificacion);
    setDialogAbierto(true);
    if (!notificacion.leida) {
      marcarComoLeida(notificacion.id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageTitle
        icon={Bell}
        title="Notificaciones"
        description="Bandeja de entrada de mensajes y avisos escolares"
        color="bg-[#059669]"
      >
        {noLeidas > 0 && (
          <Button variant="outline" onClick={marcarTodasComoLeidas}>
            Marcar todas como leídas
          </Button>
        )}
      </PageTitle>

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Estado</label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las notificaciones</SelectItem>
                  <SelectItem value="no_leidas">No leídas</SelectItem>
                  <SelectItem value="leidas">Leídas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Categoría</label>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  <SelectItem value="Académico">Académico</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                  <SelectItem value="Evento">Evento</SelectItem>
                  <SelectItem value="Conducta">Conducta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Bell className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{totalNotificaciones}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Mail className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">No Leídas</p>
                <p className="text-2xl font-bold text-[#D97706]">{noLeidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <MailOpen className="h-6 w-6 text-[#059669]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Leídas</p>
                <p className="text-2xl font-bold text-[#059669]">{leidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-3">
        {notificacionesFiltradas.length === 0 ? (
          <Card className="border-[#E5E7EB]">
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
              <p className="text-[#6B7280]">No hay notificaciones que coincidan con los filtros</p>
            </CardContent>
          </Card>
        ) : (
          notificacionesFiltradas.map((notif) => (
            <Card
              key={notif.id}
              className={`border-[#E5E7EB] hover:shadow-lg transition-all cursor-pointer ${
                !notif.leida ? "bg-blue-50 border-blue-200" : "bg-white"
              }`}
              onClick={() => verDetalle(notif)}
            >
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Indicador de lectura */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      !notif.leida ? "bg-blue-100" : "bg-gray-100"
                    }`}>
                      {!notif.leida ? (
                        <Mail className="h-6 w-6 text-[#1D4ED8]" />
                      ) : (
                        <MailOpen className="h-6 w-6 text-[#6B7280]" />
                      )}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <h3 className={`font-semibold text-[#111827] ${!notif.leida ? "font-bold" : ""}`}>
                        {notif.titulo}
                      </h3>
                      <div className="flex items-center gap-2">
                        {notif.prioridad !== "Baja" && (
                          <Badge className={getPrioridadBadge(notif.prioridad)}>
                            {notif.prioridad}
                          </Badge>
                        )}
                        {!notif.leida && (
                          <div className="w-2 h-2 bg-[#1D4ED8] rounded-full" />
                        )}
                      </div>
                    </div>

                    <p className={`text-sm text-[#6B7280] line-clamp-2 mb-3 ${!notif.leida ? "font-medium" : ""}`}>
                      {notif.mensaje}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
                      <Badge variant="secondary" className={getCategoriaColor(notif.categoria)}>
                        {notif.categoria}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{notif.fecha} • {notif.hora}</span>
                      </div>
                      <span>De: {notif.remitente}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de detalle */}
      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#1D4ED8]" />
              {notificacionSeleccionada?.titulo}
            </DialogTitle>
            <DialogDescription>
              Detalles completos de la notificación
            </DialogDescription>
          </DialogHeader>

          {notificacionSeleccionada && (
            <div className="space-y-4 mt-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className={getCategoriaColor(notificacionSeleccionada.categoria)}>
                  {notificacionSeleccionada.categoria}
                </Badge>
                <Badge className={getPrioridadBadge(notificacionSeleccionada.prioridad)}>
                  Prioridad: {notificacionSeleccionada.prioridad}
                </Badge>
                {notificacionSeleccionada.leida && (
                  <Badge className="bg-[#059669] text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Leída
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Remitente</h4>
                  <p className="text-sm text-[#6B7280]">{notificacionSeleccionada.remitente}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Fecha y hora</h4>
                  <p className="text-sm text-[#6B7280]">
                    {notificacionSeleccionada.fecha} a las {notificacionSeleccionada.hora} hrs
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Mensaje</h4>
                  <div className="p-4 bg-gray-50 rounded-lg border border-[#E5E7EB]">
                    <p className="text-sm text-[#374151] leading-relaxed">
                      {notificacionSeleccionada.mensaje}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
