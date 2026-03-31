import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Input } from "../../Components/ui/input";
import { Textarea } from "../../Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Button } from "../../Components/ui/button";
import { Label } from "../../Components/ui/label";
import { toast } from "sonner";
import { FileText, Calendar, BookOpen, Users, Save, X } from "lucide-react";
import { PageTitle } from "../../Components/PageTitle";
import { grupos, materias } from "../../data/mockData";

export function AsignarTarea() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [fechaAsignacion, setFechaAsignacion] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [fechaEntrega, setFechaEntrega] = useState("");

  const limpiarFormulario = () => {
    setTitulo("");
    setDescripcion("");
    setGrupoSeleccionado("");
    setMateriaSeleccionada("");
    setFechaAsignacion(new Date().toISOString().split('T')[0]);
    setFechaEntrega("");
  };

  const validarFormulario = () => {
    if (!titulo.trim()) {
      toast.error("El título es obligatorio");
      return false;
    }
    if (!descripcion.trim()) {
      toast.error("Las instrucciones son obligatorias");
      return false;
    }
    if (!grupoSeleccionado) {
      toast.error("Debes seleccionar un grupo");
      return false;
    }
    if (!materiaSeleccionada) {
      toast.error("Debes seleccionar una materia");
      return false;
    }
    if (!fechaEntrega) {
      toast.error("Debes establecer una fecha de entrega");
      return false;
    }

    // Validar que la fecha de entrega sea posterior a la de asignación
    const fechaAsig = new Date(fechaAsignacion);
    const fechaEnt = new Date(fechaEntrega);
    
    if (fechaEnt <= fechaAsig) {
      toast.error("La fecha de entrega debe ser posterior a la fecha de asignación");
      return false;
    }

    return true;
  };

  const asignarTarea = () => {
    if (!validarFormulario()) return;

    const grupo = grupos.find(g => g.id === parseInt(grupoSeleccionado));
    const materia = materias.find(m => m.id === parseInt(materiaSeleccionada));

    toast.success(
      `Tarea "${titulo}" asignada a ${grupo?.nombre} - ${materia?.nombre}`
    );

    limpiarFormulario();
  };

  const formatearFecha = (fechaISO: string) => {
    if (!fechaISO) return "";
    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${anio}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={FileText} title="Asignar Tarea" description="Crea una nueva tarea para tus grupos" color="bg-[#D97706]" />

      {/* Formulario */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Nueva Tarea</CardTitle>
          <CardDescription>Completa la información de la tarea a asignar</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); asignarTarea(); }}>
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#7C3AED]" />
                Título de la tarea *
              </Label>
              <Input
                id="titulo"
                placeholder="Ej: Resolver ejercicios del capítulo 3"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="rounded-lg"
              />
            </div>

            {/* Instrucciones */}
            <div className="space-y-2">
              <Label htmlFor="descripcion" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#7C3AED]" />
                Instrucciones *
              </Label>
              <Textarea
                id="descripcion"
                placeholder="Describe detalladamente las instrucciones de la tarea..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={5}
                className="rounded-lg resize-none"
              />
              <p className="text-xs text-[#6B7280]">
                {descripcion.length}/500 caracteres
              </p>
            </div>

            {/* Grupo y Materia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grupo" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#1D4ED8]" />
                  Grupo *
                </Label>
                <Select value={grupoSeleccionado} onValueChange={setGrupoSeleccionado}>
                  <SelectTrigger id="grupo" className="rounded-lg">
                    <SelectValue placeholder="Selecciona un grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {grupos.map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()}>
                        {g.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="materia" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#7C3AED]" />
                  Materia *
                </Label>
                <Select value={materiaSeleccionada} onValueChange={setMateriaSeleccionada}>
                  <SelectTrigger id="materia" className="rounded-lg">
                    <SelectValue placeholder="Selecciona una materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {materias.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaAsignacion" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#059669]" />
                  Fecha de asignación *
                </Label>
                <Input
                  id="fechaAsignacion"
                  type="date"
                  value={fechaAsignacion}
                  onChange={(e) => setFechaAsignacion(e.target.value)}
                  className="rounded-lg"
                />
                {fechaAsignacion && (
                  <p className="text-xs text-[#6B7280]">
                    {formatearFecha(fechaAsignacion)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaEntrega" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#E11D48]" />
                  Fecha de entrega *
                </Label>
                <Input
                  id="fechaEntrega"
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  min={fechaAsignacion}
                  className="rounded-lg"
                />
                {fechaEntrega && (
                  <p className="text-xs text-[#6B7280]">
                    {formatearFecha(fechaEntrega)}
                  </p>
                )}
              </div>
            </div>

            {/* Vista previa */}
            {titulo && descripcion && grupoSeleccionado && materiaSeleccionada && fechaEntrega && (
              <Card className="border-[#E5E7EB] bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="text-sm">Vista Previa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-[#6B7280]">Título:</span>{" "}
                    <span className="font-medium text-[#111827]">{titulo}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Grupo:</span>{" "}
                    <span className="font-medium text-[#111827]">
                      {grupos.find(g => g.id === parseInt(grupoSeleccionado))?.nombre}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Materia:</span>{" "}
                    <span className="font-medium text-[#111827]">
                      {materias.find(m => m.id === parseInt(materiaSeleccionada))?.nombre}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Fecha límite:</span>{" "}
                    <span className="font-medium text-[#E11D48]">
                      {formatearFecha(fechaEntrega)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#E5E7EB]">
              <Button
                type="submit"
                className="flex-1 bg-[#1D4ED8] hover:bg-[#1E40AF]"
              >
                <Save className="h-4 w-4 mr-2" />
                Asignar Tarea
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={limpiarFormulario}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar Formulario
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Ayuda */}
      <Card className="border-[#E5E7EB] bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <FileText className="h-5 w-5 text-[#1D4ED8] flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-[#1D4ED8]">
              <p className="font-medium">Consejos para asignar tareas:</p>
              <ul className="list-disc list-inside space-y-1 text-[#6B7280]">
                <li>Sé claro y específico en las instrucciones</li>
                <li>Establece fechas límite realistas</li>
                <li>Indica los materiales o recursos necesarios</li>
                <li>Especifica el formato de entrega esperado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
