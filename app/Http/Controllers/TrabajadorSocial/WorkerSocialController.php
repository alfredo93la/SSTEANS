<?php

namespace App\Http\Controllers\TrabajadorSocial;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\CicloEscolar;
use App\Models\Grupo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkerSocialController extends Controller
{
    /**
     * GET /api/trabajador-social/alumnos
     * Lista de todos los alumnos para el trabajador social.
     */
    public function alumnos(Request $request): JsonResponse
    {
        $cicloId = CicloEscolar::where('activo', true)->value('id');

        $query = Alumno::with([
            'persona:id,nombre,apellidos,curp,telefono',
            'tutores' => fn ($q) => $q->with('persona:id,nombre,apellidos,telefono')->withPivot('parentesco')->limit(1),
        ]);

        if ($cicloId) {
            $query->with([
                'asignaciones' => fn ($q) => $q
                    ->where('ciclo_escolar_id', $cicloId)
                    ->where('estado', 'activo')
                    ->with('grupo:id,nombre,grado_id', 'grupo.grado:id,numero'),
            ]);
        }

        if ($request->filled('q')) {
            $busq = $request->string('q')->toString();
            $query->whereHas('persona', fn ($q) => $q
                ->where('nombre', 'like', "%{$busq}%")
                ->orWhere('apellidos', 'like', "%{$busq}%")
            );
        }

        $alumnos = $query->get()->map(function (Alumno $a) {
            $asignacion = $a->relationLoaded('asignaciones') ? $a->asignaciones->first() : null;
            $grupo      = $asignacion?->grupo;
            $grado      = $grupo?->grado;
            $tutor      = $a->tutores->first();

            return [
                'id'             => $a->id,
                'nombre'         => trim("{$a->persona?->nombre} {$a->persona?->apellidos}"),
                'grupo_id'       => $grupo?->id,
                'estado'         => $a->estado,
                'tutor'           => $tutor ? trim("{$tutor->persona?->nombre} {$tutor->persona?->apellidos}") : null,
                'tutor_parentesco' => $tutor?->pivot?->parentesco,
                'tutor_telefono'  => $tutor?->persona?->telefono,
            ];
        })->sortBy('nombre')->values();

        // Todos los grupos del ciclo activo (independientemente de si tienen alumnos)
        $grupos = $cicloId
            ? Grupo::with('grado:id,numero')
                ->where('ciclo_escolar_id', $cicloId)
                ->orderBy('grado_id')
                ->orderBy('nombre')
                ->get()
                ->map(fn (Grupo $g) => [
                    'id'     => $g->id,
                    'nombre' => "{$g->grado?->numero}°{$g->nombre}",
                    'grado'  => $g->grado?->numero,
                    'count'  => 0, // se calcula en el frontend
                ])
                ->values()
            : collect();

        return response()->json(['alumnos' => $alumnos, 'grupos' => $grupos]);
    }
}