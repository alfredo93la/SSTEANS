<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class LimpiarDatos extends Command
{
    protected $signature   = 'db:limpiar {--force : Omite la confirmación}';
    protected $description = 'Elimina todos los datos operativos (alumnos, tutores, calificaciones, etc.) manteniendo ciclos, grupos, materias y configuración';

    public function handle(): int
    {
        if (! $this->option('force') && ! $this->confirm(
            '¿Seguro que deseas eliminar TODOS los datos operativos? Esta acción no se puede deshacer.'
        )) {
            $this->info('Operación cancelada.');
            return 0;
        }

        $this->info('Iniciando limpieza de datos operativos...');
        $this->newLine();

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        $tablas = [
            'tarea_entregas',
            'calificacion_detalle',
            'asistencias',
            'reportes_conducta',
            'calificaciones',
            'rubros_evaluacion',
            'tareas',
            'clases',
            'asignaciones_grupo',
            'tutor_alumno',
            'alumnos',
            'tutores',
        ];

        foreach ($tablas as $tabla) {
            if (DB::getSchemaBuilder()->hasTable($tabla)) {
                DB::table($tabla)->truncate();
                $this->line("  <fg=green>✓</> {$tabla}");
            } else {
                $this->line("  <fg=yellow>–</> {$tabla} (tabla no encontrada, omitida)");
            }
        }

        // Personas de tipo Alumno o Tutor (creadas por seeders, no por registro manual)
        $personasEliminadas = DB::table('personas')
            ->whereIn('tipo_persona', ['Alumno', 'Tutor'])
            ->delete();
        $this->line("  <fg=green>✓</> personas (Alumno/Tutor): {$personasEliminadas} eliminadas");

        // Usuarios de prueba generados por seeders
        $emailsPrueba = [
            'tutor@ejemplo.com',
            'profesor@ejemplo.com',
            'social@ejemplo.com',
            'administrativo@ejemplo.com',
        ];

        $idsUsuariosPrueba = DB::table('users')
            ->where(function ($q) use ($emailsPrueba) {
                $q->whereIn('email', $emailsPrueba)
                  ->orWhere('email', 'like', 'prof.g%@ejemplo.com');
            })
            ->pluck('id');

        if ($idsUsuariosPrueba->isNotEmpty()) {
            DB::table('role_user')->whereIn('user_id', $idsUsuariosPrueba)->delete();
            $eliminadosUsers = DB::table('users')->whereIn('id', $idsUsuariosPrueba)->delete();
            $this->line("  <fg=green>✓</> usuarios de prueba: {$eliminadosUsers} eliminados");
        } else {
            $this->line("  <fg=yellow>–</> usuarios de prueba: ninguno encontrado");
        }

        // Personas huérfanas (sin alumno, tutor ni usuario vinculado)
        $huerfanas = DB::table('personas')
            ->whereNotExists(fn ($q) => $q->from('users')->whereColumn('users.persona_id', 'personas.id'))
            ->whereNotExists(fn ($q) => $q->from('alumnos')->whereColumn('alumnos.persona_id', 'personas.id'))
            ->whereNotExists(fn ($q) => $q->from('tutores')->whereColumn('tutores.persona_id', 'personas.id'))
            ->delete();
        $this->line("  <fg=green>✓</> personas huérfanas: {$huerfanas} eliminadas");

        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $this->newLine();
        $this->info('✔ Limpieza completada.');
        $this->line('  Se mantienen intactos: ciclos escolares, grupos, grados, periodos, salones, materias, roles, permisos y configuración.');

        return 0;
    }
}
