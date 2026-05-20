<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\EmiteBadge;
use App\Models\AgendaEvento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgendaEventoController extends Controller
{
    use EmiteBadge;

    private const TIPOS_EXAMEN = ['Parcial', 'Final', 'Extraordinario', 'Examen'];

    public function index(): JsonResponse
    {
        $user = request()->user();
        $canManage = $user?->hasPermission('agenda.manage') ?? false;

        $TIPOS_EXAMEN = self::TIPOS_EXAMEN;

        $query = AgendaEvento::query()
            ->with(['destinatarios:id,agenda_evento_id,rol', 'grupo.grado:id,numero', 'materia:id,nombre'])
            ->orderBy('fecha')
            ->orderBy('hora_inicio');

        if ($user?->role !== 'Tutor' && $user?->role !== 'Profesor') {
            $query->whereNotIn('tipo', $TIPOS_EXAMEN);
        }

        if (! $canManage && $user) {
            $query->whereHas('destinatarios', fn ($q) => $q->where('rol', $user->role));

            if ($user->role === 'Profesor') {
                $query->where(function ($q) use ($user, $TIPOS_EXAMEN) {
                    $q->whereNotIn('tipo', $TIPOS_EXAMEN)
                        ->orWhere('creado_por_id', $user->id);
                });
            }

            if ($user->role === 'Tutor') {
                /** @var \App\Models\User $user */
                $alumnoId    = request()->integer('alumno_id') ?: null;
                $gruposHijos = $alumnoId
                    ? $this->getGrupoDeAlumno($alumnoId)
                    : $this->getGruposDelTutor($user);
                $query->where(function ($q) use ($gruposHijos, $TIPOS_EXAMEN) {
                    $q->where(function ($inner) use ($gruposHijos, $TIPOS_EXAMEN) {
                        $inner->whereIn('tipo', $TIPOS_EXAMEN)
                            ->whereIn('grupo_id', $gruposHijos);
                    })->orWhere(function ($inner) use ($TIPOS_EXAMEN) {
                        $inner->whereNotIn('tipo', $TIPOS_EXAMEN)
                            ->whereNull('grupo_id');
                    });
                });
            }
        }

        $eventos = $query->get();

        return response()->json([
            'eventos' => $eventos->map(fn (AgendaEvento $evento) => $this->formatEvento($evento)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fecha'          => ['required', 'date'],
            'fechaFin'       => ['nullable', 'date', 'after_or_equal:fecha'],
            'titulo'         => ['required', 'string', 'max:255'],
            'descripcion'    => ['nullable', 'string'],
            'horaInicio'     => ['nullable', 'date_format:H:i'],
            'horaFin'        => ['nullable', 'date_format:H:i'],
            'grupoId'        => ['nullable', 'integer', 'exists:grupos,id'],
            'materiaId'      => ['nullable', 'integer', 'exists:materias,id'],
            'tipo'           => ['required', 'string', 'max:255'],
            'destinatarios'  => ['required', 'array', 'min:1'],
            'destinatarios.*' => ['required', 'string', 'max:255'],
        ]);

        $evento = AgendaEvento::query()->create([
            'fecha'        => $validated['fecha'],
            'fecha_fin'    => $validated['fechaFin'] ?? null,
            'titulo'       => $validated['titulo'],
            'descripcion'  => $validated['descripcion'] ?? null,
            'hora_inicio'  => $validated['horaInicio'] ?? null,
            'hora_fin'     => $validated['horaFin'] ?? null,
            'grupo_id'     => $validated['grupoId'] ?? null,
            'materia_id'   => $validated['materiaId'] ?? null,
            'tipo'         => $validated['tipo'],
            'creado_por_id' => $request->user()?->id,
        ]);

        $evento->destinatarios()->createMany(
            collect($validated['destinatarios'])
                ->unique()
                ->map(fn (string $rol) => ['rol' => $rol])
                ->all()
        );

        $excludeRoles = in_array($evento->tipo, self::TIPOS_EXAMEN) ? ['Profesor'] : [];
        $this->emitirBadge('agenda', 'agenda.view', null, $excludeRoles);

        $evento->load(['grupo.grado:id,numero', 'materia:id,nombre', 'destinatarios:id,agenda_evento_id,rol']);

        return response()->json([
            'message' => 'Evento creado correctamente.',
            'evento'  => $this->formatEvento($evento),
        ], 201);
    }

    public function update(Request $request, AgendaEvento $evento): JsonResponse
    {
        $validated = $request->validate([
            'fecha'          => ['required', 'date'],
            'fechaFin'       => ['nullable', 'date', 'after_or_equal:fecha'],
            'titulo'         => ['required', 'string', 'max:255'],
            'descripcion'    => ['nullable', 'string'],
            'horaInicio'     => ['nullable', 'date_format:H:i'],
            'horaFin'        => ['nullable', 'date_format:H:i'],
            'grupoId'        => ['nullable', 'integer', 'exists:grupos,id'],
            'materiaId'      => ['nullable', 'integer', 'exists:materias,id'],
            'tipo'           => ['required', 'string', 'max:255'],
            'destinatarios'  => ['required', 'array', 'min:1'],
            'destinatarios.*' => ['required', 'string', 'max:255'],
        ]);

        $evento->update([
            'fecha'       => $validated['fecha'],
            'fecha_fin'   => $validated['fechaFin'] ?? null,
            'titulo'      => $validated['titulo'],
            'descripcion' => $validated['descripcion'] ?? null,
            'hora_inicio' => $validated['horaInicio'] ?? null,
            'hora_fin'    => $validated['horaFin'] ?? null,
            'grupo_id'    => $validated['grupoId'] ?? null,
            'materia_id'  => $validated['materiaId'] ?? null,
            'tipo'        => $validated['tipo'],
        ]);

        $evento->destinatarios()->delete();
        $evento->destinatarios()->createMany(
            collect($validated['destinatarios'])
                ->unique()
                ->map(fn (string $rol) => ['rol' => $rol])
                ->all()
        );

        $excludeRoles = in_array($validated['tipo'], self::TIPOS_EXAMEN) ? ['Profesor'] : [];
        $this->emitirBadge('agenda', 'agenda.view', null, $excludeRoles);

        return response()->json(['message' => 'Evento actualizado correctamente.']);
    }

    public function destroy(AgendaEvento $evento): JsonResponse
    {
        $tipo = $evento->tipo;
        $evento->delete();

        $excludeRoles = in_array($tipo, self::TIPOS_EXAMEN) ? ['Profesor'] : [];
        $this->emitirBadge('agenda', 'agenda.view', null, $excludeRoles);

        return response()->json(['message' => 'Evento eliminado correctamente.']);
    }

    private function formatEvento(AgendaEvento $evento): array
    {
        $grupoNombre = null;
        if ($evento->grupo) {
            $grupoNombre = $evento->grupo->grado
                ? $evento->grupo->grado->numero.'°'.$evento->grupo->nombre
                : $evento->grupo->nombre;
        }

        return [
            'id'            => $evento->id,
            'fecha'         => $evento->fecha,
            'fechaFin'      => $evento->fecha_fin,
            'titulo'        => $evento->titulo,
            'descripcion'   => $evento->descripcion,
            'horaInicio'    => $evento->hora_inicio ? substr($evento->hora_inicio, 0, 5) : null,
            'horaFin'       => $evento->hora_fin    ? substr($evento->hora_fin,    0, 5) : null,
            'grupoId'       => $evento->grupo_id,
            'grupoNombre'   => $grupoNombre,
            'materiaId'     => $evento->materia_id,
            'materiaNombre' => $evento->materia?->nombre,
            'tipo'          => $evento->tipo,
            'destinatarios' => $evento->destinatarios->pluck('rol')->values()->all(),
        ];
    }

    private function getGrupoDeAlumno(int $alumnoId): array
    {
        $cicloId = \App\Models\CicloEscolar::where('activo', true)->value('id');
        if (! $cicloId) return [];

        $grupoId = \App\Models\AsignacionGrupo::where('alumno_id', $alumnoId)
            ->where('ciclo_escolar_id', $cicloId)
            ->where('estado', 'activo')
            ->value('grupo_id');

        return $grupoId ? [$grupoId] : [];
    }

    private function getGruposDelTutor(\App\Models\User $user): array
    {
        $cicloId = \App\Models\CicloEscolar::where('activo', true)->value('id');
        if (! $cicloId) {
            return [];
        }

        $tutor = \App\Models\Tutor::whereHas('persona.user', fn ($q) => $q->where('id', $user->id))
            ->with(['alumnos.asignaciones' => fn ($q) => $q->where('ciclo_escolar_id', $cicloId)->where('estado', 'activo')])
            ->first();

        if (! $tutor) {
            return [];
        }

        $grupoIds = [];
        foreach ($tutor->alumnos as $alumno) {
            $asignacion = $alumno->asignaciones->first();
            if ($asignacion?->grupo_id) {
                $grupoIds[] = $asignacion->grupo_id;
            }
        }

        return array_unique($grupoIds);
    }
}
