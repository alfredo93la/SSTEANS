<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'status')) {
            return;
        }

        DB::table('users')->where('status', 'approved')->update(['status' => 'Activo']);
        DB::table('users')->where('status', 'pending')->update(['status' => 'Pendiente']);
        DB::table('users')->where('status', 'rejected')->update(['status' => 'Rechazado']);

        DB::statement("ALTER TABLE users MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'Activo'");
    }

    public function down(): void
    {
        if (! Schema::hasColumn('users', 'status')) {
            return;
        }

        DB::table('users')->where('status', 'Activo')->update(['status' => 'approved']);
        DB::table('users')->where('status', 'Pendiente')->update(['status' => 'pending']);
        DB::table('users')->where('status', 'Rechazado')->update(['status' => 'rejected']);
        DB::table('users')->where('status', 'Inactivo')->update(['status' => 'pending']);

        DB::statement("ALTER TABLE users MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'approved'");
    }
};
