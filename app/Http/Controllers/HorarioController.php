<?php

namespace App\Http\Controllers;

use App\Models\Alumno;
use App\Models\AsignacionGrupo;
use App\Models\CicloEscolar;
use App\Models\Clase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HorarioController extends Controller
{
    /**
     * GET /api/tutor/horario/{alumno}
     * Horario del alumno derivado de las clases de su grupo activo.
     */
    public function forAlumno(Request $request, Alumno $alumno): JsonResponse
    {
        $cicloId = CicloEscolar::where('activo', true)->value('id');

        $grupoId = AsignacionGrupo::where('alumno_id', $alumno->id)
            ->where('estado', 'activo')
            ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId))
            ->value('grupo_id');

        if (! $grupoId) {
            return response()->json(['horario' => []]);
        }

        $clases = Clase::where('grupo_id', $grupoId)
            ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId))
            ->with(['materia:id,nombre', 'salon:id,nombre', 'profesor:id,name'])
            ->get()
            ->map(fn ($c) => [
                'id'         => $c->id,
                'alumnoId'   => $alumno->id,
                'grupoId'    => $c->grupo_id,
                'materiaId'  => $c->materia_id,
                'materia'    => $c->materia?->nombre,
                'clave'      => $c->materia ? strtoupper(mb_substr($c->materia->nombre, 0, 3)) : '',
                'diaSemana'  => ucfirst($c->dia_semana === 'miercoles' ? 'Miércoles' : $c->dia_semana),
                'horaInicio' => substr($c->hora_inicio, 0, 5),
                'horaFin'    => substr($c->hora_fin, 0, 5),
                'salon'      => $c->salon?->nombre ?? '',
                'profesor'   => $c->profesor?->name ?? '',
            ]);

        return response()->json(['horario' => $clases]);
    }
}