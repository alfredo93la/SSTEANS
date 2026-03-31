import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Input } from "../../Components/ui/input";
import { Textarea } from "../../Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Button } from "../../Components/ui/button";
import { Label } from "../../Components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../Components/ui/radio-group";
import { toast } from "sonner";
import { Send, Mail, Users, User, AlertCircle, X } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";
import { grupos, alumnos, usuarios } from "../../data/mockData";

export function MensajeriaProfesor() {
  const [tipoDestinatario, setTipoDestinatario] = useState<"tutor" | "grupo">("grupo");
  const [destinatarioSeleccionado, setDestinatarioSeleccionado] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [prioridad, setPrioridad] = useState("media");

  // Obtener tutores únicos
  const tutores = usuarios.filter(u => u.rol === "Tutor");

  const limpiarFormulario = () => {
    setDestinatarioSeleccionado("");
    setAsunto("");
    setMensaje("");
    setPrioridad("media");
  };

  const validarFormulario = () => {
    if (!destinatarioSeleccionado) {
      toast.error("Debes seleccionar un destinatario");
      return false;
    }
    if (!asunto.trim()) {
      toast.error("El asunto es obligatorio");
      return false;
    }
    if (!mensaje.trim()) {
      toast.error("El mensaje no puede estar vacío");
      return false;
    }
    return true;
  };

  const enviarMensaje = () => {
    if (!validarFormulario()) return;

    let destinatarioNombre = "";
    
    if (tipoDestinatario === "grupo") {
      const grupo = grupos.find(g => g.id === parseInt(destinatarioSeleccionado));
      const alumnosGrupo = alumnos.filter(a => a.grupo === grupo?.nombre);
      destinatarioNombre = `${grupo?.nombre} (${alumnosGrupo.length} tutores)`;
    } else {
      const tutor = tutores.find(t => t.id === parseInt(destinatarioSeleccionado));
      destinatarioNombre = tutor?.nombre || "";
    }

    toast.success(`Mensaje enviado a ${destinatarioNombre}`);
    limpiarFormulario();
  };

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "bg-red-100 text-[#E11D48] border-red-200";
      case "media":
        return "bg-amber-100 text-[#D97706] border-amber-200";
      case "baja":
        return "bg-blue-100 text-[#1D4ED8] border-blue-200";
      default:
        return "bg-gray-100 text-[#6B7280] border-gray-200";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={Send} title="Enviar Notificación" description="Comunícate con tutores o grupos de alumnos" color="bg-[#1D4ED8]" />

      {/* Formulario */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Nueva Notificación</CardTitle>
          <CardDescription>Completa la información del mensaje</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); enviarMensaje(); }}>
            {/* Tipo de destinatario */}
            <div className="space-y-3">
              <Label>Tipo de destinatario *</Label>
              <RadioGroup
                value={tipoDestinatario}
                onValueChange={(value) => {
                  setTipoDestinatario(value as "tutor" | "grupo");
                  setDestinatarioSeleccionado("");
                }}
              >
                <div className="flex items-center space-x-2 p-3 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="grupo" id="grupo" />
                  <Label htmlFor="grupo" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Users className="h-4 w-4 text-[#7C3AED]" />
                    <div>
                      <p className="font-medium">Grupo completo</p>
                      <p className="text-xs text-[#6B7280]">
                        Enviar a todos los tutores de un grupo
                      </p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="tutor" id="tutor" />
                  <Label htmlFor="tutor" className="flex items-center gap-2 cursor-pointer flex-1">
                    <User className="h-4 w-4 text-[#1D4ED8]" />
                    <div>
                      <p className="font-medium">Tutor individual</p>
                      <p className="text-xs text-[#6B7280]">
                        Enviar a un tutor específico
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Destinatario */}
            <div className="space-y-2">
              <Label htmlFor="destinatario">
                {tipoDestinatario === "grupo" ? "Seleccionar grupo *" : "Seleccionar tutor *"}
              </Label>
              <Select value={destinatarioSeleccionado} onValueChange={setDestinatarioSeleccionado}>
                <SelectTrigger id="destinatario" className="rounded-lg">
                  <SelectValue placeholder={
                    tipoDestinatario === "grupo" 
                      ? "Elige un grupo..." 
                      : "Elige un tutor..."
                  } />
                </SelectTrigger>
                <SelectContent>
                  {tipoDestinatario === "grupo" ? (
                    grupos.map((g) => {
                      const alumnosGrupo = alumnos.filter(a => a.grupo === g.nombre);
                      return (
                        <SelectItem key={g.id} value={g.id.toString()}>
                          {g.nombre} ({alumnosGrupo.length} alumnos)
                        </SelectItem>
                      );
                    })
                  ) : (
                    tutores.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.nombre} ({t.correo})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridad */}
            <div className="space-y-2">
              <Label htmlFor="prioridad">Prioridad *</Label>
              <Select value={prioridad} onValueChange={setPrioridad}>
                <SelectTrigger id="prioridad" className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#E11D48] rounded-full" />
                      Alta - Urgente
                    </div>
                  </SelectItem>
                  <SelectItem value="media">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#D97706] rounded-full" />
                      Media - Normal
                    </div>
                  </SelectItem>
                  <SelectItem value="baja">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#1D4ED8] rounded-full" />
                      Baja - Informativa
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Asunto */}
            <div className="space-y-2">
              <Label htmlFor="asunto" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#7C3AED]" />
                Asunto *
              </Label>
              <Input
                id="asunto"
                placeholder="Recordatorio de reunión de padres"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                className="rounded-lg"
              />
            </div>

            {/* Mensaje */}
            <div className="space-y-2">
              <Label htmlFor="mensaje" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#7C3AED]" />
                Mensaje *
              </Label>
              <Textarea
                id="mensaje"
                placeholder="Escribe tu mensaje aquí..."
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={8}
                className="rounded-lg resize-none"
              />
              <p className="text-xs text-[#6B7280]">
                {mensaje.length}/500 caracteres
              </p>
            </div>

            {/* Vista previa */}
            {asunto && mensaje && destinatarioSeleccionado && (
              <Card className={`border-2 ${getPrioridadBadge(prioridad)}`}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Vista Previa del Mensaje
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-[#6B7280]">Para:</span>{" "}
                    <span className="font-medium text-[#111827]">
                      {tipoDestinatario === "grupo"
                        ? grupos.find(g => g.id === parseInt(destinatarioSeleccionado))?.nombre
                        : tutores.find(t => t.id === parseInt(destinatarioSeleccionado))?.nombre}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Asunto:</span>{" "}
                    <span className="font-medium text-[#111827]">{asunto}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Prioridad:</span>{" "}
                    <span className="font-medium text-[#111827] capitalize">{prioridad}</span>
                  </div>
                  <div className="pt-2 border-t border-[#E5E7EB]">
                    <p className="text-[#374151] whitespace-pre-wrap">{mensaje}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#E5E7EB]">
              <Button
                type="submit"
                className="flex-1 bg-[#1D4ED8] hover:bg-[#1E40AF]"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Notificación
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={limpiarFormulario}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar Formulario
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="border-[#E5E7EB] bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-[#1D4ED8] shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-[#1D4ED8]">
              <p className="font-medium">Consejos para enviar notificaciones:</p>
              <ul className="list-disc list-inside space-y-1 text-[#6B7280]">
                <li>Sé claro y conciso en tu mensaje</li>
                <li>Usa prioridad "Alta" solo para asuntos urgentes</li>
                <li>Revisa la ortografía antes de enviar</li>
                <li>Incluye información de contacto si es necesario</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
