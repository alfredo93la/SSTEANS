import { FormEventHandler } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Alert, AlertDescription } from "../../Components/ui/alert";
import { AlertCircle, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";

interface Props {
  canResetPassword: boolean;
  status?: string;
  canRegister?: boolean;
}

export default function Login({ canResetPassword, status, canRegister }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    
    post('/login', {
      onFinish: () => reset('password'),
    });
  };

  return (
    <>
    <Head title="Iniciar Sesión" />
    <div className="min-h-screen bg-linear-to-br from-[#F8FAFC] via-[#EFF6FF] to-[#F5F3FF] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-linear-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
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

            <h1 className="text-xl font-semibold text-[#1F2937] text-center">Sistema de Seguimiento a la Trayectoria Escolar</h1>
            <br />
            <p className="text-lg text-center mb-2 flex items-center gap-2">Iniciar Sesión</p>
            
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {status && (
              <Alert className="border-green-200 bg-green-50 animate-scale-in">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{status}</AlertDescription>
              </Alert>
            )}

            {errors.email && (
              <Alert variant="destructive" className="animate-scale-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.email}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="text"
                name="email"
                placeholder="Ingresa tu correo electrónico"
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
                className={`h-12 rounded-xl border-[#E5E7EB] bg-white/80 backdrop-blur-sm focus:bg-white transition-all ${errors.email ? 'border-red-500' : ''}`}
                disabled={processing}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Ingresa tu contraseña"
                value={data.password}
                onChange={(e) => setData("password", e.target.value)}
                className={`h-12 rounded-xl border-[#E5E7EB] bg-white/80 backdrop-blur-sm focus:bg-white transition-all ${errors.password ? 'border-red-500' : ''}`}
                disabled={processing}
                autoComplete="current-password"
              />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>

            {canResetPassword && (
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#1D4ED8] hover:text-[#7C3AED] transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all group relative overflow-hidden"
              style={{ background: "var(--gradient-primary)" }}
              disabled={processing}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {processing ? "Validando acceso..." : "Ingresar"}
                {!processing && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            </Button>

            {canRegister && (
              <p className="text-center text-sm text-[#6B7280] pt-1">
                ¿Eres tutor y aún no tienes cuenta?{" "}
                <Link href="/register" className="text-[#1D4ED8] hover:text-[#7C3AED] transition-colors font-medium">
                  Regístrate aquí
                </Link>
              </p>
            )}
          </form>
        </div>

        <p className="text-xs text-center text-[#9CA3AF] mt-6">Sistema de Seguimiento a la Trayectoria Escolar © 2026</p>
      </div>
    </div>
    </>
  );
}
