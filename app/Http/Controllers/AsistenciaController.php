<?php

namespace App\Http\Controllers;

use App\Models\Alumno;
use App\Models\Asistencia;
use App\Models\CicloEscolar;
use App\Models\Clase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AsistenciaController extends Controller
{
    /**
     * GET /api/asistencias
     * Profesor: asistencias de un grupo+materia en una fecha.
     */
    /** Mapea dayOfWeek de Carbon (0=Dom) al ENUM de clases. */
    private function diaSemanaDeCarbon(int $dow): string
    {
        return ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][$dow];
    }

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'grupo_id'   => ['required', 'integer'],
            'materia_id' => ['required', 'integer'],
            'fecha'      => ['required', 'date'],
        ]);

        $ciclo = CicloEscolar::where('activo', true)->first();
        $cicloId = $ciclo?->id;
        $userId  = $request->user()->id;
        $fecha   = \Illuminate\Support\Carbon::parse($request->fecha);

        // Validar que la fecha no sea futura
        if ($fecha->isAfter(\Illuminate\Support\Carbon::today())) {
            return response()->json([
                'message'      => 'No se puede registrar asistencia para una fecha futura.',
                'asistencias'  => [],
                'dia_invalido' => true,
            ], 422);
        }

        // Validar que la fecha esté dentro del ciclo escolar activo
        if ($ciclo && ($fecha->lt($ciclo->fecha_inicio) || $fecha->gt($ciclo->fecha_fin))) {
            return response()->json([
                'message'      => 'La fecha está fuera del ciclo escolar activo.',
                'asistencias'  => [],
                'dia_invalido' => true,
            ], 422);
        }

        // Validar que haya clase ese día de la semana
        $dia = $this->diaSemanaDeCarbon($fecha->dayOfWeek);
        $claseExiste = Clase::where('profesor_user_id', $userId)
            ->where('grupo_id', $request->integer('grupo_id'))
            ->where('materia_id', $request->integer('materia_id'))
            ->where('dia_semana', $dia)
            ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId))
            ->exists();

        if (! $claseExiste) {
            return response()->json([
                'message'      => 'Esta clase no está programada para el día seleccionado.',
                'asistencias'  => [],
                'dia_invalido' => true,
            ], 422);
        }

        $alumnos = Alumno::whereHas('asignaciones', function ($q) use ($request, $cicloId) {
                $q->where('grupo_id', $request->integer('grupo_id'))
                  ->where('estado', 'activo');
                if ($cicloId) {
                    $q->where('ciclo_escolar_id', $cicloId);
                }
            })
            ->with('persona:id,nombre,apellidos')
            ->get();

        $asistencias = Asistencia::whereIn('alumno_id', $alumnos->pluck('id'))
            ->where('materia_id', $request->integer('materia_id'))
            ->where('fecha', $request->fecha)
            ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId))
            ->get()
            ->keyBy('alumno_id');

        $resultado = $alumnos->map(fn ($a) => [
            'alumnoId'  => $a->id,
            'nombre'    => trim(($a->persona?->apellidos ?? '').' '.($a->persona?->nombre ?? '')),
            'estado'    => $asistencias[$a->id]?->estado ?? null,
        ])->sortBy('nombre')->values();

        return response()->json(['asistencias' => $resultado]);
    }

    /**
     * POST /api/asistencias/bulk
     * Guardar asistencias de un grupo+materia en una fecha (bulk upsert).
     */
    public function bulk(Request $request): JsonResponse
    {
        $request->validate([
            'materia_id'  => ['required', 'integer', 'exists:materias,id'],
            'fecha'       => ['required', 'date'],
            'asistencias' => ['required', 'array'],
            'asistencias.*.alumnoId' => ['required', 'integer', 'exists:alumnos,id'],
            'asistencias.*.estado'   => ['required', 'in:Presente,Falta,Retardo'],
        ]);

        $ciclo   = CicloEscolar::where('activo', true)->first();
        $cicloId = $ciclo?->id;
        $userId  = $request->user()->id;
        $fecha   = \Illuminate\Support\Carbon::parse($request->fecha);

        if (! $cicloId) {
            return response()->json(['message' => 'No hay ciclo escolar activo.'], 422);
        }

        // Validar que la fecha esté dentro del ciclo escolar activo
        if ($ciclo && ($fecha->lt($ciclo->fecha_inicio) || $fecha->gt($ciclo->fecha_fin))) {
            return response()->json(['message' => 'La fecha está fuera del ciclo escolar activo.'], 422);
        }

        $grupoId = $request->input('grupo_id');
        $dia     = $this->diaSemanaDeCarbon($fecha->dayOfWeek);

        // Validar que el profesor tenga clase ese día para este grupo+materia
        $autorizado = Clase::where('profesor_user_id', $userId)
            ->where('grupo_id', $grupoId)
            ->where('materia_id', $request->integer('materia_id'))
            ->where('dia_semana', $dia)
            ->where('ciclo_escolar_id', $cicloId)
            ->exists();

        if (! $autorizado) {
            return response()->json(['message' => 'Esta clase no está programada para el día seleccionado.'], 403);
        }

        DB::transaction(function () use ($request, $cicloId, $userId): void {
            foreach ($request->asistencias as $item) {
                Asistencia::updateOrCreate(
                    [
                        'alumno_id'  => $item['alumnoId'],
                        'materia_id' => $request->integer('materia_id'),
                        'fecha'      => $request->fecha,
                    ],
                    [
                        'ciclo_escolar_id' => $cicloId,
                        'registrado_por'   => $userId,
                        'estado'           => $item['estado'],
                    ]
                );
            }
        });

        return response()->json(['message' => 'Asistencia guardada correctamente.']);
    }

    /**
     * GET /api/tutor/asistencias/{alumno}
     * Asistencias de un alumno (para tutor).
     * Acepta ciclo_id opcional; si no se pasa usa el ciclo activo.
     */
    public function forAlumno(Request $request, Alumno $alumno): JsonResponse
    {
        $cicloId = $request->filled('ciclo_id')
            ? $request->integer('ciclo_id')
            : CicloEscolar::where('activo', true)->value('id');

        $query = Asistencia::where('alumno_id', $alumno->id)
            ->with('materia:id,nombre')
            ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId))
            ->when($request->filled('materia_id'), fn ($q) => $q->where('materia_id', $request->integer('materia_id')))
            ->when($request->filled('fecha_inicio'), fn ($q) => $q->where('fecha', '>=', $request->fecha_inicio))
            ->when($request->filled('fecha_fin'), fn ($q) => $q->where('fecha', '<=', $request->fecha_fin))
            ->orderBy('fecha', 'desc');

        $asistencias = $query->get()->map(function ($a) {
            $fecha = $a->fecha;
            $diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            $diaSemana  = $diasSemana[$fecha->dayOfWeek];
            $fechaStr   = $fecha->format('d/m/Y');

            return [
                'id'        => $a->id,
                'alumnoId'  => $a->alumno_id,
                'materiaId' => $a->materia_id,
                'materia'   => $a->materia?->nombre,
                'fecha'     => $fechaStr,
                'diaSemana' => $diaSemana,
                'estado'    => $a->estado,
            ];
        });

        return response()->json(['asistencias' => $asistencias]);
    }
}