<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // La tabla puede estar en estado parcial por ejecuciones previas fallidas.
        // Manejamos cada paso de forma idempotente.

        DB::table('calificaciones')->truncate();

        $columns = collect(DB::select('SHOW COLUMNS FROM calificaciones'))->pluck('Field');
        $indexes = collect(DB::select('SHOW INDEX FROM calificaciones'))->pluck('Key_name');

        // 1. Asegurar que 'periodo' no existe y 'periodo_evaluacion_id' sí
        if ($columns->contains('periodo')) {
            // Necesitamos el índice temporal para poder eliminar el unique que usa alumno_id
            if (! $indexes->contains('idx_alumno_id_tmp')) {
                DB::statement('ALTER TABLE calificaciones ADD INDEX idx_alumno_id_tmp (alumno_id)');
            }
            if ($indexes->contains('calificacion_unica')) {
                DB::statement('ALTER TABLE calificaciones DROP INDEX calificacion_unica');
            }
            Schema::table('calificaciones', function (Blueprint $table) {
                $table->dropColumn('periodo');
                $table->foreignId('periodo_evaluacion_id')
                    ->after('ciclo_escolar_id')
                    ->constrained('periodos_evaluacion')
                    ->cascadeOnDelete();
            });
        } else {
            // 'periodo_evaluacion_id' ya existe — solo asegurar el FK si falta
            $fks = collect(DB::select("
                SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'calificaciones'
                  AND CONSTRAINT_TYPE = 'FOREIGN KEY'
            "))->pluck('CONSTRAINT_NAME');

            if (! $fks->contains('calificaciones_periodo_evaluacion_id_foreign')) {
                Schema::table('calificaciones', function (Blueprint $table) {
                    $table->foreign('periodo_evaluacion_id')
                        ->references('id')->on('periodos_evaluacion')
                        ->cascadeOnDelete();
                });
            }
        }

        // 2. Asegurar índice único correcto
        $indexes = collect(DB::select('SHOW INDEX FROM calificaciones'))->pluck('Key_name');
        if (! $indexes->contains('calificacion_unica')) {
            DB::statement('ALTER TABLE calificaciones ADD UNIQUE calificacion_unica (alumno_id, materia_id, periodo_evaluacion_id)');
        }

        // 3. Eliminar índice temporal si existe
        $indexes = collect(DB::select('SHOW INDEX FROM calificaciones'))->pluck('Key_name');
        if ($indexes->contains('idx_alumno_id_tmp')) {
            DB::statement('ALTER TABLE calificaciones DROP INDEX idx_alumno_id_tmp');
        }
    }

    public function down(): void
    {
        DB::table('calificaciones')->truncate();

        DB::statement('ALTER TABLE calificaciones ADD INDEX idx_alumno_id_tmp (alumno_id)');
        DB::statement('ALTER TABLE calificaciones DROP INDEX calificacion_unica');

        Schema::table('calificaciones', function (Blueprint $table) {
            $table->dropForeign(['periodo_evaluacion_id']);
            $table->dropColumn('periodo_evaluacion_id');
            $table->tinyInteger('periodo')->default(1)->after('ciclo_escolar_id');
            $table->unique(
                ['alumno_id', 'materia_id', 'ciclo_escolar_id', 'periodo'],
                'calificacion_unica'
            );
        });

        DB::statement('ALTER TABLE calificaciones DROP INDEX idx_alumno_id_tmp');
    }
};
