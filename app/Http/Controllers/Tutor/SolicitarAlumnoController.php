<?php

namespace App\Http\Controllers\Tutor;

use App\Enums\Parentesco;
use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\ConfiguracionEscuela;
use App\Models\Persona;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SolicitarAlumnoController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $config = ConfiguracionEscuela::find(1);
        if (! $config?->registro_tutores_activo) {
            return response()->json(['message' => 'El período de solicitud de nuevos alumnos no está activo en este momento.'], 403);
        }

        $tutor = $request->user()->persona?->tutor;

        if (! $tutor) {
            return response()->json(['message' => 'No tienes un perfil de tutor asociado.'], 403);
        }

        $request->validate([
            'nombre'           => ['required', 'string', 'max:100'],
            'apellidos'        => ['required', 'string', 'max:100'],
            'curp'             => ['required', 'string', 'size:18', 'unique:personas,curp'],
            'fecha_nacimiento' => ['required', 'date', 'before:today'],
            'sexo'             => ['required', Rule::in(['Masculino', 'Femenino', 'No especificado'])],
            'parentesco'       => ['required', Rule::in(Parentesco::values())],
        ], [
            'curp.unique'                     => 'Este CURP ya está registrado en el sistema.',
            'curp.size'                       => 'El CURP debe tener exactamente 18 caracteres.',
            'fecha_nacimiento.before'         => 'La fecha de nacimiento debe ser anterior a hoy.',
        ]);

        $validated = $request->all();

        DB::transaction(function () use ($validated, $tutor): void {
            $persona = Persona::query()->create([
                'tipo_persona' => 'Alumno',
                'nombre'       => $validated['nombre'],
                'apellidos'    => $validated['apellidos'],
                'curp'         => strtoupper($validated['curp']),
            ]);

            $alumno = Alumno::query()->create([
                'persona_id'       => $persona->id,
                'estado'           => 'Pendiente',
                'fecha_nacimiento' => $validated['fecha_nacimiento'],
                'sexo'             => $validated['sexo'],
            ]);

            $tutor->alumnos()->attach($alumno->id, [
                'parentesco'       => $validated['parentesco'],
                'fecha_vinculacion' => now()->toDateString(),
            ]);
        });

        return response()->json([
            'message' => 'Solicitud enviada. El administrador revisará el registro de tu alumno.',
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $tutor = $request->user()->persona?->tutor;

        if (! $tutor) {
            return response()->json(['pendientes' => []]);
        }

        $pendientes = $tutor->alumnos()
            ->where('estado', 'Pendiente')
            ->with('persona:id,nombre,apellidos')
            ->withPivot('parentesco')
            ->get()
            ->map(fn ($a) => [
                'id'         => $a->id,
                'nombre'     => $a->persona->nombre . ' ' . $a->persona->apellidos,
                'parentesco' => $a->pivot->parentesco,
            ]);

        return response()->json(['pendientes' => $pendientes]);
    }
}
