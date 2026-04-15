<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Persona extends Model
{
    use HasFactory;

    protected $fillable = [
        'tipo_persona',
        'nombre',
        'apellidos',
        'direccion',
        'telefono',
        'curp',
    ];

    public function alumno(): HasOne
    {
        return $this->hasOne(Alumno::class);
    }

    public function tutor(): HasOne
    {
        return $this->hasOne(Tutor::class);
    }

    public function profesor(): HasOne
    {
        return $this->hasOne(Profesor::class);
    }

    public function trabSocial(): HasOne
    {
        return $this->hasOne(TrabSocial::class);
    }

    public function persAdmin(): HasOne
    {
        return $this->hasOne(PersAdmin::class);
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class);
    }
}
