<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Circular extends Model
{
    use HasFactory;

    protected $table = 'circulares';

    protected $fillable = [
        'titulo',
        'descripcion',
        'categoria',
        'prioridad',
        'publicado_por',
        'adjuntos',
    ];

    protected $casts = [
        'adjuntos' => 'array',
    ];

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'publicado_por');
    }

    public function destinatarios(): HasMany
    {
        return $this->hasMany(CircularDestinatario::class);
    }

    public function lecturas(): HasMany
    {
        return $this->hasMany(CircularLectura::class);
    }

    public function evento(): HasOne
    {
        return $this->hasOne(AgendaEvento::class);
    }
}
