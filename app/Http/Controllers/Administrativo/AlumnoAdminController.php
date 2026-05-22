<?php

namespace App\Http\Controllers\Administrativo;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\AsignacionGrupo;
use App\Models\CicloEscolar;
use App\Models\Persona;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AlumnoAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cicloActivoId = CicloEscolar::where('activo', true)->value('id');

        $query = Alumno::with([
            'persona:id,nombre,apellidos,curp,telefono,direccion',
            'tutores' => fn ($q) => $q->with('persona:id,nombre,apellidos')->withPivot('parentesco')->limit(1),
        ])->withCount('tutores');

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

        $alumnos = $alumnos->map(fn ($a) => array_merge($a->toArray(), [
            'tiene_tutor' => $a->tutores_count > 0,
        ]));

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
            'estado'          => ['nullable', Rule::in(['Activo', 'Inactivo', 'Pendiente'])],
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
            'estado'          => ['required', Rule::in(['Activo', 'Inactivo', 'Pendiente'])],
        ]);

        $estadoAnterior = $alumno->estado;
        $nuevoEstado    = $validated['estado'];

        DB::transaction(function () use ($validated, $alumno, $estadoAnterior, $nuevoEstado): void {
            $alumno->persona->update([
                'nombre'    => $validated['nombre'],
                'apellidos' => $validated['apellidos'],
                'curp'      => strtoupper($validated['curp']),
                'telefono'  => $validated['telefono'] ?? null,
                'direccion' => $validated['direccion'] ?? null,
            ]);

            $alumno->update([
                'estado'           => $nuevoEstado,
                'fecha_nacimiento' => $validated['fecha_nacimiento'],
                'sexo'             => $validated['sexo'],
            ]);

            if ($nuevoEstado !== $estadoAnterior) {
                $cicloActivoId = CicloEscolar::where('activo', true)->value('id');

                if ($cicloActivoId) {
                    $estadoAsignacion = $nuevoEstado === 'Inactivo' ? 'baja' : 'activo';

                    AsignacionGrupo::where('alumno_id', $alumno->id)
                        ->where('ciclo_escolar_id', $cicloActivoId)
                        ->update(['estado' => $estadoAsignacion]);
                }
            }
        });

        return response()->json([
            'message' => 'Alumno actualizado.',
            'alumno'  => $alumno->fresh()->load('persona:id,nombre,apellidos,curp,telefono,direccion'),
        ]);
    }

    public function aprobar(Alumno $alumno): JsonResponse
    {
        if ($alumno->estado !== 'Pendiente') {
            return response()->json(['message' => 'El alumno no está pendiente de aprobación.'], 422);
        }

        $alumno->update(['estado' => 'Activo']);

        return response()->json([
            'message' => 'Alumno aprobado correctamente.',
            'alumno'  => $alumno->fresh()->load('persona:id,nombre,apellidos,curp,telefono,direccion'),
        ]);
    }

    public function rechazar(Request $request, Alumno $alumno): JsonResponse
    {
        if ($alumno->estado !== 'Pendiente') {
            return response()->json(['message' => 'El alumno no está pendiente de aprobación.'], 422);
        }

        if ($alumno->asignaciones()->where('estado', 'activo')->exists()) {
            return response()->json(['message' => 'No se puede rechazar: el alumno tiene un grupo asignado.'], 422);
        }

        DB::transaction(function () use ($alumno): void {
            $personaId = $alumno->persona_id;
            $alumno->delete();
            Persona::destroy($personaId);
        });

        return response()->json(['message' => 'Solicitud rechazada y registro eliminado.']);
    }

    public function baja(Request $request, Alumno $alumno): JsonResponse
    {
        $request->validate(['password' => ['required', 'string']]);

        if (! Hash::check($request->password, $request->user()->password)) {
            return response()->json(['message' => 'Contraseña incorrecta.'], 403);
        }

        if ($alumno->estado === 'Inactivo') {
            return response()->json(['message' => 'El alumno ya está inactivo.'], 422);
        }

        DB::transaction(function () use ($alumno): void {
            $cicloActivoId = CicloEscolar::where('activo', true)->value('id');

            $alumno->update(['estado' => 'Inactivo']);

            if ($cicloActivoId) {
                AsignacionGrupo::where('alumno_id', $alumno->id)
                    ->where('ciclo_escolar_id', $cicloActivoId)
                    ->update(['estado' => 'baja']);
            }
        });

        return response()->json([
            'message' => 'Alumno desactivado.',
            'alumno'  => $alumno->fresh()->load('persona:id,nombre,apellidos,curp,telefono,direccion'),
        ]);
    }

    public function reactivar(Alumno $alumno): JsonResponse
    {
        if ($alumno->estado !== 'Inactivo') {
            return response()->json(['message' => 'El alumno no está inactivo.'], 422);
        }

        $alumno->update(['estado' => 'Activo']);

        return response()->json([
            'message' => 'Alumno reactivado.',
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
