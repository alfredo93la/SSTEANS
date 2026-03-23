<?php

namespace App\Http\Requests\Circulares;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCircularRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string'],
            'contenido' => ['required', 'string'],
            'categoria' => ['required', 'string', 'max:100'],
            'prioridad' => ['required', Rule::in(['Alta', 'Media', 'Baja'])],
            'fecha_publicacion' => ['nullable', 'date_format:Y-m-d'],
            'destinatarios' => ['required', 'array', 'min:1'],
            'destinatarios.*' => ['string', 'max:100'],
        ];
    }
}
