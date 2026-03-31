import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Badge } from "../../Components/ui/badge";
import { Button } from "../../Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../Components/ui/dialog";
import { AlertTriangle, FileText, User, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { reportesConducta, getUsuarioById } from "../../data/mockData";
import { PageTitle } from "../../Layouts/PageTitle";

interface ReportesConductaTutorProps {
  alumnoId: number;
}

export function ReportesConductaTutor({ alumnoId }: ReportesConductaTutorProps) {
  const [reporteSeleccionado, setReporteSeleccionado] = useState<typeof reportesConducta[0] | null>(null);
  const [dialogAbierto, setDialogAbierto] = useState(false);

  // Filtrar reportes del alumno
  const reportesAlumno = reportesConducta.filter((r) => r.alumnoId === alumnoId);

  // Estadísticas
  const totalReportes = reportesAlumno.length;
  const reportesEnSeguimiento = reportesAlumno.filter((r) => r.estatus === "En seguimiento").length;
  const reportesCerrados = reportesAlumno.filter((r) => r.estatus === "Cerrado").length;

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
      case "Disciplina":
        return "text-[#E11D48] bg-red-100";
      case "Material":
        return "text-[#D97706] bg-amber-100";
      case "Asistencia":
        return "text-[#1D4ED8] bg-blue-100";
      default:
        return "text-[#6B7280] bg-gray-100";
    }
  };

  const verDetalle = (reporte: typeof reportesConducta[0]) => {
    setReporteSeleccionado(reporte);
    setDialogAbierto(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle
        icon={AlertTriangle}
        title="Reportes de Conducta"
        description="Consulta los reportes y observaciones del estudiante"
        color="bg-[#E11D48]"
      >
      </PageTitle>

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

      {/* Mensaje si no hay reportes */}
      {reportesAlumno.length === 0 ? (
        <Card className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-emerald-50">
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-[#059669] mx-auto mb-4" />
            <h3 className="font-semibold text-[#111827] text-lg mb-2">¡Excelente comportamiento!</h3>
            <p className="text-[#6B7280]">No hay reportes de conducta registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reportesAlumno.map((reporte) => {
            const badge = getEstatusBadge(reporte.estatus);
            const tipoColor = getTipoColor(reporte.tipoReporte);
            const profesor = getUsuarioById(reporte.reportadoPor);

            return (
              <Card key={reporte.id} className="border-[#E5E7EB] hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Indicador visual */}
                    <div className="shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        reporte.estatus === "Cerrado" ? "bg-green-100" : "bg-red-100"
                      }`}>
                        <AlertTriangle className={`h-6 w-6 ${
                          reporte.estatus === "Cerrado" ? "text-[#059669]" : "text-[#E11D48]"
                        }`} />
                      </div>
                    </div>

                    {/* Información del reporte */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className={tipoColor}>
                              {reporte.tipoReporte}
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
                          <span>Reportado por: {profesor?.nombre || "Desconocido"}</span>
                        </div>
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
              <div className="flex gap-2">
                <Badge variant="secondary" className={getTipoColor(reporteSeleccionado.tipoReporte)}>
                  {reporteSeleccionado.tipoReporte}
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
                  <p className="text-sm text-[#6B7280]">{reporteSeleccionado.observaciones}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Reportado por</h4>
                  <p className="text-sm text-[#6B7280]">
                    {getUsuarioById(reporteSeleccionado.reportadoPor)?.nombre || "Desconocido"}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#111827] mb-1">Estatus</h4>
                  <div className="flex items-start gap-2 p-3 rounded-lg border border-[#E5E7EB] bg-gray-50">
                    {reporteSeleccionado.estatus === "Cerrado" ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-[#059669] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-[#059669]">Reporte cerrado</p>
                          <p className="text-xs text-[#6B7280] mt-1">
                            El caso ha sido resuelto y cerrado.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-[#D97706] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-[#D97706]">En seguimiento</p>
                          <p className="text-xs text-[#6B7280] mt-1">
                            El caso está siendo monitoreado activamente.
                          </p>
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
