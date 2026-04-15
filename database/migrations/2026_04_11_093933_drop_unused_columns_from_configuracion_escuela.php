<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('configuracion_escuela', function (Blueprint $table) {
            $table->dropColumn([
                'minimo_aprobatorio',
                'escala_calificacion',
                'permitir_captura',
                'notificaciones',
                'registro_tutores',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('configuracion_escuela', function (Blueprint $table) {
            $table->tinyInteger('minimo_aprobatorio')->default(6);
            $table->string('escala_calificacion')->default('0-10');
            $table->boolean('permitir_captura')->default(true);
            $table->boolean('notificaciones')->default(true);
            $table->boolean('registro_tutores')->default(false);
        });
    }
};
