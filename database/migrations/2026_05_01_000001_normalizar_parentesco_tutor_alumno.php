<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // "Tutelado"/"Tutelada" es el único valor no canónico que tiene equivalente directo
        DB::table('tutor_alumno')
            ->whereIn('parentesco', ['Tutelado', 'Tutelada'])
            ->update(['parentesco' => 'Tutor legal']);

        $canonicos = ['Padre', 'Madre', 'Abuelo', 'Abuela', 'Tío', 'Tía', 'Hermano', 'Hermana', 'Tutor legal', 'Otro'];

        DB::table('tutor_alumno')
            ->whereNotNull('parentesco')
            ->whereNotIn('parentesco', $canonicos)
            ->update(['parentesco' => 'Otro']);
    }

    public function down(): void {}
};
