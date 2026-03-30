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
        Schema::create('agenda_eventos', function (Blueprint $table) {
            $table->id();
            $table->date('fecha');
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->time('hora_inicio')->nullable();
            $table->time('hora_fin')->nullable();
            $table->string('tipo');
            $table->timestamps();
        });

        Schema::create('circulares', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('descripcion');
            $table->text('contenido');
            $table->string('categoria');
            $table->string('prioridad');
            $table->foreignId('publicado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('circular_destinatarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('circular_id')->constrained('circulares')->cascadeOnDelete();
            $table->string('rol');
            $table->timestamps();

            $table->unique(['circular_id', 'rol']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('circular_destinatarios');
        Schema::dropIfExists('circulares');
        Schema::dropIfExists('agenda_eventos');
    }
};
