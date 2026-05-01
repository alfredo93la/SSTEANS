import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { CalendarDays, Loader2, Clock } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";
import { AlumnoInfoCard } from "../../Components/AlumnoInfoCard";

interface ClaseData { id: number; materiaId: number; materia: string | null; clave: string; diaSemana: string; horaInicio: string; horaFin: string; salon: string; profesor: string; }

interface HorarioTutorProps {
  alumnoId: number;
}

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const;

export function HorarioTutor({ alumnoId }: HorarioTutorProps) {
  const [horario, setHorario] = useState<ClaseData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!alumnoId) return;
    setLoading(true);
    axios.get(`/api/tutor/horario/${alumnoId}`)
      .then(({ data }) => setHorario(data.horario ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [alumnoId]);

  const clasesPorDia = (dia: string) =>
    horario
      .filter((h) => h.diaSemana === dia)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  return (
    <div className="space-y-6 animate-fade-in">
      <AlumnoInfoCard alumnoId={alumnoId} />
      <PageTitle
        icon={Clock}
        title="Horario de Clases"
        description="Horario semanal de clases del alumno"
        color="bg-[#7C3AED]"
      />

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" /></div>
      ) : horario.length === 0 ? (
        <Card className="border-[#E5E7EB]">
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-10 w-10 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[#6B7280]">No hay clases asignadas para este alumno.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {DIAS.map((dia) => {
            const clases = clasesPorDia(dia);
            return (
              <Card key={dia} className="border-[#E5E7EB]">
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm font-semibold text-[#374151]">{dia}</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2">
                  {clases.length === 0 ? (
                    <p className="text-xs text-[#9CA3AF] text-center py-2">—</p>
                  ) : (
                    clases.map((clase) => (
                      <div key={clase.id} className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-semibold text-[#1D4ED8] leading-tight">{clase.materia}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{clase.horaInicio}–{clase.horaFin}</p>
                        {clase.profesor && <p className="text-xs text-[#6B7280] truncate">{clase.profesor}</p>}
                        {clase.salon && <p className="text-xs text-[#9CA3AF]">{clase.salon}</p>}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
