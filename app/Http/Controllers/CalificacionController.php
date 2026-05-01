<?php

namespace App\Http\Controllers;

use App\Models\Alumno;
use App\Models\Calificacion;
use App\Models\CalificacionDetalle;
use App\Models\CicloEscolar;
use App\Models\Clase;
use App\Models\PeriodoEvaluacion;
use App\Models\RubroEvaluacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CalificacionController extends Controller
{
    /**
     * GET /api/calificaciones
     * Profesor: requiere grupo_id, materia_id, periodo_id
     * Devuelve rubros + calificaciones con detalle por rubro.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'grupo_id'   => ['required', 'integer'],
            'materia_id' => ['required', 'integer'],
            'periodo_id' => ['required', 'integer', 'exists:periodos_evaluacion,id'],
        ]);

        $cicloId = CicloEscolar::where('activo', true)->value('id');

        // Rubros del profesor para esta materia+grupo+periodo
        $rubros = RubroEvaluacion::where('profesor_user_id', $request->user()->id)
            ->where('materia_id', $request->integer('materia_id'))
            ->where('grupo_id', $request->integer('grupo_id'))
            ->where('ciclo_escolar_id', $cicloId)
            ->where('periodo_evaluacion_id', $request->integer('periodo_id'))
            ->orderBy('orden')
            ->get(['id', 'nombre', 'ponderacion', 'orden']);

        // Alumnos del grupo
        $alumnos = Alumno::whereHas('asignaciones', function ($q) use ($request, $cicloId) {
                $q->where('grupo_id', $request->integer('grupo_id'))
                  ->where('estado', 'activo');
                if ($cicloId) {
                    $q->where('ciclo_escolar_id', $cicloId);
                }
            })
            ->with(['persona:id,nombre,apellidos'])
            ->get();

        // Calificaciones existentes con sus detalles
        $calificaciones = Calificacion::whereIn('alumno_id', $alumnos->pluck('id'))
            ->where('materia_id', $request->integer('materia_id'))
            ->where('periodo_evaluacion_id', $request->integer('periodo_id'))
            ->with('detalles')
            ->get()
            ->keyBy('alumno_id');

        $resultado = $alumnos->map(function ($alumno) use ($calificaciones, $rubros) {
            $cal = $calificaciones[$alumno->id] ?? null;

            // Construir mapa rubroId => valor
            $detallesPorRubro = [];
            if ($cal) {
                foreach ($cal->detalles as $detalle) {
                    $detallesPorRubro[$detalle->rubro_id] = $detalle->valor;
                }
            }

            $valores = $rubros->mapWithKeys(fn ($r) => [
                $r->id => $detallesPorRubro[$r->id] ?? null,
            ]);

            return [
                'alumnoId' => $alumno->id,
                'nombre'   => trim(($alumno->persona?->nombre ?? '').' '.($alumno->persona?->apellidos ?? '')),
                'promedio' => $cal?->promedio,
                'valores'  => $valores,
            ];
        })->sortBy('nombre')->values();

        // Estado de publicación: true si TODOS los alumnos con calificación la tienen publicada
        // y al menos un alumno tiene calificación guardada.
        $totalAlumnos    = $alumnos->count();
        $calPublicadas   = $calificaciones->filter(fn ($c) => $c->publicada)->count();
        $calGuardadas    = $calificaciones->count();
        $publicada       = $totalAlumnos > 0 && $calGuardadas === $totalAlumnos && $calPublicadas === $totalAlumnos;

        return response()->json([
            'rubros'         => $rubros,
            'calificaciones' => $resultado,
            'publicada'      => $publicada,
        ]);
    }

    /**
     * POST /api/calificaciones
     * Guardar/actualizar calificaciones con detalle por rubro.
     * Body: { grupo_id, materia_id, periodo_id, calificaciones: [{ alumnoId, valores: { rubroId: valor } }] }
     */
    public function upsert(Request $request): JsonResponse
    {
        $request->validate([
            'grupo_id'                         => ['required', 'integer'],
            'materia_id'                       => ['required', 'integer', 'exists:materias,id'],
            'periodo_id'                       => ['required', 'integer', 'exists:periodos_evaluacion,id'],
            'calificaciones'                   => ['required', 'array'],
            'calificaciones.*.alumnoId'        => ['required', 'integer', 'exists:alumnos,id'],
            'calificaciones.*.valores'         => ['required', 'array'],
            'calificaciones.*.valores.*'       => ['nullable', 'numeric', 'min:5', 'max:10'],
        ]);

        $periodo = PeriodoEvaluacion::findOrFail($request->integer('periodo_id'));

        if (! $periodo->captura_abierta) {
            return response()->json(['message' => 'La captura de calificaciones para este periodo está cerrada.'], 422);
        }

        $cicloId = CicloEscolar::where('activo', true)->value('id');

        if (! $cicloId) {
            return response()->json(['message' => 'No hay ciclo escolar activo.'], 422);
        }

        $autorizado = Clase::where('profesor_user_id', $request->user()->id)
            ->where('grupo_id', $request->integer('grupo_id'))
            ->where('materia_id', $request->integer('materia_id'))
            ->where('ciclo_escolar_id', $cicloId)
            ->exists();

        if (! $autorizado) {
            return response()->json(['message' => 'No estás asignado a esta materia en este grupo.'], 403);
        }

        // Cargar rubros para calcular promedio ponderado
        $rubros = RubroEvaluacion::where('profesor_user_id', $request->user()->id)
            ->where('materia_id', $request->integer('materia_id'))
            ->where('grupo_id', $request->integer('grupo_id'))
            ->where('ciclo_escolar_id', $cicloId)
            ->where('periodo_evaluacion_id', $request->integer('periodo_id'))
            ->get()
            ->keyBy('id');

        if ($rubros->isEmpty()) {
            return response()->json(['message' => 'Define los rubros de evaluación antes de registrar calificaciones.'], 422);
        }

        // Solo guardar calificaciones de alumnos con asignación activa en el ciclo
        $alumnoIdsActivos = Alumno::whereHas('asignaciones', function ($q) use ($request, $cicloId): void {
            $q->where('grupo_id', $request->integer('grupo_id'))
              ->where('ciclo_escolar_id', $cicloId)
              ->where('estado', 'activo');
        })->pluck('id')->flip();

        DB::transaction(function () use ($request, $cicloId, $rubros, $alumnoIdsActivos): void {
            foreach ($request->calificaciones as $cal) {
                if (! $alumnoIdsActivos->has($cal['alumnoId'])) {
                    continue;
                }

                $valores = $cal['valores'] ?? [];

                // Separar valores válidos (no nulos) de los pendientes
                $valoresValidos = [];
                foreach ($rubros as $rubroId => $rubro) {
                    $val = $valores[$rubroId] ?? null;
                    if ($val !== null && $val !== '') {
                        $valoresValidos[$rubroId] = floatval($val);
                    }
                }

                // Calcular promedio ponderado solo cuando TODOS los rubros tienen valor
                $promedio = null;
                if (count($valoresValidos) === count($rubros)) {
                    $suma = 0;
                    foreach ($rubros as $rubroId => $rubro) {
                        $suma += $valoresValidos[$rubroId] * ($rubro->ponderacion / 100);
                    }
                    $promedio = round($suma, 2);
                }

                // Si no hay ningún valor capturado, limpiar registro si existe y continuar
                if (empty($valoresValidos)) {
                    $existente = Calificacion::where([
                        'alumno_id'             => $cal['alumnoId'],
                        'materia_id'            => $request->integer('materia_id'),
                        'ciclo_escolar_id'      => $cicloId,
                        'periodo_evaluacion_id' => $request->integer('periodo_id'),
                    ])->first();
                    if ($existente) {
                        $existente->update(['promedio' => null]);
                        $existente->detalles()->delete();
                    }
                    continue;
                }

                $calificacion = Calificacion::updateOrCreate(
                    [
                        'alumno_id'             => $cal['alumnoId'],
                        'materia_id'            => $request->integer('materia_id'),
                        'ciclo_escolar_id'      => $cicloId,
                        'periodo_evaluacion_id' => $request->integer('periodo_id'),
                    ],
                    ['promedio' => $promedio, 'publicada' => false]
                );

                // Guardar rubros con valor; eliminar detalles de rubros borrados
                foreach ($rubros as $rubroId => $rubro) {
                    if (isset($valoresValidos[$rubroId])) {
                        CalificacionDetalle::updateOrCreate(
                            [
                                'calificacion_id' => $calificacion->id,
                                'rubro_id'        => $rubroId,
                            ],
                            ['valor' => $valoresValidos[$rubroId]]
                        );
                    } else {
                        CalificacionDetalle::where([
                            'calificacion_id' => $calificacion->id,
                            'rubro_id'        => $rubroId,
                        ])->delete();
                    }
                }
            }
        });

        return response()->json(['message' => 'Calificaciones guardadas correctamente.']);
    }

    /**
     * POST /api/calificaciones/publicar
     * Publica las calificaciones de un grupo/materia/periodo (las hace visibles al tutor).
     * Body: { grupo_id, materia_id, periodo_id }
     */
    public function publicar(Request $request): JsonResponse
    {
        $request->validate([
            'grupo_id'   => ['required', 'integer'],
            'materia_id' => ['required', 'integer', 'exists:materias,id'],
            'periodo_id' => ['required', 'integer', 'exists:periodos_evaluacion,id'],
        ]);

        $cicloId = CicloEscolar::where('activo', true)->value('id');

        if (! $cicloId) {
            return response()->json(['message' => 'No hay ciclo escolar activo.'], 422);
        }

        // Verificar que el profesor esté asignado a este grupo/materia
        $autorizado = Clase::where('profesor_user_id', $request->user()->id)
            ->where('grupo_id', $request->integer('grupo_id'))
            ->where('materia_id', $request->integer('materia_id'))
            ->where('ciclo_escolar_id', $cicloId)
            ->exists();

        if (! $autorizado) {
            return response()->json(['message' => 'No estás asignado a esta materia en este grupo.'], 403);
        }

        // Alumnos activos del grupo
        $alumnoIds = Alumno::whereHas('asignaciones', function ($q) use ($request, $cicloId) {
                $q->where('grupo_id', $request->integer('grupo_id'))
                  ->where('estado', 'activo')
                  ->where('ciclo_escolar_id', $cicloId);
            })
            ->pluck('id');

        if ($alumnoIds->isEmpty()) {
            return response()->json(['message' => 'No hay alumnos en este grupo.'], 422);
        }

        // Verificar que TODOS los alumnos tengan promedio calculado
        $conPromedio = Calificacion::whereIn('alumno_id', $alumnoIds)
            ->where('materia_id', $request->integer('materia_id'))
            ->where('ciclo_escolar_id', $cicloId)
            ->where('periodo_evaluacion_id', $request->integer('periodo_id'))
            ->whereNotNull('promedio')
            ->count();

        if ($conPromedio < $alumnoIds->count()) {
            return response()->json([
                'message' => 'Todos los alumnos deben tener calificaciones completas antes de publicar.',
            ], 422);
        }

        // Publicar
        Calificacion::whereIn('alumno_id', $alumnoIds)
            ->where('materia_id', $request->integer('materia_id'))
            ->where('ciclo_escolar_id', $cicloId)
            ->where('periodo_evaluacion_id', $request->integer('periodo_id'))
            ->update(['publicada' => true]);

        return response()->json(['message' => 'Calificaciones publicadas correctamente.']);
    }

    /**
     * GET /api/tutor/calificaciones/{alumno}
     * GET /api/trabajador-social/calificaciones/{alumno}
     * Calificaciones de un alumno con detalle por rubro (solo publicadas).
     * Acepta ciclo_id opcional; si no se pasa usa el ciclo activo.
     */
    public function forAlumno(Request $request, Alumno $alumno): JsonResponse
    {
        $cicloId = $request->filled('ciclo_id')
            ? $request->integer('ciclo_id')
            : CicloEscolar::where('activo', true)->value('id');

        $query = Calificacion::where('alumno_id', $alumno->id)
            ->where('publicada', true)
            ->with(['materia:id,nombre', 'periodoEvaluacion:id,nombre', 'detalles.rubro'])
            ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId));

        if ($request->filled('periodo_id')) {
            $query->where('periodo_evaluacion_id', $request->integer('periodo_id'));
        }

        $calificaciones = $query->get()->map(fn ($c) => [
            'id'        => $c->id,
            'alumnoId'  => $c->alumno_id,
            'materiaId' => $c->materia_id,
            'materia'   => $c->materia?->nombre,
            'clave'     => $c->materia ? strtoupper(mb_substr($c->materia->nombre, 0, 3)) : '',
            'periodoId' => $c->periodo_evaluacion_id,
            'periodo'   => $c->periodoEvaluacion?->nombre ?? '',
            'promedio'  => $c->promedio,
            'rubros'    => $c->detalles->map(fn ($d) => [
                'nombre'      => $d->rubro?->nombre ?? '',
                'ponderacion' => $d->rubro?->ponderacion ?? 0,
                'valor'       => $d->valor,
            ])->values(),
        ]);

        // Materias con captura iniciada pero no publicada (visibles solo como aviso)
        $enProcesoQuery = Calificacion::where('alumno_id', $alumno->id)
            ->where('publicada', false)
            ->with('materia:id,nombre')
            ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId));

        if ($request->filled('periodo_id')) {
            $enProcesoQuery->where('periodo_evaluacion_id', $request->integer('periodo_id'));
        }

        $materiasEnProceso = $enProcesoQuery->get()
            ->pluck('materia.nombre')
            ->filter()
            ->unique()
            ->values();

        return response()->json([
            'calificaciones'    => $calificaciones,
            'materiasEnProceso' => $materiasEnProceso,
        ]);
    }
}
