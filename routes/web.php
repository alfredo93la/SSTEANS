<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AgendaEventoController;
use App\Http\Controllers\CircularController;
use App\Http\Controllers\CalificacionController;
use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\TareaController;
use App\Http\Controllers\ReporteConductaController;
use App\Http\Controllers\HorarioController;

use App\Http\Controllers\Admin\CicloEscolarController;
use App\Http\Controllers\Admin\PeriodoEvaluacionController;
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
use App\Http\Controllers\Tutor\SolicitarAlumnoController;
use App\Http\Controllers\Profesor\ProfesorController;
use App\Http\Controllers\Profesor\RubroEvaluacionController;
use App\Http\Controllers\TrabajadorSocial\WorkerSocialController;
use App\Http\Controllers\NotificacionController;
use App\Models\Grado;
use App\Models\Materia;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('App');
    })->name('dashboard');
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

Route::middleware(['auth', 'verified', 'permission:dashboard.view'])
    ->prefix('api/tutor')
    ->group(function () {
        Route::post('/solicitar-alumno',      [SolicitarAlumnoController::class, 'store']);
        Route::get('/solicitudes-pendientes', [SolicitarAlumnoController::class, 'index']);
    });

Route::middleware(['auth', 'verified', 'permission:usuarios.manage'])->prefix('admin')->group(function () {
    Route::get('/usuarios-roles', [UserRoleManagementController::class, 'index'])->name('admin.usuarios.roles.index');
    Route::put('/usuarios/{user}/roles', [UserRoleManagementController::class, 'update'])->name('admin.usuarios.roles.update');

    Route::get('/roles-permisos', [RolePermissionManagementController::class, 'index'])->name('admin.roles.permisos.index');
    Route::post('/roles', [RolePermissionManagementController::class, 'store'])->name('admin.roles.store');
    Route::put('/roles/{role}', [RolePermissionManagementController::class, 'update'])->name('admin.roles.update');
    Route::delete('/roles/{role}', [RolePermissionManagementController::class, 'destroy'])->name('admin.roles.destroy');

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
        ->middleware('permission:agenda.manage|examenes.manage');
    Route::put('/agenda/eventos/{evento}', [AgendaEventoController::class, 'update'])
        ->middleware('permission:agenda.manage|examenes.manage');
    Route::delete('/agenda/eventos/{evento}', [AgendaEventoController::class, 'destroy'])
        ->middleware('permission:agenda.manage|examenes.manage');

    Route::get('/circulares', [CircularController::class, 'index'])
        ->middleware('permission:circulares.view');
    Route::post('/circulares', [CircularController::class, 'store'])
        ->middleware('permission:circulares.manage');
    Route::put('/circulares/{circular}', [CircularController::class, 'update'])
        ->middleware('permission:circulares.manage');
    Route::delete('/circulares/{circular}', [CircularController::class, 'destroy'])
        ->middleware('permission:circulares.manage');
    Route::patch('/circulares/{circular}/leer', [CircularController::class, 'marcarLeida'])
        ->middleware('permission:circulares.view');
    Route::get('/circulares/{circular}/adjuntos/{archivo}', [CircularController::class, 'descargarAdjunto'])
        ->middleware('permission:circulares.view')
        ->where('archivo', '.+');
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
        Route::post('/ciclos/{ciclo}/activar',           [CicloEscolarController::class, 'activate']);
        Route::get('/ciclos/{ciclo}/verificar-cierre', [CicloEscolarController::class, 'verificarCierre']);
        Route::post('/ciclos/{ciclo}/cerrar',          [CicloEscolarController::class, 'close']);
        Route::post('/ciclos/{ciclo}/archivar',        [CicloEscolarController::class, 'archivar']);

        Route::get('/materias',          [MateriaController::class, 'index']);
        Route::post('/materias',         [MateriaController::class, 'store']);
        Route::put('/materias/{materia}', [MateriaController::class, 'update']);
        Route::delete('/materias/{materia}', [MateriaController::class, 'destroy']);

        Route::get('/grados', fn () => response()->json(['grados' => Grado::with('materias')->orderBy('numero')->get()]));
    });

