<?php

namespace App\Http\Controllers\Profesor;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\CicloEscolar;
use App\Models\Clase;
use App\Models\Grupo;
use App\Models\Materia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfesorController extends Controller
{
    /**
     * Grupos donde el profesor autenticado imparte clases en el ciclo activo.
     */
    public function grupos(Request $request): JsonResponse
    {
        $userId    = $request->user()->id;
        $cicloId   = CicloEscolar::where('activo', true)->value('id');

        $grupos = Grupo::whereHas('clases', function ($q) use ($userId, $cicloId) {
                $q->where('profesor_user_id', $userId);
                if ($cicloId) {
                    $q->where('ciclo_escolar_id', $cicloId);
                }
            })
            ->with(['grado:id,numero'])
            ->get()
            ->map(fn ($g) => [
                'id'     => $g->id,
                'nombre' => $g->grado ? $g->grado->numero.'°'.$g->nombre : $g->nombre,
                'turno'  => $g->turno,
                'grado'  => $g->grado?->numero,
            ]);

        return response()->json(['grupos' => $grupos]);
    }

    /**
     * Materias que el profesor imparte en un grupo específico (ciclo activo).
     * GET /api/profesor/materias?grupo_id=X
     */
    public function materias(Request $request): JsonResponse
    {
        $request->validate(['grupo_id' => ['required', 'integer', 'exists:grupos,id']]);

        $userId  = $request->user()->id;
        $cicloId = CicloEscolar::where('activo', true)->value('id');

        $clases = Clase::where('profesor_user_id', $userId)
            ->where('grupo_id', $request->integer('grupo_id'))
            ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId))
            ->get(['materia_id', 'dia_semana']);

        // Agrupar días por materia
        $diasPorMateria = $clases->groupBy('materia_id')
            ->map(fn ($rows) => $rows->pluck('dia_semana')->unique()->values()->all());

        $materias = Materia::whereIn('id', $clases->pluck('materia_id')->unique())
            ->orderBy('nombre')
            ->get(['id', 'nombre'])
            ->map(fn ($m) => [
                'id'          => $m->id,
                'nombre'      => $m->nombre,
                'diasSemana'  => $diasPorMateria[$m->id] ?? [],
            ]);

        return response()->json(['materias' => $materias]);
    }

    /**
     * Horario del profesor autenticado en el ciclo activo.
     */
    public function horario(Request $request): JsonResponse
    {
        $userId  = $request->user()->id;
        $cicloId = CicloEscolar::where('activo', true)->value('id');

        $clases = Clase::where('profesor_user_id', $userId)
            ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId))
            ->with(['materia:id,nombre', 'grupo:id,nombre,grado_id', 'grupo.grado:id,numero', 'salon:id,nombre'])
            ->get()
            ->map(fn ($c) => [
                'id'         => $c->id,
                'grupoId'    => $c->grupo_id,
                'grupo'      => $c->grupo ? ($c->grupo->grado ? $c->grupo->grado->numero.'°'.$c->grupo->nombre : $c->grupo->nombre) : null,
                'materiaId'  => $c->materia_id,
                'materia'    => $c->materia?->nombre,
                'clave'      => $c->materia ? strtoupper(mb_substr($c->materia->nombre, 0, 3)) : '',
                'diaSemana'  => ucfirst($c->dia_semana === 'miercoles' ? 'Miércoles' : $c->dia_semana),
                'horaInicio' => substr($c->hora_inicio, 0, 5),
                'horaFin'    => substr($c->hora_fin, 0, 5),
                'salon'      => $c->salon?->nombre ?? '',
            ]);

        return response()->json(['horario' => $clases]);
    }

    /**
     * Alumnos activos en un grupo específico (para calificaciones/asistencia del profesor).
     */
    public function alumnos(Request $request): JsonResponse
    {
        $request->validate(['grupo_id' => ['required', 'integer', 'exists:grupos,id']]);

        $cicloId = CicloEscolar::where('activo', true)->value('id');

        $alumnos = Alumno::whereHas('asignaciones', function ($q) use ($request, $cicloId) {
                $q->where('grupo_id', $request->integer('grupo_id'))
                  ->where('estado', 'activo');
                if ($cicloId) {
                    $q->where('ciclo_escolar_id', $cicloId);
                }
            })
            ->with('persona:id,nombre,apellidos')
            ->get()
            ->map(fn ($a) => [
                'id'     => $a->id,
                'nombre' => trim(($a->persona?->apellidos ?? '').' '.($a->persona?->nombre ?? '')),
                'grupo'  => '',
            ])
            ->sortBy('nombre')
            ->values();

        return response()->json(['alumnos' => $alumnos]);
    }
}