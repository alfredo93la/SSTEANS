<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Grado;
use App\Models\Materia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MateriaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Materia::with('grado:id,numero,descripcion');

        if ($request->filled('grado_id')) {
            $query->where('grado_id', $request->integer('grado_id'));
        }

        $materias = $query->orderBy('grado_id')->orderBy('nombre')->get();
        $grados   = Grado::orderBy('numero')->get(['id', 'numero', 'descripcion']);

        return response()->json([
            'materias' => $materias,
            'grados'   => $grados,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'grado_id'        => ['required', 'exists:grados,id'],
            'nombre'          => ['required', 'string', 'max:255'],
            'descripcion'     => ['nullable', 'string', 'max:500'],
            'horas_semanales' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        $materia = Materia::create($validated);

        return response()->json([
            'message'  => 'Materia creada correctamente.',
            'materia'  => $materia->load('grado:id,numero,descripcion'),
        ], 201);
    }

    public function update(Request $request, Materia $materia): JsonResponse
    {
        $validated = $request->validate([
            'grado_id'        => ['required', 'exists:grados,id'],
            'nombre'          => ['required', 'string', 'max:255'],
            'descripcion'     => ['nullable', 'string', 'max:500'],
            'horas_semanales' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        $materia->update($validated);

        return response()->json([
            'message' => 'Materia actualizada.',
            'materia' => $materia->fresh()->load('grado:id,numero,descripcion'),
        ]);
    }

    public function destroy(Materia $materia): JsonResponse
    {
        if ($materia->clases()->exists()) {
            return response()->json(['message' => 'No se puede eliminar: la materia tiene clases asignadas.'], 422);
        }

        $materia->delete();

        return response()->json(['message' => 'Materia eliminada.']);
    }
}
