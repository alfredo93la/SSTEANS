<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Alumno extends Model
{
    use HasFactory;

    protected $table = 'alumnos';

    protected $fillable = [
        'persona_id',
        'estado',
        'fecha_nacimiento',
        'sexo',
    ];

    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class);
    }

    public function tutores(): BelongsToMany
    {
        return $this->belongsToMany(Tutor::class, 'tutor_alumno')
            ->withPivot('fecha_vinculacion')
            ->withTimestamps();
    }

    public function asignaciones(): HasMany
    {
        return $this->hasMany(AsignacionGrupo::class);
    }
}
