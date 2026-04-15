<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tutor_alumno', function (Blueprint $table) {
            $table->unique('alumno_id');
        });
    }

    public function down(): void
    {
        Schema::table('tutor_alumno', function (Blueprint $table) {
            $table->dropUnique(['alumno_id']);
        });
    }
};
