<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PersAdmin;
use App\Models\Persona;
use App\Models\Profesor;
use App\Models\Role;
use App\Models\TrabSocial;
use App\Models\Tutor;
use App\Models\User;
use App\Mail\CredencialesUsuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function stats(): JsonResponse
    {
        $hasStatus = Schema::hasColumn('users', 'status');

        $columns = ['id', 'name', 'role', 'created_at'];
        if ($hasStatus) {
            $columns[] = 'status';
        }

        $todos      = User::query()->orderByDesc('created_at')->get($columns);
        $sinAdmin   = $todos->where('role', '!=', 'Administrador');

        $activos   = $hasStatus ? $sinAdmin->where('status', 'Activo')->count()   : $sinAdmin->count();
        $inactivos = $hasStatus ? $sinAdmin->where('status', 'Inactivo')->count() : 0;

        $rolesUnicos = $todos->pluck('role')->unique()->count();
        $porRol      = $sinAdmin->groupBy('role')->map->count();

        $recientes = $sinAdmin->take(5)->map(fn (User $u) => [
            'name'       => $u->name,
            'role'       => $u->role,
            'status'     => $hasStatus ? $u->status : 'Activo',
            'created_at' => $u->created_at,
        ])->values();

        return response()->json([
            'total'        => $sinAdmin->count(),
            'activos'      => $activos,
            'inactivos'    => $inactivos,
            'roles_unicos' => $rolesUnicos,
            'por_rol'      => $porRol,
            'recientes'    => $recientes,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $hasStatusColumn = Schema::hasColumn('users', 'status');
        $hasValidationColumns = $hasStatusColumn
            && Schema::hasColumn('users', 'rejection_reason')
            && Schema::hasColumn('users', 'validated_at');

        $query = User::query()
            ->with([
                'roles:id,nombre',
                'persona:id,nombre,apellidos,curp,telefono,tipo_persona',
                'persona.tutor:id,persona_id,ocupacion',
                'persona.tutor.alumnos' => fn ($q) => $q
                    ->where('estado', 'Pendiente')
                    ->with('persona:id,nombre,apellidos,curp,fecha_nacimiento,sexo'),
                'persona.profesor:id,persona_id,academia,cubiculo,hora_entrada,hora_salida',
                'persona.trabSocial:id,persona_id,hora_entrada,hora_salida,extension',
                'persona.persAdmin:id,persona_id,cargo,departamento,extension',
            ])
            ->where('role', '!=', 'Administrador')
            ->orderBy('name');

        if ($request->filled('search')) {
            $search = (string) $request->string('search');
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('persona', fn ($q) => $q
                        ->where('nombre', 'like', "%{$search}%")
                        ->orWhere('apellidos', 'like', "%{$search}%")
                    );
            });
        }

        if ($hasStatusColumn && $request->filled('status') && $request->string('status') !== 'todos') {
            $query->where('status', (string) $request->string('status'));
        }

        if ($request->filled('role') && $request->string('role') !== 'todos') {
            $roleName = (string) $request->string('role');
            $query->where(function ($builder) use ($roleName): void {
                $builder->whereHas('roles', fn ($q) => $q->where('nombre', $roleName))
                    ->orWhere('role', $roleName);
            });
        }

        $columns = ['id', 'name', 'email', 'role', 'persona_id', 'created_at'];
        if ($hasValidationColumns) {
            $columns = [...$columns, 'status', 'rejection_reason', 'validated_at'];
        }

        $users = $query->get($columns)->map(function (User $user) use ($hasValidationColumns) {
            if (! $hasValidationColumns) {
                $user->setAttribute('status', 'Activo');
                $user->setAttribute('rejection_reason', null);
                $user->setAttribute('validated_at', null);
            }

            $alumnosPendientes = [];
            if ($user->role === 'Tutor' && $user->persona?->tutor) {
                $alumnosPendientes = $user->persona->tutor->alumnos->map(fn ($a) => [
                    'id'               => $a->id,
                    'nombre'           => $a->persona?->nombre,
                    'apellidos'        => $a->persona?->apellidos,
                    'curp'             => $a->persona?->curp,
                    'fecha_nacimiento' => $a->fecha_nacimiento,
                    'sexo'             => $a->sexo,
                    'parentesco'       => $a->pivot->parentesco,
                ])->values()->all();
            }
            $user->setAttribute('alumnos_pendientes', $alumnosPendientes);

            return $user;
        });

        return response()->json([
            'users' => $users,
            'roles' => Role::query()->orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $primaryRoleId = $request->input('roles.0');
        $esTutor = $primaryRoleId && Role::query()->find($primaryRoleId)?->nombre === 'Tutor';

        $validated = $request->validate([
            'nombre'       => ['required', 'string', 'max:100'],
            'apellidos'    => ['required', 'string', 'max:100'],
            'email'        => ['required', 'email', 'max:255', 'unique:users,email'],
            'curp'         => [$esTutor ? 'required' : 'nullable', 'string', 'size:18', 'unique:personas,curp'],
            'telefono'     => ['nullable', 'string', 'max:20'],
            'status'       => ['nullable', Rule::in(['Pendiente', 'Activo', 'Rechazado', 'Inactivo'])],
            'roles'        => ['required', 'array', 'min:1'],
            'roles.*'      => ['integer', Rule::exists('roles', 'id')],
            // Tutor
            'ocupacion'    => ['nullable', 'string', 'max:100'],
            // Profesor
            'academia'     => ['nullable', 'string', 'max:100'],
            'cubiculo'     => ['nullable', 'string', 'max:50'],
            'hora_entrada' => ['nullable', 'string', 'max:10'],
            'hora_salida'  => ['nullable', 'string', 'max:10'],
            // Trabajador Social
            'extension'    => ['nullable', 'string', 'max:20'],
            // Personal Administrativo
            'cargo'        => ['nullable', 'string', 'max:100'],
            'departamento' => ['nullable', 'string', 'max:100'],
        ]);

        $primaryRole = Role::query()->findOrFail($validated['roles'][0]);

        if ($primaryRole->nombre === 'Administrador' && User::whereHas('roles', fn ($q) => $q->where('nombre', 'Administrador'))->exists()) {
            return response()->json(['message' => 'Ya existe un administrador en el sistema.'], 422);
        }

        $tempPassword = Str::random(8) . rand(10, 99) . '!';

        $user = DB::transaction(function () use ($validated, $primaryRole, $request, $tempPassword): User {
            $persona = Persona::query()->create([
                'tipo_persona' => $this->tipoPersona($primaryRole->nombre),
                'nombre'       => $validated['nombre'],
                'apellidos'    => $validated['apellidos'],
                'curp'         => isset($validated['curp']) ? strtoupper($validated['curp']) : null,
                'telefono'     => $validated['telefono'] ?? null,
            ]);

            $status = $validated['status'] ?? 'Activo';

            $user = User::query()->create([
                'persona_id'           => $persona->id,
                'name'                 => "{$validated['nombre']} {$validated['apellidos']}",
                'email'                => $validated['email'],
                'password'             => Hash::make($tempPassword),
                'role'                 => $primaryRole->nombre,
                'status'               => $status,
                'must_change_password' => true,
                'validated_at'         => $status === 'Activo' ? now() : null,
                'validated_by'         => $status === 'Activo' ? $request->user()?->id : null,
            ]);

            $user->roles()->sync($validated['roles']);

            $this->syncRoleSpecificRecord($primaryRole->nombre, $persona->id, $validated);

            return $user;
        });

        try {
            Mail::to($user->email)->send(new CredencialesUsuario($user, $tempPassword));
        } catch (\Throwable $e) {
            Log::error('Error enviando credenciales a ' . $user->email . ': ' . $e->getMessage());
        }

        return response()->json([
            'message' => "Usuario creado. Se han enviado las credenciales al correo {$user->email}.",
            'user'    => $user->load($this->personaRelations()),
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $primaryRoleId = $request->input('roles.0');
        $esTutor = $primaryRoleId && Role::query()->find($primaryRoleId)?->nombre === 'Tutor';

        $validated = $request->validate([
            'nombre'       => ['required', 'string', 'max:100'],
            'apellidos'    => ['required', 'string', 'max:100'],
            'email'        => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'curp'         => [$esTutor ? 'required' : 'nullable', 'string', 'size:18',
                Rule::unique('personas', 'curp')->ignore($user->persona_id),
            ],
            'telefono'     => ['nullable', 'string', 'max:20'],
            'status'       => ['required', Rule::in(['Pendiente', 'Activo', 'Rechazado', 'Inactivo'])],
            'roles'        => ['required', 'array', 'min:1'],
            'roles.*'      => ['integer', Rule::exists('roles', 'id')],
            // Tutor
            'ocupacion'    => ['nullable', 'string', 'max:100'],
            // Profesor
            'academia'     => ['nullable', 'string', 'max:100'],
            'cubiculo'     => ['nullable', 'string', 'max:50'],
            'hora_entrada' => ['nullable', 'string', 'max:10'],
            'hora_salida'  => ['nullable', 'string', 'max:10'],
            // Trabajador Social
            'extension'    => ['nullable', 'string', 'max:20'],
            // Personal Administrativo
            'cargo'        => ['nullable', 'string', 'max:100'],
            'departamento' => ['nullable', 'string', 'max:100'],
        ]);

        $primaryRole = Role::query()->findOrFail($validated['roles'][0]);

        DB::transaction(function () use ($validated, $primaryRole, $request, $user): void {
            if ($user->persona_id) {
                $user->persona()->update([
                    'tipo_persona' => $this->tipoPersona($primaryRole->nombre),
                    'nombre'       => $validated['nombre'],
                    'apellidos'    => $validated['apellidos'],
                    'curp'         => isset($validated['curp']) ? strtoupper($validated['curp']) : null,
                    'telefono'     => $validated['telefono'] ?? null,
                    'direccion'    => $validated['direccion'] ?? null,
                ]);
            } else {
                $persona = Persona::query()->create([
                    'tipo_persona' => $this->tipoPersona($primaryRole->nombre),
                    'nombre'       => $validated['nombre'],
                    'apellidos'    => $validated['apellidos'],
                    'curp'         => isset($validated['curp']) ? strtoupper($validated['curp']) : null,
                    'telefono'     => $validated['telefono'] ?? null,
                    'direccion'    => $validated['direccion'] ?? null,
                ]);
                $user->persona_id = $persona->id;
            }

            $user->update([
                'name'             => "{$validated['nombre']} {$validated['apellidos']}",
                'email'            => $validated['email'],
                'role'             => $primaryRole->nombre,
                'status'           => $validated['status'],
                'rejection_reason' => $validated['status'] === 'Rechazado'
                    ? ($user->rejection_reason ?: 'Rechazado por administrador.')
                    : null,
                'validated_at'     => $validated['status'] === 'Activo' ? now() : null,
                'validated_by'     => $validated['status'] === 'Activo' ? $request->user()?->id : null,
                'persona_id'       => $user->persona_id,
            ]);

            $user->roles()->sync($validated['roles']);

            $personaId = $user->persona_id;
            if ($personaId) {
                $this->syncRoleSpecificRecord($primaryRole->nombre, $personaId, $validated);
            }
        });

        return response()->json([
            'message' => 'Usuario actualizado correctamente.',
            'user'    => $user->fresh($this->personaRelations()),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()?->id === $user->id) {
            return response()->json(['message' => 'No puedes eliminar tu propia cuenta.'], 403);
        }

        DB::transaction(function () use ($user): void {
            $personaId = $user->persona_id;
            $user->roles()->detach();
            $user->delete();

            if ($personaId) {
                $persona = Persona::query()->find($personaId);
                if ($persona && ! $persona->alumno) {
                    $persona->delete(); // cascade eliminará los registros específicos
                }
            }
        });

        return response()->json(['message' => 'Usuario eliminado correctamente.']);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function tipoPersona(string $roleName): string
    {
        return match ($roleName) {
            'Profesor'                => 'Profesor',
            'Trabajador Social'       => 'Trabajador Social',
            'Tutor'                   => 'Tutor',
            'Personal Administrativo' => 'Personal Administrativo',
            default                   => 'Personal Administrativo',
        };
    }

    /** Crea o actualiza el registro específico del rol, y elimina los demás. */
    private function syncRoleSpecificRecord(string $roleName, int $personaId, array $data): void
    {
        $allModels = [Tutor::class, Profesor::class, TrabSocial::class, PersAdmin::class];

        $sistemRoles = array_keys(config('permissions.roles', []));
        $isCustomRole = ! \in_array($roleName, $sistemRoles);

        $roleMap = [
            'Tutor'                   => [Tutor::class,      ['ocupacion' => $data['ocupacion'] ?? null]],
            'Profesor'                => [Profesor::class,   ['academia' => $data['academia'] ?? null, 'cubiculo' => $data['cubiculo'] ?? null, 'hora_entrada' => $data['hora_entrada'] ?? null, 'hora_salida' => $data['hora_salida'] ?? null]],
            'Trabajador Social'       => [TrabSocial::class, ['hora_entrada' => $data['hora_entrada'] ?? null, 'hora_salida' => $data['hora_salida'] ?? null, 'extension' => $data['extension'] ?? null]],
            'Personal Administrativo' => [PersAdmin::class,  ['cargo' => $data['cargo'] ?? null, 'departamento' => $data['departamento'] ?? null, 'extension' => $data['extension'] ?? null]],
        ];

        // Rol personalizado: usar los mismos datos que Personal Administrativo
        if ($isCustomRole) {
            PersAdmin::updateOrCreate(
                ['persona_id' => $personaId],
                ['cargo' => $data['cargo'] ?? null, 'departamento' => $data['departamento'] ?? null, 'extension' => $data['extension'] ?? null]
            );
            foreach ([Tutor::class, Profesor::class, TrabSocial::class] as $modelClass) {
                $modelClass::where('persona_id', $personaId)->delete();
            }
            return;
        }

        if (isset($roleMap[$roleName])) {
            [$model, $fields] = $roleMap[$roleName];
            $model::updateOrCreate(['persona_id' => $personaId], $fields);
        }

        // Eliminar registros de roles anteriores que ya no aplican
        foreach ($allModels as $modelClass) {
            if (! isset($roleMap[$roleName]) || $roleMap[$roleName][0] !== $modelClass) {
                $modelClass::where('persona_id', $personaId)->delete();
            }
        }
    }

    private function personaRelations(): array
    {
        return [
            'roles:id,nombre',
            'persona:id,nombre,apellidos,curp,telefono,tipo_persona',
            'persona.tutor:id,persona_id,ocupacion',
            'persona.profesor:id,persona_id,academia,cubiculo,hora_entrada,hora_salida',
            'persona.trabSocial:id,persona_id,hora_entrada,hora_salida,extension',
            'persona.persAdmin:id,persona_id,cargo,departamento,extension',
        ];
    }
}
