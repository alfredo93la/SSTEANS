<?php

namespace App\Enums;

enum Parentesco: string
{
    case Madre   = 'Madre';
    case Padre   = 'Padre';
    case Tutor   = 'Tutor';
    case Tutora  = 'Tutora';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
