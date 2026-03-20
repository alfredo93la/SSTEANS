<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserRoleManagementController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'users' => User::query()
                ->with('roles:id,nombre')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role', 'persona_id']),
            'roles' => Role::query()->orderBy('nombre')->get(['id', 'nombre', 'descripcion']),
        ]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['integer', Rule::exists('roles', 'id')],
        ]);

        $user->roles()->sync($validated['roles']);

        return response()->json([
            'message' => 'Roles actualizados correctamente.',
            'user' => $user->load('roles:id,nombre'),
        ]);
    }
}
