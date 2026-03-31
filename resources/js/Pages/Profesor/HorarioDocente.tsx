import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Badge } from "../../Components/ui/badge";
import { Clock, MapPin, Users, BookOpen, Calendar } from "lucide-react";
import { PageTitle } from "../../Components/PageTitle";
import { horarios, grupos, materias } from "../../data/mockData";

export function HorarioDocente() {
  // Para este ejemplo, usaremos horar del profesor ID 1
  const profesorId = 1;

  // Obtener todos los grupos del profesor
  const gruposProfesor = grupos.filter(g => g.profesorId === profesorId);
  const grupoIds = gruposProfesor.map(g => g.id);

  // Obtener horarios del profesor (basados en sus grupos)
  const horariosProfesor = horarios.filter(h => grupoIds.includes(h.grupoId));

  // Días de la semana
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  // Horas del día
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
    return horariosProfesor.find(
      (h) => h.diaSemana === dia && `${h.horaInicio} - ${h.horaFin}` === hora
    );
  };

  // Colores por grupo
  const coloresGrupos: Record<number, string> = {
    1: "bg-blue-100 text-[#1D4ED8] border-blue-300",
    2: "bg-purple-100 text-[#7C3AED] border-purple-300",
    3: "bg-green-100 text-[#059669] border-green-300",
  };

  const getColorGrupo = (grupoId: number) => {
    return coloresGrupos[grupoId] || "bg-gray-100 text-[#6B7280] border-gray-300";
  };

  // Calcular estadísticas
  const totalClases = horariosProfesor.length;
  const clasesPorDia = Math.round(totalClases / 5);
  const horasPorSemana = totalClases;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={Clock} title="Mi Horario" description="Horario semanal de todas tus clases" color="bg-[#7C3AED]" />

      {/* Estadísticas */}
      <Card className="border-[#E5E7EB] bg-gradient-to-br from-purple-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-[#6B7280]">Grupos Asignados</p>
              <p className="text-2xl font-bold text-[#7C3AED] mt-1">{gruposProfesor.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#6B7280]">Días de Clase</p>
              <p className="text-2xl font-bold text-[#1D4ED8] mt-1">{diasSemana.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#6B7280]">Clases por Día (prom.)</p>
              <p className="text-2xl font-bold text-[#059669] mt-1">{clasesPorDia}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#6B7280]">Horas por Semana</p>
              <p className="text-2xl font-bold text-[#D97706] mt-1">{horasPorSemana}</p>
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
                      className="border border-[#E5E7EB] bg-gradient-to-br from-purple-50 to-blue-50 p-3 text-center text-sm font-semibold text-[#111827]"
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

                      const materia = materias.find(m => m.id === clase.materiaId);
                      const grupo = grupos.find(g => g.id === clase.grupoId);

                      return (
                        <td
                          key={`${dia}-${hora}`}
                          className="border border-[#E5E7EB] p-2"
                        >
                          <div
                            className={`rounded-lg border-2 p-3 ${getColorGrupo(
                              clase.grupoId
                            )}`}
                          >
                            <div className="font-semibold text-sm mb-1">
                              {materia?.nombre}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs opacity-80">
                                <Users className="h-3 w-3" />
                                <span>{grupo?.nombre}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs opacity-80">
                                <MapPin className="h-3 w-3" />
                                <span>{clase.salon}</span>
                              </div>
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
          const clasesDelDia = horariosProfesor.filter((h) => h.diaSemana === dia);

          return (
            <Card key={dia} className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#1D4ED8]" />
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
                      const materia = materias.find(m => m.id === clase.materiaId);
                      const grupo = grupos.find(g => g.id === clase.grupoId);
                      
                      return (
                        <div
                          key={clase.id}
                          className={`rounded-lg border-2 p-4 ${getColorGrupo(
                            clase.grupoId
                          )}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold">{materia?.nombre}</h4>
                            <Badge variant="secondary" className="bg-white/50">
                              {materia?.clave}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {clase.horaInicio} - {clase.horaFin}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>Grupo {grupo?.nombre}</span>
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

      {/* Resumen de grupos */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Mis Grupos</CardTitle>
          <CardDescription>Grupos bajo tu responsabilidad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {gruposProfesor.map((grupo) => {
              const clasesGrupo = horariosProfesor.filter(h => h.grupoId === grupo.id);
              const materiasGrupo = [...new Set(clasesGrupo.map(c => c.materiaId))];
              
              return (
                <div
                  key={grupo.id}
                  className={`rounded-lg border-2 p-4 ${getColorGrupo(grupo.id)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center font-bold">
                      {grupo.nombre.split('°')[0]}
                    </div>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-lg mb-1">{grupo.nombre}</h4>
                  <div className="space-y-1 text-sm">
                    <p>{clasesGrupo.length} clases por semana</p>
                    <p>{materiasGrupo.length} materia(s)</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Leyenda de Grupos</CardTitle>
          <CardDescription>Colores asignados a cada grupo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gruposProfesor.map((grupo) => (
              <div
                key={grupo.id}
                className={`rounded-lg border-2 p-3 ${getColorGrupo(grupo.id)}`}
              >
                <div className="font-semibold text-center">{grupo.nombre}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
