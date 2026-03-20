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

        $alumnos = $tutor->alumnos->map(fn ($alumno) => [
            'id' => $alumno->id,
            'nombre' => trim(($alumno->persona?->nombre ?? '').' '.($alumno->persona?->apellidos ?? '')),
            'estado' => $alumno->estado,
            'fecha_vinculacion' => $alumno->pivot->fecha_vinculacion,
        ]);

        return response()->json([
            'data' => $alumnos,
        ]);
    }
}
