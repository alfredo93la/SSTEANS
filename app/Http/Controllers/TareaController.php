<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\EmiteBadge;
use App\Models\Alumno;
use App\Models\AsignacionGrupo;
use App\Models\CicloEscolar;
use App\Models\Clase;
use App\Models\Tarea;
use App\Models\TareaEntrega;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TareaController extends Controller
{
    use EmiteBadge;

    /**
     * GET /api/tareas
     * Profesor: sus tareas. Tutor: tareas del grupo del alumno seleccionado.
     */
    public function index(Request $request): JsonResponse
    {
        $cicloId = CicloEscolar::where('activo', true)->value('id');
        $userId  = $request->user()->id;

        $query = Tarea::with(['materia:id,nombre', 'grupo:id,nombre,grado_id', 'grupo.grado:id,numero'])
            ->withCount([
                'entregas as total_alumnos',
                'entregas as entregadas_count' => fn ($q) => $q->whereIn('estado', ['Entregada', 'Tarde', 'No Entregada']),
            ])
            ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId));

        // Filtrar por grupos del profesor
        if ($request->filled('grupo_id')) {
            $query->where('grupo_id', $request->integer('grupo_id'));
        } else {
            // Por defecto: solo las tareas asignadas por este profesor
            $query->where('asignado_por', $userId);
        }

        $tareas = $query->latest()->get()->map(fn ($t) => $this->formatTarea($t));

        return response()->json(['tareas' => $tareas]);
    }

    /**
     * POST /api/tareas
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titulo'           => ['required', 'string', 'max:255'],
            'descripcion'      => ['nullable', 'string', 'max:1000'],
            'materia_id'       => ['required', 'integer', 'exists:materias,id'],
            'grupo_id'         => ['required', 'integer', 'exists:grupos,id'],
            'fecha_asignacion' => ['required', 'date'],
            'fecha_entrega'    => ['required', 'date', 'after:fecha_asignacion'],
            'archivos.*'       => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png,gif,webp', 'max:10240'],
        ]);

        $cicloId = CicloEscolar::where('activo', true)->value('id');
        if (! $cicloId) {
            return response()->json(['message' => 'No hay ciclo escolar activo.'], 422);
        }

        $autorizado = Clase::where('profesor_user_id', $request->user()->id)
            ->where('grupo_id', $validated['grupo_id'])
            ->where('materia_id', $validated['materia_id'])
            ->where('ciclo_escolar_id', $cicloId)
            ->exists();

        if (! $autorizado) {
            return response()->json(['message' => 'No estás asignado a esta materia en este grupo.'], 403);
        }

        $archivos = $this->subirArchivos($request);

        $tarea = DB::transaction(function () use ($validated, $request, $cicloId, $archivos): Tarea {
            $tarea = Tarea::create([
                ...$validated,
                'ciclo_escolar_id' => $cicloId,
                'asignado_por'     => $request->user()->id,
                'archivos'         => $archivos ?: null,
            ]);

            $alumnoIds = AsignacionGrupo::where('grupo_id', $validated['grupo_id'])
                ->where('ciclo_escolar_id', $cicloId)
                ->where('estado', 'activo')
                ->pluck('alumno_id');

            foreach ($alumnoIds as $alumnoId) {
                TareaEntrega::create([
                    'tarea_id'  => $tarea->id,
                    'alumno_id' => $alumnoId,
                    'estado'    => 'Pendiente',
                ]);
            }

            return $tarea;
        });

        $tarea->loadCount([
            'entregas as total_alumnos',
            'entregas as entregadas_count' => fn ($q) => $q->whereIn('estado', ['Entregada', 'Tarde', 'No Entregada']),
        ])->load(['materia:id,nombre', 'grupo:id,nombre,grado_id', 'grupo.grado:id,numero']);

        $this->emitirBadge('tareas', 'tareas.view');

        return response()->json([
            'message' => 'Tarea asignada correctamente.',
            'tarea'   => $this->formatTarea($tarea),
        ], 201);
    }

    /**
     * PUT /api/tareas/{tarea}
     */
    public function update(Request $request, Tarea $tarea): JsonResponse
    {
        $validated = $request->validate([
            'titulo'               => ['required', 'string', 'max:255'],
            'descripcion'          => ['nullable', 'string', 'max:1000'],
            'fecha_entrega'        => ['required', 'date'],
            'archivos.*'           => ['nullable', 'file', 'max:10240'],
            'archivosExistentes'   => ['nullable', 'array'],
            'archivosExistentes.*' => ['nullable', 'string'],
        ]);

        $existentes = $request->boolean('archivosExistentesSet')
            ? ($validated['archivosExistentes'] ?? [])
            : ($tarea->archivos ?? []);
        $nuevos   = $this->subirArchivos($request);
        $archivos = array_values(array_merge($existentes, $nuevos));

        $tarea->update([
            'titulo'        => $validated['titulo'],
            'descripcion'   => $validated['descripcion'] ?? null,
            'fecha_entrega' => $validated['fecha_entrega'],
            'archivos'      => $archivos ?: null,
        ]);

        $this->emitirBadge('tareas', 'tareas.view');

        return response()->json([
            'message' => 'Tarea actualizada.',
            'tarea'   => $this->formatTarea($tarea->fresh()->load(['materia:id,nombre', 'grupo:id,nombre'])),
        ]);
    }

    /**
     * DELETE /api/tareas/{tarea}
     */
    public function destroy(Tarea $tarea): JsonResponse
    {
        foreach ($tarea->archivos ?? [] as $path) {
            Storage::disk('public')->delete($path);
        }

        $tarea->delete();

        $this->emitirBadge('tareas', 'tareas.view');

        return response()->json(['message' => 'Tarea eliminada.']);
    }

    /**
     * GET /api/tareas/{tarea}/adjuntos/{archivo}
     */
    public function descargarAdjunto(Request $request, Tarea $tarea, string $archivo): mixed
    {
        $ruta = "tareas/{$archivo}";

        if (! in_array($ruta, $tarea->archivos ?? [], true) || ! Storage::disk('public')->exists($ruta)) {
            abort(404);
        }

        $path = Storage::disk('public')->path($ruta);

        return $request->boolean('download')
            ? response()->download($path)
            : response()->file($path);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private function subirArchivos(Request $request): array
    {
        $paths = [];

        if ($request->hasFile('archivos')) {
            foreach ($request->file('archivos') as $file) {
                $path = $file->store('tareas', 'public');
                if ($path) {
                    $paths[] = $path;
                }
            }
        }

        return $paths;
    }

    private function formatTarea(Tarea $t): array
    {
        $fechaStr = $t->fecha_entrega instanceof \Illuminate\Support\Carbon
            ? $t->fecha_entrega->format('d/m/Y')
            : \Illuminate\Support\Carbon::parse($t->fecha_entrega)->format('d/m/Y');

        return [
            'id'              => $t->id,
            'titulo'          => $t->titulo,
            'descripcion'     => $t->descripcion ?? '',
            'materiaId'       => $t->materia_id,
            'materia'         => $t->materia?->nombre,
            'grupoId'         => $t->grupo_id,
            'grupo'           => $t->grupo ? ($t->grupo->grado ? $t->grupo->grado->numero.'°'.$t->grupo->nombre : $t->grupo->nombre) : null,
            'fechaEntrega'    => $fechaStr,
            'entregadasCount' => (int) ($t->entregadas_count ?? 0),
            'totalAlumnos'    => (int) ($t->total_alumnos ?? 0),
            'archivos'        => $t->archivos ?? [],
        ];
    }

    /**
     * GET /api/tareas/{tarea}/entregas
     * Lista de alumnos con su estado de entrega para una tarea.
     */
    public function entregas(Tarea $tarea): JsonResponse
    {
        $entregas = $tarea->entregas()
            ->with('alumno:id,persona_id', 'alumno.persona:id,nombre,apellidos')
            ->get()
            ->map(fn ($e) => [
                'alumnoId'     => $e->alumno_id,
                'nombre'       => $e->alumno?->persona
                    ? trim("{$e->alumno->persona->apellidos}, {$e->alumno->persona->nombre}")
                    : "Alumno #{$e->alumno_id}",
                'estado'       => $e->estado,
                'fechaEntrega' => $e->fecha_entrega?->format('d/m/Y'),
            ])
            ->sortBy('nombre')
            ->values();

        return response()->json(['entregas' => $entregas]);
    }

    /**
     * PATCH /api/tareas/{tarea}/entregas/{alumno}
     * Actualiza el estado de entrega de un alumno.
     */
    public function updateEntrega(Request $request, Tarea $tarea, Alumno $alumno): JsonResponse
    {
        $validated = $request->validate([
            'estado'        => ['required', 'string', 'in:Pendiente,Entregada,Tarde,No Entregada'],
            'fecha_entrega' => ['nullable', 'date'],
        ]);

        $entrega = TareaEntrega::firstOrCreate(
            ['tarea_id' => $tarea->id, 'alumno_id' => $alumno->id],
            ['estado'   => 'Pendiente']
        );

        $fechaEntrega = null;
        if ($validated['estado'] !== 'Pendiente') {
            $fechaEntrega = isset($validated['fecha_entrega'])
                ? \Illuminate\Support\Carbon::parse($validated['fecha_entrega'])
                : now();
        }

        $entrega->update([
            'estado'        => $validated['estado'],
            'fecha_entrega' => $fechaEntrega,
        ]);

        return response()->json(['message' => 'Entrega actualizada.', 'estado' => $entrega->estado]);
    }

    /**
     * GET /api/tutor/tareas/{alumno}
     * Tareas y estado de entrega para un alumno (tutor).
     */
    public function forAlumno(Request $request, Alumno $alumno): JsonResponse
    {
        $cicloId = CicloEscolar::where('activo', true)->value('id');

        // Obtener grupo activo del alumno
        $grupoId = AsignacionGrupo::where('alumno_id', $alumno->id)
            ->where('estado', 'activo')
            ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId))
            ->value('grupo_id');

        if (! $grupoId) {
            return response()->json(['tareas' => []]);
        }

        $tareas = Tarea::where('grupo_id', $grupoId)
            ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId))
            ->with([
                'materia:id,nombre',
                'grupo:id,nombre',
                'entregas' => fn ($q) => $q->where('alumno_id', $alumno->id),
            ])
            ->latest()
            ->get()
            ->map(function ($t) use ($alumno) {
                $entrega   = $t->entregas->first();
                $fechaStr  = $t->fecha_entrega->format('d/m/Y');

                return [
                    'id'                  => $t->id,
                    'titulo'              => $t->titulo,
                    'descripcion'         => $t->descripcion ?? '',
                    'materiaId'           => $t->materia_id,
                    'materia'             => $t->materia?->nombre,
                    'grupoId'             => $t->grupo_id,
                    'fechaEntrega'        => $fechaStr,
                    'estadoEntrega'       => $entrega?->estado ?? 'Pendiente',
                    'fechaEntregaAlumno'  => $entrega?->fecha_entrega?->format('d/m/Y'),
                    'archivos'            => $t->archivos ?? [],
                    'entregas'            => [[
                        'alumnoId'     => $alumno->id,
                        'estado'       => $entrega?->estado ?? 'Pendiente',
                        'fechaEntrega' => $entrega?->fecha_entrega?->format('d/m/Y'),
                    ]],
                ];
            });

        return response()->json(['tareas' => $tareas]);
    }
}