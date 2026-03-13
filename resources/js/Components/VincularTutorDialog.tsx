import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CheckCircle2, UserPlus, Users, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { alumnos as alumnosData, usuarios as usuariosData } from "../data/mockData";

interface VincularTutorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVincular: (tutorId: string, alumnoId: string) => void;
}

export function VincularTutorDialog({ open, onOpenChange, onVincular }: VincularTutorDialogProps) {
  const [paso, setPaso] = useState(1);
  const [tutorSeleccionado, setTutorSeleccionado] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState("");

  const tutores = usuariosData.filter(u => u.rol === "Tutor");
  const alumnos = alumnosData;

  const handleSiguiente = () => {
    if (paso === 1 && !tutorSeleccionado) {
      toast.error("Por favor selecciona un tutor");
      return;
    }
    if (paso === 2 && !alumnoSeleccionado) {
      toast.error("Por favor selecciona un alumno");
      return;
    }
    if (paso < 3) {
      setPaso(paso + 1);
    }
  };

  const handleVincular = () => {
    if (!tutorSeleccionado || !alumnoSeleccionado) {
      toast.error("Por favor completa todos los pasos");
      return;
    }
    onVincular(tutorSeleccionado, alumnoSeleccionado);
    handleCerrar();
  };

  const handleCerrar = () => {
    setPaso(1);
    setTutorSeleccionado("");
    setAlumnoSeleccionado("");
    onOpenChange(false);
  };

  const getTutorNombre = () => {
    const tutor = tutores.find(t => t.id.toString() === tutorSeleccionado);
    return tutor ? tutor.nombre : "";
  };

  const getAlumnoNombre = () => {
    const alumno = alumnos.find(a => a.id.toString() === alumnoSeleccionado);
    return alumno ? `${alumno.nombre} — ${alumno.grupo}` : "";
  };

  return (
    <Dialog open={open} onOpenChange={handleCerrar}>
      <DialogContent className="rounded-3xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#1D4ED8]" />
            Vincular Tutor-Alumno
          </DialogTitle>
          <DialogDescription>
            Sigue estos pasos para vincular un tutor con un alumno
          </DialogDescription>
        </DialogHeader>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-between mb-6 px-4">
          {[1, 2, 3].map((numPaso) => (
            <div key={numPaso} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    numPaso < paso
                      ? "bg-[#059669] text-white"
                      : numPaso === paso
                      ? "bg-[#1D4ED8] text-white ring-4 ring-blue-100"
                      : "bg-[#F3F4F6] text-[#9CA3AF]"
                  }`}
                >
                  {numPaso < paso ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="font-semibold">{numPaso}</span>
                  )}
                </div>
                <span className="text-xs mt-2 text-[#6B7280] text-center">
                  {numPaso === 1 && "Seleccionar tutor"}
                  {numPaso === 2 && "Seleccionar alumno"}
                  {numPaso === 3 && "Confirmar"}
                </span>
              </div>
              {numPaso < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all ${
                    numPaso < paso ? "bg-[#059669]" : "bg-[#E5E7EB]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Contenido según el paso */}
        <div className="min-h-[240px]">
          {paso === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-[#1D4ED8] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#111827]">Paso 1: Selecciona un tutor</p>
                    <p className="text-sm text-[#6B7280] mt-1">
                      Elige el tutor que deseas vincular con un alumno
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tutor">Tutor *</Label>
                <Select value={tutorSeleccionado} onValueChange={setTutorSeleccionado}>
                  <SelectTrigger id="tutor" className="rounded-xl h-12">
                    <SelectValue placeholder="Selecciona un tutor" />
                  </SelectTrigger>
                  <SelectContent>
                    {tutores.map((tutor) => (
                      <SelectItem key={tutor.id} value={tutor.id.toString()}>
                        {tutor.nombre} — {tutor.correo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {tutorSeleccionado && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl animate-scale-in">
                  <div className="flex items-center gap-2 text-[#059669]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Tutor seleccionado: {getTutorNombre()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-[#7C3AED] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#111827]">Paso 2: Selecciona un alumno</p>
                    <p className="text-sm text-[#6B7280] mt-1">
                      Elige el alumno que deseas vincular con {getTutorNombre()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alumno">Alumno *</Label>
                <Select value={alumnoSeleccionado} onValueChange={setAlumnoSeleccionado}>
                  <SelectTrigger id="alumno" className="rounded-xl h-12">
                    <SelectValue placeholder="Selecciona un alumno" />
                  </SelectTrigger>
                  <SelectContent>
                    {alumnos.map((alumno) => (
                      <SelectItem key={alumno.id} value={alumno.id.toString()}>
                        {alumno.nombre} — {alumno.grupo} — {alumno.curp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {alumnoSeleccionado && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl animate-scale-in">
                  <div className="flex items-center gap-2 text-[#059669]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Alumno seleccionado: {getAlumnoNombre()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {paso === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#059669] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#111827]">Paso 3: Confirma la vinculación</p>
                    <p className="text-sm text-[#6B7280] mt-1">
                      Revisa que la información sea correcta antes de confirmar
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-[#E5E7EB]">
                <div>
                  <Label className="text-xs text-[#6B7280] uppercase">Tutor</Label>
                  <p className="font-medium text-[#111827] mt-1">{getTutorNombre()}</p>
                  <p className="text-sm text-[#6B7280]">
                    {tutores.find(t => t.id.toString() === tutorSeleccionado)?.correo}
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-[#1D4ED8]" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-[#6B7280] uppercase">Alumno</Label>
                  <p className="font-medium text-[#111827] mt-1">
                    {alumnos.find(a => a.id.toString() === alumnoSeleccionado)?.nombre}
                  </p>
                  <p className="text-sm text-[#6B7280]">
                    {alumnos.find(a => a.id.toString() === alumnoSeleccionado)?.grupo} —{" "}
                    {alumnos.find(a => a.id.toString() === alumnoSeleccionado)?.curp}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-[#92400E]">
                  <strong>Nota:</strong> Al confirmar, el tutor tendrá acceso al seguimiento académico del alumno.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {paso > 1 && (
              <Button
                variant="outline"
                onClick={() => setPaso(paso - 1)}
                className="rounded-xl"
              >
                ← Anterior
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCerrar}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            {paso < 3 ? (
              <Button
                onClick={handleSiguiente}
                className="bg-[#1D4ED8] text-white rounded-xl"
              >
                Siguiente →
              </Button>
            ) : (
              <Button
                onClick={handleVincular}
                className="bg-[#059669] text-white rounded-xl hover:bg-[#047857]"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar vinculación
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
