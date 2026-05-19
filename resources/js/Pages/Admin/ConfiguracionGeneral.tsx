import { useEffect, useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Textarea } from "../../Components/ui/textarea";
import { Switch } from "../../Components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { School, Settings2, CheckCircle, Loader2, Upload, X } from "lucide-react";
import { emailValido, telefonoValido } from "../../lib/validators";
import { PageTitle } from "../../Layouts/PageTitle";
import { toast } from "sonner";

interface Config {
  nombre: string;
  numero: string;
  cct: string;
  turnos_disponibles: string;
  turnos_en_uso: string[];
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
  logo_url: string | null;
}

const defaults: Config = {
  nombre: "",
  numero: "",
  cct: "",
  turnos_disponibles: "matutino",
  turnos_en_uso: [],
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
  logo_url: null,
};

export function ConfiguracionGeneral() {
  const [config, setConfig] = useState<Config>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

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
    if (!config.nombre.trim()) { toast.error("El nombre de la escuela es obligatorio."); return; }
    if (config.correo && !emailValido(config.correo)) { toast.error("El correo electrónico no tiene un formato válido."); return; }
    if (config.telefono && !telefonoValido(config.telefono)) { toast.error("El teléfono debe tener exactamente 10 dígitos."); return; }
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

  const set = (field: keyof Config, value: string | boolean | number | null) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("logo", file);
    setUploadingLogo(true);
    try {
      const { data } = await axios.post("/api/admin/configuracion/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setConfig((prev) => ({ ...prev, logo_url: data.logo_url }));
      toast.success("Logo actualizado correctamente.");
      router.reload({ only: ["escuela"] });
    } catch {
      toast.error("No se pudo subir el logo.");
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  const handleEliminarLogo = async () => {
    setUploadingLogo(true);
    try {
      await axios.delete("/api/admin/configuracion/logo");
      setConfig((prev) => ({ ...prev, logo_url: null }));
      toast.success("Logo eliminado.");
      router.reload({ only: ["escuela"] });
    } catch {
      toast.error("No se pudo eliminar el logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#1D4ED8]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle icon={Settings2} title="Configuración General" description="Datos del plantel, parámetros académicos y ajustes del sistema" color="bg-[#4F46E5]" />

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
            {/* Logo */}
            <div className="space-y-2">
              <Label>Logo de la escuela</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-gray-50 overflow-hidden">
                  {config.logo_url
                    ? <img src={config.logo_url} alt="Logo" className="h-full w-full object-contain p-1" />
                    : <span className="text-xs font-bold text-[#9CA3AF]">ESC</span>
                  }
                </div>
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} disabled={uploadingLogo} />
                    <span className={`inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-sm font-medium transition-colors ${uploadingLogo ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"}`}>
                      {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {config.logo_url ? "Cambiar logo" : "Subir logo"}
                    </span>
                  </label>
                  {config.logo_url && (
                    <button
                      type="button"
                      onClick={handleEliminarLogo}
                      disabled={uploadingLogo}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-[#E11D48] transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Eliminar logo
                    </button>
                  )}
                  <p className="text-xs text-[#9CA3AF]">PNG, JPG, WebP o SVG · máx. 2 MB</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cfgNombre">Nombre de la escuela *</Label>
              <Input
                id="cfgNombre"
                value={config.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                className="rounded-lg"
                maxLength={255}
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
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cfgCct">Clave CCT *</Label>
                <Input
                  id="cfgCct"
                  value={config.cct}
                  onChange={(e) => set("cct", e.target.value)}
                  className="rounded-lg"
                  maxLength={20}
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
                    <SelectItem value="matutino" disabled={config.turnos_en_uso.includes("vespertino")}>
                      Matutino{config.turnos_en_uso.includes("vespertino") ? " (hay grupos vespertinos)" : ""}
                    </SelectItem>
                    <SelectItem value="vespertino" disabled={config.turnos_en_uso.includes("matutino")}>
                      Vespertino{config.turnos_en_uso.includes("matutino") ? " (hay grupos matutinos)" : ""}
                    </SelectItem>
                    <SelectItem value="ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
                {config.turnos_en_uso.length > 0 && config.turnos_disponibles === "ambos" && (
                  <p className="text-xs text-[#6B7280]">
                    Solo puedes cambiar al turno que coincida con todos los grupos del ciclo activo.
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfgDirector">Director(a) *</Label>
              <Input
                id="cfgDirector"
                value={config.director}
                onChange={(e) => set("director", e.target.value)}
                className="rounded-lg"
                maxLength={255}
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
                  maxLength={30}
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
                  maxLength={255}
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
