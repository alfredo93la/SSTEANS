<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Evento genérico para actualizar un badge del sidebar.
 * Se emite en el canal privado del usuario afectado.
 *
 * @property string $seccion   circulares | notificaciones | agenda | tareas | reportes
 * @property int    $userId    ID del usuario destinatario
 */
class BadgeActualizado implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int    $userId,
        public readonly string $seccion,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("usuario.{$this->userId}")];
    }

    public function broadcastAs(): string
    {
        return 'badge.actualizado';
    }

    public function broadcastWith(): array
    {
        return ['seccion' => $this->seccion];
    }
}
