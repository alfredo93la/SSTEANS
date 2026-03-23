<?php

namespace App\Http\Controllers;

use App\Models\AgendaEvento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgendaEventoController extends Controller
{
    public function index(): JsonResponse
    {
        $eventos = AgendaEvento::query()
            ->orderBy('fecha')
            ->orderBy('hora_inicio')
            ->get();

        return response()->json([
            'eventos' => $eventos->map(fn (AgendaEvento $evento) => [
                'id' => $evento->id,
                'fecha' => $evento->fecha,
                'titulo' => $evento->titulo,
                'descripcion' => $evento->descripcion,
                'horaInicio' => $evento->hora_inicio,
                'horaFin' => $evento->hora_fin,
                'grupo' => $evento->grupo,
                'materia' => $evento->materia,
                'tipo' => $evento->tipo,
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fecha' => ['required', 'date'],
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'horaInicio' => ['nullable', 'date_format:H:i'],
            'horaFin' => ['nullable', 'date_format:H:i'],
            'grupo' => ['nullable', 'string', 'max:255'],
            'materia' => ['nullable', 'string', 'max:255'],
            'tipo' => ['required', 'string', 'max:255'],
        ]);

        $evento = AgendaEvento::query()->create([
            'fecha' => $validated['fecha'],
            'titulo' => $validated['titulo'],
            'descripcion' => $validated['descripcion'] ?? null,
            'hora_inicio' => $validated['horaInicio'] ?? null,
            'hora_fin' => $validated['horaFin'] ?? null,
            'grupo' => $validated['grupo'] ?? 'General',
            'materia' => $validated['materia'] ?? '-',
            'tipo' => $validated['tipo'],
        ]);

        return response()->json([
            'message' => 'Evento creado correctamente.',
            'evento' => [
                'id' => $evento->id,
                'fecha' => $evento->fecha,
                'titulo' => $evento->titulo,
                'descripcion' => $evento->descripcion,
                'horaInicio' => $evento->hora_inicio,
                'horaFin' => $evento->hora_fin,
                'grupo' => $evento->grupo,
                'materia' => $evento->materia,
                'tipo' => $evento->tipo,
            ],
        ], 201);
    }

    public function update(Request $request, AgendaEvento $evento): JsonResponse
    {
        $validated = $request->validate([
            'fecha' => ['required', 'date'],
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'horaInicio' => ['nullable', 'date_format:H:i'],
            'horaFin' => ['nullable', 'date_format:H:i'],
            'grupo' => ['nullable', 'string', 'max:255'],
            'materia' => ['nullable', 'string', 'max:255'],
            'tipo' => ['required', 'string', 'max:255'],
        ]);

        $evento->update([
            'fecha' => $validated['fecha'],
            'titulo' => $validated['titulo'],
            'descripcion' => $validated['descripcion'] ?? null,
            'hora_inicio' => $validated['horaInicio'] ?? null,
            'hora_fin' => $validated['horaFin'] ?? null,
            'grupo' => $validated['grupo'] ?? 'General',
            'materia' => $validated['materia'] ?? '-',
            'tipo' => $validated['tipo'],
        ]);

        return response()->json([
            'message' => 'Evento actualizado correctamente.',
        ]);
    }

    public function destroy(AgendaEvento $evento): JsonResponse
    {
        $evento->delete();

        return response()->json([
            'message' => 'Evento eliminado correctamente.',
        ]);
    }
}
