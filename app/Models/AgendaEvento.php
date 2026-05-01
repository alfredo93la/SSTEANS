<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgendaEvento extends Model
{
    use HasFactory;

    protected $table = 'agenda_eventos';

    protected $fillable = [
        'fecha',
        'fecha_fin',
        'titulo',
        'descripcion',
        'hora_inicio',
        'hora_fin',
        'tipo',
        'grupo',
        'materia',
        'circular_id',
        'creado_por_id',
    ];

    public function destinatarios(): HasMany
    {
        return $this->hasMany(AgendaEventoDestinatario::class);
    }

    public function circular(): BelongsTo
    {
        return $this->belongsTo(Circular::class);
    }
}
