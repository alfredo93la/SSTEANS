<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reportes_conducta', function (Blueprint $table) {
            $table->string('gravedad')->default('Media')->after('tipo_reporte'); // Baja | Media | Alta
            $table->string('archivo_adjunto')->nullable()->after('observaciones'); // ruta relativa al archivo
        });
    }

    public function down(): void
    {
        Schema::table('reportes_conducta', function (Blueprint $table) {
            $table->dropColumn(['gravedad', 'archivo_adjunto']);
        });
    }
};
