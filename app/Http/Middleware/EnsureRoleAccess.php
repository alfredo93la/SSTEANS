<?php

namespace App\Http\Middleware;

use App\Models\ConfiguracionEscuela;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureRoleAccess
{
    private const ROLE_COLUMN = [
        'Tutor'                   => 'acceso_tutor',
        'Profesor'                => 'acceso_profesor',
        'Trabajador Social'       => 'acceso_trab_social',
        'Personal Administrativo' => 'acceso_administrativo',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $role = $user->role;

        // Admin siempre tiene acceso
        if (! isset(self::ROLE_COLUMN[$role])) {
            return $next($request);
        }

        $column = self::ROLE_COLUMN[$role];
        $config = ConfiguracionEscuela::first();

        if ($config && ! $config->$column) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'El acceso para tu rol está suspendido temporalmente. Contacta al administrador.',
            ]);
        }

        return $next($request);
    }
}
