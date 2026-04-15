<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trab_sociales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('persona_id')->unique()->constrained('personas')->cascadeOnDelete();
            $table->string('horario', 100)->nullable();
            $table->string('extension', 20)->nullable();
            $table->timestamps();
        });

        Schema::create('profesores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('persona_id')->unique()->constrained('personas')->cascadeOnDelete();
            $table->string('academia', 100)->nullable();
            $table->string('cubiculo', 50)->nullable();
            $table->string('hora_entrada', 10)->nullable();
            $table->string('hora_salida', 10)->nullable();
            $table->timestamps();
        });

        Schema::create('pers_admins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('persona_id')->unique()->constrained('personas')->cascadeOnDelete();
            $table->string('cargo', 100)->nullable();
            $table->string('departamento', 100)->nullable();
            $table->string('extension', 20)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pers_admins');
        Schema::dropIfExists('profesores');
        Schema::dropIfExists('trab_sociales');
    }
};
