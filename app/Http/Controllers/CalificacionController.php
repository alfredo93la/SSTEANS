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
                    $detallesPorRubro[$detalle->rubro_id] = $detalle->valor ?? 0;
                }
            }

            $valores = $rubros->mapWithKeys(fn ($r) => [
                $r->id => $detallesPorRubro[$r->id] ?? 0,
            ]);

            return [
                'alumnoId' => $alumno->id,
                'nombre'   => trim(($alumno->persona?->nombre ?? '').' '.($alumno->persona?->apellidos ?? '')),
                'promedio' => $cal?->promedio ?? 0,
                'valores'  => $valores, // { rubroId: valor }
            ];
        })->sortBy('nombre')->values();

        return response()->json([
            'rubros'         => $rubros,
            'calificaciones' => $resultado,
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

        DB::transaction(function () use ($request, $cicloId, $rubros): void {
            foreach ($request->calificaciones as $cal) {
                $valores = $cal['valores'] ?? [];

                // Calcular promedio ponderado: Σ(valor × ponderacion/100)
                $promedio = 0;
                foreach ($rubros as $rubroId => $rubro) {
                    $valor     = floatval($valores[$rubroId] ?? 0);
                    $promedio += $valor * ($rubro->ponderacion / 100);
                }
                $promedio = round($promedio, 2);

                $calificacion = Calificacion::updateOrCreate(
                    [
                        'alumno_id'             => $cal['alumnoId'],
                        'materia_id'            => $request->integer('materia_id'),
                        'ciclo_escolar_id'      => $cicloId,
                        'periodo_evaluacion_id' => $request->integer('periodo_id'),
                    ],
                    ['promedio' => $promedio]
                );

                // Upsert de cada detalle por rubro
                foreach ($rubros as $rubroId => $rubro) {
                    CalificacionDetalle::updateOrCreate(
                        [
                            'calificacion_id' => $calificacion->id,
                            'rubro_id'        => $rubroId,
                        ],
                        ['valor' => floatval($valores[$rubroId] ?? 0)]
                    );
                }
            }
        });

        return response()->json(['message' => 'Calificaciones guardadas correctamente.']);
    }

    /**
     * GET /api/tutor/calificaciones/{alumno}
     * Calificaciones de un alumno con detalle por rubro.
     */
    public function forAlumno(Request $request, Alumno $alumno): JsonResponse
    {
        $cicloId = CicloEscolar::where('activo', true)->value('id');

        $query = Calificacion::where('alumno_id', $alumno->id)
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
            'promedio'  => $c->promedio ?? 0,
            'rubros'    => $c->detalles->map(fn ($d) => [
                'nombre'      => $d->rubro?->nombre ?? '',
                'ponderacion' => $d->rubro?->ponderacion ?? 0,
                'valor'       => $d->valor ?? 0,
            ])->values(),
        ]);

        return response()->json(['calificaciones' => $calificaciones]);
    }
}
