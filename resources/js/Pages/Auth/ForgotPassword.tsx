import { FormEventHandler } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Alert, AlertDescription } from "../../Components/ui/alert";
import { AlertCircle, GraduationCap, Mail, CheckCircle2, ArrowLeft } from "lucide-react";

interface Props {
  status?: string;
}

export default function ForgotPassword({ status }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    post("/forgot-password");
  };

  return (
    <>
      <Head title="Recuperar contraseña" />
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
              <h1 className="text-xl font-semibold text-[#1F2937] text-center">Recuperar contraseña</h1>
              <p className="text-sm text-[#6B7280] text-center mt-2">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {status && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">{status}</AlertDescription>
                </Alert>
              )}

              {errors.email && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.email}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Ingresa tu correo electrónico"
                    maxLength={255}
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    className={`h-12 pl-10 rounded-xl border-[#E5E7EB] bg-white/80 backdrop-blur-sm focus:bg-white transition-all ${errors.email ? "border-red-500" : ""}`}
                    disabled={processing}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                style={{ background: "var(--gradient-primary)" }}
                disabled={processing}
              >
                {processing ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1D4ED8] transition-colors mt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver al inicio de sesión
              </Link>
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
