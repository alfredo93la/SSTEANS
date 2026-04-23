import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../../Components/ui/card";
import { Badge } from "../../Components/ui/badge";
import { Button } from "../../Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../Components/ui/dialog";
import { AlertTriangle, FileText, User, Calendar, AlertCircle, CheckCircle, Paperclip, History } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";
import { AlumnoInfoCard } from "../../Components/AlumnoInfoCard";

interface CicloData { id: number; nombre: string; activo: boolean; cerrado: boolean; }

interface ReporteData {
  id: number;
  alumnoId: number;
  tipoReporte: string;
  gravedad: "Baja" | "Media" | "Alta";
  descripcion: string;
  observaciones: string;
  archivoAdjunto: string | null;
  fecha: string;
  estatus: string;
  reportadoPor: number;
  reportadoPorNombre: string;
}

interface ReportesConductaTutorProps {
  alumnoId: number;
}

export function ReportesConductaTutor({ alumnoId }: ReportesConductaTutorProps) {
  const [ciclos, setCiclos] = useState<CicloData[]>([]);
  const [cicloSeleccionado, setCicloSeleccionado] = useState("");
  const [reportes, setReportes] = useState<ReporteData[]>([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteData | null>(null);
  const [dialogAbierto, setDialogAbierto] = useState(false);

  // Cargar ciclos y seleccionar el activo
  useEffect(() => {
    axios.get("/api/ciclos-escolares")
      .then(({ data }) => {
        const lista: CicloData[] = data.ciclos ?? [];
        setCiclos(lista);
        const activo = lista.find((c) => c.activo);
        if (activo) setCicloSeleccionado(activo.id.toString());
        else if (lista.length > 0) setCicloSeleccionado(lista[0].id.toString());
      })
      .catch(() => {});
  }, []);

  // Recargar reportes cuando cambia el ciclo
  useEffect(() => {
    if (!alumnoId || !cicloSeleccionado) return;
    axios.get(`/api/tutor/reportes-conducta/${alumnoId}`, {
      params: { ciclo_id: cicloSeleccionado },
    })
      .then(({ data }) => setReportes(data.reportes ?? []))
      .catch(() => {});
  }, [alumnoId, cicloSeleccionado]);

  const cicloActivo = ciclos.find((c) => c.activo);
  const esHistorico = cicloSeleccionado && cicloSeleccionado !== cicloActivo?.id.toString();

  // Estadísticas
  const totalReportes = reportes.length;
  const reportesEnSeguimiento = reportes.filter((r) => r.estatus === "En seguimiento").length;
  const reportesCerrados = reportes.filter((r) => r.estatus === "Cerrado").length;

  const getEstatusBadge = (estatus: string) => {
    switch (estatus) {
      case "En seguimiento":
        return { className: "bg-[#D97706] text-white", text: "En seguimiento" };
      case "Cerrado":
        return { className: "bg-[#059669] text-white", text: "Cerrado" };
      default:
        return { className: "bg-[#6B7280] text-white", text: estatus };
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "Disciplina": return "text-[#E11D48] bg-red-100";
      case "Material":   return "text-[#D97706] bg-amber-100";
      case "Asistencia": return "text-[#1D4ED8] bg-blue-100";
      default:           return "text-[#6B7280] bg-gray-100";
    }
  };

  const getGravedadBadge = (gravedad: string) => {
    switch (gravedad) {
      case "Alta":  return { className: "bg-[#E11D48] text-white", text: "Alta" };
      case "Media": return { className: "bg-[#D97706] text-white", text: "Media" };
      case "Baja":  return { className: "bg-[#059669] text-white", text: "Baja" };
      default:      return { className: "bg-[#6B7280] text-white", text: gravedad };
    }
  };

  const verDetalle = (reporte: ReporteData) => {
    setReporteSeleccionado(reporte);
    setDialogAbierto(true);
  };

  const nombreArchivo = (url: string) => url.split("/").pop() ?? "archivo";

  return (
    <div className="space-y-6 animate-fade-in">
      <AlumnoInfoCard alumnoId={alumnoId} />
      <PageTitle
        icon={AlertTriangle}
        title="Reportes de Conducta"
        description="Consulta los reportes y observaciones del estudiante"
        color="bg-[#E11D48]"
      >
        <div className="flex items-center gap-2">
          {esHistorico ? (
            <Badge className="bg-amber-100 text-amber-700 border-0 gap-1 shrink-0">
              <History className="h-3 w-3" />
              Historial
            </Badge>
          ) : (
            <Badge className="bg-green-100 text-green-700 border-0 shrink-0">Ciclo actual</Badge>
          )}
          <div className="w-48">
          <Select value={cicloSeleccionado} onValueChange={setCicloSeleccionado}>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Ciclo escolar" />
            </SelectTrigger>
            <SelectContent>
              {ciclos.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.nombre}
                  {c.activo && " (actual)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </div>
      </PageTitle>

      {/* Aviso de historial */}
      {esHistorico && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-[#D97706] shrink-0" />
              <p className="text-sm text-[#92400E]">
                Mostrando historial del ciclo <span className="font-semibold">{ciclos.find(c => c.id.toString() === cicloSeleccionado)?.nombre}</span>.
                Este ciclo ya está cerrado.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <FileText className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total Reportes</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{totalReportes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <AlertCircle className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">En Seguimiento</p>
                <p className="text-2xl font-bold text-[#D97706]">{reportesEnSeguimiento}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <CheckCircle className="h-6 w-6 text-[#059669]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Cerrados</p>
                <p className="text-2xl font-bold text-[#059669]">{reportesCerrados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de reportes */}
      {reportes.length === 0 ? (
        <Card className="border-[#E5E7EB]">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
            <p className="text-[#6B7280]">
              {esHistorico
                ? `No hay reportes registrados en el ciclo ${ciclos.find(c => c.id.toString() === cicloSeleccionado)?.nombre}`
                : "No hay reportes registrados para este alumno"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reportes.map((reporte) => {
            const badge = getEstatusBadge(reporte.estatus);
            const tipoColor = getTipoColor(reporte.tipoReporte);
            const gravedadBadge = getGravedadBadge(reporte.gravedad);

            return (
              <Card key={reporte.id} className="border-[#E5E7EB] hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        reporte.estatus === "Cerrado" ? "bg-green-100" : "bg-red-100"
                      }`}>
                        <AlertTriangle className={`h-6 w-6 ${
                          reporte.estatus === "Cerrado" ? "text-[#059669]" : "text-[#E11D48]"
                        }`} />
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="secondary" className={tipoColor}>
                              {reporte.tipoReporte}
                            </Badge>
                            <Badge className={gravedadBadge.className}>
                              Gravedad: {gravedadBadge.text}
                            </Badge>
                            <Badge className={badge.className}>
                              {badge.text}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-[#111827]">{reporte.descripcion}</h3>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-[#6B7280]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{reporte.fecha}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Reportado por: {reporte.reportadoPorNombre}</span>
                        </div>
                        {reporte.archivoAdjunto && (
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            <a
                              href={reporte.archivoAdjunto}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#1D4ED8] underline underline-offset-2"
                            >
                              {nombreArchivo(reporte.archivoAdjunto)}
                            </a>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => verDetalle(reporte)}
                        className="w-full sm:w-auto"
                      >
                        Ver detalles completos
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de detalle */}
      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Reporte</DialogTitle>
            <DialogDescription>Información completa del reporte de conducta</DialogDescription>
          </DialogHeader>

          {reporteSeleccionado && (
            <div className="space-y-4 mt-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className={getTipoColor(reporteSeleccionado.tipoReporte)}>
                  {reporteSeleccionado.tipoReporte}
                </Badge>
                <Badge className={getGravedadBadge(reporteSeleccionado.gravedad).className}>
                  Gravedad: {reporteSeleccionado.gravedad}
                </Badge>
                <Badge className={getEstatusBadge(reporteSeleccionado.estatus).className}>
                  {reporteSeleccionado.estatus}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Fecha</h4>
                  <p className="text-sm text-[#6B7280]">{reporteSeleccionado.fecha}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Descripción</h4>
                  <p className="text-sm text-[#6B7280]">{reporteSeleccionado.descripcion}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Observaciones</h4>
                  <p className="text-sm text-[#6B7280]">{reporteSeleccionado.observaciones || "Sin observaciones"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Reportado por</h4>
                  <p className="text-sm text-[#6B7280]">{reporteSeleccionado.reportadoPorNombre}</p>
                </div>
                {reporteSeleccionado.archivoAdjunto && (
                  <div>
                    <h4 className="font-semibold text-[#111827] mb-1">Archivo adjunto</h4>
                    <a
                      href={reporteSeleccionado.archivoAdjunto}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#1D4ED8] underline underline-offset-2"
                    >
                      <Paperclip className="h-4 w-4" />
                      {nombreArchivo(reporteSeleccionado.archivoAdjunto)}
                    </a>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Estatus</h4>
                  <div className="flex items-start gap-2 p-3 rounded-lg border border-[#E5E7EB] bg-gray-50">
                    {reporteSeleccionado.estatus === "Cerrado" ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-[#059669] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-[#059669]">Reporte cerrado</p>
                          <p className="text-xs text-[#6B7280] mt-1">El caso ha sido resuelto y cerrado.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-[#D97706] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-[#D97706]">En seguimiento</p>
                          <p className="text-xs text-[#6B7280] mt-1">El caso está siendo monitoreado activamente.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
