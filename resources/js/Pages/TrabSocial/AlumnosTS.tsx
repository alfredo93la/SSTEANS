import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import {
  Users,
  Search,
  Filter,
  User,
  Eye,
  ChevronRight,
  Phone,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { PageTitle } from "../../Layouts/PageTitle";

interface Alumno {
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
  grado: number | null;
  count: number;
}

interface AlumnosTSProps {
  onNavigate?: (route: string) => void;
}

export function AlumnosTS({ onNavigate }: AlumnosTSProps) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [grupos, setGrupos] = useState<GrupoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroGrupoId, setFiltroGrupoId] = useState<string>("todos");
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState<number | null>(null);

  useEffect(() => {
    axios.get<{ alumnos: Alumno[]; grupos: GrupoApi[] }>("/api/trabajador-social/alumnos")
      .then(({ data }) => {
        // Calcular count real de alumnos por grupo
        const countMap = new Map<number, number>();
        data.alumnos.forEach((a) => {
          if (a.grupo_id != null) countMap.set(a.grupo_id, (countMap.get(a.grupo_id) ?? 0) + 1);
        });
        const gruposConCount = data.grupos.map((g) => ({ ...g, count: countMap.get(g.id) ?? 0 }));
        setAlumnos(data.alumnos);
        setGrupos(gruposConCount);
      })
      .finally(() => setLoading(false));
  }, []);

  const grupoNombre = (grupo_id: number | null) =>
    grupos.find((g) => g.id === grupo_id)?.nombre ?? "";

  const alumnosFiltrados = useMemo(() => {
    return alumnos.filter((a) => {
      const matchCard   = grupoSeleccionadoId === null || a.grupo_id === grupoSeleccionadoId;
      const matchSelect = filtroGrupoId === "todos" || a.grupo_id === Number(filtroGrupoId);
      const matchSearch =
        !busqueda ||
        a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (a.tutor ?? "").toLowerCase().includes(busqueda.toLowerCase());
      return matchCard && matchSelect && matchSearch;
    });
  }, [alumnos, grupoSeleccionadoId, filtroGrupoId, busqueda]);

  const verPerfilAlumno = (alumnoId: number) => {
    onNavigate?.(`#/alumnos/perfil/${alumnoId}`);
  };

  const initials = (nombre: string) => {
    const parts = nombre.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (parts[0]?.[0] ?? "?").toUpperCase();
  };

  const grupoActual = grupoSeleccionadoId !== null
    ? grupos.find((g) => g.id === grupoSeleccionadoId)
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={Users} title="Listado de Alumnos" description="Consulta información y expedientes de alumnos por grupo" color="bg-[#1D4ED8]" />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Users className="h-6 w-6 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total Alumnos</p>
                <p className="text-2xl font-bold text-[#7C3AED]">{alumnos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <GraduationCap className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Grupos</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{grupos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Buscar por nombre o tutor..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroGrupoId} onValueChange={setFiltroGrupoId}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los grupos</SelectItem>
                {grupos.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>{g.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listado */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Alumnos</CardTitle>
          <CardDescription>
            {grupoActual
              ? `Grupo ${grupoActual.nombre} — ${alumnosFiltrados.length} alumno(s)`
              : `${alumnosFiltrados.length} alumno(s) encontrado(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B7280]" />
            </div>
          ) : alumnosFiltrados.length === 0 ? (
            <p className="text-sm text-[#6B7280] text-center py-8">No se encontraron alumnos.</p>
          ) : (
            <div className="space-y-3">
              {alumnosFiltrados.map((alumno) => {
                const nombre_grupo = grupoNombre(alumno.grupo_id);
                return (
                  <div
                    key={alumno.id}
                    className="p-4 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all cursor-pointer"
                    onClick={() => verPerfilAlumno(alumno.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-linear-to-br from-[#7C3AED] to-[#1D4ED8] rounded-lg flex items-center justify-center text-white font-bold shrink-0">
                          {initials(alumno.nombre)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="font-semibold text-[#111827]">{alumno.nombre}</h4>
                            {nombre_grupo && <Badge variant="outline">{nombre_grupo}</Badge>}
                            {alumno.estado !== "activo" && (
                              <Badge className="bg-yellow-100 text-yellow-700 capitalize">{alumno.estado}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-[#6B7280] flex-wrap">
                            {alumno.tutor && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{alumno.tutor}</span>
                                {alumno.tutor_parentesco && (
                                  <span className="text-[#9CA3AF]">· {alumno.tutor_parentesco}</span>
                                )}
                              </div>
                            )}
                            {alumno.tutor_telefono && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{alumno.tutor_telefono}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            verPerfilAlumno(alumno.id);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Perfil
                        </Button>
                        <ChevronRight className="h-5 w-5 text-[#6B7280]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
