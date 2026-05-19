import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../Components/ui/table";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { Badge } from "../../Components/ui/badge";
import { toast } from "sonner";
import { Save, AlertCircle, CheckCircle, Lock, Settings, Plus, Trash2, ChevronUp, Send, BookA, Loader2 } from "lucide-react";
import { PageTitle } from "../../Layouts/PageTitle";

interface GrupoData   { id: number; nombre: string; }
interface MateriaData { id: number; nombre: string; }
interface PeriodoData { id: number; nombre: string; capturaAbierta: boolean; }
interface AlumnoData  { id: number; nombre: string; }
interface RubroData   { id: number; nombre: string; ponderacion: number; orden: number; }
interface CalData     {
  alumnoId: number;
  promedio: number | null;
  valores: Record<number, number | null>; // rubroId => valor | null si no capturado
}

// ─── Editor de rubros ─────────────────────────────────────────────────────────

interface RubroForm { nombre: string; ponderacion: string; }

function RubrosEditor({
  grupoId, materiaId, periodoId,
  rubrosActuales,
  onGuardado,
  onCancelar,
}: {
  grupoId: string;
  materiaId: string;
  periodoId: string;
  rubrosActuales: RubroData[];
  onGuardado: (rubros: RubroData[]) => void;
  onCancelar?: () => void;
}) {
  const [rubros, setRubros] = useState<RubroForm[]>(
    rubrosActuales.length > 0
      ? rubrosActuales.map(r => ({ nombre: r.nombre, ponderacion: r.ponderacion.toString() }))
      : [
          { nombre: "Parcial",  ponderacion: "33.33" },
          { nombre: "Proyecto", ponderacion: "33.33" },
          { nombre: "Examen",   ponderacion: "33.34" },
        ]
  );
  const [guardando, setGuardando] = useState(false);

  const suma = rubros.reduce((s, r) => s + (parseFloat(r.ponderacion) || 0), 0);
  const sumaOk = Math.abs(suma - 100) < 0.1;

  const agregar = () => setRubros(prev => [...prev, { nombre: "", ponderacion: "" }]);

  const eliminar = (i: number) => setRubros(prev => prev.filter((_, idx) => idx !== i));

  const cambiar = (i: number, campo: keyof RubroForm, valor: string) =>
    setRubros(prev => prev.map((r, idx) => idx === i ? { ...r, [campo]: valor } : r));

  const guardar = async () => {
    if (!sumaOk) { toast.error("La suma de ponderaciones debe ser exactamente 100%"); return; }
    if (rubros.some(r => !r.nombre.trim())) { toast.error("Todos los rubros deben tener nombre"); return; }

    setGuardando(true);
    try {
      const { data } = await axios.post("/api/profesor/rubros", {
        materia_id: parseInt(materiaId),
        grupo_id:   parseInt(grupoId),
        periodo_id: parseInt(periodoId),
        rubros: rubros.map(r => ({ nombre: r.nombre.trim(), ponderacion: parseFloat(r.ponderacion) })),
      });
      toast.success("Rubros guardados");
      onGuardado(data.rubros);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Error al guardar rubros");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {rubros.map((rubro, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input
              placeholder="Nombre del rubro (ej. Examen)"
              maxLength={255}
              value={rubro.nombre}
              onChange={e => cambiar(i, "nombre", e.target.value)}
              className="flex-1"
            />
            <div className="relative w-32">
              <Input
                type="number" min="1" max="100" step="0.01"
                placeholder="Pond. %"
                value={rubro.ponderacion}
                onChange={e => cambiar(i, "ponderacion", e.target.value)}
                className="pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]">%</span>
            </div>
            <Button
              variant="ghost" size="icon"
              onClick={() => eliminar(i)}
              disabled={rubros.length <= 1}
              className="text-[#E11D48] hover:bg-red-50 shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Suma */}
      <div className={`flex items-center gap-2 text-sm font-medium ${sumaOk ? "text-[#059669]" : "text-[#E11D48]"}`}>
        {sumaOk
          ? <><CheckCircle className="h-4 w-4" />Suma correcta: 100%</>
          : <><AlertCircle className="h-4 w-4" />Suma actual: {suma.toFixed(2)}% (debe ser 100%)</>
        }
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={agregar}>
          <Plus className="h-4 w-4 mr-1" />Agregar rubro
        </Button>
        <div className="flex-1" />
        {onCancelar && (
          <Button variant="ghost" size="sm" onClick={onCancelar}>Cancelar</Button>
        )}
        <Button
          size="sm"
          onClick={guardar}
          disabled={guardando || !sumaOk}
          className="bg-[#1D4ED8] hover:bg-[#1E40AF]"
        >
          <Save className="h-4 w-4 mr-1" />
          {guardando ? "Guardando…" : "Guardar rubros"}
        </Button>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function RegistroCalificaciones() {
  const [grupos, setGrupos]                             = useState<GrupoData[]>([]);
  const [materias, setMaterias]                         = useState<MateriaData[]>([]);
  const [periodos, setPeriodos]                         = useState<PeriodoData[]>([]);
  const [alumnosDelGrupo, setAlumnosDelGrupo]           = useState<AlumnoData[]>([]);
  const [rubros, setRubros]                             = useState<RubroData[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado]       = useState("");
  const [materiaSeleccionada, setMateriaSeleccionada]   = useState("");
  const [periodoSeleccionado, setPeriodoSeleccionado]   = useState("");
  const [calificaciones, setCalificaciones]             = useState<CalData[]>([]);
  const [cambiosPendientes, setCambiosPendientes]       = useState<Set<number>>(new Set());
  const [editandoRubros, setEditandoRubros]             = useState(false);
  const [publicada, setPublicada]                       = useState(false);
  const [publicando, setPublicando]                     = useState(false);
  const [guardandoCals, setGuardandoCals]               = useState(false);

  const periodoActual  = periodos.find(p => p.id.toString() === periodoSeleccionado);
  const capturaAbierta = periodoActual?.capturaAbierta ?? false;

  // Cargar grupos y periodos al montar
  useEffect(() => {
    axios.get("/api/profesor/grupos")
      .then(({ data }) => {
        const lista: GrupoData[] = data.grupos ?? [];
        setGrupos(lista);
        if (lista.length > 0) setGrupoSeleccionado(lista[0].id.toString());
      })
      .catch(() => {});

    axios.get("/api/periodos/ciclo-activo")
      .then(({ data }) => {
        const lista: PeriodoData[] = data.periodos ?? [];
        setPeriodos(lista);
        const abierto = lista.find(p => p.capturaAbierta);
        const sel = abierto ?? lista[0];
        if (sel) setPeriodoSeleccionado(sel.id.toString());
      })
      .catch(() => {});
  }, []);

  // Cargar materias y alumnos al cambiar grupo
  useEffect(() => {
    if (!grupoSeleccionado) return;
    setMateriaSeleccionada("");
    setMaterias([]);
    setRubros([]);
    axios.get("/api/profesor/materias", { params: { grupo_id: grupoSeleccionado } })
      .then(({ data }) => {
        const lista: MateriaData[] = data.materias ?? [];
        setMaterias(lista);
        if (lista.length > 0) setMateriaSeleccionada(lista[0].id.toString());
      })
      .catch(() => {});
    axios.get("/api/profesor/alumnos", { params: { grupo_id: grupoSeleccionado } })
      .then(({ data }) => setAlumnosDelGrupo((data.alumnos ?? []).sort((a: AlumnoData, b: AlumnoData) => a.nombre.localeCompare(b.nombre, "es"))))
      .catch(() => {});
  }, [grupoSeleccionado]);

  // Cargar rubros al cambiar grupo, materia o periodo
  useEffect(() => {
    if (!grupoSeleccionado || !materiaSeleccionada || !periodoSeleccionado) return;
    setRubros([]);
    setEditandoRubros(false);
    axios.get("/api/profesor/rubros", {
      params: { grupo_id: grupoSeleccionado, materia_id: materiaSeleccionada, periodo_id: periodoSeleccionado },
    })
      .then(({ data }) => {
        setRubros(data.rubros ?? []);
        if ((data.rubros ?? []).length === 0) setEditandoRubros(true);
      })
      .catch(() => {});
  }, [grupoSeleccionado, materiaSeleccionada, periodoSeleccionado]);

  // Cargar calificaciones al cambiar grupo, materia, periodo o rubros
  useEffect(() => {
    if (!grupoSeleccionado || !materiaSeleccionada || !periodoSeleccionado || rubros.length === 0) {
      setCalificaciones([]);
      setPublicada(false);
      return;
    }
    axios.get("/api/calificaciones", {
      params: { grupo_id: grupoSeleccionado, materia_id: materiaSeleccionada, periodo_id: periodoSeleccionado },
    })
      .then(({ data }) => {
        setCalificaciones((data.calificaciones ?? []).map((c: any) => ({
          alumnoId: c.alumnoId,
          promedio: c.promedio ?? null,
          valores:  c.valores ?? {},
        })));
        setPublicada(data.publicada ?? false);
        setCambiosPendientes(new Set());
      })
      .catch(() => {});
  }, [grupoSeleccionado, materiaSeleccionada, periodoSeleccionado, rubros]);

  const grupo   = grupos.find(g => g.id.toString() === grupoSeleccionado);
  const materia = materias.find(m => m.id.toString() === materiaSeleccionada);

  const getCalificacion = (alumnoId: number): CalData =>
    calificaciones.find(c => c.alumnoId === alumnoId) ?? { alumnoId, promedio: null, valores: {} };

  const handleValorBlur = (valor: string) => {
    const num = parseFloat(valor);
    if (!isNaN(num) && num < 5) toast.error("La calificación debe estar entre 5 y 10");
  };

  const handleValorChange = (alumnoId: number, rubroId: number, valor: string) => {
    const num: number | null = valor === '' ? null : parseFloat(valor);
    if (num !== null && num > 10) { toast.error("La calificación debe estar entre 5 y 10"); return; }

    setCalificaciones(prev => {
      const nuevas = [...prev];
      const idx = nuevas.findIndex(c => c.alumnoId === alumnoId);
      const entry = idx >= 0 ? { ...nuevas[idx] } : { alumnoId, promedio: null, valores: {} };

      entry.valores = { ...entry.valores, [rubroId]: num };

      // Recalcular promedio ponderado solo si TODOS los rubros tienen valor
      const allFilled = rubros.every(r => entry.valores[r.id] !== null && entry.valores[r.id] !== undefined);
      entry.promedio = allFilled
        ? parseFloat(rubros.reduce((s, r) => s + (entry.valores[r.id] as number) * (r.ponderacion / 100), 0).toFixed(2))
        : null;

      if (idx >= 0) nuevas[idx] = entry; else nuevas.push(entry);
      return nuevas;
    });
    setCambiosPendientes(prev => new Set([...prev, alumnoId]));
  };

  const guardarCalificaciones = () => {
    if (!materiaSeleccionada || !periodoSeleccionado) return;
    setGuardandoCals(true);
    axios.post("/api/calificaciones", {
      grupo_id:       parseInt(grupoSeleccionado),
      materia_id:     parseInt(materiaSeleccionada),
      periodo_id:     parseInt(periodoSeleccionado),
      calificaciones: calificaciones.map(c => ({ alumnoId: c.alumnoId, valores: c.valores })),
    })
      .then(() => {
        toast.success(`Calificaciones guardadas — ${materia?.nombre} · ${grupo?.nombre}`);
        setCambiosPendientes(new Set());
        setPublicada(false);
      })
      .catch(err => toast.error(err.response?.data?.message ?? "Error al guardar calificaciones"))
      .finally(() => setGuardandoCals(false));
  };

  const handlePublicar = () => {
    if (!grupoSeleccionado || !materiaSeleccionada || !periodoSeleccionado) return;
    setPublicando(true);
    axios.post("/api/calificaciones/publicar", {
      grupo_id:   parseInt(grupoSeleccionado),
      materia_id: parseInt(materiaSeleccionada),
      periodo_id: parseInt(periodoSeleccionado),
    })
      .then(() => {
        toast.success(`Calificaciones publicadas — ${materia?.nombre} · ${grupo?.nombre}`);
        setPublicada(true);
      })
      .catch(err => toast.error(err.response?.data?.message ?? "Error al publicar calificaciones"))
      .finally(() => setPublicando(false));
  };

  const todosCompletos = alumnosDelGrupo.length > 0 &&
    alumnosDelGrupo.every(a => getCalificacion(a.id).promedio !== null);

  const getPromedioColor = (p: number | null) =>
    p === null ? "text-[#6B7280]" : p >= 9 ? "text-[#059669]" : p >= 7 ? "text-[#D97706]" : "text-[#E11D48]";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle icon={BookA} title="Registro de Calificaciones" description="Captura las evaluaciones de tus alumnos" color="bg-[#059669]" />

      {/* ── Selectores ── */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Seleccionar Grupo y Periodo</CardTitle>
          <CardDescription>Elige el grupo y periodo a evaluar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Grupo</label>
              <Select value={grupoSeleccionado} onValueChange={setGrupoSeleccionado}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {grupos.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Materia</label>
              <Select value={materiaSeleccionada} onValueChange={setMateriaSeleccionada}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {materias.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-[#6B7280] mb-2 block">Periodo</label>
              <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {periodos.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      <span className="flex items-center gap-2">
                        {p.nombre}
                        {!p.capturaAbierta && <Lock className="h-3 w-3 text-[#6B7280]" />}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {periodoActual && !capturaAbierta && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#E11D48]" />
              <span className="text-sm text-[#E11D48]">
                La captura de calificaciones para <strong>{periodoActual.nombre}</strong> está cerrada.
              </span>
            </div>
          )}

          {capturaAbierta && cambiosPendientes.size > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[#D97706]" />
              <span className="text-sm text-[#D97706]">Tienes {cambiosPendientes.size} cambio(s) sin guardar</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Rubros de evaluación ── */}
      {grupoSeleccionado && materiaSeleccionada && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#7C3AED]" />
                  Rubros de Evaluación
                </CardTitle>
                <CardDescription>
                  {rubros.length === 0
                    ? "Define cómo se calificará esta materia"
                    : `${rubros.length} rubro(s) — ponderación: ${rubros.reduce((s, r) => s + r.ponderacion, 0).toFixed(0)}%`
                  }
                </CardDescription>
              </div>
              {rubros.length > 0 && !editandoRubros && (
                <Button variant="outline" size="sm" onClick={() => setEditandoRubros(true)}>
                  <Settings className="h-4 w-4 mr-1" />Editar rubros
                </Button>
              )}
              {rubros.length > 0 && editandoRubros && (
                <Button variant="ghost" size="sm" onClick={() => setEditandoRubros(false)}>
                  <ChevronUp className="h-4 w-4 mr-1" />Cerrar
                </Button>
              )}
            </div>
          </CardHeader>

          {/* Chips cuando están cerrados */}
          {rubros.length > 0 && !editandoRubros && (
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {rubros.map(r => (
                  <Badge key={r.id} className="bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20">
                    {r.nombre} — {r.ponderacion}%
                  </Badge>
                ))}
              </div>
            </CardContent>
          )}

          {/* Editor */}
          {(rubros.length === 0 || editandoRubros) && (
            <CardContent className={rubros.length === 0 ? "pt-0" : ""}>
              <RubrosEditor
                grupoId={grupoSeleccionado}
                materiaId={materiaSeleccionada}
                periodoId={periodoSeleccionado}
                rubrosActuales={rubros}
                onGuardado={nuevosRubros => {
                  setRubros(nuevosRubros);
                  setEditandoRubros(false);
                  setCalificaciones([]);
                  setCambiosPendientes(new Set());
                }}
                onCancelar={rubros.length > 0 ? () => setEditandoRubros(false) : undefined}
              />
            </CardContent>
          )}
        </Card>
      )}

      {/* ── Tabla de calificaciones ── */}
      {rubros.length > 0 && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Calificaciones — {materia?.nombre}
                  {publicada && (
                    <Badge className="bg-green-100 text-[#059669] border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />Publicadas
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {grupo?.nombre} · {periodoActual?.nombre} · {alumnosDelGrupo.length} alumnos
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={guardarCalificaciones}
                  disabled={guardandoCals || cambiosPendientes.size === 0 || !capturaAbierta}
                  variant="outline"
                >
                  {guardandoCals ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {guardandoCals ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button
                  onClick={handlePublicar}
                  disabled={!todosCompletos || cambiosPendientes.size > 0 || publicada || publicando || !capturaAbierta}
                  className="bg-[#059669] hover:bg-[#047857]"
                >
                  {publicando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  {publicando ? "Publicando…" : publicada ? "Ya publicadas" : "Publicar"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Alumno</TableHead>
                    {rubros.map(r => (
                      <TableHead key={r.id} className="text-center w-32">
                        <div>{r.nombre}</div>
                        <div className="text-xs font-normal text-[#6B7280]">{r.ponderacion}%</div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center w-24">Promedio</TableHead>
                    <TableHead className="text-center w-32">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alumnosDelGrupo.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={rubros.length + 4} className="text-center text-[#6B7280] py-8">
                        No hay alumnos en este grupo
                      </TableCell>
                    </TableRow>
                  ) : (
                    alumnosDelGrupo.map((alumno, index) => {
                      const cal = getCalificacion(alumno.id);
                      const tieneCambios = cambiosPendientes.has(alumno.id);
                      return (
                        <TableRow key={alumno.id} className={tieneCambios ? "bg-amber-50" : "hover:bg-gray-50"}>
                          <TableCell className="font-medium text-[#6B7280]">{index + 1}</TableCell>
                          <TableCell className="font-medium">{alumno.nombre}</TableCell>
                          {rubros.map(r => (
                            <TableCell key={r.id} className="text-center">
                              <Input
                                type="number" min="5" max="10" step="0.1"
                                value={cal.valores[r.id] ?? ''}
                                onChange={e => handleValorChange(alumno.id, r.id, e.target.value)}
                                onBlur={e => handleValorBlur(e.target.value)}
                                disabled={!capturaAbierta}
                                className="w-20 text-center mx-auto disabled:opacity-50"
                              />
                            </TableCell>
                          ))}
                          <TableCell className="text-center">
                            <span className={`font-bold ${getPromedioColor(cal.promedio)}`}>
                              {cal.promedio !== null ? cal.promedio.toFixed(1) : '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {tieneCambios ? (
                              <Badge className="bg-amber-100 text-[#D97706]">
                                <AlertCircle className="h-3 w-3 mr-1" />Sin guardar
                              </Badge>
                            ) : cal.promedio !== null ? (
                              <Badge className="bg-green-100 text-[#059669]">
                                <CheckCircle className="h-3 w-3 mr-1" />Guardado
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Pendiente</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {alumnosDelGrupo.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-[#6B7280]">Promedio General</p>
                  <p className="text-2xl font-bold text-[#1D4ED8] mt-1">
                    {(() => {
                      const conPromedio = alumnosDelGrupo.map(a => getCalificacion(a.id).promedio).filter((p): p is number => p !== null);
                      return conPromedio.length > 0
                        ? (conPromedio.reduce((s, p) => s + p, 0) / conPromedio.length).toFixed(1)
                        : "—";
                    })()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#6B7280]">Aprobados (≥6)</p>
                  <p className="text-2xl font-bold text-[#059669] mt-1">
                    {alumnosDelGrupo.filter(a => { const p = getCalificacion(a.id).promedio; return p !== null && p >= 6; }).length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#6B7280]">Reprobados (&lt;6)</p>
                  <p className="text-2xl font-bold text-[#E11D48] mt-1">
                    {alumnosDelGrupo.filter(a => { const p = getCalificacion(a.id).promedio; return p !== null && p < 6; }).length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#6B7280]">Sin Calificar</p>
                  <p className="text-2xl font-bold text-[#6B7280] mt-1">
                    {alumnosDelGrupo.filter(a => getCalificacion(a.id).promedio === null).length}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
