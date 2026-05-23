import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
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
  Edit,
  Clock,
  XCircle,
  Plus,
  Paperclip,
  X,
  Loader2,
  Archive
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../../Components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../Components/ui/alert-dialog";
import { PageTitle } from "../../Layouts/PageTitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "../../Components/ui/pagination";

const POR_PAGINA = 10;

interface AlumnoData {
  id: number;
  nombre: string;
  grupo: string;
  curp: string;
}

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

interface FormDataReporte {
  alumnoId: string;
  tipoReporte: string;
  gravedad: string;
  descripcion: string;
  acciones: string;
  estatus: string;
}

const initialForm: FormDataReporte = {
  alumnoId: "",
  tipoReporte: "",
  gravedad: "",
  descripcion: "",
  acciones: "",
  estatus: "abierto",
};

export function ReportesTS() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  useEffect(() => { setPagina(1); }, [busqueda, filtroEstado]);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteData | null>(null);
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<File[]>([]);
  const [alumnos, setAlumnos] = useState<AlumnoData[]>([]);
  const [reportes, setReportes] = useState<ReporteData[]>([]);
  const [formulario, setFormulario] = useState<FormDataReporte>(initialForm);
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [busquedaAlumnoModal, setBusquedaAlumnoModal] = useState("");
  const [archivoExistenteEdit, setArchivoExistenteEdit] = useState<string | null>(null);
  const [adjuntoEliminado, setAdjuntoEliminado] = useState(false);
  const [confirmarCrear, setConfirmarCrear] = useState(false);
  const [confirmarArchivar, setConfirmarArchivar] = useState<ReporteData | null>(null);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [{ data: alumnosData }, { data: reportesData }] = await Promise.all([
        axios.get("/api/trabajador-social/alumnos"),
        axios.get("/api/reportes-conducta"),
      ]);

      setAlumnos(alumnosData.alumnos ?? []);
      setReportes(reportesData.reportes ?? []);
    } catch {
      toast.error("No se pudieron cargar los reportes de conducta.");
    }
  };

  const getAlumno = (alumnoId: number) => alumnos.find((alumno) => alumno.id === alumnoId);

  const normalizarTipo = (tipo: string) =>
    tipo
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const mapTipoToTab = (tipo: string) => {
    const tipoNormalizado = normalizarTipo(tipo);

    switch (tipoNormalizado) {
      case "conducta":
        return "conducta";
      case "asistencia":
        return "asistencia";
      case "académico":
      case "academico":
        return "academico";
      case "emocional":
        return "emocional";
      default:
        return "todos";
    }
  };

  const reportesEnriquecidos = useMemo(() => {
    return reportes.map((reporte) => {
      const alumno = getAlumno(reporte.alumnoId);

      return {
        ...reporte,
        alumno: alumno?.nombre ?? `Alumno #${reporte.alumnoId}`,
        grupo: alumno?.grupo ?? "Sin grupo",
        tipo: reporte.tipoReporte,
        gravedadVista: reporte.gravedad.toLowerCase(),
        estadoVista: reporte.estatus.toLowerCase().replace(/\s+/g, "_"),
        acciones: reporte.observaciones,
        seguimientos: reporte.observaciones ? 1 : 0,
      };
    });
  }, [alumnos, reportes]);

  const reportesFiltrados = useMemo(() => {
    return reportesEnriquecidos.filter((reporte) => {
      const coincideBusqueda =
        reporte.alumno.toLowerCase().includes(busqueda.toLowerCase()) ||
        reporte.grupo.toLowerCase().includes(busqueda.toLowerCase()) ||
        reporte.descripcion.toLowerCase().includes(busqueda.toLowerCase());

      if (!coincideBusqueda) return false;

      if (filtroEstado === "todos") return true;

      return reporte.estadoVista === filtroEstado;
    });
  }, [busqueda, filtroEstado, reportesEnriquecidos]);

  const estadisticas = useMemo(() => ({
    total: reportes.length,
    enSeguimiento: reportes.filter((reporte) => reporte.estatus === "En seguimiento").length,
    abiertos: reportes.filter((reporte) => reporte.estatus === "Abierto").length,
    cerrados: reportes.filter((reporte) => reporte.estatus === "Cerrado").length,
  }), [reportes]);

  const getBadgeGravedad = (gravedad: string) => {
    switch (gravedad.toLowerCase()) {
      case "alta":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "media":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "baja":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case "abierto":
        return "bg-red-100 text-red-700 border-red-200";
      case "en_seguimiento":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "resuelto":
        return "bg-green-100 text-green-700 border-green-200";
      case "cerrado":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "archivado":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case "abierto":
        return "Abierto";
      case "en_seguimiento":
        return "En seguimiento";
      case "cerrado":
        return "Cerrado";
      case "archivado":
        return "Archivado";
      default:
        return estado;
    }
  };

  const verDetalle = (reporte: ReporteData) => {
    setReporteSeleccionado(reporte);
    setModalDetalle(true);
  };

  const archivarReporte = async (reporte: ReporteData) => {
    try {
      const payload = new FormData();
      payload.append("_method", "PUT");
      payload.append("alumno_id", reporte.alumnoId.toString());
      payload.append("tipo_reporte", reporte.tipoReporte);
      payload.append("gravedad", reporte.gravedad);
      payload.append("descripcion", reporte.descripcion);
      payload.append("observaciones", reporte.observaciones ?? "");
      payload.append("fecha", reporte.fecha);
      payload.append("estatus", "Archivado");
      await axios.post(`/api/reportes-conducta/${reporte.id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Reporte archivado.");
      setModalDetalle(false);
      setConfirmarArchivar(null);
      await cargarDatos();
    } catch {
      toast.error("No se pudo archivar el reporte.");
    }
  };

  const alumnosFiltradosModal = useMemo(() => {
    const q = busquedaAlumnoModal.toLowerCase();
    return alumnos.filter((a) =>
      !q ||
      a.nombre.toLowerCase().includes(q) ||
      a.grupo.toLowerCase().includes(q) ||
      a.curp.toLowerCase().includes(q)
    ).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [alumnos, busquedaAlumnoModal]);

  const alumnoSeleccionado = useMemo(() =>
    alumnos.find((a) => a.id.toString() === formulario.alumnoId),
    [alumnos, formulario.alumnoId]
  );

  const abrirNuevoReporte = (abierto: boolean) => {
    setModalNuevo(abierto);

    if (!abierto) {
      setEditandoId(null);
      setFormulario(initialForm);
      setArchivosAdjuntos([]);
      setBusquedaAlumnoModal("");
      setArchivoExistenteEdit(null);
      setAdjuntoEliminado(false);
    }
  };

  const abrirEdicion = (reporte: ReporteData) => {
    setEditandoId(reporte.id);
    setFormulario({
      alumnoId: reporte.alumnoId.toString(),
      tipoReporte: normalizarTipo(reporte.tipoReporte),
      gravedad: reporte.gravedad.toLowerCase(),
      descripcion: reporte.descripcion,
      acciones: reporte.observaciones ?? "",
      estatus: reporte.estatus.toLowerCase().replace(/\s+/g, "_"),
    });
    setArchivosAdjuntos([]);
    setArchivoExistenteEdit(reporte.archivoAdjunto);
    setAdjuntoEliminado(false);
    setModalDetalle(false);
    setModalNuevo(true);
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
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const actualizarCampo = (campo: keyof FormDataReporte, valor: string) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const guardarReporte = async () => {
    if (!formulario.alumnoId) { toast.error("Debes seleccionar un alumno."); return; }
    if (!formulario.tipoReporte) { toast.error("Selecciona el tipo de reporte."); return; }
    if (!formulario.gravedad) { toast.error("Selecciona la gravedad del reporte."); return; }
    if (!formulario.descripcion.trim() || formulario.descripcion.trim().length < 10) {
      toast.error("La descripción debe tener al menos 10 caracteres."); return;
    }

    setGuardando(true);

    try {
      const payload = new FormData();
      payload.append("alumno_id", formulario.alumnoId);
      payload.append("tipo_reporte", formulario.tipoReporte.charAt(0).toUpperCase() + formulario.tipoReporte.slice(1));
      payload.append("gravedad", formulario.gravedad.charAt(0).toUpperCase() + formulario.gravedad.slice(1));
      payload.append("descripcion", formulario.descripcion.trim());
      payload.append("observaciones", formulario.acciones.trim());
      payload.append("fecha", new Date().toISOString().split("T")[0]);
      payload.append("estatus", getEstadoTexto(formulario.estatus));

      if (archivosAdjuntos[0]) {
        payload.append("archivo_adjunto", archivosAdjuntos[0]);
      } else if (editandoId && adjuntoEliminado) {
        payload.append("eliminar_adjunto", "1");
      }

      if (editandoId) {
        payload.append("_method", "PUT");
        await axios.post(`/api/reportes-conducta/${editandoId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Reporte actualizado correctamente.");
      } else {
        await axios.post("/api/reportes-conducta", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Reporte creado correctamente.");
      }

      abrirNuevoReporte(false);
      await cargarDatos();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "No se pudo guardar el reporte.");
    } finally {
      setGuardando(false);
    }
  };

  const renderListaReportes = (tipoTab: string) => {
    const lista = tipoTab === "todos"
      ? reportesFiltrados
      : reportesFiltrados.filter((reporte) => mapTipoToTab(reporte.tipoReporte) === tipoTab);

    if (lista.length === 0) {
      return (
        <Card className="border-[#E5E7EB]">
          <CardContent className="pt-6">
            <p className="text-center text-[#6B7280]">No hay reportes para mostrar</p>
          </CardContent>
        </Card>
      );
    }

    const totalPaginas = Math.ceil(lista.length / POR_PAGINA);
    const paginados = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

    return (
      <Card className="border-[#E5E7EB]">
        {tipoTab === "todos" && (
          <CardHeader>
            <CardTitle>Todos los Reportes</CardTitle>
            <CardDescription>Lista completa de reportes registrados</CardDescription>
          </CardHeader>
        )}
        <CardContent className={tipoTab === "todos" ? undefined : "pt-6"}>
          <div className="space-y-3">
            {paginados.map((reporte) => (
              <div
                key={reporte.id}
                className="p-4 rounded-lg border border-[#E5E7EB] hover:shadow-md transition-all cursor-pointer"
                onClick={() => verDetalle(reporte)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-[#111827]">{reporte.alumno}</h4>
                      <Badge variant="outline">{reporte.grupo}</Badge>
                      <Badge className={getBadgeGravedad(reporte.gravedadVista)}>
                        {reporte.gravedad}
                      </Badge>
                      <Badge className={getBadgeEstado(reporte.estadoVista)}>
                        {getEstadoTexto(reporte.estadoVista)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{reporte.tipoReporte}</Badge>
                      <span className="text-xs text-[#6B7280]">
                        {reporte.fecha} - {reporte.reportadoPorNombre}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B7280] mb-2">{reporte.descripcion}</p>
                    <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                      <span>{reporte.seguimientos} seguimiento(s)</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); abrirEdicion(reporte); }}
                      title="Editar reporte"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {reporte.estadoVista !== "archivado" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-amber-600"
                        onClick={(e) => { e.stopPropagation(); setConfirmarArchivar(reporte); }}
                        title="Archivar reporte"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPaginas > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-[#6B7280]">
              <span>Mostrando {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, lista.length)} de {lista.length}</span>
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
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={AlertTriangle} title="Reportes de Conducta" description="Gestiona y da seguimiento a los reportes de alumnos" color="bg-[#E11D48]">
        <Dialog open={modalNuevo} onOpenChange={abrirNuevoReporte}>
          <DialogTrigger asChild>
            <Button className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Reporte
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editandoId ? "Editar Reporte" : "Crear Nuevo Reporte"}</DialogTitle>
              <DialogDescription>
                {editandoId ? "Actualiza los campos necesarios del reporte." : "Llena los campos para crear un nuevo reporte de conducta."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Alumno</Label>
                  {alumnoSeleccionado ? (
                    <div className="mt-1 flex items-center justify-between px-3 py-2 border border-[#E5E7EB] rounded-lg bg-blue-50">
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{alumnoSeleccionado.nombre}</p>
                        <p className="text-xs text-[#6B7280]">
                          {alumnoSeleccionado.grupo}{alumnoSeleccionado.curp ? ` · ${alumnoSeleccionado.curp}` : ""}
                        </p>
                      </div>
                      {!editandoId && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => { actualizarCampo("alumnoId", ""); setBusquedaAlumnoModal(""); }}
                          className="hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                        <Input
                          placeholder="Buscar por nombre, grupo o CURP..."
                          value={busquedaAlumnoModal}
                          onChange={(e) => setBusquedaAlumnoModal(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="max-h-36 overflow-y-auto border border-[#E5E7EB] rounded-lg divide-y divide-[#F3F4F6]">
                        {alumnosFiltradosModal.length === 0 ? (
                          <p className="text-sm text-[#6B7280] text-center py-3">Sin resultados</p>
                        ) : (
                          alumnosFiltradosModal.map((alumno) => (
                            <button
                              key={alumno.id}
                              type="button"
                              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-left"
                              onClick={() => { actualizarCampo("alumnoId", alumno.id.toString()); setBusquedaAlumnoModal(""); }}
                            >
                              <p className="text-sm font-medium text-[#111827]">{alumno.nombre}</p>
                              <p className="text-xs text-[#6B7280]">
                                {alumno.grupo}{alumno.curp ? ` · ${alumno.curp}` : ""}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo de Reporte</Label>
                  <Select value={formulario.tipoReporte} onValueChange={(value) => actualizarCampo("tipoReporte", value)}>
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

                <div>
                  <Label htmlFor="gravedad">Nivel de Gravedad</Label>
                  <Select value={formulario.gravedad} onValueChange={(value) => actualizarCampo("gravedad", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar gravedad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="estatus">Estado del Reporte</Label>
                <Select
                  value={formulario.estatus}
                  onValueChange={(value) => actualizarCampo("estatus", value)}
                  disabled={!editandoId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abierto">Abierto</SelectItem>
                    <SelectItem value="en_seguimiento">En seguimiento</SelectItem>
                    <SelectItem value="cerrado">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
                {!editandoId && (
                  <p className="text-xs text-[#6B7280] mt-2">
                    El reporte se crea como abierto y después podrás cambiarlo a seguimiento o cerrado.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción del Incidente</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe detalladamente la situación..."
                  rows={4}
                  value={formulario.descripcion}
                  onChange={(e) => actualizarCampo("descripcion", e.target.value)}
                  maxLength={2000}
                />
              </div>

              <div>
                <Label htmlFor="acciones">Acciones Tomadas</Label>
                <Textarea
                  id="acciones"
                  placeholder="Describe las acciones que se han tomado o se tomarán..."
                  rows={3}
                  value={formulario.acciones}
                  onChange={(e) => actualizarCampo("acciones", e.target.value)}
                  maxLength={1000}
                />
              </div>

              <div>
                <Label htmlFor="adjuntos">Archivos Adjuntos</Label>
                <p className="text-xs text-[#6B7280] mb-2">
                  Puedes adjuntar evidencias, fotografías, documentos, etc.
                </p>
                <div className="space-y-3">
                  {editandoId && archivoExistenteEdit && (
                    <div className="space-y-2">
                      <Label>Archivos actuales</Label>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-[#E5E7EB]">
                        <div className="flex items-center gap-2 text-sm text-[#111827] min-w-0">
                          <FileText className="h-4 w-4 text-[#6B7280] shrink-0" />
                          <span className="truncate">{archivoExistenteEdit.split("/").pop()}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-[#6B7280] hover:text-[#E11D48] shrink-0"
                          onClick={() => { setArchivoExistenteEdit(null); setAdjuntoEliminado(true); }}
                          title="Quitar adjunto"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
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
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                    />
                    <span className="text-xs text-[#6B7280]">
                      PDF, Word, imágenes (jpg, png, gif, webp)
                    </span>
                  </div>

                  {archivosAdjuntos.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#111827]">
                        {archivosAdjuntos.length} archivo(s) seleccionado(s):
                      </p>
                      <div className="space-y-2">
                        {archivosAdjuntos.map((archivo, index) => (
                          <div
                            key={`${archivo.name}-${index}`}
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
                <Button variant="outline" onClick={() => abrirNuevoReporte(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]"
                  onClick={() => {
                    if (!editandoId) {
                      if (!formulario.alumnoId) { toast.error("Debes seleccionar un alumno."); return; }
                      if (!formulario.tipoReporte) { toast.error("Selecciona el tipo de reporte."); return; }
                      if (!formulario.gravedad) { toast.error("Selecciona la gravedad del reporte."); return; }
                      if (!formulario.descripcion.trim() || formulario.descripcion.trim().length < 10) { toast.error("La descripción debe tener al menos 10 caracteres."); return; }
                      setConfirmarCrear(true);
                    } else {
                      guardarReporte();
                    }
                  }}
                  disabled={guardando}
                >
                  {guardando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {guardando ? "Guardando..." : editandoId ? "Actualizar Reporte" : "Crear Reporte"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB] bg-linear-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <FileText className="h-6 w-6 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total Reportes</p>
                <p className="text-2xl font-bold text-[#7C3AED]">{estadisticas.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <AlertTriangle className="h-6 w-6 text-[#E11D48]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Abiertos</p>
                <p className="text-2xl font-bold text-[#E11D48]">{estadisticas.abiertos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <Clock className="h-6 w-6 text-[#1D4ED8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">En seguimiento</p>
                <p className="text-2xl font-bold text-[#1D4ED8]">{estadisticas.enSeguimiento}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-linear-to-br from-gray-50 to-gray-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <XCircle className="h-6 w-6 text-[#6B7280]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Cerrados</p>
                <p className="text-2xl font-bold text-[#6B7280]">{estadisticas.cerrados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <SelectItem value="abierto">Abiertos</SelectItem>
                <SelectItem value="en_seguimiento">En seguimiento</SelectItem>
                <SelectItem value="cerrado">Cerrados</SelectItem>
                <SelectItem value="archivado">Archivados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {renderListaReportes("todos")}

      <AlertDialog open={confirmarCrear} onOpenChange={setConfirmarCrear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar apertura de reporte?</AlertDialogTitle>
            <AlertDialogDescription>
              Una vez creado, el reporte <strong>no podrá eliminarse</strong>. Solo podrá editarse o archivarse. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]"
              onClick={() => { setConfirmarCrear(false); guardarReporte(); }}
            >
              Sí, abrir reporte
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmarArchivar} onOpenChange={(open) => { if (!open) setConfirmarArchivar(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Archivar reporte?</AlertDialogTitle>
            <AlertDialogDescription>
              El reporte quedará archivado. Podrás consultarlo pero ya no aparecerá en los listados activos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => { if (confirmarArchivar) archivarReporte(confirmarArchivar); }}
            >
              Archivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              {/* Alumno — mismo estilo que el chip del formulario */}
              <div>
                <Label className="text-[#6B7280]">Alumno</Label>
                <div className="mt-1 px-3 py-2 border border-[#E5E7EB] rounded-lg bg-blue-50">
                  <p className="text-sm font-medium text-[#111827]">
                    {getAlumno(reporteSeleccionado.alumnoId)?.nombre ?? `Alumno #${reporteSeleccionado.alumnoId}`}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {(() => {
                      const a = getAlumno(reporteSeleccionado.alumnoId);
                      return [a?.grupo, a?.curp].filter(Boolean).join(" · ") || "Sin grupo";
                    })()}
                  </p>
                </div>
              </div>

              {/* Tipo de Reporte + Nivel de Gravedad — misma grid que el formulario */}
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
                    <Badge className={getBadgeGravedad(reporteSeleccionado.gravedad)}>
                      {reporteSeleccionado.gravedad}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Estado del Reporte */}
              <div>
                <Label className="text-[#6B7280]">Estado del Reporte</Label>
                <div className="mt-1">
                  <Badge className={getBadgeEstado(reporteSeleccionado.estatus.toLowerCase().replace(/\s+/g, "_"))}>
                    {getEstadoTexto(reporteSeleccionado.estatus.toLowerCase().replace(/\s+/g, "_"))}
                  </Badge>
                </div>
              </div>

              {/* Descripción del Incidente */}
              <div>
                <Label className="text-[#6B7280]">Descripción del Incidente</Label>
                <p className="mt-1 text-sm text-[#111827]">{reporteSeleccionado.descripcion}</p>
              </div>

              {/* Acciones Tomadas */}
              <div>
                <Label className="text-[#6B7280]">Acciones Tomadas</Label>
                <p className="mt-1 text-sm text-[#111827]">{reporteSeleccionado.observaciones || "Sin observaciones"}</p>
              </div>

              {/* Metadata */}
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

              {/* Archivos Adjuntos */}
              {reporteSeleccionado.archivoAdjunto && (
                <div>
                  <Label className="text-[#6B7280]">Archivos Adjuntos</Label>
                  <a
                    href={reporteSeleccionado.archivoAdjunto}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-2 text-sm text-[#1D4ED8] underline underline-offset-2"
                  >
                    <Paperclip className="h-4 w-4" />
                    Ver archivo adjunto
                  </a>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4 border-t">
                {reporteSeleccionado.estatus.toLowerCase() !== "archivado" && (
                  <Button
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => setConfirmarArchivar(reporteSeleccionado)}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archivar
                  </Button>
                )}
                <Button className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED]" onClick={() => abrirEdicion(reporteSeleccionado)}>
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
