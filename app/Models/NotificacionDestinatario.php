<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificacionDestinatario extends Model
{
    protected $table = 'notificacion_destinatarios';

    protected $fillable = [
        'notificacion_id',
        'destinatario_user_id',
        'alumno_id',
        'grupo_id',
        'leida',
        'leida_at',
    ];

    protected $casts = [
        'leida'    => 'boolean',
        'leida_at' => 'datetime',
    ];

    public function notificacion(): BelongsTo
    {
        return $this->belongsTo(Notificacion::class);
    }

    public function destinatario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'destinatario_user_id');
    }

    public function alumno(): BelongsTo
    {
        return $this->belongsTo(Alumno::class);
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class);
    }
}
