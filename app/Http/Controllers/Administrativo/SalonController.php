<?php

namespace App\Http\Controllers\Administrativo;

use App\Http\Controllers\Controller;
use App\Models\Salon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SalonController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['salones' => Salon::orderBy('edificio')->orderBy('nombre')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre'    => ['required', 'string', 'max:50'],
            'edificio'  => ['nullable', 'string', 'max:50'],
            'capacidad' => ['required', 'integer', 'min:1', 'max:100'],
            'turno'     => ['required', Rule::in(['matutino', 'vespertino', 'ambos'])],
        ]);

        $salon = Salon::create($validated);

        return response()->json([
            'message' => 'Salón registrado.',
            'salon'   => $salon,
        ], 201);
    }

    public function update(Request $request, Salon $salon): JsonResponse
    {
        $validated = $request->validate([
            'nombre'    => ['required', 'string', 'max:50'],
            'edificio'  => ['nullable', 'string', 'max:50'],
            'capacidad' => ['required', 'integer', 'min:1', 'max:100'],
            'turno'     => ['required', Rule::in(['matutino', 'vespertino', 'ambos'])],
        ]);

        $salon->update($validated);

        return response()->json(['message' => 'Salón actualizado.', 'salon' => $salon->fresh()]);
    }

    public function destroy(Salon $salon): JsonResponse
    {
        if ($salon->clases()->exists()) {
            return response()->json(['message' => 'No se puede eliminar: el salón tiene clases asignadas.'], 422);
        }

        $salon->delete();

        return response()->json(['message' => 'Salón eliminado.']);
    }
}
