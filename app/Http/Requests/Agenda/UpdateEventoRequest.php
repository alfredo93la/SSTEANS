<?php

namespace App\Http\Requests\Agenda;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'fecha' => ['required', 'date_format:Y-m-d'],
            'hora_inicio' => ['nullable', 'date_format:H:i'],
            'hora_fin' => ['nullable', 'date_format:H:i', 'after:hora_inicio'],
            'tipo' => ['required', 'string', 'max:100'],
            'grupo' => ['nullable', 'string', 'max:100'],
            'materia' => ['nullable', 'string', 'max:100'],
        ];
    }
}