// ─── Lectura compartida: grupos y salones (Administrador + Personal Admvo) ────
Route::middleware(['auth', 'verified', 'permission:grupos.manage|horarios.manage|alumnos.manage|salones.manage'])
    ->prefix('api/administrativo')
    ->group(function () {
        Route::get('/grupos',  [GrupoController::class, 'index']);
        Route::get('/salones', [SalonController::class, 'index']);
    });

// ─── Administrador: crear y gestionar grupos ──────────────────────────────────
Route::middleware(['auth', 'verified', 'permission:grupos.manage'])
    ->prefix('api/administrativo')
    ->group(function () {
        Route::post('/grupos',           [GrupoController::class, 'store']);
        Route::put('/grupos/{grupo}',    [GrupoController::class, 'update']);
        Route::delete('/grupos/{grupo}', [GrupoController::class, 'destroy']);
    });

// ─── Administrador: crear y gestionar salones ─────────────────────────────────
Route::middleware(['auth', 'verified', 'permission:salones.manage'])
    ->prefix('api/administrativo')
    ->group(function () {
        Route::post('/salones',           [SalonController::class, 'store']);
        Route::put('/salones/{salon}',    [SalonController::class, 'update']);
        Route::delete('/salones/{salon}', [SalonController::class, 'destroy']);
    });

// ─── Personal Administrativo: clases y horarios ───────────────────────────────
Route::middleware(['auth', 'verified', 'permission:horarios.manage'])
    ->prefix('api/administrativo')
    ->group(function () {
        Route::get('/clases',              [ClaseController::class, 'index']);
        Route::post('/clases',             [ClaseController::class, 'store']);
        Route::put('/clases/{clase}',      [ClaseController::class, 'update']);
        Route::delete('/clases/{clase}',   [ClaseController::class, 'destroy']);

        Route::get('/materias',            [MateriaController::class, 'index']);
    });

Route::middleware(['auth', 'verified', 'permission:alumnos.manage'])
    ->prefix('api/administrativo')
    ->group(function () {
        Route::get('/alumnos',                          [AlumnoAdminController::class, 'index']);
        Route::post('/alumnos',                         [AlumnoAdminController::class, 'store']);
        Route::put('/alumnos/{alumno}',                 [AlumnoAdminController::class, 'update']);
        Route::delete('/alumnos/{alumno}',              [AlumnoAdminController::class, 'destroy']);
        Route::post('/alumnos/{alumno}/aprobar',        [AlumnoAdminController::class, 'aprobar']);
        Route::post('/alumnos/{alumno}/rechazar',       [AlumnoAdminController::class, 'rechazar']);

        Route::get('/asignaciones',                      [AsignacionGrupoController::class, 'index']);
        Route::post('/asignaciones',                     [AsignacionGrupoController::class, 'store']);
        Route::delete('/asignaciones/{asignacionGrupo}', [AsignacionGrupoController::class, 'destroy']);
    });

Route::middleware(['auth', 'verified', 'permission:tutores.manage'])
    ->prefix('api/administrativo')
    ->group(function () {
        Route::get('/tutores',                               [TutorAdminController::class, 'index']);
        Route::post('/tutores/{tutor}/vincular',             [TutorAdminController::class, 'vincular']);
        Route::patch('/tutores/{tutor}/parentesco',          [TutorAdminController::class, 'actualizarParentesco']);
        Route::delete('/tutores/{tutor}/desvincular',        [TutorAdminController::class, 'desvincular']);
    });

