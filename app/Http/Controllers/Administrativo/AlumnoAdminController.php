<?php

namespace App\Http\Controllers\Administrativo;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\CicloEscolar;
use App\Models\Persona;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AlumnoAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cicloActivoId = CicloEscolar::where('activo', true)->value('id');

        $query = Alumno::with([
            'persona:id,nombre,apellidos,curp,telefono,direccion',
        ]);

        // Incluir grupo actual del ciclo activo si existe
        if ($cicloActivoId) {
            $query->with([
                'asignaciones' => fn ($q) => $q
                    ->where('ciclo_escolar_id', $cicloActivoId)
                    ->where('estado', 'activo')
                    ->with('grupo:id,nombre,turno,grado_id', 'grupo.grado:id,numero'),
            ]);
        }

        if ($request->filled('q')) {
            $q = $request->string('q')->toString();
            $query->whereHas('persona', function ($builder) use ($q): void {
                $builder->where('nombre', 'like', "%{$q}%")
                    ->orWhere('apellidos', 'like', "%{$q}%")
                    ->orWhere('curp', 'like', "%{$q}%");
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->string('estado')->toString());
        }

        $alumnos = $query->orderByRaw(
            'EXISTS(SELECT 1 FROM personas WHERE personas.id = alumnos.persona_id ORDER BY personas.apellidos)'
        )->get();

        return response()->json(['alumnos' => $alumnos]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre'          => ['required', 'string', 'max:255'],
            'apellidos'       => ['required', 'string', 'max:255'],
            'curp'            => ['required', 'string', 'size:18', 'unique:personas,curp'],
            'fecha_nacimiento' => ['required', 'date', 'before:today'],
            'sexo'            => ['required', Rule::in(['Masculino', 'Femenino', 'No especificado'])],
            'telefono'        => ['nullable', 'string', 'max:30'],
            'direccion'       => ['nullable', 'string', 'max:500'],
            'estado'          => ['nullable', Rule::in(['Activo', 'Inactivo', 'Baja'])],
        ]);

        $alumno = DB::transaction(function () use ($validated): Alumno {
            $persona = Persona::create([
                'tipo_persona' => 'Alumno',
                'nombre'       => $validated['nombre'],
                'apellidos'    => $validated['apellidos'],
                'curp'         => strtoupper($validated['curp']),
                'telefono'     => $validated['telefono'] ?? null,
                'direccion'    => $validated['direccion'] ?? null,
            ]);

            return Alumno::create([
                'persona_id'      => $persona->id,
                'estado'          => $validated['estado'] ?? 'Activo',
                'fecha_nacimiento' => $validated['fecha_nacimiento'],
                'sexo'            => $validated['sexo'],
            ]);
        });

        return response()->json([
            'message' => 'Alumno registrado correctamente.',
            'alumno'  => $alumno->load('persona:id,nombre,apellidos,curp,telefono,direccion'),
        ], 201);
    }

    public function update(Request $request, Alumno $alumno): JsonResponse
    {
        $validated = $request->validate([
            'nombre'          => ['required', 'string', 'max:255'],
            'apellidos'       => ['required', 'string', 'max:255'],
            'curp'            => ['required', 'string', 'size:18', Rule::unique('personas', 'curp')->ignore($alumno->persona_id)],
            'fecha_nacimiento' => ['required', 'date', 'before:today'],
            'sexo'            => ['required', Rule::in(['Masculino', 'Femenino', 'No especificado'])],
            'telefono'        => ['nullable', 'string', 'max:30'],
            'direccion'       => ['nullable', 'string', 'max:500'],
            'estado'          => ['required', Rule::in(['Activo', 'Inactivo', 'Baja'])],
        ]);

        DB::transaction(function () use ($validated, $alumno): void {
            $alumno->persona->update([
                'nombre'    => $validated['nombre'],
                'apellidos' => $validated['apellidos'],
                'curp'      => strtoupper($validated['curp']),
                'telefono'  => $validated['telefono'] ?? null,
                'direccion' => $validated['direccion'] ?? null,
            ]);

            $alumno->update([
                'estado'          => $validated['estado'],
                'fecha_nacimiento' => $validated['fecha_nacimiento'],
                'sexo'            => $validated['sexo'],
            ]);
        });

        return response()->json([
            'message' => 'Alumno actualizado.',
            'alumno'  => $alumno->fresh()->load('persona:id,nombre,apellidos,curp,telefono,direccion'),
        ]);
    }

    public function destroy(Alumno $alumno): JsonResponse
    {
        if ($alumno->asignaciones()->where('estado', 'activo')->exists()) {
            return response()->json(['message' => 'No se puede eliminar: el alumno tiene un grupo asignado en el ciclo activo.'], 422);
        }

        DB::transaction(function () use ($alumno): void {
            $personaId = $alumno->persona_id;
            $alumno->delete();
            Persona::destroy($personaId);
        });

        return response()->json(['message' => 'Alumno eliminado.']);
    }
}
