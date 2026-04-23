<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ciclos_escolares', function (Blueprint $table) {
            $table->boolean('archivado')->default(false)->after('cerrado');
        });
    }

    public function down(): void
    {
        Schema::table('ciclos_escolares', function (Blueprint $table) {
            $table->dropColumn('archivado');
        });
    }
};
