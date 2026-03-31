<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConfiguracionEscuela;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ConfiguracionEscuelaController extends Controller
{
    public function index(): JsonResponse
    {
        $config = ConfiguracionEscuela::firstOrCreate(
            ['id' => 1],
            [
                'nombre'              => '',
                'turnos_disponibles'  => 'matutino',
                'nivel_educativo'     => 'Secundaria',
                'servicio_educativo'  => 'General',
                'minimo_aprobatorio'  => 6,
                'escala_calificacion' => '0-10',
                'permitir_captura'    => true,
                'notificaciones'      => true,
                'registro_tutores'    => false,
            ]
        );

        return response()->json($config);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre'              => ['required', 'string', 'max:255'],
            'numero'              => ['nullable', 'string', 'max:20'],
            'cct'                 => ['nullable', 'string', 'max:20'],
            'turno_escuela'       => ['nullable', 'string', 'max:50'],
            'turnos_disponibles'  => ['required', Rule::in(['matutino', 'vespertino', 'ambos'])],
            'director'            => ['nullable', 'string', 'max:255'],
            'telefono'            => ['nullable', 'string', 'max:30'],
            'correo'              => ['nullable', 'email', 'max:255'],
            'direccion'           => ['nullable', 'string', 'max:500'],
            'nivel_educativo'     => ['nullable', 'string', 'max:100'],
            'servicio_educativo'  => ['nullable', 'string', 'max:100'],
            'minimo_aprobatorio'  => ['required', 'integer', 'min:1', 'max:10'],
            'escala_calificacion' => ['nullable', 'string', 'max:20'],
            'permitir_captura'    => ['boolean'],
            'notificaciones'      => ['boolean'],
            'registro_tutores'    => ['boolean'],
        ]);

        $config = ConfiguracionEscuela::firstOrCreate(['id' => 1]);
        $config->update($validated);

        return response()->json([
            'message' => 'Configuración guardada correctamente.',
            'data'    => $config->fresh(),
        ]);
    }
}
