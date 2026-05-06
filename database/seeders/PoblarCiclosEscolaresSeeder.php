<?php

namespace Database\Seeders;

use App\Models\Alumno;
use App\Models\AsignacionGrupo;
use App\Models\Calificacion;
use App\Models\CicloEscolar;
use App\Models\Clase;
use App\Models\Grado;
use App\Models\Grupo;
use App\Models\Materia;
use App\Models\PeriodoEvaluacion;
use App\Models\Persona;
use App\Models\RubroEvaluacion;
use App\Models\Salon;
use App\Models\Tarea;
use App\Models\Tutor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PoblarCiclosEscolaresSeeder extends Seeder
{
    private User  $prof1;   // usado solo para asistencias/tareas (registrado_por / asignado_por)
    private int   $salonId;
    private array $profesoresCache = []; // un profesor dedicado por combinación grado+grupo

    // Acumuladores para bulk-insert
    private array $asistencias       = [];
    private array $calDetalles       = [];
    private array $tareaEntregas     = [];

    private const MASC = [
        'Miguel','Carlos','Juan','Diego','Luis','Andrés','José','Roberto',
        'Sergio','Fernando','Alejandro','Raúl','Eduardo','Manuel','Ricardo',
        'Alfredo','Jorge','Pablo','Víctor','Ernesto',
    ];
    private const FEM = [
        'María','Ana','Sofía','Valeria','Gabriela','Laura','Patricia','Isabel',
        'Carmen','Rosa','Daniela','Fernanda','Claudia','Elena','Verónica',
        'Sandra','Leticia','Adriana','Beatriz','Guadalupe',
    ];
    private const APELLIDOS = [
        'García','Martínez','López','González','Rodríguez','Pérez','Sánchez',
        'Ramírez','Torres','Flores','Hernández','Jiménez','Morales','Ruiz',
        'Díaz','Vargas','Castro','Reyes','Ortiz','Mendoza',
    ];
    private const PARENTESCOS_M = ['Padre','Abuelo','Tío','Hermano'];
    private const PARENTESCOS_F = ['Madre','Abuela','Tía','Hermana'];

    // ─────────────────────────────────────────────────────────────
    public function run(): void
    {
        $this->setupProfesores();
        $this->salonId = Salon::firstOrFail()->id;

        $ciclo2425 = CicloEscolar::where('nombre', '2024-2025')->firstOrFail();
        $ciclo2526 = CicloEscolar::where('nombre', '2025-2026')->firstOrFail();

        // 2024-2025 → los 3 trimestres completos
        $periodos2425 = PeriodoEvaluacion::where('ciclo_escolar_id', $ciclo2425->id)
            ->orderBy('nombre')->get();

        // 2025-2026 → solo T1 y T2 (el T3 aún no llega)
        $periodos2526 = PeriodoEvaluacion::where('ciclo_escolar_id', $ciclo2526->id)
            ->whereIn('nombre', ['Trimestre 1','Trimestre 2'])
            ->orderBy('nombre')->get();

        $this->command->info('▶ Creando grupos faltantes para 2024-2025 (grados 2° y 3°)...');
        $this->crearGruposFaltantes($ciclo2425);

        $this->command->info('▶ Poblando ciclo 2024-2025 (3 trimestres completos)...');
        $this->sembrarCiclo(
            ciclo:   $ciclo2425,
            periodos: $periodos2425,
            isActivo: false,
            seed:    1000,
            rangosAsistencias: [
                ['2024-08-26', '2024-11-29', 18],
                ['2024-12-02', '2025-03-21', 18],
                ['2025-04-07', '2025-07-11', 18],
            ]
        );

        $this->command->info('▶ Poblando ciclo 2025-2026 (T1 y T2 únicamente)...');
        $this->sembrarCiclo(
            ciclo:   $ciclo2526,
            periodos: $periodos2526,
            isActivo: true,
            seed:    2000,
            rangosAsistencias: [
                ['2025-09-01', '2025-11-28', 12],
                ['2025-12-01', '2026-03-27', 12],
            ]
        );

        $this->command->info('▶ Guardando asistencias en lote...');
        $this->flush('asistencias', $this->asistencias);

        $this->command->info('▶ Guardando detalles de calificaciones en lote...');
        $this->flush('calificacion_detalle', $this->calDetalles);

        $this->command->info('▶ Guardando entregas de tareas en lote...');
        $this->flush('tarea_entregas', $this->tareaEntregas);

        $this->command->info('✔ PoblarCiclosEscolaresSeeder completado.');
    }

    // ─────────────────────────────────────────────────────────────
    private function setupProfesores(): void
    {
        $this->prof1 = User::where('email', 'profesor@ejemplo.com')->firstOrFail();
    }

    // Devuelve (creando si hace falta) un profesor exclusivo para este grupo.
    // Email: prof.g{grado}{grupo}@ejemplo.com  →  Prof. 1°A, Prof. 2°B, etc.
    // Cada profesor solo enseña en UN grupo → imposible solapamiento de horarios.
    private function getProfesorGrupo(Grupo $grupo): User
    {
        $key = "{$grupo->grado_id}_{$grupo->nombre}";

        if (!isset($this->profesoresCache[$key])) {
            $gradoNum = $grupo->grado->numero;
            $email    = "prof.g{$gradoNum}{$grupo->nombre}@ejemplo.com";

            $this->profesoresCache[$key] = User::firstOrCreate(
                ['email' => strtolower($email)],
                [
                    'name'     => "Prof. {$gradoNum}°{$grupo->nombre}",
                    'password' => Hash::make('password'),
                    'role'     => 'Profesor',
                ]
            );
        }

        return $this->profesoresCache[$key];
    }

    private function crearGruposFaltantes(CicloEscolar $ciclo): void
    {
        $grado2 = Grado::where('numero', 2)->firstOrFail();
        $grado3 = Grado::where('numero', 3)->firstOrFail();

        foreach (['A','B','C'] as $nombre) {
            Grupo::firstOrCreate(
                ['ciclo_escolar_id' => $ciclo->id, 'grado_id' => $grado2->id, 'nombre' => $nombre, 'turno' => 'matutino'],
                ['capacidad_maxima' => 40]
            );
            Grupo::firstOrCreate(
                ['ciclo_escolar_id' => $ciclo->id, 'grado_id' => $grado3->id, 'nombre' => $nombre, 'turno' => 'matutino'],
                ['capacidad_maxima' => 40]
            );
        }
    }

    // ─────────────────────────────────────────────────────────────
    private function sembrarCiclo(
        CicloEscolar $ciclo,
        $periodos,
        bool $isActivo,
        int $seed,
        array $rangosAsistencias
    ): void {
        $grupos = Grupo::where('ciclo_escolar_id', $ciclo->id)
            ->with('grado')
            ->orderBy('grado_id')
            ->orderBy('nombre')
            ->get();

        $globalIdx = $seed;

        foreach ($grupos as $grupo) {
            $materias = Materia::where('grado_id', $grupo->grado_id)->orderBy('nombre')->get();
            $this->command->line("   Grado {$grupo->grado->numero}°{$grupo->nombre}  ({$materias->count()} materias)");

            $alumnos = $this->crearAlumnosEnGrupo($ciclo, $grupo, $globalIdx, $isActivo);
            $this->crearClases($ciclo, $grupo, $materias);
            $this->crearRubrosYCalificaciones($ciclo, $grupo, $materias, $periodos, $alumnos);
            $this->acumularAsistencias($ciclo, $grupo, $materias, $alumnos, $rangosAsistencias);
            $this->crearTareas($ciclo, $grupo, $materias, $periodos, $alumnos, $isActivo);

            $globalIdx += 20;
        }
    }

    // ── Alumnos y tutores ────────────────────────────────────────
    private function crearAlumnosEnGrupo(
        CicloEscolar $ciclo,
        Grupo $grupo,
        int $baseIdx,
        bool $isActivo
    ): \Illuminate\Support\Collection {
        $existing = Alumno::whereHas('asignaciones', fn($q) =>
            $q->where('ciclo_escolar_id', $ciclo->id)
              ->where('grupo_id', $grupo->id)
              ->where('estado', 'activo')
        )->get();

        $needed    = max(0, 8 - $existing->count());
        $gradoNum  = $grupo->grado->numero;
        $birthYear = ($isActivo ? 2012 : 2011) - ($gradoNum - 1);

        $nuevos = collect();
        for ($i = 0; $i < $needed; $i++) {
            $idx      = $baseIdx + $i;
            $esMasc   = ($i % 2 === 0);
            $nombres  = $esMasc ? self::MASC : self::FEM;
            $nombre   = $nombres[$idx % count($nombres)];
            $ap1      = self::APELLIDOS[$idx % count(self::APELLIDOS)];
            $ap2      = self::APELLIDOS[($idx + 7) % count(self::APELLIDOS)];
            $sexo     = $esMasc ? 'Masculino' : 'Femenino';

            $persona = Persona::firstOrCreate(
                ['curp' => $this->curp($ap1, $nombre, $birthYear, $sexo, $idx)],
                [
                    'tipo_persona' => 'Alumno',
                    'nombre'       => $nombre,
                    'apellidos'    => "{$ap1} {$ap2}",
                    'telefono'     => '555-' . str_pad($idx % 10000, 4, '0', STR_PAD_LEFT),
                    'direccion'    => "Calle {$i} #{$baseIdx}, CDMX",
                ]
            );

            $alumno = Alumno::firstOrCreate(
                ['persona_id' => $persona->id],
                ['estado' => 'Activo', 'fecha_nacimiento' => "{$birthYear}-03-15", 'sexo' => $sexo]
            );

            AsignacionGrupo::firstOrCreate(
                ['alumno_id' => $alumno->id, 'ciclo_escolar_id' => $ciclo->id],
                ['grupo_id' => $grupo->id, 'fecha_asignacion' => $ciclo->fecha_inicio, 'estado' => 'activo']
            );

            $this->crearTutorParaAlumno($alumno, $ciclo->fecha_inicio, $idx);
            $nuevos->push($alumno);
        }

        return $existing->merge($nuevos);
    }

    private function crearTutorParaAlumno(Alumno $alumno, $fechaVinculo, int $idx): void
    {
        if (DB::table('tutor_alumno')->where('alumno_id', $alumno->id)->exists()) return;

        $esMasc      = ($idx % 3 === 0);
        $nombres     = $esMasc ? self::MASC : self::FEM;
        $nombre      = $nombres[($idx + 5) % count($nombres)];
        $ap1         = self::APELLIDOS[($idx + 9)  % count(self::APELLIDOS)];
        $ap2         = self::APELLIDOS[($idx + 14) % count(self::APELLIDOS)];
        $sexo        = $esMasc ? 'Masculino' : 'Femenino';
        $parentesco  = $esMasc
            ? self::PARENTESCOS_M[$idx % count(self::PARENTESCOS_M)]
            : self::PARENTESCOS_F[$idx % count(self::PARENTESCOS_F)];

        $personaTutor = Persona::firstOrCreate(
            ['curp' => $this->curp($ap1, $nombre, 1982, $sexo, $idx + 5000)],
            [
                'tipo_persona' => 'Tutor',
                'nombre'       => $nombre,
                'apellidos'    => "{$ap1} {$ap2}",
                'telefono'     => '555-' . str_pad(($idx + 500) % 10000, 4, '0', STR_PAD_LEFT),
                'direccion'    => "Av. Principal #{$idx}, CDMX",
            ]
        );

        $tutor = Tutor::firstOrCreate(
            ['persona_id' => $personaTutor->id],
            ['ocupacion' => 'Empleado']
        );

        if (!DB::table('tutor_alumno')->where('alumno_id', $alumno->id)->exists()) {
            try {
                DB::table('tutor_alumno')->insert([
                    'tutor_id'          => $tutor->id,
                    'alumno_id'         => $alumno->id,
                    'fecha_vinculacion' => $fechaVinculo,
                    'parentesco'        => $parentesco,
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ]);
            } catch (\Exception) {
                // Ya existía el registro
            }
        }
    }

    // ── Clases / horario ─────────────────────────────────────────
    private function crearClases(CicloEscolar $ciclo, Grupo $grupo, $materias): void
    {
        // Skip if horario already exists for this group
        if (Clase::where('grupo_id', $grupo->id)->where('ciclo_escolar_id', $ciclo->id)->exists()) return;

        $profesor = $this->getProfesorGrupo($grupo);
        $slots = [
            ['lunes',     '08:00','09:00'],['lunes',    '09:00','10:00'],
            ['lunes',     '10:00','11:00'],['lunes',    '11:00','12:00'],
            ['martes',    '08:00','09:00'],['martes',   '09:00','10:00'],
            ['martes',    '10:00','11:00'],['martes',   '11:00','12:00'],
            ['miercoles', '08:00','09:00'],['miercoles','09:00','10:00'],
            ['miercoles', '10:00','11:00'],
            ['jueves',    '08:00','09:00'],['jueves',   '09:00','10:00'],
            ['jueves',    '10:00','11:00'],['jueves',   '11:00','12:00'],
            ['viernes',   '08:00','09:00'],['viernes',  '09:00','10:00'],
            ['viernes',   '10:00','11:00'],
        ];

        $mat = $materias->values();
        $rows = [];
        $now  = now();
        foreach ($slots as $sIdx => [$dia, $ini, $fin]) {
            $rows[] = [
                'ciclo_escolar_id' => $ciclo->id,
                'grupo_id'         => $grupo->id,
                'materia_id'       => $mat[$sIdx % $mat->count()]->id,
                'profesor_user_id' => $profesor->id,
                'salon_id'         => $this->salonId,
                'dia_semana'       => $dia,
                'hora_inicio'      => $ini,
                'hora_fin'         => $fin,
                'created_at'       => $now,
                'updated_at'       => $now,
            ];
        }
        DB::table('clases')->insertOrIgnore($rows);
    }

    // ── Rubros y calificaciones ──────────────────────────────────
    private function crearRubrosYCalificaciones(
        CicloEscolar $ciclo,
        Grupo $grupo,
        $materias,
        $periodos,
        $alumnos
    ): void {
        $profesor    = $this->getProfesorGrupo($grupo);
        $rubrosConf  = [
            ['nombre' => 'Parcial',  'ponderacion' => 33.33, 'orden' => 0],
            ['nombre' => 'Proyecto', 'ponderacion' => 33.33, 'orden' => 1],
            ['nombre' => 'Examen',   'ponderacion' => 33.34, 'orden' => 2],
        ];

        foreach ($periodos as $periodo) {
            foreach ($materias as $materia) {
                // Crear los 3 rubros para esta materia/grupo/periodo
                $rubros = [];
                foreach ($rubrosConf as $rc) {
                    $rubros[] = RubroEvaluacion::firstOrCreate(
                        [
                            'profesor_user_id'     => $profesor->id,
                            'materia_id'           => $materia->id,
                            'grupo_id'             => $grupo->id,
                            'ciclo_escolar_id'     => $ciclo->id,
                            'periodo_evaluacion_id'=> $periodo->id,
                            'nombre'               => $rc['nombre'],
                        ],
                        ['ponderacion' => $rc['ponderacion'], 'orden' => $rc['orden']]
                    );
                }

                // Calificación por alumno
                foreach ($alumnos as $aIdx => $alumno) {
                    $notas    = $this->generarNotas((int)$aIdx, $materia->id);
                    $promedio = round(array_sum($notas) / 3, 2);

                    $cal = Calificacion::firstOrCreate(
                        [
                            'alumno_id'            => $alumno->id,
                            'materia_id'           => $materia->id,
                            'periodo_evaluacion_id'=> $periodo->id,
                        ],
                        [
                            'ciclo_escolar_id' => $ciclo->id,
                            'promedio'         => $promedio,
                            'publicada'        => true,
                        ]
                    );

                    // Acumular detalles para bulk-insert
                    foreach ($rubros as $rIdx => $rubro) {
                        $this->calDetalles[] = [
                            'calificacion_id' => $cal->id,
                            'rubro_id'        => $rubro->id,
                            'valor'           => $notas[$rIdx],
                            'created_at'      => now(),
                            'updated_at'      => now(),
                        ];
                    }
                }
            }
        }
    }

    // ── Asistencias ──────────────────────────────────────────────
    private function acumularAsistencias(
        CicloEscolar $ciclo,
        Grupo $grupo,
        $materias,
        $alumnos,
        array $rangos
    ): void {
        $registradoPor  = $this->prof1->id;
        $materiasAsist  = $materias->take(3)->values();
        $now            = now();

        foreach ($rangos as [$desde, $hasta, $maxDias]) {
            $fechas = $this->diasHabiles($desde, $hasta, $maxDias);

            foreach ($alumnos as $aIdx => $alumno) {
                foreach ($fechas as $fIdx => $fecha) {
                    $estado = 'Presente';
                    if ($aIdx % 6 === 0 && $fIdx % 9 === 0)     $estado = 'Falta';
                    elseif ($aIdx % 4 === 0 && $fIdx % 7 === 0) $estado = 'Retardo';
                    elseif ($aIdx % 7 === 0 && $fIdx % 5 === 0) $estado = 'Falta';

                    foreach ($materiasAsist as $materia) {
                        $this->asistencias[] = [
                            'alumno_id'        => $alumno->id,
                            'materia_id'       => $materia->id,
                            'ciclo_escolar_id' => $ciclo->id,
                            'registrado_por'   => $registradoPor,
                            'fecha'            => $fecha,
                            'estado'           => $estado,
                            'created_at'       => $now,
                            'updated_at'       => $now,
                        ];
                    }
                }
            }
        }
    }

    // ── Tareas ───────────────────────────────────────────────────
    private function crearTareas(
        CicloEscolar $ciclo,
        Grupo $grupo,
        $materias,
        $periodos,
        $alumnos,
        bool $isActivo
    ): void {
        $asignadoPor = $this->prof1->id;
        $mat         = $materias->values();
        $now         = now();

        foreach ($periodos as $pIdx => $periodo) {
            $mat1 = $mat[$pIdx % $mat->count()];
            $mat2 = $mat[($pIdx + 1) % $mat->count()];
            $ini  = Carbon::parse($periodo->fecha_inicio);

            $tareasDef = [
                [
                    'titulo'      => "Actividad: {$mat1->nombre} — {$periodo->nombre}",
                    'descripcion' => "Actividad evaluativa del {$periodo->nombre} de {$mat1->nombre}.",
                    'materia_id'  => $mat1->id,
                    'asignacion'  => $ini->copy()->subDays(20)->toDateString(),
                    'entrega'     => $ini->copy()->subDays(7)->toDateString(),
                ],
                [
                    'titulo'      => "Proyecto: {$mat2->nombre} — {$periodo->nombre}",
                    'descripcion' => "Proyecto trimestral de {$mat2->nombre}.",
                    'materia_id'  => $mat2->id,
                    'asignacion'  => $ini->copy()->subDays(15)->toDateString(),
                    'entrega'     => $ini->copy()->subDays(2)->toDateString(),
                ],
            ];

            foreach ($tareasDef as $tDef) {
                $tarea = Tarea::firstOrCreate(
                    ['titulo' => $tDef['titulo'], 'grupo_id' => $grupo->id, 'ciclo_escolar_id' => $ciclo->id],
                    [
                        'descripcion'      => $tDef['descripcion'],
                        'materia_id'       => $tDef['materia_id'],
                        'asignado_por'     => $asignadoPor,
                        'fecha_asignacion' => $tDef['asignacion'],
                        'fecha_entrega'    => $tDef['entrega'],
                    ]
                );

                foreach ($alumnos as $aIdx => $alumno) {
                    $estado = !$isActivo
                        ? 'Entregada'
                        : (($aIdx % 4 === 0) ? 'Pendiente' : 'Entregada');
                    $this->tareaEntregas[] = [
                        'tarea_id'     => $tarea->id,
                        'alumno_id'    => $alumno->id,
                        'estado'       => $estado,
                        'fecha_entrega'=> $estado !== 'Pendiente' ? $tDef['entrega'] : null,
                        'created_at'   => $now,
                        'updated_at'   => $now,
                    ];
                }
            }
        }
    }

    // ── Helpers ──────────────────────────────────────────────────
    private function curp(string $ap, string $nombre, int $year, string $sexo, int $idx): string
    {
        $a  = strtoupper(str_pad(substr(preg_replace('/[^a-zA-Z]/', '', $ap), 0, 2), 2, 'X'));
        $n  = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $nombre), 0, 1) ?: 'X');
        $yy = substr((string)$year, 2, 2);
        $s  = $sexo === 'Masculino' ? 'H' : 'M';
        // 4 + 2 + 4 + 1 + 2 + 5 = 18 chars
        return $a . $n . 'X' . $yy . '0315' . $s . 'DF' . str_pad($idx % 99999, 5, '0', STR_PAD_LEFT);
    }

    private function generarNotas(int $aIdx, int $materiaId): array
    {
        $base     = 5.5 + (($aIdx * 17 + $materiaId * 7) % 45) / 10.0;
        $parcial  = min(10.0, round($base - 0.3, 1));
        $proyecto = min(10.0, round($base + 0.1, 1));
        $examen   = min(10.0, round($base + 0.2, 1));
        return [$parcial, $proyecto, $examen];
    }

    private function diasHabiles(string $desde, string $hasta, int $max): array
    {
        $dias = [];
        $d    = Carbon::parse($desde);
        $fin  = Carbon::parse($hasta);
        while ($d->lte($fin) && count($dias) < $max) {
            if (!$d->isWeekend()) $dias[] = $d->toDateString();
            $d->addDay();
        }
        return $dias;
    }

    private function flush(string $tabla, array &$rows): void
    {
        if (empty($rows)) return;
        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table($tabla)->insertOrIgnore($chunk);
        }
        $rows = [];
    }
}
