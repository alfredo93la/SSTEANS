<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE tarea_entregas MODIFY COLUMN estado ENUM('Pendiente','Entregada','Tarde','No Entregada') NOT NULL DEFAULT 'Pendiente'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE tarea_entregas MODIFY COLUMN estado ENUM('Pendiente','Entregada','Tarde') NOT NULL DEFAULT 'Pendiente'");
    }
};
