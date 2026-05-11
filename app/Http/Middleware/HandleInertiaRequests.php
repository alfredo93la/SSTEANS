<?php

namespace App\Http\Middleware;

use App\Models\CicloEscolar;
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
                'persona.profesor',
                'persona.trabSocial',
                'persona.persAdmin',
                'tutorProfile.alumnos' => fn ($q) => $q->with('persona')->withPivot('parentesco'),
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
                                'ocupacion' => $user->tutorProfile->ocupacion,
                                'alumnos_count' => $user->tutorProfile->alumnos->count(),
                                'alumnos' => $user->tutorProfile->alumnos->map(fn ($alumno) => [
                                    'id' => $alumno->id,
                                    'nombre' => trim(implode(' ', array_filter([
                                        $alumno->persona?->nombre,
                                        $alumno->persona?->apellidos,
                                    ]))),
                                    'sexo' => $alumno->sexo,
                                    'parentesco' => $alumno->pivot?->parentesco,
                                ])->values()->all(),
                            ]
                            : null,
                        'profesor_profile' => $user->persona?->profesor
                            ? [
                                'academia'    => $user->persona->profesor->academia,
                                'cubiculo'    => $user->persona->profesor->cubiculo,
                                'hora_entrada' => $user->persona->profesor->hora_entrada,
                                'hora_salida'  => $user->persona->profesor->hora_salida,
                            ]
                            : null,
                        'trab_social_profile' => $user->persona?->trabSocial
                            ? [
                                'hora_entrada' => $user->persona->trabSocial->hora_entrada,
                                'hora_salida'  => $user->persona->trabSocial->hora_salida,
                                'extension'    => $user->persona->trabSocial->extension,
                            ]
                            : null,
                        'pers_admin_profile' => $user->persona?->persAdmin
                            ? [
                                'cargo'        => $user->persona->persAdmin->cargo,
                                'departamento' => $user->persona->persAdmin->departamento,
                                'extension'    => $user->persona->persAdmin->extension,
                            ]
                            : null,
                        'permissions' => $user->permissions(),
                    ]
                    : null,
            ],
            'escuela' => fn () => ConfiguracionEscuela::first()?->only('nombre', 'numero', 'servicio_educativo', 'registro_tutores_activo', 'logo_url') ?? ['nombre' => '', 'numero' => '', 'servicio_educativo' => '', 'registro_tutores_activo' => false, 'logo_url' => null],
            'cicloActivo' => fn () => ($c = CicloEscolar::where('activo', true)->first())
                ? ['id' => $c->id, 'nombre' => $c->nombre, 'fecha_inicio' => $c->fecha_inicio->format('Y-m-d'), 'fecha_fin' => $c->fecha_fin->format('Y-m-d')]
                : null,
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
