<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\ConfiguracionEscuela;
use App\Models\Persona;
use App\Models\Role;
use App\Models\Tutor;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Enums\Parentesco;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RegisterTutorController extends Controller
{
    private function registroActivo(): bool
    {
        $config = ConfiguracionEscuela::find(1);

        return $config?->registro_tutores_activo === true;
    }

    public function create(): Response|RedirectResponse
    {
        if (! $this->registroActivo()) {
            return redirect()->route('login')->with(
                'status',
                'El registro de tutores no está disponible en este momento.'
            );
        }

        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        if (! $this->registroActivo()) {
            return redirect()->route('login')->with(
                'status',
                'El registro de tutores no está disponible en este momento.'
            );
        }

        $request->validate([
            'nombre'    => ['required', 'string', 'max:100'],
            'apellidos' => ['required', 'string', 'max:100'],
            'email'     => ['required', 'email', 'max:255', 'unique:users,email'],
            'curp'      => ['required', 'string', 'size:18', 'unique:personas,curp'],
            'telefono'  => ['nullable', 'string', 'max:30'],
            'ocupacion' => ['nullable', 'string', 'max:100'],
            'hijos'     => ['required', 'array', 'min:1'],
            'hijos.*.nombre'           => ['required', 'string', 'max:100'],
            'hijos.*.apellidos'        => ['required', 'string', 'max:100'],
            'hijos.*.curp'             => ['required', 'string', 'size:18', 'unique:personas,curp', 'distinct'],
            'hijos.*.fecha_nacimiento' => ['required', 'date', 'before:today'],
            'hijos.*.sexo'             => ['required', Rule::in(['Masculino', 'Femenino', 'No especificado'])],
            'hijos.*.parentesco'       => ['required', Rule::in(Parentesco::values())],
        ], [
            'curp.unique'                       => 'Este CURP ya está registrado en el sistema.',
            'curp.size'                         => 'El CURP debe tener exactamente 18 caracteres.',
            'email.unique'                      => 'Este correo electrónico ya está registrado.',
            'hijos.required'                    => 'Debes registrar al menos un alumno.',
            'hijos.min'                         => 'Debes registrar al menos un alumno.',
            'hijos.*.nombre.required'           => 'El nombre del alumno es obligatorio.',
            'hijos.*.apellidos.required'        => 'Los apellidos del alumno son obligatorios.',
            'hijos.*.curp.required'             => 'El CURP del alumno es obligatorio.',
            'hijos.*.curp.unique'               => 'El CURP del alumno ya está registrado.',
            'hijos.*.curp.size'                 => 'El CURP debe tener exactamente 18 caracteres.',
            'hijos.*.curp.distinct'             => 'Los CURP de los alumnos no pueden repetirse.',
            'hijos.*.fecha_nacimiento.required' => 'La fecha de nacimiento es obligatoria.',
            'hijos.*.fecha_nacimiento.before'   => 'La fecha de nacimiento debe ser anterior a hoy.',
            'hijos.*.sexo.required'             => 'El sexo del alumno es obligatorio.',
            'hijos.*.parentesco.required'       => 'El parentesco es obligatorio.',
        ]);

        $validated = $request->all();

        DB::transaction(function () use ($validated): void {
            $personaTutor = Persona::query()->create([
                'tipo_persona' => 'Tutor',
                'nombre'       => $validated['nombre'],
                'apellidos'    => $validated['apellidos'],
                'curp'         => strtoupper($validated['curp']),
                'telefono'     => $validated['telefono'] ?? null,
            ]);

            $user = User::query()->create([
                'persona_id'           => $personaTutor->id,
                'name'                 => "{$validated['nombre']} {$validated['apellidos']}",
                'email'                => $validated['email'],
                'password'             => Hash::make(Str::random(16)),
                'role'                 => 'Tutor',
                'status'               => 'Pendiente',
                'must_change_password' => true,
            ]);

            $tutorRole = Role::query()->where('nombre', 'Tutor')->first();
            if ($tutorRole) {
                $user->roles()->attach($tutorRole->id);
            }

            $tutor = Tutor::query()->create([
                'persona_id' => $personaTutor->id,
                'ocupacion'  => $validated['ocupacion'] ?? null,
            ]);

            foreach ($validated['hijos'] as $hijo) {
                $personaAlumno = Persona::query()->create([
                    'tipo_persona' => 'Alumno',
                    'nombre'       => $hijo['nombre'],
                    'apellidos'    => $hijo['apellidos'],
                    'curp'         => strtoupper($hijo['curp']),
                ]);

                $alumno = Alumno::query()->create([
                    'persona_id'       => $personaAlumno->id,
                    'estado'           => 'Pendiente',
                    'fecha_nacimiento' => $hijo['fecha_nacimiento'],
                    'sexo'             => $hijo['sexo'],
                ]);

                $tutor->alumnos()->attach($alumno->id, [
                    'parentesco'       => $hijo['parentesco'],
                    'fecha_vinculacion' => now()->toDateString(),
                ]);
            }
        });

        return redirect()->route('login')->with(
            'status',
            'Registro enviado correctamente. El administrador validará tu solicitud y recibirás un correo con tus credenciales de acceso.'
        );
    }

    public function checkCurp(Request $request): JsonResponse
    {
        $curp = strtoupper((string) $request->string('curp'));

        if (strlen($curp) !== 18) {
            return response()->json(['exists' => false]);
        }

        return response()->json([
            'exists' => Persona::query()->where('curp', $curp)->exists(),
        ]);
    }
}
