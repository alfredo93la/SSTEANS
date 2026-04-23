<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Calificacion extends Model
{
    protected $table = 'calificaciones';

    protected $fillable = [
        'alumno_id',
        'materia_id',
        'ciclo_escolar_id',
        'periodo_evaluacion_id',
        'promedio',
        'publicada',
    ];

    protected $casts = [
        'promedio'  => 'float',
        'publicada' => 'boolean',
    ];

    public function alumno(): BelongsTo
    {
        return $this->belongsTo(Alumno::class);
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    public function cicloEscolar(): BelongsTo
    {
        return $this->belongsTo(CicloEscolar::class, 'ciclo_escolar_id');
    }

    public function periodoEvaluacion(): BelongsTo
    {
        return $this->belongsTo(PeriodoEvaluacion::class, 'periodo_evaluacion_id');
    }

    public function detalles()
    {
        return $this->hasMany(CalificacionDetalle::class, 'calificacion_id')->with('rubro');
    }
}