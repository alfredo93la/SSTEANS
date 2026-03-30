import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  GraduationCap, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Users,
  UserCircle,
  Phone,
  Mail,
  Calendar,
  MapPin
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { PageTitle } from "../PageTitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface AlumnosAdminProps {
  userRole?: string;
}

export function AlumnosAdmin({ userRole }: AlumnosAdminProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("todos");
  const [filtroGrupo, setFiltroGrupo] = useState("todos");
  const [filtroEstatus, setFiltroEstatus] = useState("todos");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any>(null);

  // Datos de ejemplo
  const alumnos = [
    {
      id: 1,
      matricula: "2026-001-A",
      nombre: "Juan Pérez García",
      fechaNacimiento: "15/03/2012",
      edad: 13,
      grado: "1°",
      grupo: "A",
      estatus: "Activo",
      tutor: "Sr. Juan Pérez Martínez",
      telefonoTutor: "+52 555 2345 678",
      emailTutor: "juan.perez@email.com",
      direccion: "Calle Reforma #123, Col. Centro",
      promedio: 8.5,
      asistencia: 95,
      fechaIngreso: "01/09/2025"
    },
    {
      id: 2,
      matricula: "2026-002-A",
      nombre: "Ana Pérez García",
      fechaNacimiento: "20/07/2012",
      edad: 13,
      grado: "1°",
      grupo: "A",
      estatus: "Activo",
      tutor: "Sr. Juan Pérez Martínez",
      telefonoTutor: "+52 555 2345 678",
      emailTutor: "juan.perez@email.com",
      direccion: "Calle Reforma #123, Col. Centro",
      promedio: 9.2,
      asistencia: 98,
      fechaIngreso: "01/09/2025"
    },
    {
      id: 3,
      matricula: "2026-015-B",
      nombre: "Carlos Rodríguez López",
      fechaNacimiento: "10/01/2012",
      edad: 14,
      grado: "2°",
      grupo: "A",
      estatus: "Activo",
      tutor: "Sra. María López Cruz",
      telefonoTutor: "+52 555 3456 789",
      emailTutor: "maria.lopez@email.com",
      direccion: "Av. Juárez #456, Col. Norte",
      promedio: 7.8,
      asistencia: 88,
      fechaIngreso: "01/09/2024"
    },
    {
      id: 4,
      matricula: "2026-023-C",
      nombre: "María Sánchez Díaz",
      fechaNacimiento: "05/11/2011",
      edad: 14,
      grado: "2°",
      grupo: "B",
      estatus: "Activo",
      tutor: "Sr. Roberto Sánchez",
      telefonoTutor: "+52 555 4567 890",
      emailTutor: "roberto.sanchez@email.com",
      direccion: "Calle Hidalgo #789, Col. Sur",
      promedio: 9.5,
      asistencia: 99,
      fechaIngreso: "01/09/2024"
    },
    {
      id: 5,
      matricula: "2026-034-A",
      nombre: "Luis García Hernández",
      fechaNacimiento: "22/08/2010",
      edad: 15,
      grado: "3°",
      grupo: "A",
      estatus: "Activo",
      tutor: "Sra. Carmen García",
      telefonoTutor: "+52 555 5678 901",
      emailTutor: "carmen.garcia@email.com",
      direccion: "Blvd. Constitución #321, Col. Este",
      promedio: 8.9,
      asistencia: 92,
      fechaIngreso: "01/09/2023"
    },
    {
      id: 6,
      matricula: "2026-042-B",
      nombre: "Sofia Martínez Ruiz",
      fechaNacimiento: "14/04/2011",
      edad: 14,
      grado: "3°",
      grupo: "B",
      estatus: "Baja temporal",
      tutor: "Sr. Pedro Martínez",
      telefonoTutor: "+52 555 6789 012",
      emailTutor: "pedro.martinez@email.com",
      direccion: "Calle Morelos #654, Col. Oeste",
      promedio: 8.2,
      asistencia: 75,
      fechaIngreso: "01/09/2023"
    }
  ];

  const estadisticas = {
    totalAlumnos: 358,
    alumnosActivos: 352,
    alumnosBaja: 6,
    promedioGeneral: 8.7,
    asistenciaPromedio: 93
  };

  const getEstatusColor = (estatus: string) => {
    switch (estatus) {
      case "Activo": return "bg-green-100 text-green-700 border-green-200";
      case "Baja temporal": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Baja definitiva": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPromedioColor = (promedio: number) => {
    if (promedio >= 9) return "text-green-600";
    if (promedio >= 8) return "text-blue-600";
    if (promedio >= 7) return "text-yellow-600";
    return "text-red-600";
  };

  const verDetalle = (alumno: any) => {
    setAlumnoSeleccionado(alumno);
    setModalDetalle(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={GraduationCap} title="Gestión de Alumnos" description="Administra el catálogo completo de alumnos" color="bg-[#1D4ED8]">
        <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Alumno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Alumno</DialogTitle>
              <DialogDescription>
                Llena los campos para dar de alta un nuevo alumno en el sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Información del Alumno */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[#111827] flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-[#7C3AED]" />
                  Información del Alumno
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="nombre-completo">Nombre Completo</Label>
                    <Input id="nombre-completo" placeholder="Ej: Juan Pérez García" />
                  </div>

                  <div>
                    <Label htmlFor="fecha-nacimiento">Fecha de Nacimiento</Label>
                    <Input id="fecha-nacimiento" type="date" />
                  </div>

                  <div>
                    <Label htmlFor="matricula">Matrícula</Label>
                    <Input id="matricula" placeholder="Auto-generada" disabled />
                  </div>

                  <div>
                    <Label htmlFor="grado-alumno">Grado</Label>
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
                    <Label htmlFor="grupo-alumno">Grupo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input id="direccion" placeholder="Calle, número, colonia, ciudad" />
                  </div>
                </div>
              </div>

              {/* Información del Tutor */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-[#111827] flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#1D4ED8]" />
                  Información del Tutor
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="tutor-seleccionar">Tutor Existente</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Buscar tutor existente o crear nuevo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nuevo">+ Crear nuevo tutor</SelectItem>
                        <SelectItem value="1">Sr. Juan Pérez Martínez</SelectItem>
                        <SelectItem value="2">Sra. María López Cruz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="nombre-tutor">Nombre del Tutor</Label>
                    <Input id="nombre-tutor" placeholder="Nombre completo del padre/madre/tutor" />
                  </div>

                  <div>
                    <Label htmlFor="telefono-tutor">Teléfono</Label>
                    <Input id="telefono-tutor" placeholder="+52 555 1234 567" />
                  </div>

                  <div>
                    <Label htmlFor="email-tutor">Correo Electrónico</Label>
                    <Input id="email-tutor" type="email" placeholder="tutor@email.com" />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="parentesco">Parentesco</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar parentesco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="padre">Padre</SelectItem>
                        <SelectItem value="madre">Madre</SelectItem>
                        <SelectItem value="tutor">Tutor Legal</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  ℹ️ <strong>Nota:</strong> Se enviará un correo al tutor con las credenciales de acceso al sistema.
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setModalNuevo(false)}>
                  Cancelar
                </Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                  Registrar Alumno
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageTitle>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Total Alumnos</p>
                <p className="text-2xl font-bold text-[#7C3AED] mt-1">{estadisticas.totalAlumnos}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <GraduationCap className="h-6 w-6 text-[#7C3AED]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Activos</p>
                <p className="text-2xl font-bold text-[#059669] mt-1">{estadisticas.alumnosActivos}</p>
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
                <p className="text-sm text-[#6B7280]">Bajas</p>
                <p className="text-2xl font-bold text-[#DC2626] mt-1">{estadisticas.alumnosBaja}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <UserCircle className="h-6 w-6 text-[#DC2626]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Promedio</p>
                <p className="text-2xl font-bold text-[#1D4ED8] mt-1">{estadisticas.promedioGeneral}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <GraduationCap className="h-6 w-6 text-[#1D4ED8]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Asistencia</p>
                <p className="text-2xl font-bold text-[#F59E0B] mt-1">{estadisticas.asistenciaPromedio}%</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Calendar className="h-6 w-6 text-[#F59E0B]" />
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
                  placeholder="Buscar por nombre, matrícula o tutor..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroGrado} onValueChange={setFiltroGrado}>
              <SelectTrigger className="w-full lg:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Grado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="1">1°</SelectItem>
                <SelectItem value="2">2°</SelectItem>
                <SelectItem value="3">3°</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroEstatus} onValueChange={setFiltroEstatus}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="baja-temporal">Baja temporal</SelectItem>
                <SelectItem value="baja-definitiva">Baja definitiva</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de alumnos */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Lista de Alumnos</CardTitle>
          <CardDescription>Gestiona el registro de alumnos del plantel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alumnos.map((alumno) => (
              <div
                key={alumno.id}
                className="p-4 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] rounded-lg">
                        <GraduationCap className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#111827]">{alumno.nombre}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {alumno.grado}{alumno.grupo}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alumno.matricula}
                          </Badge>
                          <Badge className={getEstatusColor(alumno.estatus)}>
                            {alumno.estatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-[#6B7280] ml-12">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-xs">{alumno.tutor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span className="text-xs">{alumno.telefonoTutor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Promedio: </span>
                        <span className={`font-semibold text-xs ${getPromedioColor(alumno.promedio)}`}>
                          {alumno.promedio}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Asistencia: {alumno.asistencia}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => verDetalle(alumno)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {userRole === "Administrador" && (
                      <>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalle */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Expediente del Alumno</DialogTitle>
            <DialogDescription>
              Información completa del alumno seleccionado.
            </DialogDescription>
          </DialogHeader>
          {alumnoSeleccionado && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="p-3 bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] rounded-xl">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{alumnoSeleccionado.nombre}</h3>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{alumnoSeleccionado.grado}{alumnoSeleccionado.grupo}</Badge>
                    <Badge variant="outline">{alumnoSeleccionado.matricula}</Badge>
                    <Badge className={getEstatusColor(alumnoSeleccionado.estatus)}>
                      {alumnoSeleccionado.estatus}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-[#E5E7EB]">
                  <CardContent className="pt-4">
                    <p className="text-xs text-[#6B7280]">Edad</p>
                    <p className="text-2xl font-bold text-[#7C3AED]">{alumnoSeleccionado.edad}</p>
                  </CardContent>
                </Card>
                <Card className="border-[#E5E7EB]">
                  <CardContent className="pt-4">
                    <p className="text-xs text-[#6B7280]">Promedio</p>
                    <p className={`text-2xl font-bold ${getPromedioColor(alumnoSeleccionado.promedio)}`}>
                      {alumnoSeleccionado.promedio}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-[#E5E7EB] col-span-2">
                  <CardContent className="pt-4">
                    <p className="text-xs text-[#6B7280]">Asistencia</p>
                    <p className="text-2xl font-bold text-[#059669]">{alumnoSeleccionado.asistencia}%</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-[#6B7280]">Fecha de Nacimiento</Label>
                  <p className="font-medium">{alumnoSeleccionado.fechaNacimiento}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Dirección</Label>
                  <p className="font-medium">{alumnoSeleccionado.direccion}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Fecha de Ingreso</Label>
                  <p className="font-medium">{alumnoSeleccionado.fechaIngreso}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold text-[#111827] mb-3">Información del Tutor</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#6B7280]" />
                    <span>{alumnoSeleccionado.tutor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#6B7280]" />
                    <span>{alumnoSeleccionado.telefonoTutor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#6B7280]" />
                    <span>{alumnoSeleccionado.emailTutor}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setModalDetalle(false)}>
                  Cerrar
                </Button>
                {userRole === "Administrador" && (
                  <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Alumno
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
