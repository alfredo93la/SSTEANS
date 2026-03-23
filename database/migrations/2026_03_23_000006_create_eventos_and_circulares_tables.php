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
        Schema::create('eventos', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->date('fecha');
            $table->time('hora_inicio')->nullable();
            $table->time('hora_fin')->nullable();
            $table->string('tipo', 100);
            $table->string('grupo')->default('General');
            $table->string('materia')->default('-');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('circulares', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('descripcion');
            $table->longText('contenido');
            $table->string('categoria', 100);
            $table->string('prioridad', 50);
            $table->date('fecha_publicacion');
            $table->foreignId('publicado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('circular_destinatarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('circular_id')->constrained('circulares')->cascadeOnDelete();
            $table->string('rol', 100);
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
        Schema::dropIfExists('eventos');
    }
};
