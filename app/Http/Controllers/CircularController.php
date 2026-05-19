<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\EmiteBadge;
use App\Models\AgendaEvento;
use App\Models\Circular;
use App\Models\CircularLectura;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CircularController extends Controller
{
    use EmiteBadge;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $canManage = $user?->hasPermission('circulares.manage') ?? false;

        $query = Circular::query()
            ->with(['destinatarios:id,circular_id,rol', 'autor:id,name', 'evento'])
            ->orderByDesc('created_at');

        if (! $canManage && $user) {
            $query->whereHas('destinatarios', fn ($q) => $q->where('rol', $user->role));
        }

        $circulares = $query->get();

        $leidasIds = $user
            ? CircularLectura::where('user_id', $user->id)
                ->whereIn('circular_id', $circulares->pluck('id'))
                ->pluck('circular_id')
                ->flip()
            : collect();

        return response()->json([
            'circulares' => $circulares->map(function (Circular $circular) use ($leidasIds, $canManage) {
                return [
                    'id'                => $circular->id,
                    'titulo'            => $circular->titulo,
                    'descripcion'       => $circular->descripcion,
                    'fechaPublicacion'  => $circular->created_at?->format('d/m/Y'),
                    'prioridad'         => $circular->prioridad,
                    'categoria'         => $circular->categoria,
                    'destinatarios'     => $circular->destinatarios->pluck('rol')->values()->all(),
                    'adjuntos'          => $circular->adjuntos ?? [],
                    'publicadoPor'      => $circular->publicado_por,
                    'publicadoPorNombre'=> $circular->autor?->name ?? 'Personal Administrativo',
                    'leida'             => $canManage || $leidasIds->has($circular->id),
                    'evento'            => $circular->evento ? [
                        'id'         => $circular->evento->id,
                        'fecha'      => $circular->evento->fecha,
                        'fechaFin'   => $circular->evento->fecha_fin,
                        'horaInicio' => $circular->evento->hora_inicio,
                        'horaFin'    => $circular->evento->hora_fin,
                        'tipo'       => $circular->evento->tipo,
                    ] : null,
                ];
            }),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titulo'          => ['required', 'string', 'max:255'],
            'descripcion'     => ['required', 'string'],
            'categoria'       => ['required', 'string', 'max:255'],
            'prioridad'       => ['required', 'string', 'max:255'],
            'destinatarios'   => ['required', 'array', 'min:1'],
            'destinatarios.*' => ['required', 'string', 'max:255'],
            'archivos.*'      => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png,gif,webp', 'max:10240'],
            'eventoFecha'     => ['nullable', 'date'],
            'eventoFechaFin'  => ['nullable', 'date', 'after_or_equal:eventoFecha'],
            'eventoHoraInicio'=> ['nullable', 'date_format:H:i'],
            'eventoHoraFin'   => ['nullable', 'date_format:H:i'],
            'eventoTipo'      => ['nullable', 'string', 'max:255'],
        ]);

        $adjuntos = $this->subirArchivos($request);

        $circular = Circular::query()->create([
            'titulo'        => $validated['titulo'],
            'descripcion'   => $validated['descripcion'],
            'categoria'     => $validated['categoria'],
            'prioridad'     => $validated['prioridad'],
            'publicado_por' => $request->user()?->id,
            'adjuntos'      => $adjuntos,
        ]);

        $circular->destinatarios()->createMany(
            collect($validated['destinatarios'])
                ->unique()
                ->map(fn (string $rol) => ['rol' => $rol])
                ->all()
        );

        if (! empty($validated['eventoFecha']) && ! empty($validated['eventoTipo'])) {
            $this->sincronizarEvento($circular, $validated);
            $this->emitirBadge('agenda', 'agenda.view');
        }

        $this->emitirBadge('circulares', 'circulares.view');

        return response()->json(['message' => 'Circular creada correctamente.'], 201);
    }

    public function update(Request $request, Circular $circular): JsonResponse
    {
        $validated = $request->validate([
            'titulo'               => ['required', 'string', 'max:255'],
            'descripcion'          => ['required', 'string'],
            'categoria'            => ['required', 'string', 'max:255'],
            'prioridad'            => ['required', 'string', 'max:255'],
            'destinatarios'        => ['required', 'array', 'min:1'],
            'destinatarios.*'      => ['required', 'string', 'max:255'],
            'archivos.*'           => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'adjuntosExistentes'   => ['nullable', 'array'],
            'adjuntosExistentes.*' => ['nullable', 'string'],
            'eventoFecha'          => ['nullable', 'date'],
            'eventoFechaFin'       => ['nullable', 'date', 'after_or_equal:eventoFecha'],
            'eventoHoraInicio'     => ['nullable', 'date_format:H:i'],
            'eventoHoraFin'        => ['nullable', 'date_format:H:i'],
            'eventoTipo'           => ['nullable', 'string', 'max:255'],
        ]);

        $existentes = $request->boolean('adjuntosExistentesSet')
            ? ($validated['adjuntosExistentes'] ?? [])
            : ($circular->adjuntos ?? []);
        $nuevos = $this->subirArchivos($request);
        $adjuntos = array_values(array_merge($existentes, $nuevos));

        $circular->update([
            'titulo'      => $validated['titulo'],
            'descripcion' => $validated['descripcion'],
            'categoria'   => $validated['categoria'],
            'prioridad'   => $validated['prioridad'],
            'adjuntos'    => $adjuntos,
        ]);

        $circular->destinatarios()->delete();
        $circular->destinatarios()->createMany(
            collect($validated['destinatarios'])
                ->unique()
                ->map(fn (string $rol) => ['rol' => $rol])
                ->all()
        );

        if (! empty($validated['eventoFecha']) && ! empty($validated['eventoTipo'])) {
            $this->sincronizarEvento($circular, $validated);
            $this->emitirBadge('agenda', 'agenda.view');
        } else {
            // Si se quitó el vínculo, eliminar el evento asociado
            $circular->evento()->delete();
        }

        $this->emitirBadge('circulares', 'circulares.view');

        return response()->json(['message' => 'Circular actualizada correctamente.']);
    }

    public function destroy(Circular $circular): JsonResponse
    {
        foreach ($circular->adjuntos ?? [] as $path) {
            Storage::disk('public')->delete($path);
        }

        // El evento se elimina en cascada por la FK cascadeOnDelete
        $circular->delete();

        return response()->json(['message' => 'Circular eliminada correctamente.']);
    }

    public function marcarLeida(Request $request, Circular $circular): JsonResponse
    {
        $userId = $request->user()->id;

        CircularLectura::firstOrCreate([
            'circular_id' => $circular->id,
            'user_id'     => $userId,
        ], [
            'leida_at' => now(),
        ]);

        return response()->json(['message' => 'Circular marcada como leída.']);
    }

    public function descargarAdjunto(Request $request, Circular $circular, string $archivo): mixed
    {
        $ruta = "circulares/{$archivo}";

        if (! in_array($ruta, $circular->adjuntos ?? [], true) || ! Storage::disk('public')->exists($ruta)) {
            abort(404);
        }

        $path = Storage::disk('public')->path($ruta);

        return $request->boolean('download')
            ? response()->download($path)
            : response()->file($path);
    }

    private function sincronizarEvento(Circular $circular, array $validated): void
    {
        $datos = [
            'fecha'       => $validated['eventoFecha'],
            'fecha_fin'   => $validated['eventoFechaFin'] ?? null,
            'titulo'      => $circular->titulo,
            'descripcion' => $circular->descripcion,
            'hora_inicio' => $validated['eventoHoraInicio'] ?? null,
            'hora_fin'    => $validated['eventoHoraFin'] ?? null,
            'tipo'        => $validated['eventoTipo'],
            'grupo'       => 'General',
            'materia'     => '-',
        ];

        $evento = $circular->evento;

        if ($evento) {
            $evento->update($datos);
            $evento->destinatarios()->delete();
        } else {
            $evento = AgendaEvento::query()->create(array_merge($datos, ['circular_id' => $circular->id]));
        }

        $evento->destinatarios()->createMany(
            $circular->destinatarios()
                ->pluck('rol')
                ->unique()
                ->map(fn (string $rol) => ['rol' => $rol])
                ->all()
        );
    }

    private function subirArchivos(Request $request): array
    {
        $paths = [];

        if ($request->hasFile('archivos')) {
            foreach ($request->file('archivos') as $file) {
                $path = $file->store('circulares', 'public');
                if ($path) {
                    $paths[] = $path;
                }
            }
        }

        return $paths;
    }
}
