import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Components/ui/card";
import { Badge } from "../../Components/ui/badge";
import { Button } from "../../Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../Components/ui/dialog";
import { AlertTriangle, FileText, User, Calendar, Paperclip, History, Clock, XCircle, Eye, EyeOff, Download } from "lucide-react";
import { Label } from "../../Components/ui/label";
import { PageTitle } from "../../Layouts/PageTitle";
import { AlumnoInfoCard } from "../../Components/AlumnoInfoCard";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "../../Components/ui/pagination";

const POR_PAGINA = 10;

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
  const [alumnoInfo, setAlumnoInfo] = useState<{ nombre: string; grupo: string } | null>(null);
  const [adjuntoExpandido, setAdjuntoExpandido] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    if (!alumnoId) return;
    axios.get("/tutor/alumnos-asignados")
      .then(({ data }) => {
        const lista = data.data ?? [];
        const found = lista.find((a: { id: number }) => a.id === alumnoId);
        if (found) setAlumnoInfo({ nombre: found.nombre, grupo: found.grupo });
      })
      .catch(() => { });
  }, [alumnoId]);

  // Cargar ciclos y seleccionar el activo
  useEffect(() => {
    axios.get("/api/ciclos-escolares")
      .then(({ data }) => {
        const todos: CicloData[] = data.ciclos ?? [];
        const lista = todos.filter((c) => c.activo || c.cerrado);
        setCiclos(lista);
        const activo = lista.find((c) => c.activo);
        if (activo) setCicloSeleccionado(activo.id.toString());
        else if (lista.length > 0) setCicloSeleccionado(lista[0].id.toString());
      })
      .catch(() => { });
  }, []);

  // Recargar reportes cuando cambia el ciclo
  useEffect(() => {
    if (!alumnoId || !cicloSeleccionado) return;
    axios.get(`/api/tutor/reportes-conducta/${alumnoId}`, {
      params: { ciclo_id: cicloSeleccionado },
    })
      .then(({ data }) => { setReportes(data.reportes ?? []); setPagina(1); })
      .catch(() => { });
  }, [alumnoId, cicloSeleccionado]);

  const cicloActivo = ciclos.find((c) => c.activo);
  const esHistorico = !!cicloActivo && cicloSeleccionado !== cicloActivo.id.toString();

  // Estadísticas
  const reportesActivos = reportes.filter((r) => r.estatus !== "Archivado");
  const totalReportes = reportesActivos.length;
  const reportesEnSeguimiento = reportesActivos.filter((r) => r.estatus === "En seguimiento").length;
  const reportesCerrados = reportesActivos.filter((r) => r.estatus === "Cerrado").length;

  const totalPaginas = Math.ceil(reportesActivos.length / POR_PAGINA);
  const reportesPaginados = reportesActivos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const getEstatusBadge = (estatus: string) => {
    switch (estatus) {
      case "Abierto":
        return { className: "bg-red-100 text-red-700 border-red-200", text: "Abierto" };
      case "En seguimiento":
        return { className: "bg-blue-100 text-blue-700 border-blue-200", text: "En seguimiento" };
      case "Cerrado":
        return { className: "bg-gray-100 text-gray-700 border-gray-200", text: "Cerrado" };
      case "Archivado":
        return { className: "bg-amber-100 text-amber-700 border-amber-200", text: "Archivado" };
      default:
        return { className: "bg-gray-100 text-gray-700 border-gray-200", text: estatus };
    }
  };


  const getGravedadBadge = (gravedad: string) => {
    switch (gravedad.toLowerCase()) {
      case "alta":   return "bg-orange-100 text-orange-700 border-orange-200";
      case "media":  return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "baja":   return "bg-green-100 text-green-700 border-green-200";
      default:       return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const verDetalle = (reporte: ReporteData) => {
    setReporteSeleccionado(reporte);
    setAdjuntoExpandido(null);
    setDialogAbierto(true);
  };

  const nombreArchivo = (url: string) => url.split("/").pop() ?? "archivo";

  return (
    <div className="space-y-6 animate-fade-in">
      <AlumnoInfoCard alumnoId={alumnoId} />
      <PageTitle
        icon={AlertTriangle}
        title="Reportes de Conducta"
        description="Consulta los reportes de conducta del alumno"
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
                <Clock className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">En seguimiento</p>
                <p className="text-2xl font-bold text-[#D97706]">{reportesEnSeguimiento}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <XCircle className="h-6 w-6 text-[#059669]" />
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
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Historial de Reportes</CardTitle>
          <CardDescription>Selecciona un reporte de conducta para ver su detalle</CardDescription>
        </CardHeader>
        <CardContent>
          {reportesActivos.length === 0 ? (
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
              {reportesPaginados.map((reporte) => {
                const badge = getEstatusBadge(reporte.estatus);

                return (
                  <Card key={reporte.id} className="border-[#E5E7EB] hover:shadow-lg transition-all cursor-pointer" onClick={() => verDetalle(reporte)}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{reporte.tipoReporte}</Badge>
                          <Badge className={getGravedadBadge(reporte.gravedad)}>{reporte.gravedad}</Badge>
                          <Badge className={badge.className}>{badge.text}</Badge>
                        </div>
                        <h3 className="font-semibold text-[#111827]">{reporte.descripcion}</h3>
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
                              <span>{nombreArchivo(reporte.archivoAdjunto)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {totalPaginas > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-[#6B7280]">
                  <span>Mostrando {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, reportes.length)} de {reportes.length}</span>
                  <Pagination className="w-auto mx-0">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPagina((p) => Math.max(1, p - 1)); }} className={pagina === 1 ? "pointer-events-none opacity-50" : ""} />
                      </PaginationItem>
                      {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                        .filter((n) => n === 1 || n === totalPaginas || Math.abs(n - pagina) <= 1)
                        .reduce<(number | "ellipsis")[]>((acc, n, idx, arr) => {
                          if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
                          acc.push(n); return acc;
                        }, [])
                        .map((item, idx) => item === "ellipsis" ? (
                          <PaginationItem key={`e-${idx}`}><PaginationEllipsis /></PaginationItem>
                        ) : (
                          <PaginationItem key={item}>
                            <PaginationLink href="#" isActive={pagina === item} onClick={(e) => { e.preventDefault(); setPagina(item as number); }}>{item}</PaginationLink>
                          </PaginationItem>
                        ))}
                      <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPagina((p) => Math.min(totalPaginas, p + 1)); }} className={pagina === totalPaginas ? "pointer-events-none opacity-50" : ""} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Dialog de detalle */}
      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Reporte</DialogTitle>
            <DialogDescription>
              Información detallada del reporte seleccionado.
            </DialogDescription>
          </DialogHeader>

          {reporteSeleccionado && (
            <div className="space-y-4">
              {alumnoInfo && (
                <div>
                  <Label className="text-[#6B7280]">Alumno</Label>
                  <div className="mt-1 px-3 py-2 border border-[#E5E7EB] rounded-lg bg-blue-50">
                    <p className="text-sm font-medium text-[#111827]">{alumnoInfo.nombre}</p>
                    <p className="text-xs text-[#6B7280]">{alumnoInfo.grupo}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#6B7280]">Tipo de Reporte</Label>
                  <div className="mt-1">
                    <Badge variant="secondary">{reporteSeleccionado.tipoReporte}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Nivel de Gravedad</Label>
                  <div className="mt-1">
                    <Badge className={getGravedadBadge(reporteSeleccionado.gravedad)}>
                      {reporteSeleccionado.gravedad}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-[#6B7280]">Estado del Reporte</Label>
                <div className="mt-1">
                  <Badge className={getEstatusBadge(reporteSeleccionado.estatus).className}>
                    {reporteSeleccionado.estatus}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-[#6B7280]">Descripción del Incidente</Label>
                <p className="mt-1 text-sm text-[#111827]">{reporteSeleccionado.descripcion}</p>
              </div>

              <div>
                <Label className="text-[#6B7280]">Acciones Tomadas</Label>
                <p className="mt-1 text-sm text-[#111827]">{reporteSeleccionado.observaciones || "Sin observaciones"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E5E7EB]">
                <div>
                  <Label className="text-[#6B7280]">Reportado por</Label>
                  <p className="text-sm mt-1">{reporteSeleccionado.reportadoPorNombre}</p>
                </div>
                <div>
                  <Label className="text-[#6B7280]">Fecha</Label>
                  <p className="text-sm mt-1">{reporteSeleccionado.fecha}</p>
                </div>
              </div>

              {reporteSeleccionado.archivoAdjunto && (() => {
                const urlVer = reporteSeleccionado.archivoAdjunto as string;
                const nombre = nombreArchivo(urlVer);
                const urlDescargar = `${urlVer}?download=1`;
                const ext = nombre.split(".").pop()?.toLowerCase() ?? "";
                const esPdf = ext === "pdf";
                const esImagen = ["jpg","jpeg","png","gif","webp","svg"].includes(ext);
                const soportaVista = esPdf || esImagen;
                const estaExpandido = adjuntoExpandido === urlVer;
                return (
                  <div>
                    <Label className="text-[#6B7280]">Archivo Adjunto</Label>
                    <div className="mt-2 bg-gray-50 rounded-lg border border-[#E5E7EB] overflow-hidden">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-red-50 rounded-lg shrink-0">
                            <FileText className="h-4 w-4 text-[#E11D48]" />
                          </div>
                          <p className="text-sm font-medium text-[#111827] break-all">{nombre}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {soportaVista && (
                            <Button
                              size="sm"
                              variant="outline"
                              className={`gap-2 ${estaExpandido ? "bg-blue-50 border-[#1D4ED8] text-[#1D4ED8]" : ""}`}
                              onClick={() => setAdjuntoExpandido(estaExpandido ? null : urlVer)}
                            >
                              {estaExpandido ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              {estaExpandido ? "Ocultar" : "Visualizar"}
                            </Button>
                          )}
                          <a href={urlDescargar} download>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Download className="h-4 w-4" />
                              Descargar
                            </Button>
                          </a>
                        </div>
                      </div>
                      {soportaVista && estaExpandido && (
                        <div className="border-t border-[#E5E7EB]">
                          {esPdf ? (
                            <iframe src={urlVer} className="w-full" style={{ height: "500px" }} title={nombre} />
                          ) : (
                            <img src={urlVer} alt={nombre} className="w-full max-h-125 object-contain p-2" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setDialogAbierto(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
