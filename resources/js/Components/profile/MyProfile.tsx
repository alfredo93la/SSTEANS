import { Briefcase, IdCard, Mail, MapPin, Phone, ShieldCheck, UserRound, Users } from "lucide-react";
import { PageTitle } from "../PageTitle";
import type { User } from "../../types";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface MyProfileProps {
  user: User;
}

const roleAccent: Record<string, string> = {
  Administrador: "bg-rose-100 text-rose-700 border-rose-200",
  "Personal Administrativo": "bg-sky-100 text-sky-700 border-sky-200",
  Profesor: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Trabajador Social": "bg-amber-100 text-amber-700 border-amber-200",
  Tutor: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
};

const statusAccent: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
};

const statusLabel: Record<string, string> = {
  approved: "Activo",
  pending: "Pendiente",
  rejected: "Rechazado",
};

function getDisplayName(user: User): string {
  const personaName = [user.persona?.nombre, user.persona?.apellidos].filter(Boolean).join(" ").trim();
  return personaName || user.name;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getRoleSummary(role: string): string {
  switch (role) {
    case "Tutor":
      return "Consulta tu informacion familiar y el vinculo general con tus alumnos asignados.";
    case "Profesor":
      return "Revisa los datos de cuenta disponibles para tu perfil docente.";
    case "Trabajador Social":
      return "Consulta la informacion registrada para tu perfil operativo en el sistema.";
    case "Personal Administrativo":
      return "Visualiza la informacion general asociada a tu acceso administrativo.";
    case "Administrador":
      return "Consulta la informacion base de tu cuenta con privilegios de administracion.";
    default:
      return "Consulta los datos actualmente registrados para tu cuenta.";
  }
}

function EmptyValue({ label }: { label: string }) {
  return <span className="text-[#9CA3AF]">{label}</span>;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white/80 p-4">
      <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6B7280]">{label}</p>
        <p className="mt-1 break-words text-sm text-[#111827]">
          {value ? value : <EmptyValue label="Sin informacion registrada" />}
        </p>
      </div>
    </div>
  );
}

export function MyProfile({ user }: MyProfileProps) {
  const displayName = getDisplayName(user);
  const initials = getInitials(displayName || user.name || "U");
  const roleClassName = roleAccent[user.role] ?? "bg-slate-100 text-slate-700 border-slate-200";
  const currentStatus = user.status ?? "";
  const hasPersonalInfo = Boolean(
    user.persona?.nombre ||
      user.persona?.apellidos ||
      user.persona?.telefono ||
      user.persona?.direccion ||
      user.persona?.curp,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={UserRound} title="Mi perfil" description={getRoleSummary(user.role)} color="bg-[#1D4ED8]" />

      <Card className="overflow-hidden border-[#D9E2F2] bg-gradient-to-br from-white via-[#F8FAFC] to-[#E0F2FE]">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#1D4ED8] via-[#0EA5E9] to-[#14B8A6] text-2xl font-bold text-white shadow-lg">
                {initials}
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1D4ED8]">Perfil de usuario</p>
                  <h2 className="text-2xl font-semibold text-[#111827]">{displayName}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={roleClassName}>{user.role}</Badge>
                  {currentStatus ? (
                    <Badge className={statusAccent[currentStatus] ?? "bg-slate-100 text-slate-700 border-slate-200"}>
                      {statusLabel[currentStatus] ?? currentStatus}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Correo</p>
                <p className="mt-1 text-sm font-medium text-[#111827]">{user.email}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Tipo de persona</p>
                <p className="mt-1 text-sm font-medium text-[#111827]">{user.persona?.tipo_persona || user.role}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Informacion de cuenta</CardTitle>
            <CardDescription>Datos principales del acceso autenticado.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoRow icon={UserRound} label="Nombre de cuenta" value={user.name} />
            <InfoRow icon={Mail} label="Correo electronico" value={user.email} />
            <InfoRow icon={ShieldCheck} label="Rol principal" value={user.role} />
            <InfoRow
              icon={IdCard}
              label="Estado de la cuenta"
              value={currentStatus ? statusLabel[currentStatus] ?? currentStatus : "Sin estado registrado"}
            />
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Informacion personal</CardTitle>
            <CardDescription>Datos de la persona vinculada al usuario.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <InfoRow icon={UserRound} label="Nombre completo" value={hasPersonalInfo ? displayName : null} />
            <InfoRow icon={Phone} label="Telefono" value={user.persona?.telefono} />
            <InfoRow icon={MapPin} label="Direccion" value={user.persona?.direccion} />
            <InfoRow icon={IdCard} label="CURP" value={user.persona?.curp} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Informacion especifica del rol</CardTitle>
          <CardDescription>Se muestra solo la informacion real disponible para tu tipo de usuario.</CardDescription>
        </CardHeader>
        <CardContent>
          {user.role === "Tutor" && user.tutor_profile ? (
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="grid gap-4">
                <InfoRow icon={Users} label="Parentesco" value={user.tutor_profile.parentesco} />
                <InfoRow icon={Briefcase} label="Ocupacion" value={user.tutor_profile.ocupacion} />
                <InfoRow
                  icon={Users}
                  label="Alumnos vinculados"
                  value={String(user.tutor_profile.alumnos_count ?? user.tutor_profile.alumnos?.length ?? 0)}
                />
              </div>

              <div className="rounded-2xl border border-[#E5E7EB] bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6B7280]">Alumnos asignados</p>
                {user.tutor_profile.alumnos && user.tutor_profile.alumnos.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {user.tutor_profile.alumnos.map((alumno) => (
                      <Badge key={alumno.id} variant="outline" className="bg-white px-3 py-1 text-sm">
                        {alumno.nombre || `Alumno ${alumno.id}`}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[#6B7280]">Aun no hay alumnos vinculados a este perfil de tutor.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-[#111827]">No hay informacion adicional registrada para este rol.</p>
              <p className="mt-2 text-sm text-[#6B7280]">
                La vista ya esta preparada para mostrar mas campos cuando el backend incorpore perfiles especificos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
