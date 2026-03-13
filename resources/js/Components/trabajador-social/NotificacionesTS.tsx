import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { 
  Bell, 
  Send, 
  Search, 
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  User
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function NotificacionesTS() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todas");
  const [modalEnviar, setModalEnviar] = useState(false);

  // Datos de ejemplo
  const notificaciones = [
    {
      id: 1,
      tipo: "Reporte",
      titulo: "Seguimiento Juan Pérez",
      mensaje: "Recordatorio de cita con tutor para revisar avances del caso",
      destinatario: "Tutor - María Pérez",
      fecha: "25/02/2026",
      estado: "enviada",
      prioridad: "alta"
    },
    {
      id: 2,
      tipo: "Alerta",
      titulo: "Ausencias repetidas",
      mensaje: "Alumna Ana García tiene 5 faltas consecutivas. Requiere seguimiento",
      destinatario: "Tutor - Carlos García",
      fecha: "24/02/2026",
      estado: "enviada",
      prioridad: "urgente"
    },
    {
      id: 3,
      tipo: "Recordatorio",
      titulo: "Reunión de seguimiento",
      mensaje: "Reunión programada para el 28/02/2026 con tutor de Luis Martínez",
      destinatario: "Tutor - Sandra Martínez",
      fecha: "23/02/2026",
      estado: "programada",
      prioridad: "media"
    },
    {
      id: 4,
      tipo: "Información",
      titulo: "Actualización de expediente",
      mensaje: "Se ha actualizado el expediente del alumno Roberto Sánchez",
      destinatario: "Tutor - Laura Sánchez",
      fecha: "22/02/2026",
      estado: "enviada",
      prioridad: "baja"
    }
  ];

  const estadisticas = {
    enviadas: 24,
    programadas: 5,
    leidas: 18,
    pendientes: 6
  };

  const getBadgeColor = (prioridad: string) => {
    switch (prioridad) {
      case "urgente": return "bg-red-100 text-red-700";
      case "alta": return "bg-orange-100 text-orange-700";
      case "media": return "bg-yellow-100 text-yellow-700";
      case "baja": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "enviada": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "programada": return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#111827]">Notificaciones</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Gestiona las notificaciones enviadas a tutores y alumnos
          </p>
        </div>
        <Dialog open={modalEnviar} onOpenChange={setModalEnviar}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Send className="h-4 w-4 mr-2" />
              Nueva Notificación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enviar Notificación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="destinatario">Destinatario</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar destinatario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutor1">Tutor - María Pérez</SelectItem>
                    <SelectItem value="tutor2">Tutor - Carlos García</SelectItem>
                    <SelectItem value="tutor3">Tutor - Sandra Martínez</SelectItem>
                    <SelectItem value="grupo1">Grupo 1°A (Todos los tutores)</SelectItem>
                    <SelectItem value="grupo2">Grupo 2°B (Todos los tutores)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipo">Tipo de Notificación</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reporte">Reporte</SelectItem>
                    <SelectItem value="alerta">Alerta</SelectItem>
                    <SelectItem value="recordatorio">Recordatorio</SelectItem>
                    <SelectItem value="informacion">Información</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="asunto">Asunto</Label>
                <Input id="asunto" placeholder="Escribe el asunto de la notificación" />
              </div>

              <div>
                <Label htmlFor="mensaje">Mensaje</Label>
                <Textarea 
                  id="mensaje" 
                  placeholder="Escribe el contenido de la notificación"
                  rows={4}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setModalEnviar(false)}>
                  Cancelar
                </Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Notificación
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Enviadas</p>
                <p className="text-2xl font-bold text-[#1D4ED8] mt-1">{estadisticas.enviadas}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Send className="h-6 w-6 text-[#1D4ED8]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Programadas</p>
                <p className="text-2xl font-bold text-[#7C3AED] mt-1">{estadisticas.programadas}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Clock className="h-6 w-6 text-[#7C3AED]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Leídas</p>
                <p className="text-2xl font-bold text-[#059669] mt-1">{estadisticas.leidas}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-[#059669]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Pendientes</p>
                <p className="text-2xl font-bold text-[#D97706] mt-1">{estadisticas.pendientes}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-[#D97706]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Buscar por asunto, destinatario..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="reporte">Reportes</SelectItem>
                <SelectItem value="alerta">Alertas</SelectItem>
                <SelectItem value="recordatorio">Recordatorios</SelectItem>
                <SelectItem value="informacion">Información</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de notificaciones */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Historial de Notificaciones</CardTitle>
          <CardDescription>Últimas notificaciones enviadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notificaciones.map((notif) => (
              <div
                key={notif.id}
                className="p-4 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getEstadoIcon(notif.estado)}
                      <h4 className="font-semibold text-[#111827]">{notif.titulo}</h4>
                      <Badge className={getBadgeColor(notif.prioridad)}>
                        {notif.prioridad}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#6B7280] mb-2">{notif.mensaje}</p>
                    <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{notif.destinatario}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bell className="h-3 w-3" />
                        <span>{notif.tipo}</span>
                      </div>
                      <span>{notif.fecha}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
