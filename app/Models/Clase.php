<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Clase extends Model
{
    protected $table = 'clases';

    protected $fillable = [
        'ciclo_escolar_id',
        'grupo_id',
        'materia_id',
        'profesor_user_id',
        'salon_id',
        'dia_semana',
        'hora_inicio',
        'hora_fin',
    ];

    public function cicloEscolar(): BelongsTo
    {
        return $this->belongsTo(CicloEscolar::class, 'ciclo_escolar_id');
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class);
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    public function profesor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'profesor_user_id');
    }

    public function salon(): BelongsTo
    {
        return $this->belongsTo(Salon::class);
    }
}
