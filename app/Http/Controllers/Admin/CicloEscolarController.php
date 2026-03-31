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
        $ciclos = CicloEscolar::orderByDesc('fecha_inicio')->get();

        return response()->json([
            'ciclos'       => $ciclos,
            'ciclo_activo' => $ciclos->firstWhere('activo', true),
        ]);
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

    public function close(CicloEscolar $ciclo): JsonResponse
    {
        $ciclo->update(['activo' => false, 'cerrado' => true]);

        return response()->json([
            'message' => 'Ciclo escolar cerrado.',
            'ciclo'   => $ciclo->fresh(),
        ]);
    }
}
