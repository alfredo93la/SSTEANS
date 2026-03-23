<?php

namespace App\Http\Controllers\Circulares;

use App\Http\Controllers\Controller;
use App\Http\Requests\Circulares\StoreCircularRequest;
use App\Http\Requests\Circulares\UpdateCircularRequest;
use App\Models\Circular;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

class CircularController extends Controller
{
    public function index(): JsonResponse
    {
        $circulares = Circular::query()
            ->with('destinatarios:id,circular_id,rol')
            ->latest('fecha_publicacion')
            ->latest('id')
            ->get()
            ->map(fn (Circular $circular) => $this->toPayload($circular));

        return response()->json([
            'message' => 'Circulares obtenidas correctamente.',
            'data' => $circulares,
        ]);
    }

    public function store(StoreCircularRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $circular = Circular::query()->create([
            'titulo' => $validated['titulo'],
            'descripcion' => $validated['descripcion'],
            'contenido' => $validated['contenido'],
            'categoria' => $validated['categoria'],
            'prioridad' => $validated['prioridad'],
            'fecha_publicacion' => $validated['fecha_publicacion'] ?? now()->toDateString(),
            'publicado_por' => $request->user()?->id,
        ]);

        $this->syncDestinatarios($circular, collect($validated['destinatarios']));

        return response()->json([
            'message' => 'Circular creada correctamente.',
            'data' => $this->toPayload($circular->fresh('destinatarios')),
        ], 201);
    }

    public function update(UpdateCircularRequest $request, Circular $circular): JsonResponse
    {
        $validated = $request->validated();

        $circular->update([
            'titulo' => $validated['titulo'],
            'descripcion' => $validated['descripcion'],
            'contenido' => $validated['contenido'],
            'categoria' => $validated['categoria'],
            'prioridad' => $validated['prioridad'],
            'fecha_publicacion' => $validated['fecha_publicacion'] ?? $circular->fecha_publicacion?->format('Y-m-d') ?? now()->toDateString(),
        ]);

        $this->syncDestinatarios($circular, collect($validated['destinatarios']));

        return response()->json([
            'message' => 'Circular actualizada correctamente.',
            'data' => $this->toPayload($circular->fresh('destinatarios')),
        ]);
    }

    public function destroy(Circular $circular): JsonResponse
    {
        $circular->delete();

        return response()->json([
            'message' => 'Circular eliminada correctamente.',
            'data' => null,
        ]);
    }

    private function syncDestinatarios(Circular $circular, Collection $destinatarios): void
    {
        $roles = $destinatarios
            ->filter(fn ($rol) => is_string($rol) && $rol !== '')
            ->unique()
            ->values();

        $circular->destinatarios()->delete();

        $circular->destinatarios()->createMany(
            $roles->map(fn (string $rol) => ['rol' => $rol])->all()
        );
    }

    private function toPayload(Circular $circular): array
    {
        return [
            'id' => $circular->id,
            'titulo' => $circular->titulo,
            'descripcion' => $circular->descripcion,
            'contenido' => $circular->contenido,
            'categoria' => $circular->categoria,
            'prioridad' => $circular->prioridad,
            'fecha_publicacion' => $circular->fecha_publicacion,
            'publicado_por' => $circular->publicado_por,
            'destinatarios' => $circular->destinatarios->pluck('rol')->values(),
            'created_at' => optional($circular->created_at)?->toISOString(),
            'updated_at' => optional($circular->updated_at)?->toISOString(),
        ];
    }
}
