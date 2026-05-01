<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuracion_escuela', function (Blueprint $table): void {
            $table->boolean('registro_tutores_activo')->default(false)->after('acceso_administrativo');
        });
    }

    public function down(): void
    {
        Schema::table('configuracion_escuela', function (Blueprint $table): void {
            $table->dropColumn('registro_tutores_activo');
        });
    }
};
