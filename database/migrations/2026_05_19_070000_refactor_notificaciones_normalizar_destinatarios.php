<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Crear tabla normalizada de destinatarios
        Schema::dropIfExists('notificacion_destinatarios');
        Schema::create('notificacion_destinatarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notificacion_id')->constrained('notificaciones')->cascadeOnDelete();
            $table->foreignId('destinatario_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('alumno_id')->nullable()->constrained('alumnos')->nullOnDelete();
            $table->foreignId('grupo_id')->nullable()->constrained('grupos')->nullOnDelete();
            $table->boolean('leida')->default(false);
            $table->timestamp('leida_at')->nullable();
            $table->timestamps();

            $table->unique(['notificacion_id', 'destinatario_user_id'], 'notif_dest_unique');
        });

        // 2. Migrar datos existentes
        //    Por cada grupo_envio (o por cada fila sin grupo_envio):
        //    - El representante canónico es el MIN(id) del grupo
        //    - Crear un notificacion_destinatarios por cada fila del grupo
        if (Schema::hasColumn('notificaciones', 'destinatario_user_id')) {
            // Obtener representante canónico por grupo_envio
            $canonicos = DB::table('notificaciones')
                ->selectRaw('MIN(id) as id, grupo_envio')
                ->groupBy('grupo_envio')
                ->get();

            foreach ($canonicos as $canonico) {
                // Todas las filas que pertenecen a este grupo
                $filas = DB::table('notificaciones')
                    ->where('grupo_envio', $canonico->grupo_envio)
                    ->get();

                foreach ($filas as $fila) {
                    DB::table('notificacion_destinatarios')->insertOrIgnore([
                        'notificacion_id'      => $canonico->id,
                        'destinatario_user_id' => $fila->destinatario_user_id,
                        'alumno_id'            => $fila->alumno_id,
                        'grupo_id'             => $fila->grupo_id,
                        'leida'                => $fila->leida,
                        'leida_at'             => $fila->leida ? $fila->updated_at : null,
                        'created_at'           => $fila->created_at,
                        'updated_at'           => $fila->updated_at,
                    ]);
                }

                // Borrar filas duplicadas (no canónicas) del mismo grupo
                DB::table('notificaciones')
                    ->where('grupo_envio', $canonico->grupo_envio)
                    ->where('id', '!=', $canonico->id)
                    ->delete();
            }
        }

        // 3. Eliminar columnas que se movieron a notificacion_destinatarios
        Schema::table('notificaciones', function (Blueprint $table) {
            // Eliminar índices y FKs antes de las columnas
            $table->dropForeign(['destinatario_user_id']);
            $table->dropForeign(['alumno_id']);
            $table->dropForeign(['grupo_id']);
            $table->dropIndex('notificaciones_grupo_envio_index');

            $table->dropColumn(['destinatario_user_id', 'alumno_id', 'grupo_id', 'grupo_envio', 'leida']);
        });
    }

    public function down(): void
    {
        // Restaurar columnas en notificaciones
        Schema::table('notificaciones', function (Blueprint $table) {
            $table->foreignId('destinatario_user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('alumno_id')->nullable()->constrained('alumnos')->nullOnDelete();
            $table->foreignId('grupo_id')->nullable()->constrained('grupos')->nullOnDelete();
            $table->string('grupo_envio', 36)->nullable()->index();
            $table->boolean('leida')->default(false);
        });

        // Restaurar datos desde notificacion_destinatarios (aproximación)
        $destinatarios = DB::table('notificacion_destinatarios')->get();
        foreach ($destinatarios as $dest) {
            $notif = DB::table('notificaciones')->find($dest->notificacion_id);
            if (! $notif) continue;

            DB::table('notificaciones')->insert([
                'remitente_user_id'    => $notif->remitente_user_id,
                'destinatario_user_id' => $dest->destinatario_user_id,
                'alumno_id'            => $dest->alumno_id,
                'grupo_id'             => $dest->grupo_id,
                'grupo_envio'          => $dest->notificacion_id, // aproximación
                'titulo'               => $notif->titulo,
                'mensaje'              => $notif->mensaje,
                'tipo'                 => $notif->tipo,
                'categoria'            => $notif->categoria,
                'prioridad'            => $notif->prioridad,
                'leida'                => $dest->leida,
                'created_at'           => $notif->created_at,
                'updated_at'           => $notif->updated_at,
            ]);
        }

        // Borrar notificaciones canónicas que ya quedaron duplicadas
        DB::table('notificaciones')
            ->whereIn('id', $destinatarios->pluck('notificacion_id')->unique()->all())
            ->delete();

        Schema::dropIfExists('notificacion_destinatarios');
    }
};
