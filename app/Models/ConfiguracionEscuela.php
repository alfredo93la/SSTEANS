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
        'turnos_disponibles',
        'director',
        'telefono',
        'correo',
        'direccion',
        'nivel_educativo',
        'servicio_educativo',
        'acceso_tutor',
        'acceso_profesor',
        'acceso_trab_social',
        'acceso_administrativo',
        'registro_tutores_activo',
        'logo_url',
    ];

    protected function casts(): array
    {
        return [
            'acceso_tutor'             => 'boolean',
            'acceso_profesor'          => 'boolean',
            'acceso_trab_social'       => 'boolean',
            'acceso_administrativo'    => 'boolean',
            'registro_tutores_activo'  => 'boolean',
        ];
    }
}
