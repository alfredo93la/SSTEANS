<?php

namespace App\Http\Controllers\Tutor;

use App\Http\Controllers\Controller;
use App\Models\Tutor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssignedStudentsController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        $tutor = Tutor::query()
            ->whereHas('persona.user', fn ($query) => $query->where('id', $user->id))
            ->with('alumnos.persona')
            ->first();

        if (! $tutor) {
            return response()->json([
                'data' => [],
                'message' => 'El usuario autenticado no tiene perfil de tutor vinculado.',
            ]);
        }

        $cicloId = \App\Models\CicloEscolar::where('activo', true)->value('id');

        $alumnos = $tutor->alumnos->map(function ($alumno) use ($cicloId) {
            $asignacion = $cicloId
                ? $alumno->asignaciones()
                    ->where('ciclo_escolar_id', $cicloId)
                    ->where('estado', 'activo')
                    ->with('grupo:id,nombre,grado_id', 'grupo.grado:id,numero')
                    ->first()
                : null;

            $grupo = $asignacion?->grupo;
            $grado = $grupo?->grado;

            return [
                'id'               => $alumno->id,
                'nombre'           => trim(($alumno->persona?->nombre ?? '').' '.($alumno->persona?->apellidos ?? '')),
                'estado'           => $alumno->estado,
                'fecha_vinculacion' => $alumno->pivot->fecha_vinculacion,
                'grupo'            => ($grado && $grupo) ? $grado->numero.'°'.$grupo->nombre : ($grupo?->nombre ?? ''),
                'grado'            => $grado?->numero ?? null,
                'ciclo'            => $cicloId ? \App\Models\CicloEscolar::find($cicloId)?->nombre : '',
            ];
        });

        return response()->json([
            'data' => $alumnos,
        ]);
    }
}
