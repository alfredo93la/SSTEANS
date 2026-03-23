<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
