<?php

use App\Http\Controllers\ProfileController;

use App\Http\Controllers\Admin\RolePermissionManagementController;
use App\Http\Controllers\Admin\UserRoleManagementController;
use App\Http\Controllers\Tutor\AssignedStudentsController;
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


Route::middleware(['auth', 'verified', 'permission:dashboard.view'])->group(function () {
    Route::get('/tutor/alumnos-asignados', AssignedStudentsController::class)
        ->middleware('permission:calificaciones.view')
        ->name('tutor.alumnos.asignados');
});

Route::middleware(['auth', 'verified', 'permission:usuarios.manage'])->prefix('admin')->group(function () {
    Route::get('/usuarios-roles', [UserRoleManagementController::class, 'index'])->name('admin.usuarios.roles.index');
    Route::put('/usuarios/{user}/roles', [UserRoleManagementController::class, 'update'])->name('admin.usuarios.roles.update');

    Route::get('/roles-permisos', [RolePermissionManagementController::class, 'index'])->name('admin.roles.permisos.index');
    Route::post('/roles', [RolePermissionManagementController::class, 'store'])->name('admin.roles.store');
    Route::put('/roles/{role}', [RolePermissionManagementController::class, 'update'])->name('admin.roles.update');
});
