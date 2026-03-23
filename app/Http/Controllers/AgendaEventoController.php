<?php

namespace App\Http\Controllers;

use App\Models\AgendaEvento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgendaEventoController extends Controller
{
    public function index(): JsonResponse
    {
        $user = request()->user();
        $canManage = $user?->hasPermission('agenda.manage') ?? false;

        $query = AgendaEvento::query()
            ->with('destinatarios:id,agenda_evento_id,rol')
            ->orderBy('fecha')
            ->orderBy('hora_inicio');

        if (! $canManage && $user) {
            $query->whereHas('destinatarios', fn ($q) => $q->where('rol', $user->role));
        }

        $eventos = $query->get();

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
                'destinatarios' => $evento->destinatarios->pluck('rol')->values()->all(),
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
            'destinatarios' => ['required', 'array', 'min:1'],
            'destinatarios.*' => ['required', 'string', 'max:255'],
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

        $evento->destinatarios()->createMany(
            collect($validated['destinatarios'])
                ->unique()
                ->map(fn (string $rol) => ['rol' => $rol])
                ->all()
        );

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
                'destinatarios' => $evento->destinatarios()->pluck('rol')->values()->all(),
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
            'destinatarios' => ['required', 'array', 'min:1'],
            'destinatarios.*' => ['required', 'string', 'max:255'],
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

        $evento->destinatarios()->delete();
        $evento->destinatarios()->createMany(
            collect($validated['destinatarios'])
                ->unique()
                ->map(fn (string $rol) => ['rol' => $rol])
                ->all()
        );

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
