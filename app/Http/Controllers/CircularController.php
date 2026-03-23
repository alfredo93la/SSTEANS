<?php

namespace App\Http\Controllers;

use App\Models\Circular;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CircularController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $canManage = $user?->hasPermission('circulares.manage') ?? false;

        $query = Circular::query()
            ->with(['destinatarios:id,circular_id,rol', 'autor:id,name'])
            ->orderByDesc('created_at');

        if (! $canManage && $user) {
            $query->whereHas('destinatarios', fn ($q) => $q->where('rol', $user->role));
        }

        $circulares = $query->get();

        return response()->json([
            'circulares' => $circulares->map(function (Circular $circular) {
                return [
                    'id' => $circular->id,
                    'titulo' => $circular->titulo,
                    'descripcion' => $circular->descripcion,
                    'contenido' => $circular->contenido,
                    'fechaPublicacion' => $circular->created_at?->format('d/m/Y'),
                    'prioridad' => $circular->prioridad,
                    'categoria' => $circular->categoria,
                    'destinatarios' => $circular->destinatarios->pluck('rol')->values()->all(),
                    'adjuntos' => [],
                    'publicadoPor' => $circular->publicado_por,
                    'leida' => true,
                ];
            }),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string', 'max:500'],
            'contenido' => ['required', 'string'],
            'categoria' => ['required', 'string', 'max:255'],
            'prioridad' => ['required', 'string', 'max:255'],
            'destinatarios' => ['required', 'array', 'min:1'],
            'destinatarios.*' => ['required', 'string', 'max:255'],
        ]);

        $circular = Circular::query()->create([
            'titulo' => $validated['titulo'],
            'descripcion' => $validated['descripcion'],
            'contenido' => $validated['contenido'],
            'categoria' => $validated['categoria'],
            'prioridad' => $validated['prioridad'],
            'publicado_por' => $request->user()?->id,
        ]);

        $circular->destinatarios()->createMany(
            collect($validated['destinatarios'])
                ->unique()
                ->map(fn (string $rol) => ['rol' => $rol])
                ->all()
        );

        return response()->json([
            'message' => 'Circular creada correctamente.',
        ], 201);
    }

    public function update(Request $request, Circular $circular): JsonResponse
    {
        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string', 'max:500'],
            'contenido' => ['required', 'string'],
            'categoria' => ['required', 'string', 'max:255'],
            'prioridad' => ['required', 'string', 'max:255'],
            'destinatarios' => ['required', 'array', 'min:1'],
            'destinatarios.*' => ['required', 'string', 'max:255'],
        ]);

        $circular->update([
            'titulo' => $validated['titulo'],
            'descripcion' => $validated['descripcion'],
            'contenido' => $validated['contenido'],
            'categoria' => $validated['categoria'],
            'prioridad' => $validated['prioridad'],
        ]);

        $circular->destinatarios()->delete();
        $circular->destinatarios()->createMany(
            collect($validated['destinatarios'])
                ->unique()
                ->map(fn (string $rol) => ['rol' => $rol])
                ->all()
        );

        return response()->json([
            'message' => 'Circular actualizada correctamente.',
        ]);
    }

    public function destroy(Circular $circular): JsonResponse
    {
        $circular->delete();

        return response()->json([
            'message' => 'Circular eliminada correctamente.',
        ]);
    }
}
