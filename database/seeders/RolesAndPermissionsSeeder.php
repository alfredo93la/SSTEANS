<?php

namespace Database\Seeders;

use App\Models\Permiso;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Seed roles and permissions from config/permissions.php
     */
    public function run(): void
    {
        $map = config('permissions.roles', []);

        foreach ($map as $roleName => $permissions) {
            $role = Role::query()->firstOrCreate(
                ['nombre' => $roleName],
                ['descripcion' => 'Rol del sistema: '.$roleName]
            );

            $permissionIds = collect($permissions)
                ->map(function (string $permissionName) {
                    return Permiso::query()->firstOrCreate(
                        ['nombre' => $permissionName],
                        ['descripcion' => 'Permiso '.$permissionName]
                    )->id;
                })
                ->all();

            $role->permisos()->sync($permissionIds);
        }

        User::query()->each(function (User $user): void {
            if (! $user->role) {
                return;
            }

            $role = Role::query()->where('nombre', $user->role)->first();
            if ($role) {
                $user->roles()->syncWithoutDetaching([$role->id]);
            }
        });
    }
}
