<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $columns = collect(DB::select('SHOW COLUMNS FROM rubros_evaluacion'))->pluck('Field');
        $indexes = collect(DB::select('SHOW INDEX FROM rubros_evaluacion'))->pluck('Key_name')->unique();
        $fks     = collect(DB::select("
            SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'rubros_evaluacion'
              AND REFERENCED_TABLE_NAME IS NOT NULL
              AND TABLE_SCHEMA = DATABASE()
        "))->pluck('CONSTRAINT_NAME');

        // 1. Agregar columna si no existe
        if (! $columns->contains('periodo_evaluacion_id')) {
            DB::statement('
                ALTER TABLE rubros_evaluacion
                ADD COLUMN periodo_evaluacion_id BIGINT UNSIGNED NULL
                AFTER ciclo_escolar_id
            ');
        }

        // 2. Asegurar NOT NULL
        DB::statement('
            ALTER TABLE rubros_evaluacion
            MODIFY COLUMN periodo_evaluacion_id BIGINT UNSIGNED NOT NULL
        ');

        // 3. Agregar FK si no existe
        if (! $fks->contains('rubros_evaluacion_periodo_evaluacion_id_foreign')) {
            DB::statement('
                ALTER TABLE rubros_evaluacion
                ADD CONSTRAINT rubros_evaluacion_periodo_evaluacion_id_foreign
                FOREIGN KEY (periodo_evaluacion_id) REFERENCES periodos_evaluacion(id)
                ON DELETE CASCADE
            ');
        }

        // 4. Reemplazar unique constraint para incluir el periodo
        // MySQL no permite eliminar un índice que soporta un FK; se crea un índice
        // temporal en profesor_user_id antes de eliminar rubro_unico.
        $indexes = collect(DB::select('SHOW INDEX FROM rubros_evaluacion'))->pluck('Key_name')->unique();

        if ($indexes->contains('rubro_unico')) {
            DB::statement('ALTER TABLE rubros_evaluacion ADD INDEX idx_prof_tmp (profesor_user_id)');
            DB::statement('ALTER TABLE rubros_evaluacion DROP INDEX rubro_unico');
        }

        DB::statement('
            ALTER TABLE rubros_evaluacion
            ADD UNIQUE KEY rubro_unico
            (profesor_user_id, materia_id, grupo_id, ciclo_escolar_id, periodo_evaluacion_id, nombre)
        ');

        // Eliminar el índice temporal (rubro_unico ya lo cubre)
        $indexes = collect(DB::select('SHOW INDEX FROM rubros_evaluacion'))->pluck('Key_name')->unique();
        if ($indexes->contains('idx_prof_tmp')) {
            DB::statement('ALTER TABLE rubros_evaluacion DROP INDEX idx_prof_tmp');
        }
    }

    public function down(): void
    {
        Schema::table('rubros_evaluacion', function (Blueprint $table) {
            $table->dropUnique('rubro_unico');
            $table->dropForeign(['periodo_evaluacion_id']);
            $table->dropColumn('periodo_evaluacion_id');
            $table->unique(
                ['profesor_user_id', 'materia_id', 'grupo_id', 'ciclo_escolar_id', 'nombre'],
                'rubro_unico'
            );
        });
    }
};
