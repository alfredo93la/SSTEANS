<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PrimerAccesoController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Auth/CambiarPasswordInicial');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password'             => Hash::make($request->string('password')),
            'must_change_password' => false,
            'email_verified_at'    => $request->user()->email_verified_at ?? now(),
        ]);

        return redirect()->route('dashboard');
    }
}
