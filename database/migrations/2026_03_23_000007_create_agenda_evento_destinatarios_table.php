<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('agenda_evento_destinatarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agenda_evento_id')->constrained('agenda_eventos')->cascadeOnDelete();
            $table->string('rol');
            $table->timestamps();

            $table->unique(['agenda_evento_id', 'rol']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agenda_evento_destinatarios');
    }
};
