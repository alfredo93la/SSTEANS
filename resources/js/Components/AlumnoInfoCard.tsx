import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

interface AlumnoInfo {
  id: number;
  nombre: string;
  grupo: string;
  ciclo: string;
}

interface AlumnoInfoCardProps {
  alumnoId: number;
}

export function AlumnoInfoCard({ alumnoId }: AlumnoInfoCardProps) {
  const [alumno, setAlumno] = useState<AlumnoInfo | null>(null);

  useEffect(() => {
    if (!alumnoId) return;
    axios.get("/tutor/alumnos-asignados")
      .then(({ data }) => {
        const lista: AlumnoInfo[] = data.data ?? [];
        const found = lista.find((a) => a.id === alumnoId);
        if (found) setAlumno(found);
      })
      .catch(() => {});
  }, [alumnoId]);

  if (!alumno) return null;

  const initials = alumno.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Card className="bg-linear-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-linear-to-br from-[#7C3AED] to-[#1D4ED8] rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0 shadow-md">
            {initials}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#111827]">{alumno.nombre}</p>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="secondary" className="bg-white/80 text-[#000000]">
                {alumno.grupo}
              </Badge>
              <span className="text-sm text-[#6B7280]">Ciclo {alumno.ciclo}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
