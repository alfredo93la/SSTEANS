import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { CalendarDays, Clock, MapPin, Users, Plus, Search, Filter } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";
interface EventoData { id: number; titulo: string; descripcion: string; tipo: string; fecha: string; horaInicio: string; horaFin: string; lugar: string; destinatarios: string[]; }

interface EventosAcademicosProps {
  userRole: string;
  onNavigate: (route: string) => void;
}

export function EventosAcademicos({ userRole, onNavigate }: EventosAcademicosProps) {
  const [filtroTipo, setFiltroTipo] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState("");

  const eventosAcademicos: EventoData[] = [];

  const eventosVisibles = eventosAcademicos.filter(evento =>
    evento.destinatarios.includes(userRole)
  );

  const eventosFiltrados = eventosVisibles.filter(evento => {
    const cumpleFiltroTipo = filtroTipo === "Todos" || evento.tipo === filtroTipo;
    const cumpleBusqueda = busqueda === "" ||
      evento.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      evento.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleFiltroTipo && cumpleBusqueda;
  });

  const tiposEvento = ["Todos", "Reunión", "Junta", "Evento"];

  const getBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "Reunión":
        return "bg-purple-100 text-[#7C3AED]";
      case "Junta":
        return "bg-indigo-100 text-indigo-700";
      case "Evento":
        return "bg-pink-100 text-pink-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={CalendarDays} title="Eventos Académicos" description="Reuniones, juntas y eventos escolares programados" color="bg-[#7C3AED]">
        {(userRole === "Administrador" || userRole === "Trabajador Social") && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Evento
          </Button>
        )}
      </PageTitle>

      {/* Filtros y búsqueda */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent"
              />
            </div>

            {/* Filtro por tipo */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#6B7280]" />
              <div className="flex gap-2">
                {tiposEvento.map((tipo) => (
                  <Button
                    key={tipo}
                    variant={filtroTipo === tipo ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroTipo(tipo)}
                  >
                    {tipo}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de eventos */}
      <div className="grid grid-cols-1 gap-4">
        {eventosFiltrados.length > 0 ? (
          eventosFiltrados.map((evento) => (
            <Card key={evento.id} className="border-[#E5E7EB] hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Fecha */}
                  <div className="w-16 h-16 rounded-xl bg-linear-to-br from-purple-100 to-purple-200 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs text-[#7C3AED]">
                      {evento.fecha.split('/')[1] === "11" ? "Nov" : "Dic"}
                    </span>
                    <span className="text-xl font-bold text-[#7C3AED]">
                      {evento.fecha.split('/')[0]}
                    </span>
                  </div>

                  {/* Detalles */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-[#111827] text-lg">{evento.titulo}</h3>
                        <p className="text-sm text-[#6B7280] mt-1">{evento.descripcion}</p>
                      </div>
                      <Badge variant="secondary" className={getBadgeColor(evento.tipo)}>
                        {evento.tipo}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#6B7280]">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{evento.horaInicio} - {evento.horaFin}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{evento.lugar}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{evento.destinatarios.join(", ")}</span>
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
                <CalendarDays className="h-12 w-12 text-[#6B7280] mx-auto mb-3" />
                <p className="text-[#6B7280]">No se encontraron eventos</p>
                <p className="text-sm text-[#9CA3AF] mt-1">
                  {busqueda ? "Intenta con otros términos de búsqueda" : "No hay eventos programados"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
