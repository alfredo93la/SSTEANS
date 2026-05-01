<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfMustChangePassword
{
    public function handle(Request $request, Closure $next): Response
    {
        if (
            $request->user() &&
            $request->user()->must_change_password &&
            ! $request->routeIs('primer-acceso.*', 'logout')
        ) {
            return redirect()->route('primer-acceso.show');
        }

        return $next($request);
    }
}
