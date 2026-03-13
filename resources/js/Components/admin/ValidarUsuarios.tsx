import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  UserCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

type EstadoValidacion = "pendiente" | "aprobado" | "rechazado";

interface SolicitudUsuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  rol: string;
  fechaSolicitud: string;
  estado: EstadoValidacion;
  motivoRechazo?: string;
  documentos: string[];
  comentario?: string;
}

const SOLICITUDES_MOCK: SolicitudUsuario[] = [
  {
    id: 1,
    nombre: "Ana Laura Vega Hernández",
    email: "ana.vega@escuela.mx",
    telefono: "+52 555 1234 001",
    rol: "Profesor",
    fechaSolicitud: "28/02/2026",
    estado: "pendiente",
    documentos: ["Título profesional", "Identificación oficial"],
    comentario: "Solicita acceso para impartir Matemáticas en 2° grado.",
  },
  {
    id: 2,
    nombre: "Marco Antonio Ruiz Díaz",
    email: "marco.ruiz@escuela.mx",
    telefono: "+52 555 1234 002",
    rol: "Tutor",
    fechaSolicitud: "27/02/2026",
    estado: "pendiente",
    documentos: ["Acta de nacimiento del alumno", "Identificación oficial"],
    comentario: "Tutor del alumno Luis Ruiz García de 3°B.",
  },
  {
    id: 3,
    nombre: "Sofía Méndez Torres",
    email: "sofia.mendez@escuela.mx",
    telefono: "+52 555 1234 003",
    rol: "Trabajador Social",
    fechaSolicitud: "25/02/2026",
    estado: "pendiente",
    documentos: ["Cédula profesional", "Carta de presentación"],
    comentario: "Cubrirá vacante en el área de orientación.",
  },
  {
    id: 4,
    nombre: "Carlos Estrada Fuentes",
    email: "carlos.estrada@escuela.mx",
    telefono: "+52 555 1234 004",
    rol: "Profesor",
    fechaSolicitud: "20/02/2026",
    estado: "aprobado",
    documentos: ["Título profesional", "Identificación oficial"],
  },
  {
    id: 5,
    nombre: "Patricia Lara Campos",
    email: "patricia.lara@escuela.mx",
    telefono: "+52 555 1234 005",
    rol: "Tutor",
    fechaSolicitud: "18/02/2026",
    estado: "rechazado",
    motivoRechazo: "Documentación incompleta. No adjuntó acta de nacimiento.",
    documentos: ["Identificación oficial"],
  },
  {
    id: 6,
    nombre: "Jorge Ibáñez Mora",
    email: "jorge.ibanez@escuela.mx",
    telefono: "+52 555 1234 006",
    rol: "Personal Administrativo",
    fechaSolicitud: "15/02/2026",
    estado: "aprobado",
    documentos: ["Identificación oficial", "Comprobante de domicilio"],
  },
];

