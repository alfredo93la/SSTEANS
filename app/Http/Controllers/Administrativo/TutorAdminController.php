<?php

namespace App\Http\Controllers\Administrativo;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\Tutor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TutorAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Tutor::with([
            'persona:id,nombre,apellidos,curp,telefono,direccion',
            'persona.user:id,persona_id,email,status',
            'alumnos' => fn ($q) => $q->with('persona:id,nombre,apellidos,curp')->withPivot('parentesco', 'fecha_vinculacion')->select(['alumnos.id', 'alumnos.persona_id', 'alumnos.sexo']),
        ]);

        if ($request->filled('q')) {
            $q = $request->string('q')->toString();
            $query->whereHas('persona', function ($builder) use ($q): void {
                $builder->where('nombre', 'like', "%{$q}%")
                    ->orWhere('apellidos', 'like', "%{$q}%")
                    ->orWhere('curp', 'like', "%{$q}%");
            });
        }

        return response()->json(['tutores' => $query->get()]);
    }

    public function vincular(Request $request, Tutor $tutor): JsonResponse
    {
        $validated = $request->validate([
            'alumno_id'         => ['required', 'exists:alumnos,id'],
            'parentesco'        => ['nullable', 'string', 'max:50'],
            'fecha_vinculacion' => ['nullable', 'date'],
        ]);

        $alumno = Alumno::findOrFail($validated['alumno_id']);

        if ($tutor->alumnos()->where('alumno_id', $alumno->id)->exists()) {
            return response()->json(['message' => 'El tutor ya está vinculado con ese alumno.'], 422);
        }

        if ($alumno->tutores()->exists()) {
            return response()->json(['message' => 'Este alumno ya tiene un tutor asignado.'], 422);
        }

        $tutor->alumnos()->attach($alumno->id, [
            'parentesco'        => $validated['parentesco'] ?? null,
            'fecha_vinculacion' => $validated['fecha_vinculacion'] ?? now()->toDateString(),
        ]);

        return response()->json(['message' => 'Tutor vinculado al alumno correctamente.']);
    }

    public function desvincular(Request $request, Tutor $tutor): JsonResponse
    {
        $validated = $request->validate([
            'alumno_id' => ['required', 'exists:alumnos,id'],
        ]);

        $tutor->alumnos()->detach($validated['alumno_id']);

        return response()->json(['message' => 'Vínculo eliminado.']);
    }
}
