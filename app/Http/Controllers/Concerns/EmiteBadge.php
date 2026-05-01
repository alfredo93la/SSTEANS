<?php

namespace App\Http\Controllers\Concerns;

use App\Events\BadgeActualizado;
use App\Models\User;

trait EmiteBadge
{
    /**
     * Emite BadgeActualizado a todos los usuarios cuyo rol tenga el permiso dado.
     * Si se pasa $userId, solo se emite a ese usuario.
     */
    protected function emitirBadge(string $seccion, string $permiso, ?int $userId = null): void
    {
        try {
            if ($userId !== null) {
                broadcast(new BadgeActualizado($userId, $seccion));
                return;
            }

            // Roles gestores (con .manage) nunca reciben el badge por Reverb.
            $permisoManage = "{$seccion}.manage";

            $roles = collect(config('permissions.roles', []))
                ->filter(fn (array $perms) =>
                    in_array($permiso, $perms, true) &&
                    ! in_array($permisoManage, $perms, true)
                )
                ->keys();

            User::whereIn('role', $roles)
                ->pluck('id')
                ->each(fn ($id) => broadcast(new BadgeActualizado($id, $seccion)));
        } catch (\Throwable) {
            // Reverb not running — badge update skipped, API response unaffected
        }
    }
}
