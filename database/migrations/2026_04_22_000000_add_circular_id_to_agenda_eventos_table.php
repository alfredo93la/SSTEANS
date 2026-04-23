<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agenda_eventos', function (Blueprint $table) {
            $table->foreignId('circular_id')
                ->nullable()
                ->after('materia')
                ->constrained('circulares')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('agenda_eventos', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Circular::class);
            $table->dropColumn('circular_id');
        });
    }
};
