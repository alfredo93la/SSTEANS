<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE notificaciones MODIFY COLUMN categoria ENUM('Académico','Asistencia','Conducta','Citatorio','Administrativo','Aviso','Orientación','Evento') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE notificaciones MODIFY COLUMN categoria ENUM('Académico','Administrativo','Evento','Conducta') NOT NULL");
    }
};
