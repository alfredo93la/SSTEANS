import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { 
  BookOpen, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  BookMarked,
  Users,
  GraduationCap,
  Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function Materias() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("todos");
  const [filtroArea, setFiltroArea] = useState("todos");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<any>(null);

  // Datos de ejemplo
  const materias = [
    {
      id: 1,
      nombre: "Matemáticas",
      clave: "MAT-101",
      area: "Ciencias Exactas",
      grados: ["1°", "2°", "3°"],
      horasSemana: 5,
      descripcion: "Aritmética, álgebra básica y geometría",
      profesores: ["Prof. María García López", "Prof. Roberto Sánchez Díaz"],
      gruposAsignados: 8,
      color: "blue"
    },
    {
      id: 2,
      nombre: "Español",
      clave: "ESP-101",
      area: "Lengua y Literatura",
      grados: ["1°", "2°", "3°"],
      horasSemana: 5,
      descripcion: "Gramática, lectura comprensiva y redacción",
      profesores: ["Prof. Laura Rodríguez Cruz", "Prof. Carmen Flores Ruiz"],
      gruposAsignados: 8,
      color: "red"
    },
    {
      id: 3,
      nombre: "Ciencias (Biología)",
      clave: "BIO-201",
      area: "Ciencias Naturales",
      grados: ["2°"],
      horasSemana: 4,
      descripcion: "Estudio de los seres vivos y ecosistemas",
      profesores: ["Prof. Pedro González Mora"],
      gruposAsignados: 3,
      color: "green"
    },
    {
      id: 4,
      nombre: "Historia de México",
      clave: "HIS-101",
      area: "Ciencias Sociales",
      grados: ["1°", "2°", "3°"],
      horasSemana: 3,
      descripcion: "Historia desde la época prehispánica hasta la actualidad",
      profesores: ["Prof. Ana Martínez Silva"],
      gruposAsignados: 6,
      color: "yellow"
    },
    {
      id: 5,
      nombre: "Inglés",
      clave: "ING-101",
      area: "Lenguas Extranjeras",
      grados: ["1°", "2°", "3°"],
      horasSemana: 4,
      descripcion: "Inglés básico e intermedio",
      profesores: ["Prof. Diana Torres", "Prof. Luis Hernández"],
      gruposAsignados: 8,
      color: "purple"
    },
    {
      id: 6,
      nombre: "Educación Física",
      clave: "EDF-101",
      area: "Desarrollo Físico",
      grados: ["1°", "2°", "3°"],
      horasSemana: 2,
      descripcion: "Actividades deportivas y desarrollo motor",
      profesores: ["Prof. Carlos Ruiz"],
      gruposAsignados: 8,
      color: "orange"
    },
    {
      id: 7,
      nombre: "Física",
      clave: "FIS-301",
      area: "Ciencias Exactas",
      grados: ["3°"],
      horasSemana: 4,
      descripcion: "Mecánica, energía y ondas",
      profesores: ["Prof. Roberto Sánchez Díaz"],
      gruposAsignados: 2,
      color: "indigo"
    },
    {
      id: 8,
      nombre: "Artes",
      clave: "ART-101",
      area: "Expresión Artística",
      grados: ["1°", "2°"],
      horasSemana: 2,
      descripcion: "Música, pintura y expresión creativa",
      profesores: ["Prof. Sofia López"],
      gruposAsignados: 5,
      color: "pink"
    },
    {
      id: 9,
      nombre: "Formación Cívica y Ética",
      clave: "FCE-101",
      area: "Ciencias Sociales",
      grados: ["1°", "2°", "3°"],
      horasSemana: 2,
      descripcion: "Valores, ciudadanía y derechos humanos",
      profesores: ["Prof. Patricia Gómez"],
      gruposAsignados: 7,
      color: "teal"
    }
  ];

  const estadisticas = {
    totalMaterias: 15,
    areasConocimiento: 6,
    profesoresAsignados: 18,
    horasSemanalesTotal: 248
  };

  const areasConocimiento = [
    "Ciencias Exactas",
    "Lengua y Literatura",
    "Ciencias Naturales",
    "Ciencias Sociales",
    "Lenguas Extranjeras",
    "Desarrollo Físico",
    "Expresión Artística",
    "Tecnología"
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue": return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", icon: "bg-blue-500" };
      case "red": return { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", icon: "bg-red-500" };
      case "green": return { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", icon: "bg-green-500" };
      case "yellow": return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", icon: "bg-yellow-500" };
      case "purple": return { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", icon: "bg-purple-500" };
      case "orange": return { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", icon: "bg-orange-500" };
      case "indigo": return { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200", icon: "bg-indigo-500" };
      case "pink": return { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200", icon: "bg-pink-500" };
      case "teal": return { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200", icon: "bg-teal-500" };
      default: return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", icon: "bg-gray-500" };
    }
  };

  const verDetalle = (materia: any) => {
    setMateriaSeleccionada(materia);
    setModalDetalle(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#111827]">Gestión de Materias</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Administra el catálogo de materias del plan de estudios
          </p>
        </div>
        <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Materia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Materia</DialogTitle>
              <DialogDescription>
                Llena los campos para agregar una nueva materia al plan de estudios.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre-materia">Nombre de la Materia</Label>
                  <Input id="nombre-materia" placeholder="Ej: Matemáticas" />
                </div>

                <div>
                  <Label htmlFor="clave">Clave</Label>
                  <Input id="clave" placeholder="Ej: MAT-101" />
                </div>
              </div>

              <div>
                <Label htmlFor="area">Área de Conocimiento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areasConocimiento.map((area) => (
                      <SelectItem key={area} value={area.toLowerCase().replace(/ /g, "-")}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea 
                  id="descripcion" 
                  placeholder="Describe el contenido y objetivos de la materia..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="horas-semana">Horas por Semana</Label>
                  <Input id="horas-semana" type="number" placeholder="5" min="1" max="10" />
                </div>

                <div>
                  <Label htmlFor="color-materia">Color Identificador</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="red">Rojo</SelectItem>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="yellow">Amarillo</SelectItem>
                      <SelectItem value="purple">Morado</SelectItem>
                      <SelectItem value="orange">Naranja</SelectItem>
                      <SelectItem value="indigo">Índigo</SelectItem>
                      <SelectItem value="pink">Rosa</SelectItem>
                      <SelectItem value="teal">Turquesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="grados">Grados donde se imparte</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">1° (Primero)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">2° (Segundo)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">3° (Tercero)</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  📚 <strong>Nota:</strong> Después de crear la materia, podrás asignar profesores desde la sección de Horarios.
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setModalNuevo(false)}>
                  Cancelar
                </Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                  Crear Materia
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Total Materias</p>
                <p className="text-2xl font-bold text-[#7C3AED] mt-1">{estadisticas.totalMaterias}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <BookMarked className="h-6 w-6 text-[#7C3AED]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Áreas de Conocimiento</p>
                <p className="text-2xl font-bold text-[#1D4ED8] mt-1">{estadisticas.areasConocimiento}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-[#1D4ED8]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Profesores Asignados</p>
                <p className="text-2xl font-bold text-[#059669] mt-1">{estadisticas.profesoresAsignados}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="h-6 w-6 text-[#059669]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Horas Semanales</p>
                <p className="text-2xl font-bold text-[#F59E0B] mt-1">{estadisticas.horasSemanalesTotal}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="h-6 w-6 text-[#F59E0B]" />
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
                  placeholder="Buscar por nombre, clave o profesor..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroArea} onValueChange={setFiltroArea}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las áreas</SelectItem>
                {areasConocimiento.map((area) => (
                  <SelectItem key={area} value={area.toLowerCase().replace(/ /g, "-")}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroGrado} onValueChange={setFiltroGrado}>
              <SelectTrigger className="w-full lg:w-48">
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

      {/* Grid de materias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materias.map((materia) => {
          const colors = getColorClasses(materia.color);
          return (
            <Card key={materia.id} className="border-[#E5E7EB] hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 ${colors.icon} rounded-xl`}>
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{materia.nombre}</CardTitle>
                      <p className="text-xs text-[#6B7280] mt-0.5">{materia.clave}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Badge className={`${colors.bg} ${colors.text} ${colors.border}`}>
                    {materia.area}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Horas/semana:</span>
                    <span className="font-semibold text-[#111827]">{materia.horasSemana}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Grupos:</span>
                    <span className="font-semibold text-[#111827]">{materia.gruposAsignados}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Grados:</span>
                    <div className="flex gap-1">
                      {materia.grados.map((grado, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {grado}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-[#6B7280] mb-1">
                    {materia.profesores.length} {materia.profesores.length === 1 ? 'profesor' : 'profesores'}
                  </p>
                  <p className="text-xs text-[#111827] line-clamp-1">
                    {materia.profesores[0]}
                    {materia.profesores.length > 1 && ` +${materia.profesores.length - 1}`}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => verDetalle(materia)}
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
          );
        })}
      </div>

      {/* Modal de detalle */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de la Materia</DialogTitle>
            <DialogDescription>
              Información completa de la materia seleccionada.
            </DialogDescription>
          </DialogHeader>
          {materiaSeleccionada && (
            <div className="space-y-4">
              <div className={`flex items-center gap-4 p-4 rounded-lg ${getColorClasses(materiaSeleccionada.color).bg}`}>
                <div className={`p-3 ${getColorClasses(materiaSeleccionada.color).icon} rounded-xl`}>
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{materiaSeleccionada.nombre}</h3>
                  <p className="text-sm text-[#6B7280]">{materiaSeleccionada.clave}</p>
                </div>
              </div>

              <div>
                <Label className="text-[#6B7280]">Descripción</Label>
                <p className="text-[#111827] mt-1">{materiaSeleccionada.descripcion}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-[#E5E7EB]">
                  <CardContent className="pt-4">
                    <p className="text-xs text-[#6B7280]">Horas/Semana</p>
                    <p className="text-2xl font-bold text-[#7C3AED]">{materiaSeleccionada.horasSemana}h</p>
                  </CardContent>
                </Card>
                <Card className="border-[#E5E7EB]">
                  <CardContent className="pt-4">
                    <p className="text-xs text-[#6B7280]">Grupos</p>
                    <p className="text-2xl font-bold text-[#1D4ED8]">{materiaSeleccionada.gruposAsignados}</p>
                  </CardContent>
                </Card>
                <Card className="border-[#E5E7EB] col-span-2">
                  <CardContent className="pt-4">
                    <p className="text-xs text-[#6B7280]">Área</p>
                    <Badge className={`${getColorClasses(materiaSeleccionada.color).bg} ${getColorClasses(materiaSeleccionada.color).text} mt-1`}>
                      {materiaSeleccionada.area}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Label className="text-[#111827] font-semibold">Grados donde se imparte</Label>
                <div className="flex gap-2 mt-2">
                  {materiaSeleccionada.grados.map((grado: string, i: number) => (
                    <Badge key={i} variant="secondary">{grado}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-[#111827] font-semibold">Profesores Asignados</Label>
                <div className="space-y-2 mt-2">
                  {materiaSeleccionada.profesores.map((profesor: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <GraduationCap className="h-4 w-4 text-[#7C3AED]" />
                      <span className="text-sm">{profesor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setModalDetalle(false)}>
                  Cerrar
                </Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Materia
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
