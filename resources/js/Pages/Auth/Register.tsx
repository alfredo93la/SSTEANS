import { FormEventHandler, useCallback, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { AlertCircle, CheckCircle2, GraduationCap, Loader2, Plus, Trash2, User, Users } from "lucide-react";
import { Alert, AlertDescription } from "../../Components/ui/alert";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";

interface Hijo {
  nombre: string;
  apellidos: string;
  curp: string;
  fecha_nacimiento: string;
  sexo: string;
  parentesco: string;
}

function parentescoOpciones(sexo: string): string[] {
  if (sexo === "Masculino") return ["Hijo", "Nieto", "Sobrino", "Hermano", "Tutelado", "Otro"];
  if (sexo === "Femenino")  return ["Hija", "Nieta", "Sobrina", "Hermana", "Tutelada", "Otro"];
  return ["Hijo/a", "Nieto/a", "Sobrino/a", "Hermano/a", "Tutelado/a", "Otro"];
}

const emptyHijo = (): Hijo => ({
  nombre: "",
  apellidos: "",
  curp: "",
  fecha_nacimiento: "",
  sexo: "",
  parentesco: "",
});

type CurpStatus = "idle" | "checking" | "exists" | "ok";

export default function Register() {
  const { data, setData, post, processing, errors } = useForm<{
    nombre: string;
    apellidos: string;
    email: string;
    curp: string;
    telefono: string;
    ocupacion: string;
    hijos: Hijo[];
  }>({
    nombre: "",
    apellidos: "",
    email: "",
    curp: "",
    telefono: "",
    ocupacion: "",
    hijos: [emptyHijo()],
  });

  const [curpStatus, setCurpStatus] = useState<Record<string, CurpStatus>>({});

  const checkCurp = useCallback(async (curp: string, key: string) => {
    if (curp.length !== 18) return;
    setCurpStatus((prev) => ({ ...prev, [key]: "checking" }));
    try {
      const res = await fetch(`/api/check-curp?curp=${encodeURIComponent(curp.toUpperCase())}`);
      const json = await res.json();
      setCurpStatus((prev) => ({ ...prev, [key]: json.exists ? "exists" : "ok" }));
    } catch {
      setCurpStatus((prev) => ({ ...prev, [key]: "idle" }));
    }
  }, []);

  const addHijo = () => setData("hijos", [...data.hijos, emptyHijo()]);

  const removeHijo = (idx: number) =>
    setData("hijos", data.hijos.filter((_, i) => i !== idx));

  const updateHijo = (idx: number, field: keyof Hijo, value: string) =>
    setData("hijos", data.hijos.map((h, i) => (i === idx ? { ...h, [field]: value } : h)));

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    post("/register");
  };

  const hasCurpConflict = Object.values(curpStatus).some((s) => s === "exists");

  const fieldError = (key: string) => (errors as Record<string, string>)[key];

  const CurpIcon = ({ k }: { k: string }) => {
    if (curpStatus[k] === "checking") return <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />;
    if (curpStatus[k] === "ok")       return <CheckCircle2 className="absolute right-3 top-3 w-4 h-4 text-green-500" />;
    if (curpStatus[k] === "exists")   return <AlertCircle className="absolute right-3 top-3 w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <>
      <Head title="Registro de Tutor" />
      <div className="min-h-screen bg-linear-to-br from-[#F8FAFC] via-[#EFF6FF] to-[#F5F3FF] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-2xl relative z-10 my-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl">

            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-linear-to-br from-[#1D4ED8] to-[#7C3AED] rounded-2xl blur-lg opacity-40 animate-pulse" />
                <div
                  className="relative flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <GraduationCap className="absolute w-7 h-7 text-white" />
                </div>
              </div>
              <h1 className="text-xl font-semibold text-[#1F2937] text-center">Registro de Tutor</h1>
              <p className="text-sm text-[#6B7280] mt-1 text-center">
                Una vez enviado, el administrador validará tu solicitud y recibirás un correo con tus credenciales.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* ── Datos del tutor ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7EB]">
                  <User className="w-4 h-4 text-[#1D4ED8]" />
                  <h2 className="font-medium text-[#1F2937]">Datos del tutor</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nombre">Nombre(s) *</Label>
                    <Input
                      id="nombre"
                      value={data.nombre}
                      onChange={(e) => setData("nombre", e.target.value)}
                      className={`h-11 rounded-xl ${errors.nombre ? "border-red-500" : ""}`}
                    />
                    {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="apellidos">Apellidos *</Label>
                    <Input
                      id="apellidos"
                      value={data.apellidos}
                      onChange={(e) => setData("apellidos", e.target.value)}
                      className={`h-11 rounded-xl ${errors.apellidos ? "border-red-500" : ""}`}
                    />
                    {errors.apellidos && <p className="text-xs text-red-500">{errors.apellidos}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Correo electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData("email", e.target.value)}
                      className={`h-11 rounded-xl ${errors.email ? "border-red-500" : ""}`}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="curp">CURP *</Label>
                    <div className="relative">
                      <Input
                        id="curp"
                        value={data.curp}
                        maxLength={18}
                        onChange={(e) => {
                          const v = e.target.value.toUpperCase();
                          setData("curp", v);
                          setCurpStatus((prev) => ({ ...prev, tutor: "idle" }));
                        }}
                        onBlur={() => checkCurp(data.curp, "tutor")}
                        className={`h-11 rounded-xl pr-9 ${
                          errors.curp || curpStatus.tutor === "exists"
                            ? "border-red-500"
                            : curpStatus.tutor === "ok"
                            ? "border-green-500"
                            : ""
                        }`}
                      />
                      <CurpIcon k="tutor" />
                    </div>
                    {curpStatus.tutor === "exists" && <p className="text-xs text-red-500">Este CURP ya está registrado.</p>}
                    {errors.curp && <p className="text-xs text-red-500">{errors.curp}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={data.telefono}
                      onChange={(e) => setData("telefono", e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ocupacion">Ocupación</Label>
                    <Input
                      id="ocupacion"
                      value={data.ocupacion}
                      onChange={(e) => setData("ocupacion", e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* ── Alumnos ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#1D4ED8]" />
                    <h2 className="font-medium text-[#1F2937]">Alumnos a registrar</h2>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addHijo} className="h-8 gap-1.5 rounded-lg">
                    <Plus className="w-3.5 h-3.5" /> Agregar alumno
                  </Button>
                </div>

                {fieldError("hijos") && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{fieldError("hijos")}</AlertDescription>
                  </Alert>
                )}

                {data.hijos.map((hijo, idx) => {
                  const curpKey = `hijo_${idx}`;
                  return (
                    <div key={idx} className="p-4 rounded-2xl border border-[#E5E7EB] bg-white/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#374151]">Alumno {idx + 1}</span>
                        {data.hijos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeHijo(idx)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label>Nombre(s) *</Label>
                          <Input
                            value={hijo.nombre}
                            onChange={(e) => updateHijo(idx, "nombre", e.target.value)}
                            className={`h-11 rounded-xl ${fieldError(`hijos.${idx}.nombre`) ? "border-red-500" : ""}`}
                          />
                          {fieldError(`hijos.${idx}.nombre`) && (
                            <p className="text-xs text-red-500">{fieldError(`hijos.${idx}.nombre`)}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label>Apellidos *</Label>
                          <Input
                            value={hijo.apellidos}
                            onChange={(e) => updateHijo(idx, "apellidos", e.target.value)}
                            className={`h-11 rounded-xl ${fieldError(`hijos.${idx}.apellidos`) ? "border-red-500" : ""}`}
                          />
                          {fieldError(`hijos.${idx}.apellidos`) && (
                            <p className="text-xs text-red-500">{fieldError(`hijos.${idx}.apellidos`)}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label>CURP *</Label>
                          <div className="relative">
                            <Input
                              value={hijo.curp}
                              maxLength={18}
                              onChange={(e) => {
                                const v = e.target.value.toUpperCase();
                                updateHijo(idx, "curp", v);
                                setCurpStatus((prev) => ({ ...prev, [curpKey]: "idle" }));
                              }}
                              onBlur={() => checkCurp(hijo.curp, curpKey)}
                              className={`h-11 rounded-xl pr-9 ${
                                fieldError(`hijos.${idx}.curp`) || curpStatus[curpKey] === "exists"
                                  ? "border-red-500"
                                  : curpStatus[curpKey] === "ok"
                                  ? "border-green-500"
                                  : ""
                              }`}
                            />
                            <CurpIcon k={curpKey} />
                          </div>
                          {curpStatus[curpKey] === "exists" && (
                            <p className="text-xs text-red-500">Este CURP ya está registrado.</p>
                          )}
                          {fieldError(`hijos.${idx}.curp`) && (
                            <p className="text-xs text-red-500">{fieldError(`hijos.${idx}.curp`)}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label>Fecha de nacimiento *</Label>
                          <Input
                            type="date"
                            value={hijo.fecha_nacimiento}
                            onChange={(e) => updateHijo(idx, "fecha_nacimiento", e.target.value)}
                            className={`h-11 rounded-xl ${fieldError(`hijos.${idx}.fecha_nacimiento`) ? "border-red-500" : ""}`}
                          />
                          {fieldError(`hijos.${idx}.fecha_nacimiento`) && (
                            <p className="text-xs text-red-500">{fieldError(`hijos.${idx}.fecha_nacimiento`)}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label>Sexo *</Label>
                          <Select
                            value={hijo.sexo}
                            onValueChange={(v) => {
                              const updated = data.hijos.map((h, i) =>
                                i === idx ? { ...h, sexo: v, parentesco: "" } : h
                              );
                              setData("hijos", updated);
                            }}
                          >
                            <SelectTrigger className={`h-11 rounded-xl ${fieldError(`hijos.${idx}.sexo`) ? "border-red-500" : ""}`}>
                              <SelectValue placeholder="Seleccionar…" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Masculino">Masculino</SelectItem>
                              <SelectItem value="Femenino">Femenino</SelectItem>
                              <SelectItem value="No especificado">No especificado</SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldError(`hijos.${idx}.sexo`) && (
                            <p className="text-xs text-red-500">{fieldError(`hijos.${idx}.sexo`)}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label>Parentesco *</Label>
                          <Select
                            value={hijo.parentesco}
                            onValueChange={(v) => updateHijo(idx, "parentesco", v)}
                            disabled={!hijo.sexo}
                          >
                            <SelectTrigger className={`h-11 rounded-xl ${fieldError(`hijos.${idx}.parentesco`) ? "border-red-500" : ""}`}>
                              <SelectValue placeholder={hijo.sexo ? "Seleccionar…" : "Primero selecciona el sexo"} />
                            </SelectTrigger>
                            <SelectContent>
                              {parentescoOpciones(hijo.sexo).map((op) => (
                                <SelectItem key={op} value={op}>{op}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fieldError(`hijos.${idx}.parentesco`) && (
                            <p className="text-xs text-red-500">{fieldError(`hijos.${idx}.parentesco`)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Submit ── */}
              <div className="pt-2 space-y-3">
                <Button
                  type="submit"
                  className="w-full h-12 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                  style={{ background: "var(--gradient-primary)" }}
                  disabled={processing || hasCurpConflict}
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Enviando solicitud…
                    </span>
                  ) : (
                    "Enviar solicitud de registro"
                  )}
                </Button>

                <p className="text-center text-sm text-[#6B7280]">
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/login" className="text-[#1D4ED8] hover:text-[#7C3AED] transition-colors font-medium">
                    Iniciar sesión
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <p className="text-xs text-center text-[#9CA3AF] mt-6">
            Sistema de Seguimiento a la Trayectoria Escolar © 2026
          </p>
        </div>
      </div>
    </>
  );
}
