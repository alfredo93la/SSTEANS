<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PeriodoEvaluacion extends Model
{
    protected $table = 'periodos_evaluacion';

    protected $fillable = [
        'ciclo_escolar_id',
        'nombre',
        'fecha_inicio',
        'fecha_fin',
        'captura_abierta',
    ];

    protected $casts = [
        'fecha_inicio'   => 'date',
        'fecha_fin'      => 'date',
        'captura_abierta' => 'boolean',
    ];

    public function cicloEscolar(): BelongsTo
    {
        return $this->belongsTo(CicloEscolar::class, 'ciclo_escolar_id');
    }
}
