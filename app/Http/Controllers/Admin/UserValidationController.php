<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\CredencialesUsuario;
use App\Models\Alumno;
use App\Models\Tutor;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class UserValidationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $hasStatusColumn = Schema::hasColumn('users', 'status');
        $hasValidationColumns = $hasStatusColumn && Schema::hasColumn('users', 'rejection_reason') && Schema::hasColumn('users', 'validated_at');

        $query = User::query()->with('roles:id,nombre')->orderByDesc('created_at');

        if ($hasStatusColumn && $request->filled('status') && $request->string('status') !== 'todos') {
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

        $columns = ['id', 'name', 'email', 'role', 'created_at'];
        if ($hasValidationColumns) {
            $columns = [...$columns, 'status', 'rejection_reason', 'validated_at'];
        }

        $requests = $query->get($columns)->map(function (User $user) use ($hasValidationColumns) {
            if (! $hasValidationColumns) {
                $user->setAttribute('status', 'Pendiente');
                $user->setAttribute('rejection_reason', null);
                $user->setAttribute('validated_at', null);
            }

            return $user;
        });

        return response()->json([
            'requests' => $requests,
        ]);
    }

    public function approve(Request $request, User $user): JsonResponse
    {
        if (! Schema::hasColumn('users', 'status')) {
            return response()->json([
                'message' => 'La tabla users no tiene columnas de validación. Ejecuta migraciones pendientes.',
            ], 409);
        }

        $tempPassword = Str::random(8) . rand(10, 99) . '!';

        $user->update([
            'status'               => 'Activo',
            'rejection_reason'     => null,
            'validated_at'         => now(),
            'validated_by'         => $request->user()?->id,
            'password'             => Hash::make($tempPassword),
            'must_change_password' => true,
        ]);

        // Activar alumnos pendientes vinculados al tutor
        $alumnosActivados = 0;
        if ($user->role === 'Tutor' && $user->persona_id) {
            $tutor = Tutor::where('persona_id', $user->persona_id)->first();
            if ($tutor) {
                $alumnosActivados = Alumno::whereHas('tutores', fn ($q) => $q->where('tutor_id', $tutor->id))
                    ->where('estado', 'Pendiente')
                    ->update(['estado' => 'Activo']);
            }
        }

        try {
            Mail::to($user->email)->send(new CredencialesUsuario($user, $tempPassword));
        } catch (\Throwable $e) {
            Log::error('Error enviando credenciales a ' . $user->email . ': ' . $e->getMessage());
        }

        $msg = "Solicitud aprobada. Se han enviado las credenciales al correo {$user->email}.";
        if ($alumnosActivados > 0) {
            $msg .= " Se activaron {$alumnosActivados} alumno(s) vinculado(s).";
        }

        return response()->json([
            'message' => $msg,
            'user'    => $user,
        ]);
    }

    public function reject(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        if (! Schema::hasColumn('users', 'status')) {
            return response()->json([
                'message' => 'La tabla users no tiene columnas de validación. Ejecuta migraciones pendientes.',
            ], 409);
        }

        $user->update([
            'status' => 'Rechazado',
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
