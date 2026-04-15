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
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $hasStatusColumn = Schema::hasColumn('users', 'status');
        $hasValidationColumns = $hasStatusColumn
            && Schema::hasColumn('users', 'rejection_reason')
            && Schema::hasColumn('users', 'validated_at');

        $query = User::query()
            ->with([
                'roles:id,nombre',
                'persona:id,nombre,apellidos,curp,telefono,direccion,tipo_persona',
                'persona.tutor:id,persona_id,ocupacion',
                'persona.profesor:id,persona_id,academia,cubiculo,hora_entrada,hora_salida',
                'persona.trabSocial:id,persona_id,horario,extension',
                'persona.persAdmin:id,persona_id,cargo,departamento,extension',
            ])
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

            return $user;
        });

        return response()->json([
            'users' => $users,
            'roles' => Role::query()->orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre'       => ['required', 'string', 'max:100'],
            'apellidos'    => ['required', 'string', 'max:100'],
            'email'        => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'     => ['required', 'string', 'min:8'],
            'curp'         => ['nullable', 'string', 'size:18', 'unique:personas,curp'],
            'telefono'     => ['nullable', 'string', 'max:20'],
            'direccion'    => ['nullable', 'string', 'max:255'],
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
            'horario'      => ['nullable', 'string', 'max:100'],
            'extension'    => ['nullable', 'string', 'max:20'],
            // Personal Administrativo
            'cargo'        => ['nullable', 'string', 'max:100'],
            'departamento' => ['nullable', 'string', 'max:100'],
        ]);

        $primaryRole = Role::query()->findOrFail($validated['roles'][0]);

        $user = DB::transaction(function () use ($validated, $primaryRole, $request): User {
            $persona = Persona::query()->create([
                'tipo_persona' => $this->tipoPersona($primaryRole->nombre),
                'nombre'       => $validated['nombre'],
                'apellidos'    => $validated['apellidos'],
                'curp'         => isset($validated['curp']) ? strtoupper($validated['curp']) : null,
                'telefono'     => $validated['telefono'] ?? null,
                'direccion'    => $validated['direccion'] ?? null,
            ]);

            $status = $validated['status'] ?? 'Activo';

            $user = User::query()->create([
                'persona_id'   => $persona->id,
                'name'         => "{$validated['nombre']} {$validated['apellidos']}",
                'email'        => $validated['email'],
                'password'     => Hash::make($validated['password']),
                'role'         => $primaryRole->nombre,
                'status'       => $status,
                'validated_at' => $status === 'Activo' ? now() : null,
                'validated_by' => $status === 'Activo' ? $request->user()?->id : null,
            ]);

            $user->roles()->sync($validated['roles']);

            $this->syncRoleSpecificRecord($primaryRole->nombre, $persona->id, $validated);

            return $user;
        });

        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'user'    => $user->load($this->personaRelations()),
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'nombre'       => ['required', 'string', 'max:100'],
            'apellidos'    => ['required', 'string', 'max:100'],
            'email'        => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'curp'         => ['nullable', 'string', 'size:18',
                Rule::unique('personas', 'curp')->ignore($user->persona_id),
            ],
            'telefono'     => ['nullable', 'string', 'max:20'],
            'direccion'    => ['nullable', 'string', 'max:255'],
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
            'horario'      => ['nullable', 'string', 'max:100'],
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

    public function destroy(User $user): JsonResponse
    {
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
            'Profesor'                => 'profesor',
            'Trabajador Social'       => 'trabajador_social',
            'Tutor'                   => 'tutor',
            'Personal Administrativo' => 'administrativo',
            default                   => 'administrativo',
        };
    }

    /** Crea o actualiza el registro específico del rol, y elimina los demás. */
    private function syncRoleSpecificRecord(string $roleName, int $personaId, array $data): void
    {
        $allModels = [Tutor::class, Profesor::class, TrabSocial::class, PersAdmin::class];

        $roleMap = [
            'Tutor'                   => [Tutor::class,      ['ocupacion' => $data['ocupacion'] ?? null]],
            'Profesor'                => [Profesor::class,   ['academia' => $data['academia'] ?? null, 'cubiculo' => $data['cubiculo'] ?? null, 'hora_entrada' => $data['hora_entrada'] ?? null, 'hora_salida' => $data['hora_salida'] ?? null]],
            'Trabajador Social'       => [TrabSocial::class, ['horario' => $data['horario'] ?? null, 'extension' => $data['extension'] ?? null]],
            'Personal Administrativo' => [PersAdmin::class,  ['cargo' => $data['cargo'] ?? null, 'departamento' => $data['departamento'] ?? null, 'extension' => $data['extension'] ?? null]],
        ];

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
            'persona:id,nombre,apellidos,curp,telefono,direccion,tipo_persona',
            'persona.tutor:id,persona_id,ocupacion',
            'persona.profesor:id,persona_id,academia,cubiculo,hora_entrada,hora_salida',
            'persona.trabSocial:id,persona_id,horario,extension',
            'persona.persAdmin:id,persona_id,cargo,departamento,extension',
        ];
    }
}
