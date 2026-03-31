<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CicloEscolar extends Model
{
    protected $table = 'ciclos_escolares';

    protected $fillable = [
        'nombre',
        'fecha_inicio',
        'fecha_fin',
        'activo',
        'cerrado',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin'    => 'date',
            'activo'       => 'boolean',
            'cerrado'      => 'boolean',
        ];
    }

    public function grupos(): HasMany
    {
        return $this->hasMany(Grupo::class, 'ciclo_escolar_id');
    }

    public function clases(): HasMany
    {
        return $this->hasMany(Clase::class, 'ciclo_escolar_id');
    }

    public function asignaciones(): HasMany
    {
        return $this->hasMany(AsignacionGrupo::class, 'ciclo_escolar_id');
    }
}
