<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CicloEscolar;
use App\Models\ConfiguracionEscuela;
use App\Models\Grupo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ConfiguracionEscuelaController extends Controller
{
    public function index(): JsonResponse
    {
        $config = ConfiguracionEscuela::firstOrCreate(
            ['id' => 1],
            [
                'nombre'             => '',
                'turnos_disponibles' => 'matutino',
                'nivel_educativo'    => 'Secundaria',
                'servicio_educativo' => 'General',
                'acceso_tutor'            => true,
                'acceso_profesor'         => true,
                'acceso_trab_social'      => true,
                'acceso_administrativo'   => true,
                'registro_tutores_activo' => false,
            ]
        );

        $cicloActivoId = CicloEscolar::where('activo', true)->value('id');
        $turnosEnUso = $cicloActivoId
            ? Grupo::where('ciclo_escolar_id', $cicloActivoId)
                ->distinct()
                ->pluck('turno')
                ->values()
                ->all()
            : [];

        return response()->json([...$config->toArray(), 'turnos_en_uso' => $turnosEnUso]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre'                   => ['required', 'string', 'max:255'],
            'numero'                   => ['nullable', 'string', 'max:20'],
            'cct'                      => ['nullable', 'string', 'max:20'],
            'turnos_disponibles'            => ['required', Rule::in(['matutino', 'vespertino', 'ambos'])],
            'director'                 => ['nullable', 'string', 'max:255'],
            'telefono'                 => ['nullable', 'string', 'max:30'],
            'correo'                   => ['nullable', 'email', 'max:255'],
            'direccion'                => ['nullable', 'string', 'max:500'],
            'nivel_educativo'          => ['nullable', 'string', 'max:100'],
            'servicio_educativo'       => ['nullable', 'string', 'max:100'],
            'acceso_tutor'             => ['boolean'],
            'acceso_profesor'          => ['boolean'],
            'acceso_trab_social'       => ['boolean'],
            'acceso_administrativo'    => ['boolean'],
            'registro_tutores_activo'  => ['boolean'],
        ]);

        $config = ConfiguracionEscuela::firstOrCreate(['id' => 1]);

        $nuevoTurno = $validated['turnos_disponibles'];
        if ($nuevoTurno !== $config->turnos_disponibles && $nuevoTurno !== 'ambos') {
            $turnoProhibido = $nuevoTurno === 'matutino' ? 'vespertino' : 'matutino';
            $cicloActivoId  = CicloEscolar::where('activo', true)->value('id');

            if ($cicloActivoId) {
                $count = Grupo::where('ciclo_escolar_id', $cicloActivoId)
                    ->where('turno', $turnoProhibido)
                    ->count();

                if ($count > 0) {
                    $turnoNombre   = ucfirst($nuevoTurno);
                    $conflictoNombre = ucfirst($turnoProhibido);
                    return response()->json([
                        'message' => "No se puede cambiar a {$turnoNombre}: hay {$count} grupo(s) {$conflictoNombre}s en el ciclo activo. Elimínalos primero o cambia a 'Ambos'.",
                    ], 422);
                }
            }
        }

        $config->update($validated);

        return response()->json([
            'message' => 'Configuración guardada correctamente.',
            'data'    => $config->fresh(),
        ]);
    }

    public function deleteLogo(): JsonResponse
    {
        $config = ConfiguracionEscuela::firstOrCreate(['id' => 1]);

        if ($config->logo_url) {
            $storagePath = ltrim(str_replace('/storage', '', $config->logo_url), '/');
            Storage::disk('public')->delete($storagePath);
            $config->update(['logo_url' => null]);
        }

        return response()->json(['message' => 'Logo eliminado correctamente.']);
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,svg', 'max:2048'],
        ]);

        $config = ConfiguracionEscuela::firstOrCreate(['id' => 1]);

        if ($config->logo_url) {
            $storagePath = ltrim(str_replace('/storage', '', $config->logo_url), '/');
            Storage::disk('public')->delete($storagePath);
        }

        $path = $request->file('logo')->store('logos', 'public');
        $url  = Storage::disk('public')->url($path);

        $config->update(['logo_url' => $url]);

        return response()->json([
            'message'  => 'Logo actualizado correctamente.',
            'logo_url' => $url,
        ]);
    }
}
