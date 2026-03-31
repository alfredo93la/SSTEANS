<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AgendaEventoController;
use App\Http\Controllers\CircularController;

use App\Http\Controllers\Admin\CicloEscolarController;
use App\Http\Controllers\Admin\ConfiguracionEscuelaController;
use App\Http\Controllers\Admin\MateriaController;
use App\Http\Controllers\Admin\RolePermissionManagementController;
use App\Http\Controllers\Admin\UserRoleManagementController;
use App\Http\Controllers\Admin\UserValidationController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Administrativo\AlumnoAdminController;
use App\Http\Controllers\Administrativo\AsignacionGrupoController;
use App\Http\Controllers\Administrativo\ClaseController;
use App\Http\Controllers\Administrativo\GrupoController;
use App\Http\Controllers\Administrativo\SalonController;
use App\Http\Controllers\Administrativo\TutorAdminController;
use App\Http\Controllers\Tutor\AssignedStudentsController;
use App\Models\Grado;
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

    Route::get('/usuarios', [UserManagementController::class, 'index'])->name('admin.usuarios.index');
    Route::post('/usuarios', [UserManagementController::class, 'store'])->name('admin.usuarios.store');
    Route::put('/usuarios/{user}', [UserManagementController::class, 'update'])->name('admin.usuarios.update');
    Route::delete('/usuarios/{user}', [UserManagementController::class, 'destroy'])->name('admin.usuarios.destroy');

    Route::get('/validar-usuarios', [UserValidationController::class, 'index'])->name('admin.validar-usuarios.index');
    Route::post('/validar-usuarios/{user}/aprobar', [UserValidationController::class, 'approve'])->name('admin.validar-usuarios.approve');
    Route::post('/validar-usuarios/{user}/rechazar', [UserValidationController::class, 'reject'])->name('admin.validar-usuarios.reject');
});

Route::middleware(['auth', 'verified'])->prefix('api')->group(function () {
    Route::get('/agenda/eventos', [AgendaEventoController::class, 'index'])
        ->middleware('permission:agenda.view');
    Route::post('/agenda/eventos', [AgendaEventoController::class, 'store'])
        ->middleware('permission:agenda.manage');
    Route::put('/agenda/eventos/{evento}', [AgendaEventoController::class, 'update'])
        ->middleware('permission:agenda.manage');
    Route::delete('/agenda/eventos/{evento}', [AgendaEventoController::class, 'destroy'])
        ->middleware('permission:agenda.manage');

    Route::get('/circulares', [CircularController::class, 'index'])
        ->middleware('permission:circulares.view');
    Route::post('/circulares', [CircularController::class, 'store'])
        ->middleware('permission:circulares.manage');
    Route::put('/circulares/{circular}', [CircularController::class, 'update'])
        ->middleware('permission:circulares.manage');
    Route::delete('/circulares/{circular}', [CircularController::class, 'destroy'])
        ->middleware('permission:circulares.manage');
});

// ─── Admin: configuración académica ──────────────────────────────────────────
Route::middleware(['auth', 'verified', 'permission:configuracion.manage'])
    ->prefix('api/admin')
    ->group(function () {
        Route::get('/configuracion',  [ConfiguracionEscuelaController::class, 'index']);
        Route::put('/configuracion',  [ConfiguracionEscuelaController::class, 'update']);

        Route::get('/ciclos',                         [CicloEscolarController::class, 'index']);
        Route::post('/ciclos',                        [CicloEscolarController::class, 'store']);
        Route::put('/ciclos/{ciclo}',                 [CicloEscolarController::class, 'update']);
        Route::delete('/ciclos/{ciclo}',              [CicloEscolarController::class, 'destroy']);
        Route::post('/ciclos/{ciclo}/activar',        [CicloEscolarController::class, 'activate']);
        Route::post('/ciclos/{ciclo}/cerrar',         [CicloEscolarController::class, 'close']);

        Route::get('/materias',          [MateriaController::class, 'index']);
        Route::post('/materias',         [MateriaController::class, 'store']);
        Route::put('/materias/{materia}', [MateriaController::class, 'update']);
        Route::delete('/materias/{materia}', [MateriaController::class, 'destroy']);

        Route::get('/grados', fn () => response()->json(['grados' => Grado::with('materias')->orderBy('numero')->get()]));
    });

// ─── Administrativo: gestión operativa ───────────────────────────────────────
Route::middleware(['auth', 'verified', 'permission:grupos.manage'])
    ->prefix('api/administrativo')
    ->group(function () {
        Route::get('/grupos',              [GrupoController::class, 'index']);
        Route::post('/grupos',             [GrupoController::class, 'store']);
        Route::put('/grupos/{grupo}',      [GrupoController::class, 'update']);
        Route::delete('/grupos/{grupo}',   [GrupoController::class, 'destroy']);

        Route::get('/clases',              [ClaseController::class, 'index']);
        Route::post('/clases',             [ClaseController::class, 'store']);
        Route::put('/clases/{clase}',      [ClaseController::class, 'update']);
        Route::delete('/clases/{clase}',   [ClaseController::class, 'destroy']);

        Route::get('/asignaciones',                            [AsignacionGrupoController::class, 'index']);
        Route::post('/asignaciones',                           [AsignacionGrupoController::class, 'store']);
        Route::delete('/asignaciones/{asignacionGrupo}',       [AsignacionGrupoController::class, 'destroy']);

        Route::get('/salones',             [SalonController::class, 'index']);
        Route::post('/salones',            [SalonController::class, 'store']);
        Route::put('/salones/{salon}',     [SalonController::class, 'update']);
        Route::delete('/salones/{salon}',  [SalonController::class, 'destroy']);

        Route::get('/materias',            [MateriaController::class, 'index']);
    });

Route::middleware(['auth', 'verified', 'permission:alumnos.manage'])
    ->prefix('api/administrativo')
    ->group(function () {
        Route::get('/alumnos',             [AlumnoAdminController::class, 'index']);
        Route::post('/alumnos',            [AlumnoAdminController::class, 'store']);
        Route::put('/alumnos/{alumno}',    [AlumnoAdminController::class, 'update']);
        Route::delete('/alumnos/{alumno}', [AlumnoAdminController::class, 'destroy']);
    });

Route::middleware(['auth', 'verified', 'permission:tutores.manage'])
    ->prefix('api/administrativo')
    ->group(function () {
        Route::get('/tutores',                           [TutorAdminController::class, 'index']);
        Route::post('/tutores/{tutor}/vincular',         [TutorAdminController::class, 'vincular']);
        Route::delete('/tutores/{tutor}/desvincular',    [TutorAdminController::class, 'desvincular']);
    });
