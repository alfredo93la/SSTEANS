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
            ['email' => 'tutor@example.com'],
            [
                'name' => 'María López',
                'password' => 'Tutor123*',
                'role' => 'Tutor',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'profesor@example.com'],
            [
                'name' => 'Prof. García',
                'password' => 'Profesor123*',
                'role' => 'Profesor',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'social@example.com'],
            [
                'name' => 'Lic. Martínez',
                'password' => 'Social123*',
                'role' => 'Trabajador Social',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrador',
                'password' => 'Admin123*',
                'role' => 'Administrador',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'administrativo@example.com'],
            [
                'name' => 'Lic. Fernández',
                'password' => 'Adminva123*',
                'role' => 'Personal Administrativo',
            ]
        );
    }
}
