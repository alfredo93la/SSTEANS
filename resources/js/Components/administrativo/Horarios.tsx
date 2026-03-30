import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PageTitle } from "../PageTitle";
import {
  Clock,
  Search,
  Filter,
  Eye,
  Edit,
  Plus,
  Calendar,
  Users,
  BookOpen,
  Trash2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function Horarios() {
  const [filtroGrupo, setFiltroGrupo] = useState("todos");
  const [filtroProfesor, setFiltroProfesor] = useState("todos");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [vistaActual, setVistaActual] = useState<"grupo" | "profesor">("grupo");

  // Estado del formulario de nueva clase
  const [formGrupo, setFormGrupo] = useState("");
  const [formMateria, setFormMateria] = useState("");
  const [formProfesor, setFormProfesor] = useState("");
  const [sesiones, setSesiones] = useState([{ dia: "", horaInicio: "", horaFin: "", aula: "" }]);

  const agregarSesion = () => setSesiones([...sesiones, { dia: "", horaInicio: "", horaFin: "", aula: "" }]);
  const eliminarSesion = (i: number) => setSesiones(sesiones.filter((_, idx) => idx !== i));
  const actualizarSesion = (i: number, campo: string, valor: string) => {
    setSesiones(sesiones.map((s, idx) => idx === i ? { ...s, [campo]: valor } : s));
  };

  const resetForm = () => {
    setFormGrupo(""); setFormMateria(""); setFormProfesor("");
    setSesiones([{ dia: "", horaInicio: "", horaFin: "", aula: "" }]);
  };

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const horasClase = [
    { inicio: "07:00", fin: "08:00" },
    { inicio: "08:00", fin: "09:00" },
    { inicio: "09:00", fin: "10:00" },
    { inicio: "10:00", fin: "10:30", tipo: "Receso" },
    { inicio: "10:30", fin: "11:30" },
    { inicio: "11:30", fin: "12:30" },
    { inicio: "12:30", fin: "13:30" }
  ];

  // Horario de ejemplo para un grupo
  const horarioGrupo = {
    "1°A": {
      Lunes: [
        { materia: "Matemáticas", profesor: "Prof. María García", color: "blue", aula: "A-101" },
        { materia: "Español", profesor: "Prof. Laura Rodríguez", color: "red", aula: "A-101" },
        { materia: "Ciencias", profesor: "Prof. Pedro González", color: "green", aula: "A-101" },
        { tipo: "Receso" },
        { materia: "Historia", profesor: "Prof. Ana Martínez", color: "yellow", aula: "A-101" },
        { materia: "Inglés", profesor: "Prof. Diana Torres", color: "purple", aula: "A-101" },
        { materia: "Ed. Física", profesor: "Prof. Carlos Ruiz", color: "orange", aula: "Patio" }
      ],
      Martes: [
        { materia: "Español", profesor: "Prof. Laura Rodríguez", color: "red", aula: "A-101" },
        { materia: "Matemáticas", profesor: "Prof. María García", color: "blue", aula: "A-101" },
        { materia: "Inglés", profesor: "Prof. Diana Torres", color: "purple", aula: "A-101" },
        { tipo: "Receso" },
        { materia: "Ciencias", profesor: "Prof. Pedro González", color: "green", aula: "Lab-1" },
        { materia: "Artes", profesor: "Prof. Sofia López", color: "pink", aula: "A-101" },
        { materia: "FCE", profesor: "Prof. Patricia Gómez", color: "teal", aula: "A-101" }
      ],
      Miércoles: [
        { materia: "Matemáticas", profesor: "Prof. María García", color: "blue", aula: "A-101" },
        { materia: "Historia", profesor: "Prof. Ana Martínez", color: "yellow", aula: "A-101" },
        { materia: "Español", profesor: "Prof. Laura Rodríguez", color: "red", aula: "A-101" },
        { tipo: "Receso" },
        { materia: "Inglés", profesor: "Prof. Diana Torres", color: "purple", aula: "A-101" },
        { materia: "Matemáticas", profesor: "Prof. María García", color: "blue", aula: "A-101" },
        { materia: "Ciencias", profesor: "Prof. Pedro González", color: "green", aula: "A-101" }
      ],
      Jueves: [
        { materia: "Español", profesor: "Prof. Laura Rodríguez", color: "red", aula: "A-101" },
        { materia: "Matemáticas", profesor: "Prof. María García", color: "blue", aula: "A-101" },
        { materia: "Ed. Física", profesor: "Prof. Carlos Ruiz", color: "orange", aula: "Patio" },
        { tipo: "Receso" },
        { materia: "Historia", profesor: "Prof. Ana Martínez", color: "yellow", aula: "A-101" },
        { materia: "Inglés", profesor: "Prof. Diana Torres", color: "purple", aula: "A-101" },
        { materia: "Artes", profesor: "Prof. Sofia López", color: "pink", aula: "A-101" }
      ],
      Viernes: [
        { materia: "Matemáticas", profesor: "Prof. María García", color: "blue", aula: "A-101" },
        { materia: "Español", profesor: "Prof. Laura Rodríguez", color: "red", aula: "A-101" },
        { materia: "Ciencias", profesor: "Prof. Pedro González", color: "green", aula: "A-101" },
        { tipo: "Receso" },
        { materia: "FCE", profesor: "Prof. Patricia Gómez", color: "teal", aula: "A-101" },
        { materia: "Inglés", profesor: "Prof. Diana Torres", color: "purple", aula: "A-101" },
        { tipo: "Taller", materia: "Actividades", profesor: "Varios", color: "gray", aula: "Varios" }
      ]
    }
  };

  const grupos = ["1°A", "1°B", "2°A", "2°B", "3°A", "3°B"];
  const profesores = [
    "Prof. María García López",
    "Prof. Laura Rodríguez Cruz",
    "Prof. Roberto Sánchez Díaz",
    "Prof. Pedro González Mora",
    "Prof. Ana Martínez Silva"
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-100 text-blue-700 border-blue-300";
      case "red": return "bg-red-100 text-red-700 border-red-300";
      case "green": return "bg-green-100 text-green-700 border-green-300";
      case "yellow": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "purple": return "bg-purple-100 text-purple-700 border-purple-300";
      case "orange": return "bg-orange-100 text-orange-700 border-orange-300";
      case "pink": return "bg-pink-100 text-pink-700 border-pink-300";
      case "teal": return "bg-teal-100 text-teal-700 border-teal-300";
      case "gray": return "bg-gray-100 text-gray-700 border-gray-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={Clock} title="Gestión de Horarios" description="Configura los horarios de clases por grupo" color="bg-[#7C3AED]">
        <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Plus className="h-4 w-4 mr-2" />
              Asignar Clase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Asignar Nueva Clase</DialogTitle>
              <DialogDescription>
                Define la materia, profesor y agrega todos los días con su horario y aula correspondiente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              {/* Grupo y Materia */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Grupo</Label>
                  <Select value={formGrupo} onValueChange={setFormGrupo}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {grupos.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Materia</Label>
                  <Select value={formMateria} onValueChange={setFormMateria}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar materia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="matematicas">Matemáticas</SelectItem>
                      <SelectItem value="español">Español</SelectItem>
                      <SelectItem value="ciencias">Ciencias</SelectItem>
                      <SelectItem value="historia">Historia</SelectItem>
                      <SelectItem value="ingles">Inglés</SelectItem>
                      <SelectItem value="ed-fisica">Ed. Física</SelectItem>
                      <SelectItem value="artes">Artes</SelectItem>
                      <SelectItem value="fce">FCE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Profesor */}
              <div>
                <Label>Profesor</Label>
                <Select value={formProfesor} onValueChange={setFormProfesor}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar profesor" />
                  </SelectTrigger>
                  <SelectContent>
                    {profesores.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Sesiones dinámicas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Días y horarios</Label>
                  <span className="text-xs text-[#6B7280]">{sesiones.length} día{sesiones.length !== 1 ? "s" : ""} agregado{sesiones.length !== 1 ? "s" : ""}</span>
                </div>

                <div className="space-y-2">
                  {sesiones.map((sesion, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-end p-3 bg-gray-50 rounded-lg border border-[#E5E7EB]">
                      {/* Día */}
                      <div>
                        <label className="text-xs text-[#6B7280] mb-1 block">Día</label>
                        <Select value={sesion.dia} onValueChange={(v) => actualizarSesion(i, "dia", v)}>
                          <SelectTrigger className="h-9 bg-white text-sm">
                            <SelectValue placeholder="Día" />
                          </SelectTrigger>
                          <SelectContent>
                            {diasSemana.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Hora inicio */}
                      <div>
                        <label className="text-xs text-[#6B7280] mb-1 block">Hora inicio</label>
                        <Select value={sesion.horaInicio} onValueChange={(v) => actualizarSesion(i, "horaInicio", v)}>
                          <SelectTrigger className="h-9 bg-white text-sm">
                            <SelectValue placeholder="Inicio" />
                          </SelectTrigger>
                          <SelectContent>
                            {["07:00","08:00","09:00","10:00","10:30","11:00","11:30","12:00","12:30","13:00"].map((h) => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Hora fin */}
                      <div>
                        <label className="text-xs text-[#6B7280] mb-1 block">Hora término</label>
                        <Select value={sesion.horaFin} onValueChange={(v) => actualizarSesion(i, "horaFin", v)}>
                          <SelectTrigger className="h-9 bg-white text-sm">
                            <SelectValue placeholder="Término" />
                          </SelectTrigger>
                          <SelectContent>
                            {["08:00","09:00","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30"].map((h) => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Aula */}
                      <div>
                        <label className="text-xs text-[#6B7280] mb-1 block">Aula</label>
                        <Input
                          value={sesion.aula}
                          onChange={(e) => actualizarSesion(i, "aula", e.target.value)}
                          placeholder="A-101, Lab-1…"
                          className="h-9 bg-white text-sm"
                        />
                      </div>

                      {/* Eliminar fila */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-[#E11D48] hover:bg-red-50 self-end"
                        onClick={() => eliminarSesion(i)}
                        disabled={sesiones.length === 1}
                        title="Eliminar día"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed border-[#1D4ED8] text-[#1D4ED8] hover:bg-blue-50"
                  onClick={agregarSesion}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar otro día
                </Button>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-[#E5E7EB]">
                <Button variant="outline" onClick={() => { setModalNuevo(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button className="bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED]" onClick={() => { setModalNuevo(false); resetForm(); }}>
                  Asignar Clase
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
                <p className="text-2xl font-bold text-[#7C3AED] mt-1">12</p>
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
                <p className="text-sm text-[#6B7280]">Horas por Día</p>
                <p className="text-2xl font-bold text-[#1D4ED8] mt-1">7</p>
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
                <p className="text-sm text-[#6B7280]">Profesores Activos</p>
                <p className="text-2xl font-bold text-[#059669] mt-1">18</p>
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
                <p className="text-sm text-[#6B7280]">Materias</p>
                <p className="text-2xl font-bold text-[#F59E0B] mt-1">15</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-[#F59E0B]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Vista */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <Tabs value={vistaActual} onValueChange={(v) => setVistaActual(v as "grupo" | "profesor")} className="flex-1">
              <TabsList>
                <TabsTrigger value="grupo">
                  <Users className="h-4 w-4 mr-2" />
                  Por Grupo
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {vistaActual === "grupo" ? (
              <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
                <SelectTrigger className="w-full lg:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Seleccionar grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los grupos</SelectItem>
                  {grupos.map((grupo) => (
                    <SelectItem key={grupo} value={grupo}>{grupo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={filtroProfesor} onValueChange={setFiltroProfesor}>
                <SelectTrigger className="w-full lg:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Seleccionar profesor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los profesores</SelectItem>
                  {profesores.map((profesor) => (
                    <SelectItem key={profesor} value={profesor}>{profesor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Horario Visual */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Horario: 1°A</CardTitle>
              <CardDescription>Turno Matutino (07:00 - 13:30)</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar Horario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-[#E5E7EB] bg-gray-50 p-3 text-left text-sm font-semibold text-[#111827] min-w-[100px]">
                    Horario
                  </th>
                  {diasSemana.map((dia) => (
                    <th key={dia} className="border border-[#E5E7EB] bg-gray-50 p-3 text-center text-sm font-semibold text-[#111827] min-w-[150px]">
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horasClase.map((hora, i) => (
                  <tr key={i}>
                    <td className="border border-[#E5E7EB] p-3 bg-gray-50">
                      <div className="text-sm font-medium text-[#111827]">
                        {hora.inicio} - {hora.fin}
                      </div>
                    </td>
                    {diasSemana.map((dia) => {
                      const clase = horarioGrupo["1°A"][dia as keyof typeof horarioGrupo["1°A"]][i];
                      
                      if (hora.tipo === "Receso") {
                        return (
                          <td key={dia} className="border border-[#E5E7EB] p-3 bg-amber-50">
                            <div className="text-center">
                              <p className="text-sm font-semibold text-amber-700">☕ Receso</p>
                            </div>
                          </td>
                        );
                      }
                      
                      if (!clase || clase.tipo === "Receso") {
                        return <td key={dia} className="border border-[#E5E7EB] p-3 bg-gray-50"></td>;
                      }
                      
                      return (
                        <td key={dia} className="border border-[#E5E7EB] p-2">
                          <div className={`p-3 rounded-lg border-l-4 ${getColorClasses(clase.color)} hover:shadow-md transition-shadow cursor-pointer`}>
                            <p className="text-sm font-semibold line-clamp-1">{clase.materia}</p>
                            <p className="text-xs mt-1 line-clamp-1">{clase.profesor}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              <p className="text-xs">{clase.aula}</p>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Matemáticas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Español</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Ciencias</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">Historia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm">Inglés</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm">Ed. Física</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-500 rounded"></div>
              <span className="text-sm">Artes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-teal-500 rounded"></div>
              <span className="text-sm">FCE</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}