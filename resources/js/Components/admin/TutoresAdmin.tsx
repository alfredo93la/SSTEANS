import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  UserCircle,
  Phone,
  Mail,
  GraduationCap,
  Link as LinkIcon
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function TutoresAdmin() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState("todos");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalVincular, setModalVincular] = useState(false);
  const [tutorSeleccionado, setTutorSeleccionado] = useState<any>(null);

  // Datos de ejemplo
  const tutores = [
    {
      id: 1,
      nombre: "Sr. Juan Pérez Martínez",
      email: "juan.perez@email.com",
      telefono: "+52 555 2345 678",
      estatus: "Activo",
      fechaRegistro: "15/01/2026",
      hijos: [
        { id: 1, nombre: "Juan Pérez García", grado: "1°A", promedio: 8.5 },
        { id: 2, nombre: "Ana Pérez García", grado: "1°A", promedio: 9.2 }
      ],
      direccion: "Calle Reforma #123, Col. Centro",
      ocupacion: "Ingeniero",
      ultimoAcceso: "25/02/2026 08:30"
    },
    {
      id: 2,
      nombre: "Sra. María López Cruz",
      email: "maria.lopez@email.com",
      telefono: "+52 555 3456 789",
      estatus: "Activo",
      fechaRegistro: "10/01/2026",
      hijos: [
        { id: 3, nombre: "Carlos Rodríguez López", grado: "2°A", promedio: 7.8 }
      ],
      direccion: "Av. Juárez #456, Col. Norte",
      ocupacion: "Doctora",
      ultimoAcceso: "24/02/2026 18:45"
    },
    {
      id: 3,
      nombre: "Sr. Roberto Sánchez Díaz",
      email: "roberto.sanchez@email.com",
      telefono: "+52 555 4567 890",
      estatus: "Activo",
      fechaRegistro: "05/01/2026",
      hijos: [
        { id: 4, nombre: "María Sánchez Díaz", grado: "2°B", promedio: 9.5 }
      ],
      direccion: "Calle Hidalgo #789, Col. Sur",
      ocupacion: "Contador",
      ultimoAcceso: "25/02/2026 07:15"
    },
    {
      id: 4,
      nombre: "Sra. Carmen García Ruiz",
      email: "carmen.garcia@email.com",
      telefono: "+52 555 5678 901",
      estatus: "Activo",
      fechaRegistro: "01/01/2026",
      hijos: [
        { id: 5, nombre: "Luis García Hernández", grado: "3°A", promedio: 8.9 },
        { id: 6, nombre: "Diana García Hernández", grado: "1°B", promedio: 9.1 }
      ],
      direccion: "Blvd. Constitución #321, Col. Este",
      ocupacion: "Arquitecta",
      ultimoAcceso: "25/02/2026 09:00"
    },
    {
      id: 5,
      nombre: "Sr. Pedro Martínez Silva",
      email: "pedro.martinez@email.com",
      telefono: "+52 555 6789 012",
      estatus: "Inactivo",
      fechaRegistro: "20/12/2025",
      hijos: [
        { id: 7, nombre: "Sofia Martínez Ruiz", grado: "3°B", promedio: 8.2 }
      ],
      direccion: "Calle Morelos #654, Col. Oeste",
      ocupacion: "Abogado",
      ultimoAcceso: "10/02/2026 20:30"
    }
  ];

  const estadisticas = {
    totalTutores: 285,
    tutoresActivos: 278,
    tutoresInactivos: 7,
    alumnosPorTutor: 1.3,
    tutoresSinVincular: 5
  };

  const verDetalle = (tutor: any) => {
    setTutorSeleccionado(tutor);
    setModalDetalle(true);
  };

  const vincularAlumno = (tutor: any) => {
    setTutorSeleccionado(tutor);
    setModalVincular(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#111827]">Gestión de Tutores</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Administra los tutores y su vinculación con alumnos
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="border-[#7C3AED] text-[#7C3AED] hover:bg-purple-50"
            onClick={() => setModalVincular(true)}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Vincular Alumno
          </Button>
          <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Tutor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Tutor</DialogTitle>
                <DialogDescription>
                  Llena los campos para crear un nuevo tutor en el sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre-tutor">Nombre Completo</Label>
                  <Input id="nombre-tutor" placeholder="Ej: Sr. Juan Pérez Martínez" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" type="email" placeholder="tutor@email.com" />
                  </div>

                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" placeholder="+52 555 1234 567" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="direccion-tutor">Dirección</Label>
                  <Input id="direccion-tutor" placeholder="Calle, número, colonia, ciudad" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ocupacion">Ocupación</Label>
                    <Input id="ocupacion" placeholder="Ej: Ingeniero, Doctora" />
                  </div>

                  <div>
                    <Label htmlFor="parentesco-tutor">Parentesco Principal</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
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

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    ℹ️ <strong>Nota:</strong> Después de crear el tutor, deberás vincularlo con sus hijos desde la opción "Vincular Alumno".
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setModalNuevo(false)}>
                    Cancelar
                  </Button>
                  <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                    Registrar Tutor
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Total Tutores</p>
                <p className="text-2xl font-bold text-[#7C3AED] mt-1">{estadisticas.totalTutores}</p>
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
                <p className="text-sm text-[#6B7280]">Activos</p>
                <p className="text-2xl font-bold text-[#059669] mt-1">{estadisticas.tutoresActivos}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <UserCircle className="h-6 w-6 text-[#059669]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Inactivos</p>
                <p className="text-2xl font-bold text-[#DC2626] mt-1">{estadisticas.tutoresInactivos}</p>
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
                <p className="text-sm text-[#6B7280]">Alumnos/Tutor</p>
                <p className="text-2xl font-bold text-[#1D4ED8] mt-1">{estadisticas.alumnosPorTutor}</p>
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
                <p className="text-sm text-[#6B7280]">Sin Vincular</p>
                <p className="text-2xl font-bold text-[#F59E0B] mt-1">{estadisticas.tutoresSinVincular}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <LinkIcon className="h-6 w-6 text-[#F59E0B]" />
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
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroEstatus} onValueChange={setFiltroEstatus}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
                <SelectItem value="sin-vincular">Sin vincular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de tutores */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Lista de Tutores</CardTitle>
          <CardDescription>Gestiona los tutores y su vinculación con alumnos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tutores.map((tutor) => (
              <div
                key={tutor.id}
                className="p-4 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] rounded-lg">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#111827]">{tutor.nombre}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={
                            tutor.estatus === "Activo" 
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }>
                            {tutor.estatus}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {tutor.hijos.length} {tutor.hijos.length === 1 ? 'hijo' : 'hijos'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#6B7280] ml-12">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="text-xs">{tutor.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span className="text-xs">{tutor.telefono}</span>
                      </div>
                    </div>
                    {tutor.hijos.length > 0 && (
                      <div className="mt-3 ml-12">
                        <p className="text-xs text-[#6B7280] mb-2">Hijos vinculados:</p>
                        <div className="flex flex-wrap gap-2">
                          {tutor.hijos.map((hijo) => (
                            <div key={hijo.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-[#E5E7EB]">
                              <GraduationCap className="h-3.5 w-3.5 text-[#7C3AED]" />
                              <span className="text-xs font-medium">{hijo.nombre}</span>
                              <Badge variant="outline" className="text-xs">{hijo.grado}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => vincularAlumno(tutor)}
                      title="Vincular alumno"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => verDetalle(tutor)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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
            <DialogTitle>Detalle del Tutor</DialogTitle>
            <DialogDescription>
              Información completa del tutor seleccionado.
            </DialogDescription>
          </DialogHeader>
          {tutorSeleccionado && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="p-3 bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] rounded-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{tutorSeleccionado.nombre}</h3>
                  <Badge variant="outline" className={
                    tutorSeleccionado.estatus === "Activo" 
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }>
                    {tutorSeleccionado.estatus}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#6B7280]">Email</Label>
                  <p className="font-medium">{tutorSeleccionado.email}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Teléfono</Label>
                  <p className="font-medium">{tutorSeleccionado.telefono}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Ocupación</Label>
                  <p className="font-medium">{tutorSeleccionado.ocupacion}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Fecha de registro</Label>
                  <p>{tutorSeleccionado.fechaRegistro}</p>
                </div>
              </div>

              <div>
                <Label className="text-[#6B7280]">Dirección</Label>
                <p className="font-medium">{tutorSeleccionado.direccion}</p>
              </div>

              <div>
                <Label className="text-[#6B7280]">Último acceso</Label>
                <p>{tutorSeleccionado.ultimoAcceso}</p>
              </div>

              <div className="pt-4 border-t">
                <Label className="text-[#111827] font-semibold">Hijos Vinculados ({tutorSeleccionado.hijos.length})</Label>
                <div className="space-y-2 mt-3">
                  {tutorSeleccionado.hijos.map((hijo: any) => (
                    <div key={hijo.id} className="p-3 bg-gray-50 rounded-lg border border-[#E5E7EB]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-5 w-5 text-[#7C3AED]" />
                          <div>
                            <p className="font-medium text-[#111827]">{hijo.nombre}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{hijo.grado}</Badge>
                              <span className="text-xs text-[#6B7280]">Promedio: {hijo.promedio}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                          Desvincular
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setModalDetalle(false)}>
                  Cerrar
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setModalDetalle(false);
                    setModalVincular(true);
                  }}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Vincular Alumno
                </Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Tutor
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de vinculación */}
      <Dialog open={modalVincular} onOpenChange={setModalVincular}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vincular Alumno a Tutor</DialogTitle>
            <DialogDescription>
              Selecciona el tutor y el alumno para crear la vinculación.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tutor-vincular">Tutor</Label>
              <Select defaultValue={tutorSeleccionado?.id.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tutor" />
                </SelectTrigger>
                <SelectContent>
                  {tutores.map((tutor) => (
                    <SelectItem key={tutor.id} value={tutor.id.toString()}>
                      {tutor.nombre} ({tutor.hijos.length} {tutor.hijos.length === 1 ? 'hijo' : 'hijos'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="alumno-vincular">Alumno</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar alumno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Juan Pérez García - 1°A</SelectItem>
                  <SelectItem value="2">Ana Pérez García - 1°A</SelectItem>
                  <SelectItem value="3">Carlos Rodríguez López - 2°A</SelectItem>
                  <SelectItem value="4">María Sánchez Díaz - 2°B</SelectItem>
                  <SelectItem value="5">Luis García Hernández - 3°A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="parentesco-vinculacion">Parentesco</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar parentesco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="padre">Padre</SelectItem>
                  <SelectItem value="madre">Madre</SelectItem>
                  <SelectItem value="tutor">Tutor Legal</SelectItem>
                  <SelectItem value="abuelo">Abuelo/a</SelectItem>
                  <SelectItem value="tio">Tío/a</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                ℹ️ <strong>Nota:</strong> El tutor podrá ver toda la información académica del alumno vinculado.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setModalVincular(false)}>
                Cancelar
              </Button>
              <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                <LinkIcon className="h-4 w-4 mr-2" />
                Vincular
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
