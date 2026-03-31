<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConfiguracionEscuela extends Model
{
    protected $table = 'configuracion_escuela';

    protected $fillable = [
        'nombre',
        'numero',
        'cct',
        'turno_escuela',
        'turnos_disponibles',
        'director',
        'telefono',
        'correo',
        'direccion',
        'nivel_educativo',
        'servicio_educativo',
        'minimo_aprobatorio',
        'escala_calificacion',
        'permitir_captura',
        'notificaciones',
        'registro_tutores',
    ];

    protected function casts(): array
    {
        return [
            'permitir_captura'   => 'boolean',
            'notificaciones'     => 'boolean',
            'registro_tutores'   => 'boolean',
            'minimo_aprobatorio' => 'integer',
        ];
    }
}
