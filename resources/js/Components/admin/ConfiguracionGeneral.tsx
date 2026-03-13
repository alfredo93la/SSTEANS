import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { School, BookOpen, Settings2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function ConfiguracionGeneral() {
  const [config, setConfig] = useState({
    nombreEscuela: "Secundaria General No. 1",
    cct: "09DES0001X",
    turno: "Matutino",
    director: "Mtro. Alejandro Vega Hernández",
    telefono: "55 1234 5678",
    correoInstitucional: "secundaria1@edu.cdmx.gob.mx",
    direccion: "Calle Escolar 123, Col. Centro, CDMX",
    nivelEducativo: "Secundaria",
    sostenimiento: "Público Federal",
    minimoAprobatorio: "6",
    escalaCalificacion: "0–10",
    permitirCaptura: true,
    notificaciones: true,
    registroTutores: false,
  });
  const [guardado, setGuardado] = useState(false);

  const handleGuardar = () => {
    setGuardado(true);
    toast.success("Configuración guardada correctamente.");
    setTimeout(() => setGuardado(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Configuración General</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Datos del plantel, parámetros académicos y ajustes del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Datos del plantel */}
        <Card className="border-[#E5E7EB] rounded-3xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <School className="h-5 w-5 text-[#1D4ED8]" />
              </div>
              <div>
                <CardTitle className="text-base">Datos del Plantel</CardTitle>
                <CardDescription>Información oficial de la institución</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cfgNombre">Nombre de la escuela *</Label>
              <Input
                id="cfgNombre"
                value={config.nombreEscuela}
                onChange={(e) => setConfig({ ...config, nombreEscuela: e.target.value })}
                className="rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cfgCct">Clave CCT *</Label>
                <Input
                  id="cfgCct"
                  value={config.cct}
                  onChange={(e) => setConfig({ ...config, cct: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Turno</Label>
                <Select value={config.turno} onValueChange={(v) => setConfig({ ...config, turno: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matutino">Matutino</SelectItem>
                    <SelectItem value="Vespertino">Vespertino</SelectItem>
                    <SelectItem value="Nocturno">Nocturno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfgDirector">Director(a) *</Label>
              <Input
                id="cfgDirector"
                value={config.director}
                onChange={(e) => setConfig({ ...config, director: e.target.value })}
                className="rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cfgTel">Teléfono</Label>
                <Input
                  id="cfgTel"
                  value={config.telefono}
                  onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Sostenimiento</Label>
                <Select value={config.sostenimiento} onValueChange={(v) => setConfig({ ...config, sostenimiento: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Público Federal">Público Federal</SelectItem>
                    <SelectItem value="Público Estatal">Público Estatal</SelectItem>
                    <SelectItem value="Privado">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfgCorreo">Correo institucional</Label>
              <Input
                id="cfgCorreo"
                type="email"
                value={config.correoInstitucional}
                onChange={(e) => setConfig({ ...config, correoInstitucional: e.target.value })}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfgDireccion">Dirección</Label>
              <Textarea
                id="cfgDireccion"
                value={config.direccion}
                rows={2}
                onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                className="rounded-lg resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Parámetros académicos */}
          <Card className="border-[#E5E7EB] rounded-3xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-xl">
                  <BookOpen className="h-5 w-5 text-[#7C3AED]" />
                </div>
                <div>
                  <CardTitle className="text-base">Parámetros Académicos</CardTitle>
                  <CardDescription>Escala y criterios de evaluación</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mínimo aprobatorio</Label>
                  <Select value={config.minimoAprobatorio} onValueChange={(v) => setConfig({ ...config, minimoAprobatorio: v })}>
                    <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["5", "6", "7"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Escala de calificación</Label>
                  <Select value={config.escalaCalificacion} onValueChange={(v) => setConfig({ ...config, escalaCalificacion: v })}>
                    <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0–10">0 – 10</SelectItem>
                      <SelectItem value="0–100">0 – 100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nivel educativo</Label>
                <Select value={config.nivelEducativo} onValueChange={(v) => setConfig({ ...config, nivelEducativo: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Primaria">Primaria</SelectItem>
                    <SelectItem value="Secundaria">Secundaria</SelectItem>
                    <SelectItem value="Preparatoria">Preparatoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Ajustes del sistema */}
          <Card className="border-[#E5E7EB] rounded-3xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <Settings2 className="h-5 w-5 text-[#374151]" />
                </div>
                <div>
                  <CardTitle className="text-base">Ajustes del Sistema</CardTitle>
                  <CardDescription>Permisos y funcionalidades globales</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {([
                { key: "permitirCaptura", label: "Permitir captura de calificaciones", desc: "Habilita que los profesores registren calificaciones" },
                { key: "notificaciones",  label: "Notificaciones automáticas",          desc: "Envío de avisos por correo a tutores" },
                { key: "registroTutores", label: "Registro abierto de tutores",         desc: "Los tutores pueden registrarse de forma autónoma" },
              ] as { key: keyof typeof config; label: string; desc: string }[]).map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-[#111827]">{label}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{desc}</p>
                  </div>
                  <Switch
                    checked={config[key] as boolean}
                    onCheckedChange={(v) => setConfig({ ...config, [key]: v })}
                    className="data-[state=checked]:bg-[#1D4ED8]"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleGuardar}
          className={`rounded-xl px-6 transition-all text-white ${
            guardado ? "bg-[#059669] hover:bg-[#047857]" : "bg-[#1D4ED8] hover:bg-[#1E40AF]"
          }`}
        >
          {guardado
            ? <><CheckCircle className="h-4 w-4 mr-2" />Configuración guardada</>
            : <><Settings2 className="h-4 w-4 mr-2" />Guardar configuración</>}
        </Button>
      </div>
    </div>
  );
}
