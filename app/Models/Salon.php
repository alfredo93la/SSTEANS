<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Salon extends Model
{
    protected $table = 'salones';

    protected $fillable = [
        'nombre',
        'edificio',
        'capacidad',
        'turno',
    ];

    public function clases(): HasMany
    {
        return $this->hasMany(Clase::class);
    }
}
