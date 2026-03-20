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
            'roles' => $roles,
            'permisos' => $permisos,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:255', 'unique:roles,nombre'],
            'descripcion' => ['nullable', 'string', 'max:500'],
            'permisos' => ['nullable', 'array'],
            'permisos.*' => ['integer', Rule::exists('permisos', 'id')],
        ]);

        $role = Role::query()->create([
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
        ]);

        if (! empty($validated['permisos'])) {
            $role->permisos()->sync($validated['permisos']);
        }

        return response()->json([
            'message' => 'Rol creado correctamente.',
            'role' => $role->load('permisos:id,nombre')->loadCount('users'),
        ], 201);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:255', Rule::unique('roles', 'nombre')->ignore($role->id)],
            'descripcion' => ['nullable', 'string', 'max:500'],
            'permisos' => ['required', 'array', 'min:1'],
            'permisos.*' => ['integer', Rule::exists('permisos', 'id')],
        ]);

        $role->update([
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
        ]);

        $role->permisos()->sync($validated['permisos']);

        return response()->json([
            'message' => 'Rol actualizado correctamente.',
            'role' => $role->load('permisos:id,nombre')->loadCount('users'),
        ]);
    }
}
