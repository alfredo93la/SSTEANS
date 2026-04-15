import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Clock, Loader2 } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";

interface ClaseData { id: number; materiaId: number; materia: string | null; clave: string; grupoId: number; grupo: string | null; diaSemana: string; horaInicio: string; horaFin: string; salon: string; }

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const;

export function HorarioDocente() {
  const [horario, setHorario] = useState<ClaseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/profesor/horario")
      .then(({ data }) => setHorario(data.horario ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const clasesPorDia = (dia: string) =>
    horario
      .filter((h) => h.diaSemana === dia)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={Clock} title="Mi Horario" description="Horario semanal de todas tus clases" color="bg-[#7C3AED]" />

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" /></div>
      ) : horario.length === 0 ? (
        <Card className="border-[#E5E7EB]">
          <CardContent className="py-12 text-center">
            <Clock className="h-10 w-10 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[#6B7280]">No tienes clases asignadas en el ciclo activo.</p>
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
                      <div key={clase.id} className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-xs font-semibold text-[#7C3AED] leading-tight">{clase.materia}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{clase.horaInicio}–{clase.horaFin}</p>
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
