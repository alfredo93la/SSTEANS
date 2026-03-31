import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../Components/ui/dialog";
import { Input } from "../../Components/ui/input";
import { Textarea } from "../../Components/ui/textarea";
import { Label } from "../../Components/ui/label";
import { toast } from "sonner";
import { FileText, Calendar, Edit, Trash2, Users, CheckCircle, Clock } from "lucide-react";
import { PageTitle } from "../../Components/PageTitle";
import { tareas as tareasIniciales, getMateriaById, grupos } from "../../data/mockData";

export function GestionarTareas() {
  const [tareas, setTareas] = useState(tareasIniciales);
  const [filtroGrupo, setFiltroGrupo] = useState("todos");
  const [tareaEditar, setTareaEditar] = useState<typeof tareasIniciales[0] | null>(null);
  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false);
  const [dialogEliminarAbierto, setDialogEliminarAbierto] = useState(false);
  const [tareaEliminar, setTareaEliminar] = useState<number | null>(null);

  // Datos temporales para edición
  const [tituloEdit, setTituloEdit] = useState("");
  const [descripcionEdit, setDescripcionEdit] = useState("");
  const [fechaEntregaEdit, setFechaEntregaEdit] = useState("");

  const tareasFiltradas = tareas.filter(t => 
    filtroGrupo === "todos" || t.grupoId === parseInt(filtroGrupo)
  );

  const abrirEditar = (tarea: typeof tareasIniciales[0]) => {
    setTareaEditar(tarea);
    setTituloEdit(tarea.titulo);
    setDescripcionEdit(tarea.descripcion);
    setFechaEntregaEdit(convertirFechaAISO(tarea.fechaEntrega));
    setDialogEditarAbierto(true);
  };

  const convertirFechaAISO = (fecha: string) => {
    const [dia, mes, anio] = fecha.split('/');
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  };

  const convertirFechaAFormato = (fechaISO: string) => {
    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${anio}`;
  };

  const guardarEdicion = () => {
    if (!tareaEditar) return;

    if (!tituloEdit.trim() || !descripcionEdit.trim() || !fechaEntregaEdit) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    setTareas(prev => prev.map(t => 
      t.id === tareaEditar.id 
        ? {
            ...t,
            titulo: tituloEdit,
            descripcion: descripcionEdit,
            fechaEntrega: convertirFechaAFormato(fechaEntregaEdit)
          }
        : t
    ));

    toast.success("Tarea actualizada exitosamente");
    setDialogEditarAbierto(false);
    setTareaEditar(null);
  };

  const abrirEliminar = (tareaId: number) => {
    setTareaEliminar(tareaId);
    setDialogEliminarAbierto(true);
  };

  const confirmarEliminar = () => {
    if (tareaEliminar === null) return;

    setTareas(prev => prev.filter(t => t.id !== tareaEliminar));
    toast.success("Tarea eliminada exitosamente");
    setDialogEliminarAbierto(false);
    setTareaEliminar(null);
  };

  const calcularPorcentajeEntrega = (tarea: typeof tareasIniciales[0]) => {
    const entregadas = tarea.entregas.filter(e => e.estado === "Entregada").length;
    const total = tarea.entregas.length;
    return total > 0 ? Math.round((entregadas / total) * 100) : 0;
  };

  const calcularDiasRestantes = (fechaEntrega: string) => {
    const hoy = new Date();
    const [dia, mes, anio] = fechaEntrega.split("/").map(Number);
    const fechaLimite = new Date(anio, mes - 1, dia);
    const diferencia = Math.ceil((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diferencia;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={FileText} title="Gestionar Tareas" description="Administra las tareas asignadas a tus grupos" color="bg-[#D97706]">
        <div className="sm:w-64">
          <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los grupos</SelectItem>
              {grupos.map((g) => (
                <SelectItem key={g.id} value={g.id.toString()}>
                  {g.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageTitle>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-[#6B7280]">Total de Tareas</p>
              <p className="text-3xl font-bold text-[#1D4ED8] mt-1">{tareasFiltradas.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-[#6B7280]">Activas</p>
              <p className="text-3xl font-bold text-[#059669] mt-1">
                {tareasFiltradas.filter(t => calcularDiasRestantes(t.fechaEntrega) >= 0).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-[#6B7280]">Vencidas</p>
              <p className="text-3xl font-bold text-[#6B7280] mt-1">
                {tareasFiltradas.filter(t => calcularDiasRestantes(t.fechaEntrega) < 0).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de tareas */}
      <div className="space-y-4">
        {tareasFiltradas.length === 0 ? (
          <Card className="border-[#E5E7EB]">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
              <p className="text-[#6B7280]">No hay tareas para mostrar</p>
            </CardContent>
          </Card>
        ) : (
          tareasFiltradas.map((tarea) => {
            const materia = getMateriaById(tarea.materiaId);
            const grupo = grupos.find(g => g.id === tarea.grupoId);
            const porcentaje = calcularPorcentajeEntrega(tarea);
            const diasRestantes = calcularDiasRestantes(tarea.fechaEntrega);
            const entregadas = tarea.entregas.filter(e => e.estado === "Entregada").length;
            const total = tarea.entregas.length;

            return (
              <Card key={tarea.id} className="border-[#E5E7EB] hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header de la tarea */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <FileText className="h-5 w-5 text-[#7C3AED] mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#111827] text-lg">{tarea.titulo}</h3>
                            <p className="text-sm text-[#6B7280] mt-1">{tarea.descripcion}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="secondary" className="bg-purple-100 text-[#7C3AED]">
                            {materia?.nombre}
                          </Badge>
                          <Badge variant="secondary" className="bg-blue-100 text-[#1D4ED8]">
                            <Users className="h-3 w-3 mr-1" />
                            {grupo?.nombre}
                          </Badge>
                          <Badge 
                            variant="secondary"
                            className={
                              diasRestantes < 0 ? "bg-gray-100 text-[#6B7280]" :
                              diasRestantes <= 3 ? "bg-red-100 text-[#E11D48]" :
                              "bg-green-100 text-[#059669]"
                            }
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            {tarea.fechaEntrega}
                          </Badge>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirEditar(tarea)}
                          className="text-[#1D4ED8] border-[#1D4ED8] hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirEliminar(tarea.id)}
                          className="text-[#E11D48] border-[#E11D48] hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>

                    {/* Progreso de entregas */}
                    <div className="space-y-2 pt-3 border-t border-[#E5E7EB]">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-[#6B7280]">
                          <CheckCircle className="h-4 w-4" />
                          <span>Entregas: {entregadas} de {total}</span>
                        </div>
                        <Badge className={
                          porcentaje >= 80 ? "bg-[#059669]" :
                          porcentaje >= 50 ? "bg-[#D97706]" :
                          "bg-[#E11D48]"
                        }>
                          {porcentaje}%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            porcentaje >= 80 ? "bg-[#059669]" :
                            porcentaje >= 50 ? "bg-[#D97706]" :
                            "bg-[#E11D48]"
                          }`}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>

                    {/* Estado de la tarea */}
                    {diasRestantes < 0 ? (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm text-[#6B7280]">
                        <Clock className="h-4 w-4" />
                        <span>Tarea vencida hace {Math.abs(diasRestantes)} días</span>
                      </div>
                    ) : diasRestantes <= 3 ? (
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-sm text-[#E11D48]">
                        <Clock className="h-4 w-4" />
                        <span>
                          {diasRestantes === 0 ? "¡Vence hoy!" :
                           diasRestantes === 1 ? "Vence mañana" :
                           `Vence en ${diasRestantes} días`}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog Editar */}
      <Dialog open={dialogEditarAbierto} onOpenChange={setDialogEditarAbierto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
            <DialogDescription>Modifica los detalles de la tarea</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="edit-titulo">Título</Label>
              <Input
                id="edit-titulo"
                value={tituloEdit}
                onChange={(e) => setTituloEdit(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-descripcion">Instrucciones</Label>
              <Textarea
                id="edit-descripcion"
                value={descripcionEdit}
                onChange={(e) => setDescripcionEdit(e.target.value)}
                rows={4}
                className="rounded-lg resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fecha">Fecha de entrega</Label>
              <Input
                id="edit-fecha"
                type="date"
                value={fechaEntregaEdit}
                onChange={(e) => setFechaEntregaEdit(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEditarAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarEdicion} className="bg-[#1D4ED8] hover:bg-[#1E40AF]">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar */}
      <Dialog open={dialogEliminarAbierto} onOpenChange={setDialogEliminarAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEliminarAbierto(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmarEliminar}
              className="bg-[#E11D48] hover:bg-[#BE123C]"
            >
              Eliminar Tarea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
