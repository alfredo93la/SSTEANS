import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { PageTitle } from "../../Layouts/PageTitle";
import { User, ArrowLeft, Phone, Loader2, Users } from "lucide-react";

interface AlumnoDetalle {
  id: number;
  nombre: string;
  grupo_id: number | null;
  estado: string;
  tutor: string | null;
  tutor_parentesco: string | null;
  tutor_telefono: string | null;
}

interface GrupoApi {
  id: number;
  nombre: string;
}

interface PerfilAlumnoTSProps {
  alumnoId: number;
  onNavigate?: (route: string) => void;
}

export function PerfilAlumnoTS({ alumnoId, onNavigate }: PerfilAlumnoTSProps) {
  const [alumno, setAlumno] = useState<AlumnoDetalle | null>(null);
  const [grupoNombre, setGrupoNombre] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios
      .get<{ alumnos: AlumnoDetalle[]; grupos: GrupoApi[] }>("/api/trabajador-social/alumnos")
      .then(({ data }) => {
        const found = data.alumnos.find((a) => a.id === alumnoId) ?? null;
        setAlumno(found);
        if (!found) { setNotFound(true); return; }
        const grupo = data.grupos.find((g) => g.id === found.grupo_id);
        setGrupoNombre(grupo?.nombre ?? "");
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [alumnoId]);

  const initials = (nombre: string) => {
    const parts = nombre.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (parts[0]?.[0] ?? "?").toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate?.("#/trabajador-social/alumnos")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
      </div>

      <PageTitle
        icon={User}
        title="Perfil del Alumno"
        description="Información general y datos de contacto"
        color="bg-[#1D4ED8]"
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#6B7280]" />
        </div>
      ) : notFound || !alumno ? (
        <Card className="border-[#E5E7EB]">
          <CardContent className="py-12 text-center text-[#6B7280]">
            Alumno no encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Datos del alumno */}
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-base">Datos del Alumno</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-linear-to-br from-[#7C3AED] to-[#1D4ED8] rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {initials(alumno.nombre)}
                </div>
                <div>
                  <p className="font-semibold text-[#111827] text-lg">{alumno.nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {grupoNombre && <Badge variant="outline">{grupoNombre}</Badge>}
                    {alumno.estado !== "activo" && (
                      <Badge className="bg-yellow-100 text-yellow-700 capitalize">{alumno.estado}</Badge>
                    )}
                    {alumno.estado === "activo" && (
                      <Badge className="bg-green-100 text-green-700">Activo</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datos del tutor */}
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-base">Tutor / Familiar</CardTitle>
            </CardHeader>
            <CardContent>
              {alumno.tutor ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-[#374151]">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-4 w-4 text-[#7C3AED]" />
                    </div>
                    <div>
                      <span>{alumno.tutor}</span>
                      {alumno.tutor_parentesco && (
                        <span className="ml-2 text-xs text-[#6B7280]">({alumno.tutor_parentesco})</span>
                      )}
                    </div>
                  </div>
                  {alumno.tutor_telefono && (
                    <div className="flex items-center gap-3 text-sm text-[#374151]">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Phone className="h-4 w-4 text-[#1D4ED8]" />
                      </div>
                      <span>{alumno.tutor_telefono}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#6B7280]">Sin tutor registrado.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
