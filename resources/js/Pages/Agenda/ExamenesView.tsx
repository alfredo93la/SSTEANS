import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { FileText, Clock, BookOpen, Plus, Search, Filter, Award } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";
interface ExamenData { id: number; titulo: string; descripcion: string; materia: string | null; grupo: string | null; fecha: string; horaInicio: string; horaFin: string; tipo: string; valor: number; }

interface ExamenesViewProps {
  userRole: string;
  hijoSeleccionado?: number | null;
  onNavigate: (route: string) => void;
}

export function ExamenesView({ userRole }: ExamenesViewProps) {
  const [filtroMateria, setFiltroMateria] = useState<string>("Todas");
  const [busqueda, setBusqueda] = useState("");

  const examenes: ExamenData[] = [];

  const examenesFiltrados = examenes
    .filter(examen => {
      const cumpleFiltroMateria = filtroMateria === "Todas" || examen.materia === filtroMateria;
      const cumpleBusqueda = busqueda === "" ||
        examen.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        examen.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        (examen.materia ?? "").toLowerCase().includes(busqueda.toLowerCase());
      return cumpleFiltroMateria && cumpleBusqueda;
    })
    .sort((a, b) => {
      const dateA = a.fecha.split('/').reverse().join('');
      const dateB = b.fecha.split('/').reverse().join('');
      return dateA.localeCompare(dateB);
    });

  const materiasUnicas = ["Todas", ...new Set(examenes.map(e => e.materia).filter(Boolean))] as string[];

  const getBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "Parcial":
        return "bg-red-100 text-[#E11D48]";
      case "Final":
        return "bg-orange-100 text-orange-700";
      case "Extraordinario":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={FileText} title="Exámenes Programados" description="Calendario de evaluaciones y exámenes" color="bg-[#E11D48]">
        {userRole === "Profesor" && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Programar Examen
          </Button>
        )}
      </PageTitle>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <FileText className="h-6 w-6 text-[#E11D48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total Exámenes</p>
                <p className="text-2xl font-bold text-[#E11D48]">{examenesFiltrados.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Esta Semana</p>
                <p className="text-2xl font-bold text-orange-600">
                  {examenesFiltrados.filter(e => {
                    const fecha = new Date(e.fecha.split('/').reverse().join('-'));
                    const hoy = new Date();
                    const finSemana = new Date(hoy);
                    finSemana.setDate(hoy.getDate() + 7);
                    return fecha >= hoy && fecha <= finSemana;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <BookOpen className="h-6 w-6 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Materias</p>
                <p className="text-2xl font-bold text-[#7C3AED]">{materiasUnicas.length - 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Buscar exámenes por materia o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent"
              />
            </div>

            {/* Filtro por materia */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#6B7280]" />
              <select
                value={filtroMateria}
                onChange={(e) => setFiltroMateria(e.target.value)}
                className="px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent"
              >
                {materiasUnicas.map((materia) => (
                  <option key={materia} value={materia}>
                    {materia}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de exámenes */}
      <div className="grid grid-cols-1 gap-4">
        {examenesFiltrados.length > 0 ? (
          examenesFiltrados.map((examen) => (
              <Card key={examen.id} className="border-[#E5E7EB] hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Fecha */}
                    <div className="w-16 h-16 rounded-xl bg-linear-to-br from-red-100 to-red-200 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs text-[#E11D48]">
                        {examen.fecha.split('/')[1] === "11" ? "Nov" : "Dic"}
                      </span>
                      <span className="text-xl font-bold text-[#E11D48]">
                        {examen.fecha.split('/')[0]}
                      </span>
                    </div>

                    {/* Detalles */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#111827] text-lg">{examen.materia}</h3>
                            <Badge variant="outline" className="text-xs">
                              {examen.grupo}
                            </Badge>
                          </div>
                          <p className="text-sm text-[#6B7280]">{examen.descripcion}</p>
                        </div>
                        <Badge variant="secondary" className={getBadgeColor(examen.tipo)}>
                          {examen.tipo}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#6B7280]">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{examen.horaInicio} - {examen.horaFin}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span>Valor: {examen.valor}% de la calificación</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          ))
        ) : (
          <Card className="border-[#E5E7EB]">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-[#6B7280] mx-auto mb-3" />
                <p className="text-[#6B7280]">No se encontraron exámenes</p>
                <p className="text-sm text-[#9CA3AF] mt-1">
                  {busqueda ? "Intenta con otros términos de búsqueda" : "No hay exámenes programados"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
