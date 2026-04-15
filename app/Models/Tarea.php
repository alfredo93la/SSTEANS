<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tarea extends Model
{
    protected $table = 'tareas';

    protected $fillable = [
        'titulo',
        'descripcion',
        'materia_id',
        'grupo_id',
        'ciclo_escolar_id',
        'asignado_por',
        'fecha_asignacion',
        'fecha_entrega',
    ];

    protected $casts = [
        'fecha_asignacion' => 'date',
        'fecha_entrega'    => 'date',
    ];

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

    public function asignadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'asignado_por');
    }

    public function entregas(): HasMany
    {
        return $this->hasMany(TareaEntrega::class);
    }
}