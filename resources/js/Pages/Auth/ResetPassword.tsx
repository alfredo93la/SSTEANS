import { FormEventHandler, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Alert, AlertDescription } from "../../Components/ui/alert";
import { AlertCircle, GraduationCap, KeyRound, Eye, EyeOff } from "lucide-react";
import { passwordFuerte, passwordsCoinciden } from "../../lib/validators";

interface Props {
  email: string;
  token: string;
}

export default function ResetPassword({ email, token }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    token,
    email,
    password: "",
    password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [pwdError, setPwdError] = useState<string | null>(null);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    if (!passwordFuerte(data.password)) {
      setPwdError("La contraseña debe tener mínimo 12 caracteres, una mayúscula, un número y un símbolo.");
      return;
    }
    if (!passwordsCoinciden(data.password, data.password_confirmation)) {
      setPwdError("Las contraseñas no coinciden.");
      return;
    }
    setPwdError(null);
    post("/reset-password", {
      onFinish: () => reset("password", "password_confirmation"),
    });
  };

  return (
    <>
      <Head title="Nueva contraseña" />
      <div className="min-h-screen bg-linear-to-br from-[#F8FAFC] via-[#EFF6FF] to-[#F5F3FF] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl">
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
              <h1 className="text-xl font-semibold text-[#1F2937] text-center">Nueva contraseña</h1>
              <p className="text-sm text-[#6B7280] text-center mt-2">
                Establece una nueva contraseña para tu cuenta.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {(errors.email || errors.token) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.email || errors.token}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                  className={`h-12 rounded-xl border-[#E5E7EB] bg-white/60 ${errors.email ? "border-red-500" : ""}`}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    placeholder="Mín. 12 caracteres, mayús., núm. y símbolo"
                    className={`h-12 pr-10 rounded-xl border-[#E5E7EB] bg-white/80 ${errors.password ? "border-red-500" : ""}`}
                    disabled={processing}
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {(pwdError || errors.password) && <p className="text-sm text-red-500">{pwdError ?? errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    type={showConfirm ? "text" : "password"}
                    value={data.password_confirmation}
                    onChange={(e) => setData("password_confirmation", e.target.value)}
                    placeholder="Repite la contraseña"
                    className={`h-12 pr-10 rounded-xl border-[#E5E7EB] bg-white/80 ${errors.password_confirmation ? "border-red-500" : ""}`}
                    disabled={processing}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                    onClick={() => setShowConfirm((v) => !v)}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                style={{ background: "var(--gradient-primary)" }}
                disabled={processing}
              >
                <span className="flex items-center justify-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  {processing ? "Guardando..." : "Restablecer contraseña"}
                </span>
              </Button>
            </form>
          </div>

          <p className="text-xs text-center text-[#9CA3AF] mt-6">
            Sistema de Seguimiento a la Trayectoria Escolar © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
}
