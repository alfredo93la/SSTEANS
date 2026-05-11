<?php

namespace Database\Seeders;

use App\Models\Grado;
use App\Models\Materia;
use Illuminate\Database\Seeder;

class GradosYMateriasSeeder extends Seeder
{
    public function run(): void
    {
        $materiasPorGrado = [
            1 => [
                'descripcion' => 'Primer Grado',
                'materias'    => [
                    ['nombre' => 'Español I',                    'horas_semanales' => 5],
                    ['nombre' => 'Matemáticas I',                'horas_semanales' => 5],
                    ['nombre' => 'Ciencias I - Biología',        'horas_semanales' => 3],
                    ['nombre' => 'Historia I',                   'horas_semanales' => 3],
                    ['nombre' => 'Geografía',                    'horas_semanales' => 3],
                    ['nombre' => 'Formación Cívica y Ética I',   'horas_semanales' => 2],
                    ['nombre' => 'Inglés I',                     'horas_semanales' => 3],
                    ['nombre' => 'Artes I',                      'horas_semanales' => 2],
                    ['nombre' => 'Educación Física I',           'horas_semanales' => 2],
                    ['nombre' => 'Tecnología I',                 'horas_semanales' => 3],
                ],
            ],
            2 => [
                'descripcion' => 'Segundo Grado',
                'materias'    => [
                    ['nombre' => 'Español II',                   'horas_semanales' => 5],
                    ['nombre' => 'Matemáticas II',               'horas_semanales' => 5],
                    ['nombre' => 'Ciencias II - Física',         'horas_semanales' => 3],
                    ['nombre' => 'Historia II',                  'horas_semanales' => 3],
                    ['nombre' => 'Formación Cívica y Ética II',  'horas_semanales' => 2],
                    ['nombre' => 'Inglés II',                    'horas_semanales' => 3],
                    ['nombre' => 'Artes II',                     'horas_semanales' => 2],
                    ['nombre' => 'Educación Física II',          'horas_semanales' => 2],
                    ['nombre' => 'Tecnología II',                'horas_semanales' => 3],
                ],
            ],
            3 => [
                'descripcion' => 'Tercer Grado',
                'materias'    => [
                    ['nombre' => 'Español III',                  'horas_semanales' => 5],
                    ['nombre' => 'Matemáticas III',              'horas_semanales' => 5],
                    ['nombre' => 'Ciencias III - Química',       'horas_semanales' => 3],
                    ['nombre' => 'Historia III',                 'horas_semanales' => 3],
                    ['nombre' => 'Formación Cívica y Ética III', 'horas_semanales' => 2],
                    ['nombre' => 'Inglés III',                   'horas_semanales' => 3],
                    ['nombre' => 'Artes III',                    'horas_semanales' => 2],
                    ['nombre' => 'Educación Física III',         'horas_semanales' => 2],
                    ['nombre' => 'Tecnología III',               'horas_semanales' => 3],
                ],
            ],
        ];

        foreach ($materiasPorGrado as $numero => $config) {
            $grado = Grado::firstOrCreate(
                ['numero'      => $numero],
                ['descripcion' => $config['descripcion']]
            );

            foreach ($config['materias'] as $data) {
                Materia::firstOrCreate(
                    ['grado_id' => $grado->id, 'nombre' => $data['nombre']],
                    ['horas_semanales' => $data['horas_semanales']]
                );
            }
        }
    }
}
