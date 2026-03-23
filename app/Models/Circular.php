<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Circular extends Model
{
    use HasFactory;

    protected $fillable = [
        'titulo',
        'descripcion',
        'contenido',
        'categoria',
        'prioridad',
        'publicado_por',
    ];

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'publicado_por');
    }

    public function destinatarios(): HasMany
    {
        return $this->hasMany(CircularDestinatario::class);
    }
}
