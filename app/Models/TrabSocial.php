<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrabSocial extends Model
{
    use HasFactory;

    protected $table = 'trab_sociales';

    protected $fillable = [
        'persona_id',
        'horario',
        'extension',
    ];

    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class);
    }
}
