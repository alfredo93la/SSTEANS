<?php

namespace App\Http\Controllers\Profesor;

use App\Http\Controllers\Controller;
use App\Models\CicloEscolar;
use App\Models\Clase;
use App\Models\RubroEvaluacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RubroEvaluacionController extends Controller
{
    /**
     * GET /api/profesor/rubros
     * Devuelve los rubros del profesor para una materia+grupo del ciclo activo.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'materia_id' => ['required', 'integer', 'exists:materias,id'],
            'grupo_id'   => ['required', 'integer', 'exists:grupos,id'],
            'periodo_id' => ['required', 'integer', 'exists:periodos_evaluacion,id'],
        ]);

        $cicloId = CicloEscolar::where('activo', true)->value('id');

        $rubros = RubroEvaluacion::where('profesor_user_id', $request->user()->id)
            ->where('materia_id', $request->integer('materia_id'))
            ->where('grupo_id', $request->integer('grupo_id'))
            ->where('ciclo_escolar_id', $cicloId)
            ->where('periodo_evaluacion_id', $request->integer('periodo_id'))
            ->orderBy('orden')
            ->get(['id', 'nombre', 'ponderacion', 'orden']);

        return response()->json(['rubros' => $rubros]);
    }

    /**
     * POST /api/profesor/rubros
     * Reemplaza (sync) los rubros del profesor para una materia+grupo.
     * Body: { materia_id, grupo_id, rubros: [{ nombre, ponderacion }] }
     */
    public function sync(Request $request): JsonResponse
    {
        $request->validate([
            'materia_id'           => ['required', 'integer', 'exists:materias,id'],
            'grupo_id'             => ['required', 'integer', 'exists:grupos,id'],
            'periodo_id'           => ['required', 'integer', 'exists:periodos_evaluacion,id'],
            'rubros'               => ['required', 'array', 'min:1'],
            'rubros.*.nombre'      => ['required', 'string', 'max:100'],
            'rubros.*.ponderacion' => ['required', 'numeric', 'min:1', 'max:100'],
        ]);

        $cicloId   = CicloEscolar::where('activo', true)->value('id');
        $materiaId = $request->integer('materia_id');
        $grupoId   = $request->integer('grupo_id');
        $periodoId = $request->integer('periodo_id');

        $autorizado = Clase::where('profesor_user_id', $request->user()->id)
            ->where('grupo_id', $grupoId)
            ->where('materia_id', $materiaId)
            ->where('ciclo_escolar_id', $cicloId)
            ->exists();

        if (! $autorizado) {
            return response()->json(['message' => 'No estás asignado a esta materia en este grupo.'], 403);
        }

        $suma = collect($request->input('rubros'))->sum('ponderacion');
        if (abs($suma - 100) > 0.01) {
            return response()->json([
                'message' => "La suma de ponderaciones debe ser 100%. Suma actual: {$suma}%",
            ], 422);
        }

        DB::transaction(function () use ($request, $cicloId, $materiaId, $grupoId, $periodoId): void {
            RubroEvaluacion::where('profesor_user_id', $request->user()->id)
                ->where('materia_id', $materiaId)
                ->where('grupo_id', $grupoId)
                ->where('ciclo_escolar_id', $cicloId)
                ->where('periodo_evaluacion_id', $periodoId)
                ->delete();

            foreach ($request->input('rubros') as $orden => $rubro) {
                RubroEvaluacion::create([
                    'profesor_user_id'      => $request->user()->id,
                    'materia_id'            => $materiaId,
                    'grupo_id'              => $grupoId,
                    'ciclo_escolar_id'      => $cicloId,
                    'periodo_evaluacion_id' => $periodoId,
                    'nombre'                => trim($rubro['nombre']),
                    'ponderacion'           => (float) $rubro['ponderacion'],
                    'orden'                 => $orden,
                ]);
            }
        });

        $rubros = RubroEvaluacion::where('profesor_user_id', $request->user()->id)
            ->where('materia_id', $materiaId)
            ->where('grupo_id', $grupoId)
            ->where('ciclo_escolar_id', $cicloId)
            ->where('periodo_evaluacion_id', $periodoId)
            ->orderBy('orden')
            ->get(['id', 'nombre', 'ponderacion', 'orden']);

        return response()->json([
            'message' => 'Rubros guardados correctamente.',
            'rubros'  => $rubros,
        ]);
    }
}
