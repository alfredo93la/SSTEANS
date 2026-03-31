<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Configuración general de la escuela (singleton)
        Schema::create('configuracion_escuela', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->default('');
            $table->string('numero')->nullable();
            $table->string('cct', 20)->nullable();
            $table->string('turno_escuela')->nullable(); // turno real de la escuela (informativo)
            $table->enum('turnos_disponibles', ['matutino', 'vespertino', 'ambos'])->default('matutino');
            $table->string('director')->nullable();
            $table->string('telefono', 30)->nullable();
            $table->string('correo')->nullable();
            $table->text('direccion')->nullable();
            $table->string('nivel_educativo')->default('Secundaria');
            $table->string('servicio_educativo')->default('General');
            $table->tinyInteger('minimo_aprobatorio')->default(6);
            $table->string('escala_calificacion')->default('0-10');
            $table->boolean('permitir_captura')->default(true);
            $table->boolean('notificaciones')->default(true);
            $table->boolean('registro_tutores')->default(false);
            $table->timestamps();
        });

        // 2. Ciclos escolares
        Schema::create('ciclos_escolares', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 20)->unique(); // ej. "2024-2025"
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->boolean('activo')->default(false);
            $table->boolean('cerrado')->default(false);
            $table->timestamps();
        });

        // 3. Grados (1°, 2°, 3°) — datos estáticos
        Schema::create('grados', function (Blueprint $table) {
            $table->id();
            $table->tinyInteger('numero')->unique(); // 1, 2, 3
            $table->string('descripcion');
            $table->timestamps();
        });

        // 4. Materias por grado
        Schema::create('materias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grado_id')->constrained('grados')->cascadeOnDelete();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->tinyInteger('horas_semanales')->default(3);
            $table->timestamps();

            $table->unique(['grado_id', 'nombre']);
        });

        // 5. Salones / aulas
        Schema::create('salones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50);
            $table->string('edificio', 50)->nullable();
            $table->tinyInteger('capacidad')->default(40);
            $table->enum('turno', ['matutino', 'vespertino', 'ambos'])->default('ambos');
            $table->timestamps();
        });

        // 6. Grupos (por ciclo + grado)
        Schema::create('grupos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ciclo_escolar_id')->constrained('ciclos_escolares')->cascadeOnDelete();
            $table->foreignId('grado_id')->constrained('grados');
            $table->string('nombre', 5); // A, B, C …
            $table->enum('turno', ['matutino', 'vespertino']);
            $table->tinyInteger('capacidad_maxima')->default(40);
            $table->timestamps();

            $table->unique(['ciclo_escolar_id', 'grado_id', 'nombre', 'turno']);
        });

        // 7. Clases / horario (cada entrada = materia+profesor+grupo en un slot)
        Schema::create('clases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ciclo_escolar_id')->constrained('ciclos_escolares')->cascadeOnDelete();
            $table->foreignId('grupo_id')->constrained('grupos')->cascadeOnDelete();
            $table->foreignId('materia_id')->constrained('materias');
            $table->foreignId('profesor_user_id')->constrained('users');
            $table->foreignId('salon_id')->nullable()->constrained('salones')->nullOnDelete();
            $table->enum('dia_semana', ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']);
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->timestamps();
        });

        // 8. Asignaciones de grupo (alumno asignado a un grupo por ciclo)
        Schema::create('asignaciones_grupo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained('alumnos')->cascadeOnDelete();
            $table->foreignId('grupo_id')->constrained('grupos')->cascadeOnDelete();
            $table->foreignId('ciclo_escolar_id')->constrained('ciclos_escolares')->cascadeOnDelete();
            $table->date('fecha_asignacion')->useCurrent();
            $table->enum('estado', ['activo', 'baja'])->default('activo');
            $table->timestamps();

            $table->unique(['alumno_id', 'ciclo_escolar_id']); // un alumno = un grupo por ciclo
        });


        // --- Datos iniciales ---

        // Registro singleton de configuración
        DB::table('configuracion_escuela')->insert([
            'nombre'              => '',
            'turnos_disponibles'  => 'matutino',
            'nivel_educativo'     => 'Secundaria',
            'servicio_educativo'  => 'General',
            'minimo_aprobatorio'  => 6,
            'escala_calificacion' => '0-10',
            'permitir_captura'    => true,
            'notificaciones'      => true,
            'registro_tutores'    => false,
            'created_at'          => now(),
            'updated_at'          => now(),
        ]);

        // Ciclos escolares
        DB::table('ciclos_escolares')->insert([
            ['nombre' => '2024-2025', 'fecha_inicio' => '2024-08-26', 'fecha_fin' => '2025-07-16', 'activo' => false, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => '2025-2026', 'fecha_inicio' => '2025-09-01', 'fecha_fin' => '2026-07-15', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Grados
        DB::table('grados')->insert([
            ['numero' => 1, 'descripcion' => 'Primer Grado',    'created_at' => now(), 'updated_at' => now()],
            ['numero' => 2, 'descripcion' => 'Segundo Grado',   'created_at' => now(), 'updated_at' => now()],
            ['numero' => 3, 'descripcion' => 'Tercer Grado',    'created_at' => now(), 'updated_at' => now()],
        ]);

        // Salones
        DB::table('salones')->insert([
            ['nombre' => 'Aula 1', 'edificio' => 'Principal', 'capacidad' => 40, 'turno' => 'ambos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Aula 2', 'edificio' => 'Principal', 'capacidad' => 40, 'turno' => 'ambos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Aula 3', 'edificio' => 'Principal', 'capacidad' => 40, 'turno' => 'ambos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Aula 4', 'edificio' => 'Principal', 'capacidad' => 40, 'turno' => 'ambos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Aula 5', 'edificio' => 'Principal', 'capacidad' => 40, 'turno' => 'ambos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Laboratorio de Ciencias', 'edificio' => 'Anexo', 'capacidad' => 30, 'turno' => 'ambos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Sala de Computo', 'edificio' => 'Anexo', 'capacidad' => 30, 'turno' => 'ambos', 'created_at' => now(), 'updated_at' => now()],
        ]);



        // Materias por grado (plan de estudios SEP secundaria general)
        $grado1 = DB::table('grados')->where('numero', 1)->value('id');
        $grado2 = DB::table('grados')->where('numero', 2)->value('id');
        $grado3 = DB::table('grados')->where('numero', 3)->value('id');

        $now = now();
        DB::table('materias')->insert([
            // 1° Grado
            ['grado_id' => $grado1, 'nombre' => 'Español I',                          'horas_semanales' => 5, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado1, 'nombre' => 'Matemáticas I',                      'horas_semanales' => 5, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado1, 'nombre' => 'Ciencias I - Biología',              'horas_semanales' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado1, 'nombre' => 'Historia I',                         'horas_semanales' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado1, 'nombre' => 'Geografía',                          'horas_semanales' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado1, 'nombre' => 'Formación Cívica y Ética I',         'horas_semanales' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado1, 'nombre' => 'Inglés I',                           'horas_semanales' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado1, 'nombre' => 'Artes I',                            'horas_semanales' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado1, 'nombre' => 'Educación Física I',                 'horas_semanales' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado1, 'nombre' => 'Tecnología I',                       'horas_semanales' => 1, 'created_at' => $now, 'updated_at' => $now],
            // 2° Grado
            ['grado_id' => $grado2, 'nombre' => 'Español II',                         'horas_semanales' => 5, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado2, 'nombre' => 'Matemáticas II',                     'horas_semanales' => 5, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado2, 'nombre' => 'Ciencias II - Física',               'horas_semanales' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado2, 'nombre' => 'Historia II',                        'horas_semanales' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado2, 'nombre' => 'Formación Cívica y Ética II',        'horas_semanales' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado2, 'nombre' => 'Inglés II',                          'horas_semanales' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado2, 'nombre' => 'Artes II',                           'horas_semanales' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado2, 'nombre' => 'Educación Física II',                'horas_semanales' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado2, 'nombre' => 'Tecnología II',                       'horas_semanales' => 1, 'created_at' => $now, 'updated_at' => $now],
            // 3° Grado
            ['grado_id' => $grado3, 'nombre' => 'Español III',                        'horas_semanales' => 5, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado3, 'nombre' => 'Matemáticas III',                    'horas_semanales' => 5, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado3, 'nombre' => 'Ciencias III - Química',             'horas_semanales' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado3, 'nombre' => 'Historia III',                       'horas_semanales' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado3, 'nombre' => 'Formación Cívica y Ética III',       'horas_semanales' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado3, 'nombre' => 'Inglés III',                         'horas_semanales' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado3, 'nombre' => 'Artes III',                          'horas_semanales' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado3, 'nombre' => 'Educación Física III',               'horas_semanales' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['grado_id' => $grado3, 'nombre' => 'Tecnología III',                      'horas_semanales' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Grupos (ejemplo para ciclo activo + 3 grados + turno matutino)
        $cicloActivo = DB::table('ciclos_escolares')->where('activo', true)->value('id');
        $grados = DB::table('grados')->pluck('id', 'numero');
        $turnos = ['matutino', 'vespertino'];
        $gruposData = [];
        foreach ($grados as $numero => $id) {
            foreach ($turnos as $turno) {
                $gruposData[] = [
                    'ciclo_escolar_id' => $cicloActivo,
                    'grado_id' => $id,
                    'nombre' => 'A',
                    'turno' => $turno,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        DB::table('grupos')->insert($gruposData);
    }

    public function down(): void
    {
        Schema::dropIfExists('asignaciones_grupo');
        Schema::dropIfExists('clases');
        Schema::dropIfExists('grupos');
        Schema::dropIfExists('salones');
        Schema::dropIfExists('materias');
        Schema::dropIfExists('grados');
        Schema::dropIfExists('ciclos_escolares');
        Schema::dropIfExists('configuracion_escuela');
    }
};
