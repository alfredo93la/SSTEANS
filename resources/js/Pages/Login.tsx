import { useState } from "react";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import { Checkbox } from "../Components/ui/checkbox";
import { Alert, AlertDescription } from "../Components/ui/alert";
import { AlertCircle, GraduationCap, ArrowRight } from "lucide-react";
import { AuthUser, authenticate } from "../data/auth";

interface LoginProps {
  onLogin: (userData: AuthUser) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [recordarme, setRecordarme] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const authenticatedUser = authenticate(usuario, password);

      if (authenticatedUser) {
        onLogin(authenticatedUser);
        return;
      }

      setError("Credenciales no válidas. Verifica usuario y contraseña.");
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#EFF6FF] to-[#F5F3FF] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] rounded-2xl blur-lg opacity-40 animate-pulse" />

              <div
                className="relative flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden"
                style={{ background: "var(--gradient-primary)" }}
              >
                <GraduationCap className="absolute w-7 h-7 text-white" />
              </div>
            </div>

            <h1 className="text-center mb-2 flex items-center gap-2">Iniciar Sesión</h1>
            <p className="text-sm text-[#6B7280] text-center">Sistema de Seguimiento a la Trayectoria Escolar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="animate-scale-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                type="text"
                placeholder="Ej. tutor"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="h-12 rounded-xl border-[#E5E7EB] bg-white/80 backdrop-blur-sm focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-[#E5E7EB] bg-white/80 backdrop-blur-sm focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recordarme"
                  checked={recordarme}
                  onCheckedChange={(checked) => setRecordarme(checked as boolean)}
                />
                <Label htmlFor="recordarme" className="text-sm font-normal text-[#6B7280] cursor-pointer">
                  Recuérdame
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all group relative overflow-hidden"
              style={{ background: "var(--gradient-primary)" }}
              disabled={loading}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Validando acceso..." : "Ingresar"}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-[#334155]">
            <p className="font-semibold mb-1">Usuarios de prueba</p>
            <p>tutor / Tutor123*</p>
            <p>profesor / Profesor123*</p>
            <p>social / Social123*</p>
            <p>admin / Admin123*</p>
            <p>administrativo / Adminva123*</p>
          </div>
        </div>

        <p className="text-xs text-center text-[#9CA3AF] mt-6">Sistema de Seguimiento a la Trayectoria Escolar © 2026</p>
      </div>
    </div>
  );
}
