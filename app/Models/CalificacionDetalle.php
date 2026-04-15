<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CalificacionDetalle extends Model
{
    protected $table = 'calificacion_detalle';

    protected $fillable = [
        'calificacion_id',
        'rubro_id',
        'valor',
    ];

    protected $casts = [
        'valor' => 'float',
    ];

    public function calificacion(): BelongsTo
    {
        return $this->belongsTo(Calificacion::class);
    }

    public function rubro(): BelongsTo
    {
        return $this->belongsTo(RubroEvaluacion::class, 'rubro_id');
    }
}
