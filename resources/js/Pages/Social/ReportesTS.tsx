import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { Textarea } from "../../Components/ui/textarea";
import { Label } from "../../Components/ui/label";
import { 
  AlertTriangle, 
  Search, 
  Filter,
  FileText,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Calendar,
  Paperclip,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../../Components/ui/dialog";
import { PageTitle } from "../../Components/PageTitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../Components/ui/tabs";

export function ReportesTS() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<any>(null);
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<File[]>([]);

  // Datos de ejemplo
  const reportes = [
    {
      id: 1,
      alumno: "Juan Pérez García",
      grupo: "1°A",
      tipo: "Conducta",
      gravedad: "alta",
      descripcion: "Agresión verbal repetida hacia compañeros",
      fecha: "23/02/2026",
      reportadoPor: "Prof. Laura González",
      estado: "en_seguimiento",
      acciones: "Canalizado a trabajo social. Reunión con tutor programada para 26/02/2026",
      seguimientos: 2
    },
    {
      id: 2,
      alumno: "Ana García López",
      grupo: "2°B",
      tipo: "Asistencia",
      gravedad: "urgente",
      descripcion: "5 faltas consecutivas sin justificación",
      fecha: "22/02/2026",
      reportadoPor: "Sistema Automático",
      estado: "en_seguimiento",
      acciones: "Contacto con tutor realizado. Visita domiciliaria programada",
      seguimientos: 3
    },
    {
      id: 3,
      alumno: "Luis Martínez Ruiz",
      grupo: "3°A",
      tipo: "Académico",
      gravedad: "media",
      descripcion: "Bajo rendimiento en matemáticas y física",
      fecha: "20/02/2026",
      reportadoPor: "Prof. Roberto Sánchez",
      estado: "resuelto",
      acciones: "Asesorías extras asignadas. Mejoría notable en últimas evaluaciones",
      seguimientos: 4
    },
    {
      id: 4,
      alumno: "María Rodríguez Cruz",
      grupo: "1°B",
      tipo: "Emocional",
      gravedad: "alta",
      descripcion: "Signos de depresión y aislamiento social",
      fecha: "18/02/2026",
      reportadoPor: "Psicóloga Escolar",
      estado: "en_seguimiento",
      acciones: "Sesiones con psicóloga. Reunión con padres realizada",
      seguimientos: 5
    },
    {
      id: 5,
      alumno: "Carlos Hernández Díaz",
      grupo: "2°A",
      tipo: "Conducta",
      gravedad: "baja",
      descripcion: "Uso de celular en clase repetidamente",
      fecha: "15/02/2026",
      reportadoPor: "Prof. Carmen Flores",
      estado: "cerrado",
      acciones: "Advertencia realizada. Compromiso firmado con alumno",
      seguimientos: 1
    }
  ];

  const estadisticas = {
    total: 48,
    enSeguimiento: 12,
    resueltos: 28,
    cerrados: 8
  };

  const getBadgeGravedad = (gravedad: string) => {
    switch (gravedad) {
      case "urgente": return "bg-red-100 text-red-700 border-red-200";
      case "alta": return "bg-orange-100 text-orange-700 border-orange-200";
      case "media": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "baja": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case "en_seguimiento": return "bg-blue-100 text-blue-700 border-blue-200";
      case "resuelto": return "bg-green-100 text-green-700 border-green-200";
      case "cerrado": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case "en_seguimiento": return "En Seguimiento";
      case "resuelto": return "Resuelto";
      case "cerrado": return "Cerrado";
      default: return estado;
    }
  };

  const verDetalle = (reporte: any) => {
    setReporteSeleccionado(reporte);
    setModalDetalle(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nuevosArchivos = Array.from(e.target.files);
      setArchivosAdjuntos([...archivosAdjuntos, ...nuevosArchivos]);
    }
  };

  const eliminarArchivo = (index: number) => {
    setArchivosAdjuntos(archivosAdjuntos.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={AlertTriangle} title="Reportes de Conducta" description="Gestiona y da seguimiento a los reportes de alumnos" color="bg-[#E11D48]">
        <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Reporte
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Reporte</DialogTitle>
              <DialogDescription>
                Llena los campos para crear un nuevo reporte de conducta.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alumno">Alumno</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar alumno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Juan Pérez García - 1°A</SelectItem>
                      <SelectItem value="2">Ana García López - 2°B</SelectItem>
                      <SelectItem value="3">Luis Martínez Ruiz - 3°A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo de Reporte</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conducta">Conducta</SelectItem>
                      <SelectItem value="asistencia">Asistencia</SelectItem>
                      <SelectItem value="academico">Académico</SelectItem>
                      <SelectItem value="emocional">Emocional</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="gravedad">Nivel de Gravedad</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar gravedad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción del Incidente</Label>
                <Textarea 
                  id="descripcion" 
                  placeholder="Describe detalladamente la situación..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="acciones">Acciones Tomadas</Label>
                <Textarea 
                  id="acciones" 
                  placeholder="Describe las acciones que se han tomado o se tomarán..."
                  rows={3}
                />
              </div>

              {/* Campo de Archivos Adjuntos */}
              <div>
                <Label htmlFor="adjuntos">Archivos Adjuntos</Label>
                <p className="text-xs text-[#6B7280] mb-2">
                  Puedes adjuntar evidencias, fotografías, documentos, etc.
                </p>
                <div className="space-y-3">
                  {/* Input de archivo */}
                  <div className="flex items-center gap-2">
                    <label 
                      htmlFor="file-upload" 
                      className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Paperclip className="h-4 w-4 text-[#6B7280]" />
                      <span className="text-sm text-[#6B7280]">Seleccionar archivos</span>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    />
                    <span className="text-xs text-[#6B7280]">
                      Formatos: PDF, Word, Imágenes
                    </span>
                  </div>

                  {/* Lista de archivos adjuntos */}
                  {archivosAdjuntos.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#111827]">
                        {archivosAdjuntos.length} archivo(s) seleccionado(s):
                      </p>
                      <div className="space-y-2">
                        {archivosAdjuntos.map((archivo, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-[#E5E7EB]"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 bg-white rounded-lg border border-[#E5E7EB]">
                                <Paperclip className="h-4 w-4 text-[#7C3AED]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#111827] truncate">
                                  {archivo.name}
                                </p>
                                <p className="text-xs text-[#6B7280]">
                                  {formatFileSize(archivo.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarArchivo(index)}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setModalNuevo(false)}>
                  Cancelar
                </Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                  Crear Reporte
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
                <p className="text-sm text-[#6B7280]">Total Reportes</p>
                <p className="text-2xl font-bold text-[#7C3AED] mt-1">{estadisticas.total}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText className="h-6 w-6 text-[#7C3AED]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">En Seguimiento</p>
                <p className="text-2xl font-bold text-[#1D4ED8] mt-1">{estadisticas.enSeguimiento}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="h-6 w-6 text-[#1D4ED8]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Resueltos</p>
                <p className="text-2xl font-bold text-[#059669] mt-1">{estadisticas.resueltos}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-[#059669]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Cerrados</p>
                <p className="text-2xl font-bold text-[#6B7280] mt-1">{estadisticas.cerrados}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-xl">
                <XCircle className="h-6 w-6 text-[#6B7280]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Buscar por nombre de alumno, grupo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="en_seguimiento">En Seguimiento</SelectItem>
                <SelectItem value="resuelto">Resueltos</SelectItem>
                <SelectItem value="cerrado">Cerrados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs por tipo */}
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="conducta">Conducta</TabsTrigger>
          <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
          <TabsTrigger value="academico">Académico</TabsTrigger>
          <TabsTrigger value="emocional">Emocional</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle>Todos los Reportes</CardTitle>
              <CardDescription>Lista completa de reportes registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportes.map((reporte) => (
                  <div
                    key={reporte.id}
                    className="p-4 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-[#111827]">{reporte.alumno}</h4>
                          <Badge variant="outline">{reporte.grupo}</Badge>
                          <Badge className={getBadgeGravedad(reporte.gravedad)}>
                            {reporte.gravedad}
                          </Badge>
                          <Badge className={getBadgeEstado(reporte.estado)}>
                            {getEstadoTexto(reporte.estado)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{reporte.tipo}</Badge>
                          <span className="text-xs text-[#6B7280]">
                            {reporte.fecha} • {reporte.reportadoPor}
                          </span>
                        </div>
                        <p className="text-sm text-[#6B7280] mb-2">{reporte.descripcion}</p>
                        <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                          <span>{reporte.seguimientos} seguimiento(s)</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => verDetalle(reporte)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Otros tabs tendrían contenido similar filtrado por tipo */}
        <TabsContent value="conducta">
          <Card className="border-[#E5E7EB]">
            <CardContent className="pt-6">
              <p className="text-center text-[#6B7280]">Reportes de conducta</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de detalle */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Reporte</DialogTitle>
            <DialogDescription>
              Información detallada del reporte seleccionado.
            </DialogDescription>
          </DialogHeader>
          {reporteSeleccionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#6B7280]">Alumno</Label>
                  <p className="font-semibold">{reporteSeleccionado.alumno}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Grupo</Label>
                  <p className="font-semibold">{reporteSeleccionado.grupo}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Tipo</Label>
                  <Badge variant="secondary">{reporteSeleccionado.tipo}</Badge>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Gravedad</Label>
                  <Badge className={getBadgeGravedad(reporteSeleccionado.gravedad)}>
                    {reporteSeleccionado.gravedad}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-[#6B7280]">Descripción</Label>
                <p className="mt-1">{reporteSeleccionado.descripcion}</p>
              </div>

              <div>
                <Label className="text-[#6B7280]">Acciones Tomadas</Label>
                <p className="mt-1">{reporteSeleccionado.acciones}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#6B7280]">Reportado por</Label>
                  <p>{reporteSeleccionado.reportadoPor}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Fecha</Label>
                  <p>{reporteSeleccionado.fecha}</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setModalDetalle(false)}>
                  Cerrar
                </Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
                  Editar Reporte
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}