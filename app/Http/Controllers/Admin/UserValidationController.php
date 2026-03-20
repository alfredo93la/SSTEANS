<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserValidationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->with('roles:id,nombre')->orderByDesc('created_at');

        if ($request->filled('status') && $request->string('status') !== 'todos') {
            $query->where('status', (string) $request->string('status'));
        }

        if ($request->filled('role') && $request->string('role') !== 'todos') {
            $query->where('role', (string) $request->string('role'));
        }

        if ($request->filled('search')) {
            $search = (string) $request->string('search');
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'requests' => $query->get([
                'id', 'name', 'email', 'role', 'status', 'rejection_reason', 'created_at', 'validated_at',
            ]),
        ]);
    }

    public function approve(Request $request, User $user): JsonResponse
    {
        $user->update([
            'status' => 'approved',
            'rejection_reason' => null,
            'validated_at' => now(),
            'validated_by' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Solicitud aprobada correctamente.',
            'user' => $user,
        ]);
    }

    public function reject(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $user->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason'],
            'validated_at' => null,
            'validated_by' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Solicitud rechazada correctamente.',
            'user' => $user,
        ]);
    }
}
