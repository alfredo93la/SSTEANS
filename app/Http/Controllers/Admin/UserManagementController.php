<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->with('roles:id,nombre')->orderBy('name');

        if ($request->filled('search')) {
            $search = (string) $request->string('search');
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->string('status') !== 'todos') {
            $query->where('status', (string) $request->string('status'));
        }

        if ($request->filled('role') && $request->string('role') !== 'todos') {
            $query->whereHas('roles', fn ($q) => $q->where('nombre', (string) $request->string('role')))
                ->orWhere('role', (string) $request->string('role'));
        }

        return response()->json([
            'users' => $query->get([
                'id', 'name', 'email', 'role', 'status', 'rejection_reason', 'validated_at', 'persona_id', 'created_at',
            ]),
            'roles' => Role::query()->orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'status' => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['integer', Rule::exists('roles', 'id')],
        ]);

        $primaryRole = Role::query()->findOrFail($validated['roles'][0]);

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $primaryRole->nombre,
            'status' => $validated['status'] ?? 'approved',
            'validated_at' => ($validated['status'] ?? 'approved') === 'approved' ? now() : null,
            'validated_by' => ($validated['status'] ?? 'approved') === 'approved' ? $request->user()?->id : null,
        ]);

        $user->roles()->sync($validated['roles']);

        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'user' => $user->load('roles:id,nombre'),
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['integer', Rule::exists('roles', 'id')],
        ]);

        $primaryRole = Role::query()->findOrFail($validated['roles'][0]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $primaryRole->nombre,
            'status' => $validated['status'],
            'rejection_reason' => $validated['status'] === 'rejected' ? ($user->rejection_reason ?: 'Rechazado por administrador.') : null,
            'validated_at' => $validated['status'] === 'approved' ? now() : null,
            'validated_by' => $validated['status'] === 'approved' ? $request->user()?->id : null,
        ]);

        $user->roles()->sync($validated['roles']);

        return response()->json([
            'message' => 'Usuario actualizado correctamente.',
            'user' => $user->load('roles:id,nombre'),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado correctamente.',
        ]);
    }
}
