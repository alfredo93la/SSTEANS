<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReporteConducta extends Model
{
    protected $table = 'reportes_conducta';

    protected $fillable = [
        'alumno_id',
        'reportado_por',
        'tipo_reporte',
        'gravedad',
        'descripcion',
        'observaciones',
        'archivo_adjunto',
        'fecha',
        'estatus',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    public function alumno(): BelongsTo
    {
        return $this->belongsTo(Alumno::class);
    }

    public function reportadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reportado_por');
    }
}