<?php

namespace App\Http\Controllers\Agenda;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agenda\StoreEventoRequest;
use App\Http\Requests\Agenda\UpdateEventoRequest;
use App\Models\Evento;
use Illuminate\Http\JsonResponse;

class EventoController extends Controller
{
    public function index(): JsonResponse
    {
        $eventos = Evento::query()
            ->orderBy('fecha')
            ->orderBy('hora_inicio')
            ->get()
            ->map(fn (Evento $evento) => $this->toPayload($evento));

        return response()->json([
            'message' => 'Eventos obtenidos correctamente.',
            'data' => $eventos,
        ]);
    }

    public function store(StoreEventoRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $payload['created_by'] = $request->user()?->id;
        $payload['updated_by'] = $request->user()?->id;
        $payload['grupo'] = $payload['grupo'] ?? 'General';
        $payload['materia'] = $payload['materia'] ?? '-';

        $evento = Evento::query()->create($payload);

        return response()->json([
            'message' => 'Evento creado correctamente.',
            'data' => $this->toPayload($evento->fresh()),
        ], 201);
    }

    public function update(UpdateEventoRequest $request, Evento $evento): JsonResponse
    {
        $payload = $request->validated();
        $payload['updated_by'] = $request->user()?->id;
        $payload['grupo'] = $payload['grupo'] ?? 'General';
        $payload['materia'] = $payload['materia'] ?? '-';

        $evento->update($payload);

        return response()->json([
            'message' => 'Evento actualizado correctamente.',
            'data' => $this->toPayload($evento->fresh()),
        ]);
    }

    public function destroy(Evento $evento): JsonResponse
    {
        $evento->delete();

        return response()->json([
            'message' => 'Evento eliminado correctamente.',
            'data' => null,
        ]);
    }

    private function toPayload(Evento $evento): array
    {
        return [
            'id' => $evento->id,
            'titulo' => $evento->titulo,
            'descripcion' => $evento->descripcion,
            'fecha' => $evento->fecha,
            'hora_inicio' => $evento->hora_inicio,
            'hora_fin' => $evento->hora_fin,
            'tipo' => $evento->tipo,
            'grupo' => $evento->grupo,
            'materia' => $evento->materia,
            'created_at' => optional($evento->created_at)?->toISOString(),
            'updated_at' => optional($evento->updated_at)?->toISOString(),
        ];
    }
}
