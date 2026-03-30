import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PageTitle } from "../PageTitle";
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  UserCog,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function Grupos() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("todos");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<any>(null);

  // Datos de ejemplo
  const grupos = [
    {
      id: 1,
      nombre: "1°A",
      grado: "1°",
      grupo: "A",
      totalAlumnos: 32,
      profesorTitular: "Prof. María García López",
      turno: "Matutino",
      aula: "Edificio A - Aula 101",
      materiasAsignadas: 8,
      profesores: ["Prof. María García", "Prof. Juan Pérez", "Prof. Roberto Sánchez"]
    },
    {
      id: 2,
      nombre: "1°B",
      grado: "1°",
      grupo: "B",
      totalAlumnos: 30,
      profesorTitular: "Prof. Laura Rodríguez Cruz",
      turno: "Matutino",
      aula: "Edificio A - Aula 102",
      materiasAsignadas: 8,
      profesores: ["Prof. Laura Rodríguez", "Prof. Carmen Flores", "Prof. Pedro González"]
    },
    {
      id: 3,
      nombre: "2°A",
      grado: "2°",
      grupo: "A",
      totalAlumnos: 28,
      profesorTitular: "Prof. Roberto Sánchez Díaz",
      turno: "Matutino",
      aula: "Edificio B - Aula 201",
      materiasAsignadas: 9,
      profesores: ["Prof. Roberto Sánchez", "Prof. Ana Martínez", "Prof. Carlos Ruiz"]
    },
    {
      id: 4,
      nombre: "2°B",
      grado: "2°",
      grupo: "B",
      totalAlumnos: 29,
      profesorTitular: "Prof. Carmen Flores Ruiz",
      turno: "Vespertino",
      aula: "Edificio B - Aula 202",
      materiasAsignadas: 9,
      profesores: ["Prof. Carmen Flores", "Prof. Luis Hernández", "Prof. Sofia López"]
    },
    {
      id: 5,
      nombre: "3°A",
      grado: "3°",
      grupo: "A",
      totalAlumnos: 27,
      profesorTitular: "Prof. Pedro González Mora",
      turno: "Matutino",
      aula: "Edificio C - Aula 301",
      materiasAsignadas: 10,
      profesores: ["Prof. Pedro González", "Prof. Diana Torres", "Prof. Miguel Ángel"]
    },
    {
      id: 6,
      nombre: "3°B",
      grado: "3°",
      grupo: "B",
      totalAlumnos: 26,
      profesorTitular: "Prof. Ana Martínez Silva",
      turno: "Matutino",
      aula: "Edificio C - Aula 302",
      materiasAsignadas: 10,
      profesores: ["Prof. Ana Martínez", "Prof. Jorge Ramírez", "Prof. Patricia Gómez"]
    }
  ];

  const estadisticas = {
    totalGrupos: 12,
    totalAlumnos: 358,
    promedioAlumnosPorGrupo: 29.8,
    gruposMatutino: 9,
    gruposVespertino: 3
  };

  const verDetalle = (grupo: any) => {
    setGrupoSeleccionado(grupo);
    setModalDetalle(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={Users} title="Gestión de Grupos" description="Administra los grupos escolares y sus asignaciones" color="bg-[#1D4ED8]">
        <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Grupo</DialogTitle>
              <DialogDescription>
                Llena los campos para crear un nuevo grupo escolar.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grado">Grado</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1° (Primero)</SelectItem>
                      <SelectItem value="2">2° (Segundo)</SelectItem>
                      <SelectItem value="3">3° (Tercero)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="grupo">Grupo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="profesor-titular">Profesor Titular</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar profesor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Prof. María García López</SelectItem>
                    <SelectItem value="2">Prof. Laura Rodríguez Cruz</SelectItem>
                    <SelectItem value="3">Prof. Roberto Sánchez Díaz</SelectItem>
                    <SelectItem value="4">Prof. Carmen Flores Ruiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="turno">Turno</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar turno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="matutino">Matutino (7:00 - 14:00)</SelectItem>
                      <SelectItem value="vespertino">Vespertino (14:00 - 21:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="capacidad">Capacidad Máxima</Label>
                  <Input id="capacidad" type="number" placeholder="35" defaultValue="35" />
                </div>
              </div>

              <div>
                <Label htmlFor="aula">Aula Asignada</Label>
                <Input id="aula" placeholder="Ej: Edificio A - Aula 101" />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  📚 <strong>Nota:</strong> Después de crear el grupo, podrás asignar materias, horarios y alumnos desde las secciones correspondientes.
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setModalNuevo(false)}>
                  Cancelar
                </Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                  Crear Grupo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageTitle>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Total Grupos</p>
                <p className="text-2xl font-bold text-[#7C3AED] mt-1">{estadisticas.totalGrupos}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-[#7C3AED]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Total Alumnos</p>
                <p className="text-2xl font-bold text-[#1D4ED8] mt-1">{estadisticas.totalAlumnos}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <GraduationCap className="h-6 w-6 text-[#1D4ED8]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Buscar por nombre de grupo, profesor..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroGrado} onValueChange={setFiltroGrado}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Grado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los grados</SelectItem>
                <SelectItem value="1">1° (Primero)</SelectItem>
                <SelectItem value="2">2° (Segundo)</SelectItem>
                <SelectItem value="3">3° (Tercero)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de grupos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grupos.map((grupo) => (
          <Card key={grupo.id} className="border-[#E5E7EB] hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{grupo.nombre}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {grupo.turno}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Alumnos:</span>
                  <span className="font-semibold text-[#111827]">{grupo.totalAlumnos}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Materias:</span>
                  <span className="font-semibold text-[#111827]">{grupo.materiasAsignadas}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Aula:</span>
                  <span className="font-semibold text-[#111827] text-xs">{grupo.aula}</span>
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs text-[#6B7280] mb-1">Profesor Titular:</p>
                <p className="text-sm font-medium text-[#111827]">{grupo.profesorTitular}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => verDetalle(grupo)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Ver
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de detalle */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Grupo</DialogTitle>
            <DialogDescription>
              Información completa del grupo seleccionado.
            </DialogDescription>
          </DialogHeader>
          {grupoSeleccionado && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="p-3 bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] rounded-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl">{grupoSeleccionado.nombre}</h3>
                  <Badge variant="outline">{grupoSeleccionado.turno}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-[#E5E7EB]">
                  <CardContent className="pt-4">
                    <p className="text-xs text-[#6B7280]">Total Alumnos</p>
                    <p className="text-2xl font-bold text-[#7C3AED]">{grupoSeleccionado.totalAlumnos}</p>
                  </CardContent>
                </Card>
                <Card className="border-[#E5E7EB]">
                  <CardContent className="pt-4">
                    <p className="text-xs text-[#6B7280]">Materias</p>
                    <p className="text-2xl font-bold text-[#1D4ED8]">{grupoSeleccionado.materiasAsignadas}</p>
                  </CardContent>
                </Card>
                <Card className="border-[#E5E7EB] col-span-2">
                  <CardContent className="pt-4">
                    <p className="text-xs text-[#6B7280]">Aula</p>
                    <p className="text-lg font-bold text-[#059669]">{grupoSeleccionado.aula}</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Label className="text-[#111827] font-semibold">Profesor Titular</Label>
                <p className="text-[#6B7280] mt-1">{grupoSeleccionado.profesorTitular}</p>
              </div>

              <div>
                <Label className="text-[#111827] font-semibold">Profesores Asignados</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {grupoSeleccionado.profesores.map((profesor: string, i: number) => (
                    <Badge key={i} variant="secondary">{profesor}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setModalDetalle(false)}>
                  Cerrar
                </Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Grupo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
