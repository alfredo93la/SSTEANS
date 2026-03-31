<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsignacionGrupo extends Model
{
    protected $table = 'asignaciones_grupo';

    protected $fillable = [
        'alumno_id',
        'grupo_id',
        'ciclo_escolar_id',
        'fecha_asignacion',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'fecha_asignacion' => 'date',
        ];
    }

    public function alumno(): BelongsTo
    {
        return $this->belongsTo(Alumno::class);
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class);
    }

    public function cicloEscolar(): BelongsTo
    {
        return $this->belongsTo(CicloEscolar::class, 'ciclo_escolar_id');
    }
}