// ─── Materias: lectura para cualquier rol autenticado ─────────────────────────
Route::middleware(['auth', 'verified'])->prefix('api')->group(function () {
    Route::get('/materias', fn () => response()->json([
        'materias' => Materia::orderBy('nombre')
            ->get(['id', 'nombre', 'grado_id'])
            ->map(fn ($m) => [
                'id'    => $m->id,
                'nombre' => $m->nombre,
                'clave' => strtoupper(mb_substr($m->nombre, 0, 3)),
            ]),
    ]));
});

// ─── Ciclos: lectura para Personal Administrativo (grupos.manage) ─────────────
Route::middleware(['auth', 'verified', 'permission:grupos.manage'])->prefix('api')->group(function () {
    Route::get('/ciclos', [CicloEscolarController::class, 'index']);
});

// ─── Ciclos: lectura para Tutor y Trabajador Social (historial) ───────────────
Route::middleware(['auth', 'verified', 'permission:calificaciones.view|alumnos.view'])->prefix('api')->group(function () {
    Route::get('/ciclos-escolares', [CicloEscolarController::class, 'index']);
});

// ─── Periodos de Evaluación ────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->prefix('api')->group(function () {
    // Profesores, tutores y trabajador social: periodos por ciclo (debe ir antes de {periodo})
    Route::get('/periodos/ciclo-activo',             [PeriodoEvaluacionController::class, 'cicloActivo'])
        ->middleware('permission:calificaciones.manage|calificaciones.view|alumnos.view');
    // Admin: CRUD completo
    Route::get('/periodos',                          [PeriodoEvaluacionController::class, 'index'])
        ->middleware('permission:periodos.manage');
    Route::post('/periodos',                         [PeriodoEvaluacionController::class, 'store'])
        ->middleware('permission:periodos.manage');
    Route::put('/periodos/{periodo}',                [PeriodoEvaluacionController::class, 'update'])
        ->middleware('permission:periodos.manage');
    Route::patch('/periodos/{periodo}/captura',      [PeriodoEvaluacionController::class, 'toggleCaptura'])
        ->middleware('permission:periodos.manage');
    Route::delete('/periodos/{periodo}',             [PeriodoEvaluacionController::class, 'destroy'])
        ->middleware('permission:periodos.manage');
});

// ─── Profesor ─────────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->prefix('api/profesor')->group(function () {
    Route::get('/grupos',   [ProfesorController::class, 'grupos'])
        ->middleware('permission:calificaciones.manage');
    Route::get('/materias', [ProfesorController::class, 'materias'])
        ->middleware('permission:calificaciones.manage');
    Route::get('/horario',  [ProfesorController::class, 'horario'])
        ->middleware('permission:horario.view');
    Route::get('/alumnos',  [ProfesorController::class, 'alumnos'])
        ->middleware('permission:calificaciones.manage');

    // Rubros de evaluación (definidos por el profesor por clase)
    Route::get('/rubros',  [RubroEvaluacionController::class, 'index'])
        ->middleware('permission:calificaciones.manage');
    Route::post('/rubros', [RubroEvaluacionController::class, 'sync'])
        ->middleware('permission:calificaciones.manage');
});

// ─── Calificaciones ───────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->prefix('api')->group(function () {
    Route::get('/calificaciones',         [CalificacionController::class, 'index'])
        ->middleware('permission:calificaciones.manage');
    Route::post('/calificaciones',        [CalificacionController::class, 'upsert'])
        ->middleware('permission:calificaciones.manage');
    Route::post('/calificaciones/publicar', [CalificacionController::class, 'publicar'])
        ->middleware('permission:calificaciones.manage');
});

// ─── Asistencias ──────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->prefix('api')->group(function () {
    Route::get('/asistencias',       [AsistenciaController::class, 'index'])
        ->middleware('permission:asistencia.manage');
    Route::post('/asistencias/bulk', [AsistenciaController::class, 'bulk'])
        ->middleware('permission:asistencia.manage');
});

