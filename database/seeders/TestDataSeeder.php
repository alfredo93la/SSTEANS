<?php

namespace Database\Seeders;

use App\Models\Alumno;
use App\Models\AsignacionGrupo;
use App\Models\Asistencia;
use App\Models\Calificacion;
use App\Models\CicloEscolar;
use App\Models\Clase;
use App\Models\Grado;
use App\Models\Grupo;
use App\Models\Materia;
use App\Models\Persona;
use App\Models\ReporteConducta;
use App\Models\Salon;
use App\Models\Tarea;
use App\Models\TareaEntrega;
use App\Models\Tutor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $ciclo     = CicloEscolar::where('activo', true)->firstOrFail();
        $grado1    = Grado::where('numero', 1)->firstOrFail();
        $grupo     = Grupo::where('ciclo_escolar_id', $ciclo->id)
                         ->where('grado_id', $grado1->id)
                         ->where('turno', 'matutino')
                         ->firstOrFail();
        $salon     = Salon::firstOrFail();
        $profesor  = User::where('email', 'profesor@ejemplo.com')->firstOrFail();
        $tutorUser = User::where('email', 'tutor@ejemplo.com')->firstOrFail();

        // ── 1. Persona + Tutor para el usuario tutor ─────────────────────────
        $personaTutor = Persona::firstOrCreate(
            ['curp' => 'LOPM750312MDFPRA01'],
            [
                'tipo_persona' => 'Tutor',
                'nombre'       => 'María',
                'apellidos'    => 'López Pérez',
                'telefono'     => '555-0001',
                'direccion'    => 'Av. Insurgentes 100, CDMX',
            ]
        );
        $tutorUser->update(['persona_id' => $personaTutor->id]);

        Tutor::firstOrCreate(
            ['persona_id' => $personaTutor->id],
            ['parentesco' => 'Madre', 'ocupacion' => 'Empleada']
        );

        // ── 2. Alumnos ────────────────────────────────────────────────────────
        $alumnosData = [
            ['curp' => 'ARCA120505HDFMRL01', 'nombre' => 'Carlos',   'apellidos' => 'Armas Ruiz',       'sexo' => 'Masculino', 'nacimiento' => '2012-05-05'],
            ['curp' => 'GOME120815MDFNRL02', 'nombre' => 'Sofía',    'apellidos' => 'Gómez Navarro',    'sexo' => 'Femenino',  'nacimiento' => '2012-08-15'],
            ['curp' => 'HERS120223HDFRNL03', 'nombre' => 'Diego',    'apellidos' => 'Hernández Soto',   'sexo' => 'Masculino', 'nacimiento' => '2012-02-23'],
            ['curp' => 'FLOL121101MDFRRR04', 'nombre' => 'Valeria',  'apellidos' => 'Flores Reyes',     'sexo' => 'Femenino',  'nacimiento' => '2012-11-01'],
            ['curp' => 'MORA121212HDFRTL05', 'nombre' => 'Andrés',   'apellidos' => 'Mora Torres',      'sexo' => 'Masculino', 'nacimiento' => '2012-12-12'],
            ['curp' => 'RAMG120630MDFZRL06', 'nombre' => 'Gabriela', 'apellidos' => 'Ramírez González', 'sexo' => 'Femenino',  'nacimiento' => '2012-06-30'],
        ];

        $alumnos = collect($alumnosData)->map(function ($data) use ($ciclo, $grupo) {
            $persona = Persona::firstOrCreate(
                ['curp' => $data['curp']],
                [
                    'tipo_persona' => 'Alumno',
                    'nombre'       => $data['nombre'],
                    'apellidos'    => $data['apellidos'],
                ]
            );

            $alumno = Alumno::firstOrCreate(
                ['persona_id' => $persona->id],
                [
                    'estado'           => 'Activo',
                    'fecha_nacimiento' => $data['nacimiento'],
                    'sexo'             => $data['sexo'],
                ]
            );

            AsignacionGrupo::firstOrCreate(
                ['alumno_id' => $alumno->id, 'ciclo_escolar_id' => $ciclo->id],
                [
                    'grupo_id'         => $grupo->id,
                    'fecha_asignacion' => $ciclo->fecha_inicio,
                    'estado'           => 'activo',
                ]
            );

            return $alumno;
        });

        // ── 3. Vincular alumnos al tutor ──────────────────────────────────────
        $tutor = Tutor::where('persona_id', $personaTutor->id)->firstOrFail();
        foreach ($alumnos as $alumno) {
            $tutor->alumnos()->syncWithoutDetaching([
                $alumno->id => ['fecha_vinculacion' => $ciclo->fecha_inicio],
            ]);
        }

        // ── 4. Horario (clases) — rango 08:00–14:00 para coincidir con la vista ──
        $materias = Materia::where('grado_id', $grado1->id)->get()->keyBy('nombre');

        // Cada entrada: [dia, hora_inicio, hora_fin, materia]
        // El frontend muestra slots: 08:00-09:00 … 13:00-14:00 (6 franjas por día).
        // Se cubre 4 franjas por día para un horario realista de 1° grado.
        $horario = [
            ['lunes',     '08:00', '09:00', 'Español I'],
            ['lunes',     '09:00', '10:00', 'Matemáticas I'],
            ['lunes',     '10:00', '11:00', 'Ciencias I - Biología'],
            ['lunes',     '11:00', '12:00', 'Historia I'],

            ['martes',    '08:00', '09:00', 'Español I'],
            ['martes',    '09:00', '10:00', 'Matemáticas I'],
            ['martes',    '10:00', '11:00', 'Geografía'],
            ['martes',    '11:00', '12:00', 'Inglés I'],

            ['miercoles', '08:00', '09:00', 'Español I'],
            ['miercoles', '09:00', '10:00', 'Matemáticas I'],
            ['miercoles', '10:00', '11:00', 'Ciencias I - Biología'],
            ['miercoles', '11:00', '12:00', 'Formación Cívica y Ética I'],

            ['jueves',    '08:00', '09:00', 'Historia I'],
            ['jueves',    '09:00', '10:00', 'Inglés I'],
            ['jueves',    '10:00', '11:00', 'Geografía'],
            ['jueves',    '11:00', '12:00', 'Español I'],

            ['viernes',   '08:00', '09:00', 'Matemáticas I'],
            ['viernes',   '09:00', '10:00', 'Artes I'],
            ['viernes',   '10:00', '11:00', 'Educación Física I'],
            ['viernes',   '11:00', '12:00', 'Tecnología I'],
        ];

        foreach ($horario as [$dia, $inicio, $fin, $materiaNombre]) {
            $materia = $materias[$materiaNombre] ?? null;
            if (! $materia) {
                continue;
            }

            Clase::firstOrCreate(
                [
                    'ciclo_escolar_id' => $ciclo->id,
                    'grupo_id'         => $grupo->id,
                    'materia_id'       => $materia->id,
                    'dia_semana'       => $dia,
                    'hora_inicio'      => $inicio,
                ],
                [
                    'profesor_user_id' => $profesor->id,
                    'salon_id'         => $salon->id,
                    'hora_fin'         => $fin,
                ]
            );
        }

        // ── 5. Calificaciones (Trimestres 1 y 2) ─────────────────────────────
        $materiasCalif = $materias->only([
            'Español I', 'Matemáticas I', 'Ciencias I - Biología',
            'Historia I', 'Geografía', 'Inglés I',
        ]);

        $calData = [
            // [alumno_idx, materia, t1_parc, t1_proy, t1_exam, t2_parc, t2_proy, t2_exam]
            [0, 'Español I',             8.5, 9.0,  8.0,  9.0,  8.5,  9.5],
            [0, 'Matemáticas I',         7.0, 7.5,  6.5,  7.5,  8.0,  7.0],
            [0, 'Ciencias I - Biología', 9.0, 8.5,  9.5,  8.5,  9.0,  9.0],
            [0, 'Historia I',            8.0, 8.5,  7.5,  8.5,  8.0,  9.0],
            [0, 'Geografía',             7.5, 8.0,  7.0,  8.0,  7.5,  8.5],
            [0, 'Inglés I',              9.0, 9.5,  8.5,  9.5,  9.0, 10.0],

            [1, 'Español I',             9.5, 9.0, 10.0,  9.5, 10.0,  9.0],
            [1, 'Matemáticas I',         8.0, 8.5,  8.5,  8.5,  9.0,  8.0],
            [1, 'Ciencias I - Biología', 8.5, 9.0,  8.0,  9.0,  8.5,  9.5],
            [1, 'Historia I',            9.0, 9.5,  8.5,  9.5,  9.0, 10.0],
            [1, 'Geografía',             8.5, 9.0,  8.0,  9.0,  8.5,  9.5],
            [1, 'Inglés I',              9.5,10.0,  9.0, 10.0,  9.5, 10.0],

            [2, 'Español I',             7.0, 6.5,  7.5,  7.5,  7.0,  8.0],
            [2, 'Matemáticas I',         6.5, 7.0,  6.0,  7.0,  6.5,  7.5],
            [2, 'Ciencias I - Biología', 7.5, 7.0,  8.0,  8.0,  7.5,  8.5],
            [2, 'Historia I',            8.0, 7.5,  8.5,  8.5,  8.0,  9.0],
            [2, 'Geografía',             6.5, 7.0,  6.0,  7.0,  6.5,  7.5],
            [2, 'Inglés I',              7.0, 7.5,  6.5,  7.5,  7.0,  8.0],

            [3, 'Español I',             8.0, 8.5,  8.5,  9.0,  8.5,  9.5],
            [3, 'Matemáticas I',         9.0, 9.5,  9.0,  9.5,  9.0, 10.0],
            [3, 'Ciencias I - Biología', 8.5, 8.0,  9.0,  9.0,  8.5,  9.5],
            [3, 'Historia I',            7.5, 8.0,  7.0,  8.0,  7.5,  8.5],
            [3, 'Geografía',             9.0, 9.5,  8.5,  9.5,  9.0, 10.0],
            [3, 'Inglés I',              8.0, 8.5,  7.5,  8.5,  8.0,  9.0],

            [4, 'Español I',             6.0, 6.5,  5.5,  6.5,  6.0,  7.0],
            [4, 'Matemáticas I',         7.5, 7.0,  8.0,  8.0,  7.5,  8.5],
            [4, 'Ciencias I - Biología', 6.5, 7.0,  6.0,  7.0,  6.5,  7.5],
            [4, 'Historia I',            7.0, 7.5,  6.5,  7.5,  7.0,  8.0],
            [4, 'Geografía',             6.0, 6.5,  5.5,  6.5,  6.0,  7.0],
            [4, 'Inglés I',              7.5, 8.0,  7.0,  8.0,  7.5,  8.5],

            [5, 'Español I',             8.5, 9.0,  9.0,  9.0,  9.5,  8.5],
            [5, 'Matemáticas I',         8.0, 8.5,  7.5,  8.5,  8.0,  9.0],
            [5, 'Ciencias I - Biología', 9.5, 9.0, 10.0,  9.5, 10.0,  9.0],
            [5, 'Historia I',            8.5, 8.0,  9.0,  9.0,  8.5,  9.5],
            [5, 'Geografía',             9.0, 9.5,  8.5,  9.5,  9.0, 10.0],
            [5, 'Inglés I',              8.0, 8.5,  7.5,  8.5,  8.0,  9.0],
        ];

        foreach ($calData as [$idx, $materiaNombre, $p1parc, $p1proy, $p1exam, $p2parc, $p2proy, $p2exam]) {
            $alumno  = $alumnos[$idx];
            $materia = $materiasCalif[$materiaNombre] ?? null;
            if (! $materia) {
                continue;
            }

            Calificacion::updateOrCreate(
                ['alumno_id' => $alumno->id, 'materia_id' => $materia->id, 'ciclo_escolar_id' => $ciclo->id, 'periodo' => 1],
                ['parcial' => $p1parc, 'proyecto' => $p1proy, 'examen' => $p1exam, 'promedio' => round(($p1parc + $p1proy + $p1exam) / 3, 2)]
            );

            Calificacion::updateOrCreate(
                ['alumno_id' => $alumno->id, 'materia_id' => $materia->id, 'ciclo_escolar_id' => $ciclo->id, 'periodo' => 2],
                ['parcial' => $p2parc, 'proyecto' => $p2proy, 'examen' => $p2exam, 'promedio' => round(($p2parc + $p2proy + $p2exam) / 3, 2)]
            );
        }

        // ── 6. Asistencias — múltiples materias, fechas recientes ────────────
        // Recoge las últimas 10 fechas escolares hasta hoy
        $diasHabiles = collect();
        $hoy  = Carbon::today();
        $date = $hoy->copy();
        while ($diasHabiles->count() < 10) {
            if (! $date->isWeekend()) {
                $diasHabiles->prepend($date->toDateString());
            }
            $date->subDay();
        }

        $estadosPorAlumno = [
            // 10 registros por alumno
            0 => ['Presente','Presente','Presente','Presente','Presente','Presente','Presente','Presente','Presente','Presente'],
            1 => ['Presente','Presente','Falta',   'Presente','Presente','Presente','Presente','Retardo', 'Presente','Presente'],
            2 => ['Presente','Falta',   'Presente','Presente','Retardo', 'Presente','Falta',   'Presente','Presente','Presente'],
            3 => ['Presente','Presente','Presente','Presente','Presente','Presente','Presente','Presente','Falta',   'Presente'],
            4 => ['Falta',   'Presente','Falta',   'Presente','Presente','Retardo', 'Presente','Falta',   'Presente','Presente'],
            5 => ['Presente','Presente','Presente','Retardo', 'Presente','Presente','Presente','Presente','Presente','Presente'],
        ];

        // Siembra asistencias para 3 materias: Español, Matemáticas, Ciencias
        $materiasAsist = $materias->only(['Español I', 'Matemáticas I', 'Ciencias I - Biología'])->values();

        foreach ($alumnos as $idx => $alumno) {
            foreach ($diasHabiles->values() as $fechaIdx => $fecha) {
                $estadoBase = $estadosPorAlumno[$idx][$fechaIdx] ?? 'Presente';

                foreach ($materiasAsist as $materia) {
                    // Variación menor por materia para que los datos no sean idénticos
                    $estado = $estadoBase;
                    if ($materia->nombre === 'Matemáticas I' && $estadoBase === 'Presente' && $fechaIdx % 4 === 0 && $idx === 2) {
                        $estado = 'Retardo';
                    }

                    Asistencia::firstOrCreate(
                        ['alumno_id' => $alumno->id, 'materia_id' => $materia->id, 'fecha' => $fecha],
                        [
                            'ciclo_escolar_id' => $ciclo->id,
                            'registrado_por'   => $profesor->id,
                            'estado'           => $estado,
                        ]
                    );
                }
            }
        }

        // ── 7. Tareas — con fechas actuales/futuras ───────────────────────────
        $materiaEsp  = $materias['Español I'] ?? null;
        $materiasMat = $materias['Matemáticas I'] ?? null;
        $materiaCien = $materias['Ciencias I - Biología'] ?? null;

        // Fecha de referencia: hace 2 semanas (ya asignadas) con entrega esta semana y próxima
        $hoyRef = Carbon::today();
        $tareasData = [
            [
                'titulo'           => 'Ensayo: Género narrativo',
                'descripcion'      => 'Redactar un ensayo de 3 cuartillas sobre el género narrativo y sus elementos.',
                'materia'          => $materiaEsp,
                'fecha_asignacion' => $hoyRef->copy()->subDays(14)->toDateString(),
                'fecha_entrega'    => $hoyRef->copy()->addDays(3)->toDateString(),
            ],
            [
                'titulo'           => 'Ejercicios: Operaciones con fracciones',
                'descripcion'      => 'Resolver los ejercicios del 1 al 30 de la página 45 del libro de Matemáticas.',
                'materia'          => $materiasMat,
                'fecha_asignacion' => $hoyRef->copy()->subDays(10)->toDateString(),
                'fecha_entrega'    => $hoyRef->copy()->addDays(7)->toDateString(),
            ],
            [
                'titulo'           => 'Mapa conceptual: La célula',
                'descripcion'      => 'Elaborar un mapa conceptual sobre la estructura y función de la célula.',
                'materia'          => $materiaCien,
                'fecha_asignacion' => $hoyRef->copy()->subDays(7)->toDateString(),
                'fecha_entrega'    => $hoyRef->copy()->addDays(14)->toDateString(),
            ],
        ];

        $estadosEntrega = [
            0 => ['Entregada', 'Entregada', 'Pendiente'],
            1 => ['Entregada', 'Entregada', 'Pendiente'],
            2 => ['Tarde',     'Pendiente', 'Pendiente'],
            3 => ['Entregada', 'Entregada', 'Pendiente'],
            4 => ['Pendiente', 'Tarde',     'Pendiente'],
            5 => ['Entregada', 'Entregada', 'Pendiente'],
        ];

        foreach ($tareasData as $tIdx => $tData) {
            if (! $tData['materia']) {
                continue;
            }

            $tarea = Tarea::firstOrCreate(
                [
                    'titulo'           => $tData['titulo'],
                    'grupo_id'         => $grupo->id,
                    'ciclo_escolar_id' => $ciclo->id,
                ],
                [
                    'descripcion'      => $tData['descripcion'],
                    'materia_id'       => $tData['materia']->id,
                    'asignado_por'     => $profesor->id,
                    'fecha_asignacion' => $tData['fecha_asignacion'],
                    'fecha_entrega'    => $tData['fecha_entrega'],
                ]
            );

            foreach ($alumnos as $aIdx => $alumno) {
                $estado       = $estadosEntrega[$aIdx][$tIdx] ?? 'Pendiente';
                $fechaEntrega = $estado !== 'Pendiente' ? $tData['fecha_entrega'] : null;

                TareaEntrega::firstOrCreate(
                    ['tarea_id' => $tarea->id, 'alumno_id' => $alumno->id],
                    ['estado' => $estado, 'fecha_entrega' => $fechaEntrega]
                );
            }
        }

        // ── 8. Reportes de Conducta ───────────────────────────────────────────
        $reportes = [
            [
                'alumno_idx'   => 2, // Diego
                'tipo_reporte' => 'Conducta disruptiva',
                'descripcion'  => 'El alumno interrumpió la clase en múltiples ocasiones durante la sesión de Español.',
                'observaciones'=> 'Se habló con el alumno al término de la clase. Muestra disposición de mejorar.',
                'fecha'        => $hoyRef->copy()->subDays(45)->toDateString(),
                'estatus'      => 'Cerrado',
            ],
            [
                'alumno_idx'   => 4, // Andrés
                'tipo_reporte' => 'Falta de materiales',
                'descripcion'  => 'El alumno llegó sin cuaderno ni materiales por tercera ocasión consecutiva.',
                'observaciones'=> 'Se solicitó comunicación con el tutor familiar.',
                'fecha'        => $hoyRef->copy()->subDays(30)->toDateString(),
                'estatus'      => 'En seguimiento',
            ],
            [
                'alumno_idx'   => 4, // Andrés
                'tipo_reporte' => 'Incidente con compañeros',
                'descripcion'  => 'Discusión verbal con otro alumno durante el recreo que requirió intervención.',
                'observaciones'=> 'Ambos alumnos fueron llamados a orientación.',
                'fecha'        => $hoyRef->copy()->subDays(10)->toDateString(),
                'estatus'      => 'Abierto',
            ],
            [
                'alumno_idx'   => 0, // Carlos
                'tipo_reporte' => 'Reconocimiento',
                'descripcion'  => 'El alumno obtuvo el primer lugar en el concurso de matemáticas de la escuela.',
                'observaciones'=> 'Se felicitó al alumno frente al grupo.',
                'fecha'        => $hoyRef->copy()->subDays(20)->toDateString(),
                'estatus'      => 'Cerrado',
            ],
        ];

        foreach ($reportes as $r) {
            ReporteConducta::firstOrCreate(
                [
                    'alumno_id'    => $alumnos[$r['alumno_idx']]->id,
                    'fecha'        => $r['fecha'],
                    'tipo_reporte' => $r['tipo_reporte'],
                ],
                [
                    'reportado_por' => $profesor->id,
                    'descripcion'   => $r['descripcion'],
                    'observaciones' => $r['observaciones'],
                    'estatus'       => $r['estatus'],
                ]
            );
        }

        $this->command->info('TestDataSeeder completado: 6 alumnos, horario (08:00-12:00), asistencias en 3 materias, tareas con fechas actuales, reportes de conducta.');
    }
}
