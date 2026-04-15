<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Agregar parentesco al pivot tutor_alumno
        Schema::table('tutor_alumno', function (Blueprint $table) {
            $table->string('parentesco', 50)->nullable()->after('fecha_vinculacion');
        });

        // Quitar parentesco de tutores
        Schema::table('tutores', function (Blueprint $table) {
            $table->dropColumn('parentesco');
        });
    }

    public function down(): void
    {
        Schema::table('tutores', function (Blueprint $table) {
            $table->string('parentesco', 50)->nullable();
        });

        Schema::table('tutor_alumno', function (Blueprint $table) {
            $table->dropColumn('parentesco');
        });
    }
};
