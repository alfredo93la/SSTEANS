<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Persona;
use App\Models\Role;
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
            ->with(['roles:id,nombre', 'persona:id,nombre,apellidos,curp,telefono,direccion,tipo_persona'])
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
                $user->setAttribute('status', 'approved');
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
            'nombre'    => ['required', 'string', 'max:100'],
            'apellidos' => ['required', 'string', 'max:100'],
            'email'     => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'  => ['required', 'string', 'min:8'],
            'curp'      => ['nullable', 'string', 'size:18', 'unique:personas,curp'],
            'telefono'  => ['nullable', 'string', 'max:20'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'status'    => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
            'roles'     => ['required', 'array', 'min:1'],
            'roles.*'   => ['integer', Rule::exists('roles', 'id')],
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

            $status = $validated['status'] ?? 'approved';

            $user = User::query()->create([
                'persona_id'   => $persona->id,
                'name'         => "{$validated['nombre']} {$validated['apellidos']}",
                'email'        => $validated['email'],
                'password'     => Hash::make($validated['password']),
                'role'         => $primaryRole->nombre,
                'status'       => $status,
                'validated_at' => $status === 'approved' ? now() : null,
                'validated_by' => $status === 'approved' ? $request->user()?->id : null,
            ]);

            $user->roles()->sync($validated['roles']);

            return $user;
        });

        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'user'    => $user->load(['roles:id,nombre', 'persona:id,nombre,apellidos,curp,telefono,direccion,tipo_persona']),
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'nombre'    => ['required', 'string', 'max:100'],
            'apellidos' => ['required', 'string', 'max:100'],
            'email'     => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'curp'      => ['nullable', 'string', 'size:18',
                Rule::unique('personas', 'curp')->ignore($user->persona_id),
            ],
            'telefono'  => ['nullable', 'string', 'max:20'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'status'    => ['required', Rule::in(['pending', 'approved', 'rejected'])],
            'roles'     => ['required', 'array', 'min:1'],
            'roles.*'   => ['integer', Rule::exists('roles', 'id')],
        ]);

        $primaryRole = Role::query()->findOrFail($validated['roles'][0]);

        DB::transaction(function () use ($validated, $primaryRole, $request, $user): void {
            // Update or create linked Persona
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
                'rejection_reason' => $validated['status'] === 'rejected'
                    ? ($user->rejection_reason ?: 'Rechazado por administrador.')
                    : null,
                'validated_at'     => $validated['status'] === 'approved' ? now() : null,
                'validated_by'     => $validated['status'] === 'approved' ? $request->user()?->id : null,
                'persona_id'       => $user->persona_id,
            ]);

            $user->roles()->sync($validated['roles']);
        });

        return response()->json([
            'message' => 'Usuario actualizado correctamente.',
            'user'    => $user->fresh(['roles:id,nombre', 'persona:id,nombre,apellidos,curp,telefono,direccion,tipo_persona']),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        DB::transaction(function () use ($user): void {
            $personaId = $user->persona_id;
            $user->roles()->detach();
            $user->delete();

            // Delete persona only if it has no other linked entities (alumno, tutor)
            if ($personaId) {
                $persona = Persona::query()->find($personaId);
                if ($persona && ! $persona->alumno && ! $persona->tutor) {
                    $persona->delete();
                }
            }
        });

        return response()->json(['message' => 'Usuario eliminado correctamente.']);
    }

    private function tipoPersona(string $roleName): string
    {
        return match ($roleName) {
            'Profesor'              => 'profesor',
            'Trabajador Social'     => 'trabajador_social',
            'Tutor'                 => 'tutor',
            default                 => 'administrativo',
        };
    }
}
