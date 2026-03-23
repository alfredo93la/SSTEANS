<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CircularDestinatario extends Model
{
    use HasFactory;

    protected $fillable = [
        'circular_id',
        'rol',
    ];

    public function circular(): BelongsTo
    {
        return $this->belongsTo(Circular::class);
    }
}
