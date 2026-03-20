<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'tutor@ejemplo.com'],
            [
                'name' => 'María López',
                'password' => 'password',
                'role' => 'Tutor',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'profesor@ejemplo.com'],
            [
                'name' => 'Prof. García',
                'password' => 'password',
                'role' => 'Profesor',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'social@ejemplo.com'],
            [
                'name' => 'Lic. Martínez',
                'password' => 'password',
                'role' => 'Trabajador Social',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'admin@ejemplo.com'],
            [
                'name' => 'Administrador',
                'password' => 'password',
                'role' => 'Administrador',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'administrativo@ejemplo.com'],
            [
                'name' => 'Lic. Fernández',
                'password' => 'password',
                'role' => 'Personal Administrativo',
            ]
        );

        $this->call(RolesAndPermissionsSeeder::class);
    }
}
