import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Textarea } from "../../Components/ui/textarea";
import { Switch } from "../../Components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { School, Settings2, CheckCircle, Loader2 } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";
import { toast } from "sonner";

interface Config {
  nombre: string;
  numero: string;
  cct: string;
  turno_escuela: string;
  turnos_disponibles: string;
  director: string;
  telefono: string;
  correo: string;
  direccion: string;
  nivel_educativo: string;
  servicio_educativo: string;
  acceso_tutor: boolean;
  acceso_profesor: boolean;
  acceso_trab_social: boolean;
  acceso_administrativo: boolean;
  registro_tutores_activo: boolean;
}

const defaults: Config = {
  nombre: "",
  numero: "",
  cct: "",
  turno_escuela: "Matutino",
  turnos_disponibles: "matutino",
  director: "",
  telefono: "",
  correo: "",
  direccion: "",
  nivel_educativo: "Secundaria",
  servicio_educativo: "General",
  acceso_tutor: true,
  acceso_profesor: true,
  acceso_trab_social: true,
  acceso_administrativo: true,
  registro_tutores_activo: false,
};

export function ConfiguracionGeneral() {
  const [config, setConfig] = useState<Config>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    axios.get("/api/admin/configuracion")
      .then(({ data }) => {
        const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== undefined));
        setConfig({ ...defaults, ...clean });
      })
      .catch(() => toast.error("No se pudo cargar la configuración."))
      .finally(() => setLoading(false));
  }, []);

  const handleGuardar = () => {
    setSaving(true);
    axios.put("/api/admin/configuracion", config)
      .then(() => {
        setGuardado(true);
        toast.success("Configuración guardada correctamente.");
        setTimeout(() => setGuardado(false), 3000);
      })
      .catch((err) => {
        const msg = err.response?.data?.message ?? "Error al guardar la configuración.";
        toast.error(msg);
      })
      .finally(() => setSaving(false));
  };

  const set = (field: keyof Config, value: string | boolean | number) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#1D4ED8]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle icon={Settings2} title="Configuración General" description="Datos del plantel, parámetros académicos y ajustes del sistema" color="bg-[#1D4ED8]" />

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
                value={config.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cfgNum">Número</Label>
                <Input
                  id="cfgNum"
                  value={config.numero}
                  onChange={(e) => set("numero", e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cfgCct">Clave CCT *</Label>
                <Input
                  id="cfgCct"
                  value={config.cct}
                  onChange={(e) => set("cct", e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Servicio educativo</Label>
                <Select value={config.servicio_educativo} onValueChange={(v) => set("servicio_educativo", v)}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Técnica">Técnica</SelectItem>
                    <SelectItem value="Telesecundaria">Telesecundaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Turno(s) disponibles</Label>
                <Select value={config.turnos_disponibles} onValueChange={(v) => set("turnos_disponibles", v)}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matutino">Matutino</SelectItem>
                    <SelectItem value="vespertino">Vespertino</SelectItem>
                    <SelectItem value="ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfgDirector">Director(a) *</Label>
              <Input
                id="cfgDirector"
                value={config.director}
                onChange={(e) => set("director", e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cfgTel">Teléfono</Label>
                <Input
                  id="cfgTel"
                  value={config.telefono}
                  onChange={(e) => set("telefono", e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cfgCorreo">Correo institucional</Label>
                <Input
                  id="cfgCorreo"
                  type="email"
                  value={config.correo}
                  onChange={(e) => set("correo", e.target.value)}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfgDireccion">Dirección</Label>
              <Textarea
                id="cfgDireccion"
                value={config.direccion}
                rows={2}
                onChange={(e) => set("direccion", e.target.value)}
                className="rounded-lg resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
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
                { key: "acceso_tutor",            label: "Acceso de tutores",                  desc: "Los tutores pueden iniciar sesión en el sistema" },
                { key: "acceso_profesor",         label: "Acceso de profesores",               desc: "Los profesores pueden iniciar sesión en el sistema" },
                { key: "acceso_trab_social",      label: "Acceso de trabajadores sociales",    desc: "Los trabajadores sociales pueden iniciar sesión" },
                { key: "acceso_administrativo",   label: "Acceso de personal administrativo",  desc: "El personal administrativo puede iniciar sesión" },
                { key: "registro_tutores_activo", label: "Auto-registro de tutores",           desc: "Permite que tutores se registren ellos mismos y sus hijos desde /register" },
              ] as { key: keyof Config; label: string; desc: string }[]).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#111827]">{label}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{desc}</p>
                  </div>
                  <Switch
                    checked={config[key] as boolean}
                    onCheckedChange={(v) => set(key, v)}
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
          disabled={saving}
          className={`rounded-xl px-6 transition-all text-white ${
            guardado ? "bg-[#059669] hover:bg-[#047857]" : "bg-[#1D4ED8] hover:bg-[#1E40AF]"
          }`}
        >
          {saving
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando…</>
            : guardado
            ? <><CheckCircle className="h-4 w-4 mr-2" />Configuración guardada</>
            : <><Settings2 className="h-4 w-4 mr-2" />Guardar configuración</>}
        </Button>
      </div>
    </div>
  );
}
