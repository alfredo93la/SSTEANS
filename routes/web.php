<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('App');
    })->name('dashboard');

    Route::get('/dashboard/admin', function () {
        return Inertia::render('App');
    })->middleware('permission:usuarios.manage')->name('dashboard.admin');

    Route::get('/dashboard/social', function () {
        return Inertia::render('App');
    })->middleware('permission:reportes.manage')->name('dashboard.social');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
