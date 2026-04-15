<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained('alumnos')->cascadeOnDelete();
            $table->foreignId('materia_id')->constrained('materias')->cascadeOnDelete();
            $table->foreignId('ciclo_escolar_id')->constrained('ciclos_escolares')->cascadeOnDelete();
            $table->tinyInteger('periodo'); // 1, 2, 3
            $table->decimal('parcial', 5, 2)->nullable();
            $table->decimal('proyecto', 5, 2)->nullable();
            $table->decimal('examen', 5, 2)->nullable();
            $table->decimal('promedio', 5, 2)->nullable();
            $table->timestamps();
            $table->unique(['alumno_id', 'materia_id', 'ciclo_escolar_id', 'periodo'], 'calificacion_unica');
        });

        Schema::create('asistencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained('alumnos')->cascadeOnDelete();
            $table->foreignId('materia_id')->constrained('materias')->cascadeOnDelete();
            $table->foreignId('ciclo_escolar_id')->constrained('ciclos_escolares')->cascadeOnDelete();
            $table->foreignId('registrado_por')->constrained('users');
            $table->date('fecha');
            $table->enum('estado', ['Presente', 'Falta', 'Retardo'])->default('Presente');
            $table->timestamps();
            $table->unique(['alumno_id', 'materia_id', 'fecha'], 'asistencia_unica');
        });

        Schema::create('tareas', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->foreignId('materia_id')->constrained('materias')->cascadeOnDelete();
            $table->foreignId('grupo_id')->constrained('grupos')->cascadeOnDelete();
            $table->foreignId('ciclo_escolar_id')->constrained('ciclos_escolares')->cascadeOnDelete();
            $table->foreignId('asignado_por')->constrained('users');
            $table->date('fecha_asignacion');
            $table->date('fecha_entrega');
            $table->timestamps();
        });

        Schema::create('tarea_entregas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tarea_id')->constrained('tareas')->cascadeOnDelete();
            $table->foreignId('alumno_id')->constrained('alumnos')->cascadeOnDelete();
            $table->enum('estado', ['Pendiente', 'Entregada', 'Tarde'])->default('Pendiente');
            $table->date('fecha_entrega')->nullable();
            $table->timestamps();
            $table->unique(['tarea_id', 'alumno_id'], 'entrega_unica');
        });

        Schema::create('reportes_conducta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained('alumnos')->cascadeOnDelete();
            $table->foreignId('reportado_por')->constrained('users');
            $table->string('tipo_reporte');
            $table->text('descripcion');
            $table->text('observaciones')->nullable();
            $table->date('fecha');
            $table->string('estatus')->default('Abierto');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes_conducta');
        Schema::dropIfExists('tarea_entregas');
        Schema::dropIfExists('tareas');
        Schema::dropIfExists('asistencias');
        Schema::dropIfExists('calificaciones');
    }
};
