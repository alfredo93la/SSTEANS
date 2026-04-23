<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CircularLectura extends Model
{
    public $timestamps = false;

    protected $fillable = ['circular_id', 'user_id', 'leida_at'];

    protected $casts = ['leida_at' => 'datetime'];
}
