<?php

namespace App\Enums;

enum Parentesco: string
{
    case Padre      = 'Padre';
    case Madre      = 'Madre';
    case Abuelo     = 'Abuelo';
    case Abuela     = 'Abuela';
    case Tio        = 'Tío';
    case Tia        = 'Tía';
    case Hermano    = 'Hermano';
    case Hermana    = 'Hermana';
    case TutorLegal = 'Tutor legal';
    case Otro       = 'Otro';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
