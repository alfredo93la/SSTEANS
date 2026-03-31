import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Badge } from "../../Components/ui/badge";
import { Clock, MapPin, BookOpen, CalendarDays } from "lucide-react";
import { horarios, getMateriaById } from "../../data/mockData";
import { PageTitle } from "../../Layouts/PageTitle";

interface HorarioTutorProps {
  alumnoId: number;
}

export function HorarioTutor({ alumnoId }: HorarioTutorProps) {
  // Obtener horarios del alumno
  const horariosAlumno = horarios.filter((h) => h.alumnoId === alumnoId);

  // Días de la semana
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  // Horas del día (generales)
  const horasDelDia = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
  ];

  // Organizar horarios por día y hora
  const getClasePorDiaHora = (dia: string, hora: string) => {
    return horariosAlumno.find(
      (h) => h.diaSemana === dia && `${h.horaInicio} - ${h.horaFin}` === hora
    );
  };

  // Colores por materia
  const coloresMaterias: Record<number, string> = {
    1: "bg-blue-100 text-[#1D4ED8] border-blue-300",      // Matemáticas
    2: "bg-purple-100 text-[#7C3AED] border-purple-300",  // Español
    3: "bg-amber-100 text-[#D97706] border-amber-300",    // Historia
    4: "bg-green-100 text-[#059669] border-green-300",    // Ciencias
    5: "bg-pink-100 text-[#E11D48] border-pink-300",      // Inglés
    6: "bg-teal-100 text-[#0891B2] border-teal-300",      // Educación Física
  };

  const getColorMateria = (materiaId: number) => {
    return coloresMaterias[materiaId] || "bg-gray-100 text-[#6B7280] border-gray-300";
  };

  // Vista responsiva: Desktop muestra tabla, móvil muestra lista
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageTitle
        icon={CalendarDays}
        title="Horario de Clases"
        description="Horario semanal de clases por materia"
        color="bg-[#7C3AED]"
      />

      {/* Información general */}
      <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-[#6B7280]">Días de clase</p>
              <p className="text-2xl font-bold text-[#1D4ED8]">{diasSemana.length}</p>
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Clases por semana</p>
              <p className="text-2xl font-bold text-[#7C3AED]">{horariosAlumno.length}</p>
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">Horario</p>
              <p className="text-lg font-bold text-[#111827]">08:00 - 14:00</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista Desktop: Tabla de horarios */}
      <Card className="border-[#E5E7EB] hidden lg:block">
        <CardHeader>
          <CardTitle>Horario Semanal</CardTitle>
          <CardDescription>Distribución de clases por día y hora</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-[#E5E7EB] bg-gray-50 p-3 text-left text-sm font-semibold text-[#6B7280] w-32">
                    Hora
                  </th>
                  {diasSemana.map((dia) => (
                    <th
                      key={dia}
                      className="border border-[#E5E7EB] bg-linear-to-br from-blue-50 to-purple-50 p-3 text-center text-sm font-semibold text-[#111827]"
                    >
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horasDelDia.map((hora) => (
                  <tr key={hora}>
                    <td className="border border-[#E5E7EB] bg-gray-50 p-3 text-sm font-medium text-[#6B7280]">
                      {hora}
                    </td>
                    {diasSemana.map((dia) => {
                      const clase = getClasePorDiaHora(dia, hora);
                      if (!clase) {
                        return (
                          <td
                            key={`${dia}-${hora}`}
                            className="border border-[#E5E7EB] p-3 bg-white"
                          >
                            <div className="text-center text-xs text-[#9CA3AF]">-</div>
                          </td>
                        );
                      }

                      const materia = getMateriaById(clase.materiaId);
                      return (
                        <td
                          key={`${dia}-${hora}`}
                          className="border border-[#E5E7EB] p-2"
                        >
                          <div
                            className={`rounded-lg border-2 p-3 ${getColorMateria(
                              clase.materiaId
                            )}`}
                          >
                            <div className="font-semibold text-sm mb-1">
                              {materia?.nombre}
                            </div>
                            <div className="flex items-center gap-1 text-xs opacity-80">
                              <MapPin className="h-3 w-3" />
                              <span>{clase.salon}</span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Vista Móvil/Tablet: Lista por día */}
      <div className="space-y-4 lg:hidden">
        {diasSemana.map((dia) => {
          const clasesDelDia = horariosAlumno.filter((h) => h.diaSemana === dia);

          return (
            <Card key={dia} className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#1D4ED8]" />
                  {dia}
                </CardTitle>
                <CardDescription>{clasesDelDia.length} clases programadas</CardDescription>
              </CardHeader>
              <CardContent>
                {clasesDelDia.length === 0 ? (
                  <p className="text-center text-sm text-[#6B7280] py-4">
                    No hay clases programadas
                  </p>
                ) : (
                  <div className="space-y-3">
                    {clasesDelDia.map((clase) => {
                      const materia = getMateriaById(clase.materiaId);
                      return (
                        <div
                          key={clase.id}
                          className={`rounded-lg border-2 p-4 ${getColorMateria(
                            clase.materiaId
                          )}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{materia?.nombre}</h4>
                            <Badge variant="secondary" className="bg-white/50">
                              {materia?.clave}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {clase.horaInicio} - {clase.horaFin}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>Salón {clase.salon}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leyenda de materias */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Leyenda de Materias</CardTitle>
          <CardDescription>Colores asignados a cada materia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((materiaId) => {
              const materia = getMateriaById(materiaId);
              return (
                <div
                  key={materiaId}
                  className={`rounded-lg border-2 p-3 ${getColorMateria(materiaId)}`}
                >
                  <div className="font-semibold text-sm text-center">
                    {materia?.nombre}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
