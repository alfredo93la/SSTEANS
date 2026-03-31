<?php

namespace App\Http\Controllers\Administrativo;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\Persona;
use App\Models\Tutor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TutorAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Tutor::with([
            'persona:id,nombre,apellidos,curp,telefono,direccion',
            'alumnos.persona:id,nombre,apellidos,curp',
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

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre'     => ['required', 'string', 'max:255'],
            'apellidos'  => ['required', 'string', 'max:255'],
            'curp'       => ['nullable', 'string', 'size:18', 'unique:personas,curp'],
            'telefono'   => ['nullable', 'string', 'max:30'],
            'direccion'  => ['nullable', 'string', 'max:500'],
            'parentesco' => ['nullable', 'string', 'max:50'],
            'ocupacion'  => ['nullable', 'string', 'max:100'],
        ]);

        $tutor = DB::transaction(function () use ($validated): Tutor {
            $persona = Persona::create([
                'tipo_persona' => 'Tutor',
                'nombre'       => $validated['nombre'],
                'apellidos'    => $validated['apellidos'],
                'curp'         => $validated['curp'] ? strtoupper($validated['curp']) : null,
                'telefono'     => $validated['telefono'] ?? null,
                'direccion'    => $validated['direccion'] ?? null,
            ]);

            return Tutor::create([
                'persona_id'  => $persona->id,
                'parentesco'  => $validated['parentesco'] ?? null,
                'ocupacion'   => $validated['ocupacion'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Tutor registrado correctamente.',
            'tutor'   => $tutor->load('persona:id,nombre,apellidos,curp,telefono,direccion'),
        ], 201);
    }

    public function update(Request $request, Tutor $tutor): JsonResponse
    {
        $validated = $request->validate([
            'nombre'     => ['required', 'string', 'max:255'],
            'apellidos'  => ['required', 'string', 'max:255'],
            'curp'       => ['nullable', 'string', 'size:18', Rule::unique('personas', 'curp')->ignore($tutor->persona_id)],
            'telefono'   => ['nullable', 'string', 'max:30'],
            'direccion'  => ['nullable', 'string', 'max:500'],
            'parentesco' => ['nullable', 'string', 'max:50'],
            'ocupacion'  => ['nullable', 'string', 'max:100'],
        ]);

        DB::transaction(function () use ($validated, $tutor): void {
            $tutor->persona->update([
                'nombre'    => $validated['nombre'],
                'apellidos' => $validated['apellidos'],
                'curp'      => $validated['curp'] ? strtoupper($validated['curp']) : null,
                'telefono'  => $validated['telefono'] ?? null,
                'direccion' => $validated['direccion'] ?? null,
            ]);

            $tutor->update([
                'parentesco' => $validated['parentesco'] ?? null,
                'ocupacion'  => $validated['ocupacion'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Tutor actualizado.',
            'tutor'   => $tutor->fresh()->load('persona:id,nombre,apellidos,curp,telefono,direccion'),
        ]);
    }

    public function destroy(Tutor $tutor): JsonResponse
    {
        DB::transaction(function () use ($tutor): void {
            $personaId = $tutor->persona_id;
            $tutor->delete();
            Persona::destroy($personaId);
        });

        return response()->json(['message' => 'Tutor eliminado.']);
    }

    public function vincular(Request $request, Tutor $tutor): JsonResponse
    {
        $validated = $request->validate([
            'alumno_id'         => ['required', 'exists:alumnos,id'],
            'fecha_vinculacion' => ['nullable', 'date'],
        ]);

        $alumno = Alumno::findOrFail($validated['alumno_id']);

        if ($tutor->alumnos()->where('alumno_id', $alumno->id)->exists()) {
            return response()->json(['message' => 'El tutor ya está vinculado con ese alumno.'], 422);
        }

        $tutor->alumnos()->attach($alumno->id, [
            'fecha_vinculacion' => $validated['fecha_vinculacion'] ?? now()->toDateString(),
        ]);

        return response()->json([
            'message' => 'Tutor vinculado al alumno correctamente.',
        ]);
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
