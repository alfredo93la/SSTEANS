<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Rubros de evaluación definidos por el profesor por clase
        Schema::create('rubros_evaluacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profesor_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('materia_id')->constrained('materias')->cascadeOnDelete();
            $table->foreignId('grupo_id')->constrained('grupos')->cascadeOnDelete();
            $table->foreignId('ciclo_escolar_id')->constrained('ciclos_escolares')->cascadeOnDelete();
            $table->string('nombre', 100);         // "Parcial", "Proyecto", "Examen", "Tarea", etc.
            $table->decimal('ponderacion', 5, 2);  // 30.00 = 30% — la suma debe ser 100
            $table->tinyInteger('orden')->default(0);
            $table->timestamps();

            $table->unique(
                ['profesor_user_id', 'materia_id', 'grupo_id', 'ciclo_escolar_id', 'nombre'],
                'rubro_unico'
            );
        });

        // 2. Detalle de calificación por rubro (reemplaza las columnas parcial/proyecto/examen)
        Schema::create('calificacion_detalle', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calificacion_id')->constrained('calificaciones')->cascadeOnDelete();
            $table->foreignId('rubro_id')->constrained('rubros_evaluacion')->cascadeOnDelete();
            $table->decimal('valor', 5, 2)->nullable();
            $table->timestamps();

            $table->unique(['calificacion_id', 'rubro_id'], 'detalle_unico');
        });

        // 3. Quitar columnas fijas de calificaciones
        // DELETE en lugar de TRUNCATE para respetar FKs ya existentes
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('calificaciones')->delete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $columns = collect(DB::select('SHOW COLUMNS FROM calificaciones'))->pluck('Field');

        Schema::table('calificaciones', function (Blueprint $table) use ($columns) {
            if ($columns->contains('parcial'))  $table->dropColumn('parcial');
            if ($columns->contains('proyecto')) $table->dropColumn('proyecto');
            if ($columns->contains('examen'))   $table->dropColumn('examen');
        });
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('calificaciones')->delete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        Schema::dropIfExists('calificacion_detalle');
        Schema::dropIfExists('rubros_evaluacion');

        Schema::table('calificaciones', function (Blueprint $table) {
            $table->decimal('parcial',  5, 2)->nullable()->after('periodo_evaluacion_id');
            $table->decimal('proyecto', 5, 2)->nullable()->after('parcial');
            $table->decimal('examen',   5, 2)->nullable()->after('proyecto');
        });
    }
};
