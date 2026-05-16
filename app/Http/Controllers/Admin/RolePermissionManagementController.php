<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permiso;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RolePermissionManagementController extends Controller
{
    private function allowedPermissionIds(): array
    {
        $names = config('permissions.roles.Personal Administrativo', []);

        return Permiso::whereIn('nombre', $names)->pluck('id')->toArray();
    }

    public function index(): JsonResponse
    {
        $roles = Role::query()
            ->with(['permisos:id,nombre'])
            ->withCount('users')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'descripcion']);

        $permisos = Permiso::query()
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'descripcion']);

        return response()->json([
            'roles'              => $roles,
            'permisos'           => $permisos,
            'permisos_custom_ids' => $this->allowedPermissionIds(),
        ]);
    }

    private function validateCustomPermisos(array $permisoIds): bool
    {
        $allowed = $this->allowedPermissionIds();
        return empty(array_diff($permisoIds, $allowed));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre'      => ['required', 'string', 'max:255', 'unique:roles,nombre'],
            'descripcion' => ['nullable', 'string', 'max:500'],
            'permisos'    => ['nullable', 'array'],
            'permisos.*'  => ['integer', Rule::exists('permisos', 'id')],
        ]);

        $permisos = $validated['permisos'] ?? [];

        if (! empty($permisos) && ! $this->validateCustomPermisos($permisos)) {
            return response()->json([
                'message' => 'Solo se pueden asignar permisos del Personal Administrativo.',
            ], 403);
        }

        $dashboardId = Permiso::where('nombre', 'dashboard.view')->value('id');
        if ($dashboardId && ! \in_array($dashboardId, $permisos)) {
            $permisos[] = $dashboardId;
        }

        $role = Role::query()->create([
            'nombre'      => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
        ]);

        $role->permisos()->sync($permisos);

        return response()->json([
            'message' => 'Rol creado correctamente.',
            'role'    => $role->load('permisos:id,nombre')->loadCount('users'),
        ], 201);
    }

    public function destroy(Role $role): JsonResponse
    {
        $sistemRoles = array_keys(config('permissions.roles', []));
        if (\in_array($role->nombre, $sistemRoles)) {
            return response()->json(['message' => 'Los roles del sistema no pueden eliminarse.'], 403);
        }

        $usersCount = \App\Models\User::where('role', $role->nombre)->count()
            + $role->users()->whereNotIn('role', [$role->nombre])->count();

        if ($usersCount > 0) {
            return response()->json([
                'message' => "No se puede eliminar el rol \"{$role->nombre}\" porque tiene {$usersCount} usuario(s) asignado(s). Reasigna o elimina esos usuarios primero.",
            ], 422);
        }

        $role->permisos()->detach();
        $role->delete();

        return response()->json(['message' => 'Rol eliminado correctamente.']);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $sistemRoles = array_keys(config('permissions.roles', []));
        if (\in_array($role->nombre, $sistemRoles)) {
            return response()->json(['message' => 'Los roles del sistema no pueden editarse.'], 403);
        }

        $validated = $request->validate([
            'nombre'      => ['required', 'string', 'max:255', Rule::unique('roles', 'nombre')->ignore($role->id)],
            'descripcion' => ['nullable', 'string', 'max:500'],
            'permisos'    => ['required', 'array', 'min:1'],
            'permisos.*'  => ['integer', Rule::exists('permisos', 'id')],
        ]);

        if (! $this->validateCustomPermisos($validated['permisos'])) {
            return response()->json([
                'message' => 'Solo se pueden asignar permisos del Personal Administrativo.',
            ], 403);
        }

        $role->update([
            'nombre'      => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
        ]);

        $role->permisos()->sync($validated['permisos']);

        return response()->json([
            'message' => 'Rol actualizado correctamente.',
            'role'    => $role->load('permisos:id,nombre')->loadCount('users'),
        ]);
    }
}
