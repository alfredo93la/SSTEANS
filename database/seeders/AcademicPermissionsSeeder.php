<?php

namespace Database\Seeders;

use App\Models\Permiso;
use App\Models\Role;
use Illuminate\Database\Seeder;

class AcademicPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Permisos del módulo académico
        $permisos = [
            ['nombre' => 'configuracion.manage', 'descripcion' => 'Gestionar configuración general de la escuela'],
            ['nombre' => 'ciclos.manage',         'descripcion' => 'Gestionar ciclos escolares'],
            ['nombre' => 'materias.manage',       'descripcion' => 'Gestionar materias por grado'],
            ['nombre' => 'grupos.manage',         'descripcion' => 'Gestionar grupos por ciclo'],
            ['nombre' => 'horarios.manage',       'descripcion' => 'Gestionar horarios de clases'],
            ['nombre' => 'alumnos.manage',        'descripcion' => 'Gestionar alumnos'],
            ['nombre' => 'tutores.manage',        'descripcion' => 'Gestionar tutores y vinculación con alumnos'],
            ['nombre' => 'salones.manage',        'descripcion' => 'Gestionar salones y aulas'],
        ];

        foreach ($permisos as $data) {
            Permiso::firstOrCreate(['nombre' => $data['nombre']], ['descripcion' => $data['descripcion']]);
        }

        // Asignar permisos al rol Administrador
        $admin = Role::where('nombre', 'Administrador')->first();
        if ($admin) {
            $adminPermisos = Permiso::whereIn('nombre', [
                'configuracion.manage',
                'ciclos.manage',
                'materias.manage',
                'grupos.manage',
                'alumnos.manage',
                'salones.manage',
            ])->pluck('id');

            $admin->permisos()->syncWithoutDetaching($adminPermisos);
        }

        // Asignar permisos al rol Personal Administrativo
        $administrativo = Role::where('nombre', 'Personal Administrativo')->first();
        if ($administrativo) {
            $adminPermisos = Permiso::whereIn('nombre', [
                'grupos.manage',
                'horarios.manage',
                'alumnos.manage',
                'tutores.manage',
                'salones.manage',
            ])->pluck('id');

            $administrativo->permisos()->syncWithoutDetaching($adminPermisos);
        }
    }
}