// ─── Tareas ───────────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->prefix('api')->group(function () {
    Route::get('/tareas',            [TareaController::class, 'index'])
        ->middleware('permission:tareas.manage');
    Route::post('/tareas',           [TareaController::class, 'store'])
        ->middleware('permission:tareas.manage');
    Route::put('/tareas/{tarea}',                        [TareaController::class, 'update'])
        ->middleware('permission:tareas.manage');
    Route::delete('/tareas/{tarea}',                     [TareaController::class, 'destroy'])
        ->middleware('permission:tareas.manage');
    Route::get('/tareas/{tarea}/entregas',               [TareaController::class, 'entregas'])
        ->middleware('permission:tareas.manage');
    Route::patch('/tareas/{tarea}/entregas/{alumno}',    [TareaController::class, 'updateEntrega'])
        ->middleware('permission:tareas.manage');
});

// ─── Reportes de Conducta ─────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->prefix('api')->group(function () {
    Route::get('/reportes-conducta',              [ReporteConductaController::class, 'index'])
        ->middleware('permission:reportes.manage');
    Route::post('/reportes-conducta',             [ReporteConductaController::class, 'store'])
        ->middleware('permission:reportes.manage');
    Route::put('/reportes-conducta/{reporte}',    [ReporteConductaController::class, 'update'])
        ->middleware('permission:reportes.manage');
});

// ─── Tutor: data de sus alumnos ───────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->prefix('api/tutor')->group(function () {
    Route::get('/horario/{alumno}',          [HorarioController::class, 'forAlumno'])
        ->middleware('permission:horario.view');
    Route::get('/calificaciones/{alumno}',   [CalificacionController::class, 'forAlumno'])
        ->middleware('permission:calificaciones.view');
    Route::get('/asistencias/{alumno}',      [AsistenciaController::class, 'forAlumno'])
        ->middleware('permission:asistencia.view');
    Route::get('/tareas/{alumno}',           [TareaController::class, 'forAlumno'])
        ->middleware('permission:tareas.view');
    Route::get('/reportes-conducta/{alumno}', [ReporteConductaController::class, 'forAlumno'])
        ->middleware('permission:reportes.view');
});

// ─── Trabajador Social ────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'permission:alumnos.view'])->prefix('api/trabajador-social')->group(function () {
    Route::get('/alumnos',             [WorkerSocialController::class, 'alumnos']);
    Route::get('/alumnos/{alumno}',    [WorkerSocialController::class, 'alumno']);
    Route::get('/calificaciones/{alumno}',    [CalificacionController::class, 'forAlumno']);
    Route::get('/reportes-conducta/{alumno}', [ReporteConductaController::class, 'forAlumno']);
});

// ─── Notificaciones ───────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->prefix('api')->group(function () {
    // Tutor: recibir y marcar como leídas
    Route::get('/notificaciones',                              [NotificacionController::class, 'index'])
        ->middleware('permission:notificaciones.view|notificaciones.manage');
    Route::patch('/notificaciones/leer-todas',                 [NotificacionController::class, 'marcarTodasLeidas'])
        ->middleware('permission:notificaciones.view');
    Route::patch('/notificaciones/{notificacion}/leer',        [NotificacionController::class, 'marcarLeida'])
        ->middleware('permission:notificaciones.view');

    // Profesor / Trabajador Social: enviar y ver enviadas
    Route::get('/notificaciones/enviadas',                     [NotificacionController::class, 'enviadas'])
        ->middleware('permission:notificaciones.manage');
    Route::post('/notificaciones',                             [NotificacionController::class, 'store'])
        ->middleware('permission:notificaciones.manage');

    // Común: lista de tutores para el selector
    Route::get('/notificaciones/tutores',                      [NotificacionController::class, 'tutores'])
        ->middleware('permission:notificaciones.manage');
    Route::get('/notificaciones/destinatarios',                [NotificacionController::class, 'destinatarios'])
        ->middleware('permission:notificaciones.manage');
});
