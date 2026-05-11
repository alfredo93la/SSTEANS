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
            $table->string('logo_url')->nullable()->after('nombre');
        });
    }

    public function down(): void
    {
        Schema::table('configuracion_escuela', function (Blueprint $table) {
            $table->dropColumn('logo_url');
        });
    }
};
