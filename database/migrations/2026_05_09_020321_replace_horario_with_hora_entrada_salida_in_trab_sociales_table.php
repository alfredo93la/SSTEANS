<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trab_sociales', function (Blueprint $table) {
            $table->dropColumn('horario');
            $table->time('hora_entrada')->nullable()->after('persona_id');
            $table->time('hora_salida')->nullable()->after('hora_entrada');
        });
    }

    public function down(): void
    {
        Schema::table('trab_sociales', function (Blueprint $table) {
            $table->dropColumn(['hora_entrada', 'hora_salida']);
            $table->string('horario', 100)->nullable()->after('persona_id');
        });
    }
};
