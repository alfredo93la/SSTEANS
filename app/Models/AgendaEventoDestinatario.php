<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgendaEventoDestinatario extends Model
{
    use HasFactory;

    protected $table = 'agenda_evento_destinatarios';

    protected $fillable = [
        'agenda_evento_id',
        'rol',
    ];

    public function evento(): BelongsTo
    {
        return $this->belongsTo(AgendaEvento::class, 'agenda_evento_id');
    }
}
