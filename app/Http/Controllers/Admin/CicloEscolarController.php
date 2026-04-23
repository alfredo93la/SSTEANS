<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CicloEscolar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CicloEscolarController extends Controller
{
    public function index(): JsonResponse
    {
        $ciclos = CicloEscolar::where('archivado', false)->orderByDesc('fecha_inicio')->get();

        return response()->json([
            'ciclos'       => $ciclos,
            'ciclo_activo' => $ciclos->firstWhere('activo', true),
        ]);
    }

    public function archivar(CicloEscolar $ciclo): JsonResponse
    {
        if (!$ciclo->cerrado) {
            return response()->json(['message' => 'Solo se pueden archivar ciclos cerrados.'], 422);
        }

        $ciclo->update(['archivado' => true]);

        return response()->json(['message' => 'Ciclo escolar archivado.']);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre'      => ['required', 'string', 'max:20', 'unique:ciclos_escolares,nombre'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin'   => ['required', 'date', 'after:fecha_inicio'],
        ]);

        $ciclo = CicloEscolar::create([
            ...$validated,
            'activo'  => false,
            'cerrado' => false,
        ]);

        return response()->json([
            'message' => 'Ciclo escolar creado correctamente.',
            'ciclo'   => $ciclo,
        ], 201);
    }

    public function update(Request $request, CicloEscolar $ciclo): JsonResponse
    {
        if ($ciclo->cerrado) {
            return response()->json(['message' => 'No se puede editar un ciclo cerrado.'], 422);
        }

        $validated = $request->validate([
            'nombre'      => ['required', 'string', 'max:20', "unique:ciclos_escolares,nombre,{$ciclo->id}"],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin'   => ['required', 'date', 'after:fecha_inicio'],
        ]);

        $ciclo->update($validated);

        return response()->json([
            'message' => 'Ciclo escolar actualizado.',
            'ciclo'   => $ciclo->fresh(),
        ]);
    }

    public function destroy(CicloEscolar $ciclo): JsonResponse
    {
        if ($ciclo->grupos()->exists()) {
            return response()->json(['message' => 'No se puede eliminar: el ciclo tiene grupos asignados.'], 422);
        }

        $ciclo->delete();

        return response()->json(['message' => 'Ciclo escolar eliminado.']);
    }

    public function activate(CicloEscolar $ciclo): JsonResponse
    {
        if ($ciclo->cerrado) {
            return response()->json(['message' => 'No se puede activar un ciclo cerrado.'], 422);
        }

        DB::transaction(function () use ($ciclo): void {
            CicloEscolar::where('activo', true)->update(['activo' => false]);
            $ciclo->update(['activo' => true]);
        });

        return response()->json([
            'message' => 'Ciclo escolar activado.',
            'ciclo'   => $ciclo->fresh(),
        ]);
    }

    public function verificarCierre(CicloEscolar $ciclo): JsonResponse
    {
        $periodosAbiertos = $ciclo->periodos()->where('captura_abierta', true)->count();
        $totalPeriodos    = $ciclo->periodos()->count();

        $checks = [
            [
                'label' => 'Períodos de evaluación con captura cerrada',
                'ok'    => $periodosAbiertos === 0,
                'detalle' => $periodosAbiertos > 0
                    ? "{$periodosAbiertos} período(s) aún con captura abierta"
                    : "{$totalPeriodos} período(s) cerrado(s)",
            ],
        ];

        return response()->json([
            'puede_cerrar' => collect($checks)->every('ok'),
            'checks'       => $checks,
        ]);
    }

    public function close(CicloEscolar $ciclo): JsonResponse
    {
        $periodosAbiertos = $ciclo->periodos()->where('captura_abierta', true)->count();

        if ($periodosAbiertos > 0) {
            return response()->json([
                'message' => "No se puede cerrar el ciclo: hay {$periodosAbiertos} período(s) de evaluación con captura abierta.",
            ], 422);
        }

        $ciclo->update(['activo' => false, 'cerrado' => true]);

        return response()->json([
            'message' => 'Ciclo escolar cerrado.',
            'ciclo'   => $ciclo->fresh(),
        ]);
    }
}
