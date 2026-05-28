<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ConfigurarAdmin extends Command
{
    protected $signature   = 'admin:configurar';
    protected $description = 'Crea o actualiza el usuario Administrador del sistema';

    public function handle(): int
    {
        $this->info('');
        $this->info('╔══════════════════════════════════════╗');
        $this->info('║   Configuración del Administrador    ║');
        $this->info('╚══════════════════════════════════════╝');
        $this->info('');

        $admin = User::where('role', 'Administrador')->first();

        if ($admin) {
            $this->line("  Administrador actual: <fg=yellow>{$admin->name}</> ({$admin->email})");
            if (!$this->confirm('¿Deseas actualizar sus datos?', false)) {
                $this->info('Sin cambios.');
                return self::SUCCESS;
            }
        } else {
            $this->line('  No existe un administrador. Se creará uno nuevo.');
        }

        $this->info('');

        // ── Nombre ───────────────────────────────────────────────
        $nombre = $this->ask('  Nombre completo', $admin?->name ?? 'Administrador');

        // ── Email ────────────────────────────────────────────────
        $email = $this->askEmail($admin?->email);

        // ── Contraseña ───────────────────────────────────────────
        $this->info('');
        $this->line('  <fg=cyan>Contraseña:</> déjala en blanco para generar una segura automáticamente.');
        $password = $this->secret('  Nueva contraseña (mín. 12 caracteres)');

        $generada = false;
        if (empty($password)) {
            $password = Str::password(16);
            $generada = true;
        } elseif (strlen($password) < 12) {
            $this->error('  La contraseña debe tener al menos 12 caracteres.');
            return self::FAILURE;
        }

        // ── Confirmar ────────────────────────────────────────────
        $this->info('');
        $this->table(
            ['Campo', 'Valor'],
            [
                ['Nombre', $nombre],
                ['Email',  $email],
                ['Contraseña', $generada ? '<generada automáticamente>' : str_repeat('*', strlen($password))],
            ]
        );

        if (!$this->confirm('¿Confirmar estos datos?', true)) {
            $this->warn('  Operación cancelada.');
            return self::SUCCESS;
        }

        // ── Guardar ──────────────────────────────────────────────
        $datos = [
            'name'                 => $nombre,
            'email'                => $email,
            'password'             => Hash::make($password),
            'role'                 => 'Administrador',
            'must_change_password' => true,
        ];

        if ($admin) {
            $admin->update($datos);
        } else {
            User::create($datos);
        }

        // ── Resultado ────────────────────────────────────────────
        $this->info('');
        $this->info('  ✔ Administrador configurado correctamente.');
        $this->info('');
        $this->line('  ┌─────────────────────────────────────────┐');
        $this->line("  │  Email:      <fg=green>{$email}</>");
        if ($generada) {
            $this->line("  │  Contraseña: <fg=yellow>{$password}</>");
            $this->line('  │');
            $this->line('  │  <fg=cyan>Guarda esta contraseña, no se mostrará de nuevo.</>');
        }
        $this->line('  │');
        $this->line('  │  Se solicitará cambio de contraseña en el primer acceso.');
        $this->line('  └─────────────────────────────────────────┘');
        $this->info('');

        return self::SUCCESS;
    }

    private function askEmail(?string $actual): string
    {
        while (true) {
            $email = $this->ask('  Email', $actual ?? '');

            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->error('  Email inválido, intenta de nuevo.');
                continue;
            }

            $enUso = User::where('email', $email)
                ->where('role', '!=', 'Administrador')
                ->exists();

            if ($enUso) {
                $this->error('  Ese email ya está en uso por otro usuario.');
                continue;
            }

            return $email;
        }
    }
}
