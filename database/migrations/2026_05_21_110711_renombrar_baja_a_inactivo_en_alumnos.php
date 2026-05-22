<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('alumnos')->where('estado', 'Baja')->update(['estado' => 'Inactivo']);
    }

    public function down(): void
    {
        DB::table('alumnos')->where('estado', 'Inactivo')->update(['estado' => 'Baja']);
    }
};
