<?php

namespace App\Http\Middleware;

use App\Models\ConfiguracionEscuela;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            $user->loadMissing([
                'persona',
                'tutorProfile.alumnos.persona',
            ]);
        }

        $hasStatusColumn = Schema::hasColumn('users', 'status');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user
                    ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'persona_id' => $user->persona_id,
                        'status' => $hasStatusColumn ? $user->status : null,
                        'persona' => $user->persona
                            ? [
                                'tipo_persona' => $user->persona->tipo_persona,
                                'nombre' => $user->persona->nombre,
                                'apellidos' => $user->persona->apellidos,
                                'direccion' => $user->persona->direccion,
                                'telefono' => $user->persona->telefono,
                                'curp' => $user->persona->curp,
                            ]
                            : null,
                        'tutor_profile' => $user->tutorProfile
                            ? [
                                'parentesco' => $user->tutorProfile->parentesco,
                                'ocupacion' => $user->tutorProfile->ocupacion,
                                'alumnos_count' => $user->tutorProfile->alumnos->count(),
                                'alumnos' => $user->tutorProfile->alumnos->map(fn ($alumno) => [
                                    'id' => $alumno->id,
                                    'nombre' => trim(implode(' ', array_filter([
                                        $alumno->persona?->nombre,
                                        $alumno->persona?->apellidos,
                                    ]))),
                                ])->values()->all(),
                            ]
                            : null,
                        'permissions' => $user->permissions(),
                    ]
                    : null,
            ],
            'escuela' => fn () => ConfiguracionEscuela::first()?->only('nombre', 'numero', 'servicio_educativo') ?? ['nombre' => '', 'numero' => '', 'servicio_educativo' => ''],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
