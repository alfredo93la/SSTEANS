<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('remitente_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('destinatario_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('titulo');
            $table->text('mensaje');
            $table->enum('tipo', ['Reporte', 'Alerta', 'Recordatorio', 'Información'])->default('Información');
            $table->enum('categoria', ['Académico', 'Administrativo', 'Evento', 'Conducta'])->default('Académico');
            $table->enum('prioridad', ['Alta', 'Media', 'Baja'])->default('Media');
            $table->boolean('leida')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};