const getBadgeRol = (rol: string) => {
  switch (rol) {
    case "Administrador":     return "bg-purple-100 text-purple-700 border-purple-200";
    case "Personal Administrativo": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Profesor":          return "bg-green-100 text-green-700 border-green-200";
    case "Trabajador Social": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Tutor":             return "bg-pink-100 text-pink-700 border-pink-200";
    default:                  return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getBadgeEstado = (estado: EstadoValidacion) => {
  switch (estado) {
    case "pendiente":  return "bg-[#FEF3C7] text-[#D97706] border-0";
    case "aprobado":   return "bg-[#ECFDF5] text-[#059669] border-0";
    case "rechazado":  return "bg-[#FEE2E2] text-[#E11D48] border-0";
  }
};

const getLabelEstado = (estado: EstadoValidacion) => {
  switch (estado) {
    case "pendiente":  return "Pendiente";
    case "aprobado":   return "Aprobado";
    case "rechazado":  return "Rechazado";
  }
};

export function ValidarUsuarios() {
  const [solicitudes, setSolicitudes] = useState<SolicitudUsuario[]>(SOLICITUDES_MOCK);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroRol, setFiltroRol] = useState<string>("todos");

  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalRechazo, setModalRechazo] = useState(false);
  const [seleccionada, setSeleccionada] = useState<SolicitudUsuario | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  const pendientes  = solicitudes.filter(s => s.estado === "pendiente").length;
  const aprobados   = solicitudes.filter(s => s.estado === "aprobado").length;
  const rechazados  = solicitudes.filter(s => s.estado === "rechazado").length;

  const filtradas = solicitudes.filter((s) => {
    const matchBusqueda =
      busqueda === "" ||
      s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.email.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === "todos" || s.estado === filtroEstado;
    const matchRol    = filtroRol === "todos"    || s.rol === filtroRol;
    return matchBusqueda && matchEstado && matchRol;
  });

  const handleAprobar = (id: number) => {
    setSolicitudes(solicitudes.map(s => s.id === id ? { ...s, estado: "aprobado" } : s));
    toast.success("Solicitud aprobada. El usuario puede acceder al sistema.");
    setModalDetalle(false);
  };

  const handleAbrirRechazo = (solicitud: SolicitudUsuario) => {
    setSeleccionada(solicitud);
    setMotivoRechazo("");
    setModalRechazo(true);
  };

  const handleConfirmarRechazo = () => {
    if (!motivoRechazo.trim()) {
      toast.error("Debes indicar el motivo del rechazo.");
      return;
    }
    setSolicitudes(solicitudes.map(s =>
      s.id === seleccionada?.id
        ? { ...s, estado: "rechazado", motivoRechazo }
        : s
    ));
    toast.success("Solicitud rechazada correctamente.");
    setModalRechazo(false);
    setModalDetalle(false);
  };

  const handleVerDetalle = (solicitud: SolicitudUsuario) => {
    setSeleccionada(solicitud);
    setModalDetalle(true);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1>Validar Usuarios</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Revisa y aprueba las solicitudes de acceso al sistema
        </p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] rounded-2xl">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280]">Pendientes</p>
                <p className="text-2xl font-bold text-[#D97706] mt-1">{pendientes}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="h-5 w-5 text-[#D97706]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] rounded-2xl">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280]">Aprobados</p>
                <p className="text-2xl font-bold text-[#059669] mt-1">{aprobados}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-5 w-5 text-[#059669]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] rounded-2xl">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280]">Rechazados</p>
                <p className="text-2xl font-bold text-[#E11D48] mt-1">{rechazados}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="h-5 w-5 text-[#E11D48]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-[#E5E7EB] rounded-2xl">
        <CardContent className="pt-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <Input
                placeholder="Buscar por nombre o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full lg:w-44 rounded-lg">
                <Filter className="h-4 w-4 mr-2 text-[#6B7280]" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroRol} onValueChange={setFiltroRol}>
              <SelectTrigger className="w-full lg:w-48 rounded-lg">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los roles</SelectItem>
                <SelectItem value="Profesor">Profesor</SelectItem>
                <SelectItem value="Tutor">Tutor</SelectItem>
                <SelectItem value="Trabajador Social">Trabajador Social</SelectItem>
                <SelectItem value="Personal Administrativo">Personal Administrativo</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listado */}
      <Card className="border-[#E5E7EB] rounded-3xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <UserCheck className="h-5 w-5 text-[#1D4ED8]" />
            </div>
            <div>
              <CardTitle>Solicitudes de acceso</CardTitle>
              <CardDescription>
                {filtradas.length} solicitud{filtradas.length !== 1 ? "es" : ""} encontrada{filtradas.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtradas.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-10 w-10 text-[#D1D5DB] mx-auto mb-3" />
              <p className="text-sm text-[#6B7280]">No se encontraron solicitudes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtradas.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] rounded-lg shrink-0 mt-0.5">
                      <UserCheck className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#111827]">{s.nombre}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge className={getBadgeRol(s.rol)}>{s.rol}</Badge>
                        <Badge className={getBadgeEstado(s.estado)}>
                          {getLabelEstado(s.estado)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#6B7280]">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />{s.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />{s.fechaSolicitud}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg text-[#1D4ED8] hover:bg-blue-50"
                      onClick={() => handleVerDetalle(s)}
                    >
                      <Eye className="h-4 w-4 mr-1" />Ver
                    </Button>
                    {s.estado === "pendiente" && (
                      <>
                        <Button
                          size="sm"
                          className="rounded-lg bg-[#059669] hover:bg-[#047857] text-white"
                          onClick={() => handleAprobar(s.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg text-[#E11D48] border-[#E11D48] hover:bg-red-50"
                          onClick={() => handleAbrirRechazo(s)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />Rechazar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal detalle */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="rounded-3xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de solicitud</DialogTitle>
            <DialogDescription>Información completa de la solicitud de acceso</DialogDescription>
          </DialogHeader>
          {seleccionada && (
            <div className="space-y-4">
              {/* Perfil */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="p-3 bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] rounded-xl">
                  <ShieldCheck className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#111827]">{seleccionada.nombre}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge className={getBadgeRol(seleccionada.rol)}>{seleccionada.rol}</Badge>
                    <Badge className={getBadgeEstado(seleccionada.estado)}>
                      {getLabelEstado(seleccionada.estado)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Datos */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Correo electrónico", value: seleccionada.email, icon: <Mail className="h-3.5 w-3.5" /> },
                  { label: "Teléfono",            value: seleccionada.telefono, icon: <Phone className="h-3.5 w-3.5" /> },
                  { label: "Fecha de solicitud",  value: seleccionada.fechaSolicitud, icon: <CalendarDays className="h-3.5 w-3.5" /> },
                  { label: "Rol solicitado",      value: seleccionada.rol, icon: <UserCheck className="h-3.5 w-3.5" /> },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="p-3 bg-[#F9FAFB] rounded-lg">
                    <Label className="text-xs text-[#6B7280] flex items-center gap-1 mb-1">{icon}{label}</Label>
                    <p className="font-medium text-[#111827]">{value}</p>
                  </div>
                ))}
              </div>

              {/* Comentario */}
              {seleccionada.comentario && (
                <div className="p-3 bg-[#F9FAFB] rounded-lg">
                  <Label className="text-xs text-[#6B7280] mb-1 block">Comentario del solicitante</Label>
                  <p className="text-sm text-[#374151]">{seleccionada.comentario}</p>
                </div>
              )}

              {/* Documentos */}
              <div>
                <Label className="text-xs text-[#6B7280] mb-2 block">Documentos adjuntos</Label>
                <div className="flex flex-wrap gap-2">
                  {seleccionada.documentos.map((doc, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{doc}</Badge>
                  ))}
                </div>
              </div>

              {/* Motivo de rechazo si aplica */}
              {seleccionada.estado === "rechazado" && seleccionada.motivoRechazo && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Label className="text-xs text-[#E11D48] mb-1 block flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />Motivo de rechazo
                  </Label>
                  <p className="text-sm text-[#374151]">{seleccionada.motivoRechazo}</p>
                </div>
              )}

              {/* Acciones */}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setModalDetalle(false)} className="rounded-lg">
                  Cerrar
                </Button>
                {seleccionada.estado === "pendiente" && (
                  <>
                    <Button
                      variant="outline"
                      className="rounded-lg text-[#E11D48] border-[#E11D48] hover:bg-red-50"
                      onClick={() => handleAbrirRechazo(seleccionada)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />Rechazar
                    </Button>
                    <Button
                      className="rounded-lg bg-[#059669] hover:bg-[#047857] text-white"
                      onClick={() => handleAprobar(seleccionada.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />Aprobar
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal rechazo */}
      <Dialog open={modalRechazo} onOpenChange={setModalRechazo}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar solicitud</DialogTitle>
            <DialogDescription>
              Indica el motivo del rechazo. Se le notificará al solicitante.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-[#92400E]">
              <strong>Solicitante:</strong> {seleccionada?.nombre}
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo del rechazo *</Label>
              <Textarea
                id="motivo"
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Ej. Documentación incompleta, no adjuntó el título profesional..."
                rows={4}
                className="rounded-lg resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalRechazo(false)} className="rounded-lg">
              Cancelar
            </Button>
            <Button
              className="rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white"
              onClick={handleConfirmarRechazo}
            >
              <XCircle className="h-4 w-4 mr-1" />Confirmar rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
