<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Canal privado por usuario — para badges y actualizaciones en tiempo real
Broadcast::channel('usuario.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
