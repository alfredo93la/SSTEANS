<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PersAdmin extends Model
{
    use HasFactory;

    protected $table = 'pers_admins';

    protected $fillable = [
        'persona_id',
        'cargo',
        'departamento',
        'extension',
    ];

    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class);
    }
}
