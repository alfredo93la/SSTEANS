<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Notificacion extends Model
{
    protected $table = 'notificaciones';

    protected $fillable = [
        'remitente_user_id',
        'titulo',
        'mensaje',
        'tipo',
        'categoria',
        'prioridad',
    ];

    public function remitente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'remitente_user_id');
    }

    public function destinatarios(): HasMany
    {
        return $this->hasMany(NotificacionDestinatario::class);
    }
}
