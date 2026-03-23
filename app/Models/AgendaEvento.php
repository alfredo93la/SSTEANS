<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgendaEvento extends Model
{
    use HasFactory;

    protected $table = 'agenda_eventos';

    protected $fillable = [
        'fecha',
        'titulo',
        'descripcion',
        'hora_inicio',
        'hora_fin',
        'grupo',
        'materia',
        'tipo',
    ];

    public function destinatarios(): HasMany
    {
        return $this->hasMany(AgendaEventoDestinatario::class);
    }
}
