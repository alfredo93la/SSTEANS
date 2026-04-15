<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RubroEvaluacion extends Model
{
    protected $table = 'rubros_evaluacion';

    protected $fillable = [
        'profesor_user_id',
        'materia_id',
        'grupo_id',
        'ciclo_escolar_id',
        'periodo_evaluacion_id',
        'nombre',
        'ponderacion',
        'orden',
    ];

    protected $casts = [
        'ponderacion' => 'float',
        'orden'       => 'integer',
    ];

    public function profesor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'profesor_user_id');
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class);
    }

    public function cicloEscolar(): BelongsTo
    {
        return $this->belongsTo(CicloEscolar::class, 'ciclo_escolar_id');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(CalificacionDetalle::class, 'rubro_id');
    }
}
