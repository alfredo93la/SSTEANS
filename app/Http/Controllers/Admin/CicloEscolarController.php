<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CicloEscolar;
use App\Models\ConfiguracionEscuela;
use App\Models\Grado;
use App\Models\Grupo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CicloEscolarController extends Controller
{
    public function index(): JsonResponse
    {
        $ciclos = CicloEscolar::where('archivado', false)->orderByDesc('fecha_inicio')->get();

        return response()->json([
            'ciclos'             => $ciclos,
            'ciclo_activo'       => $ciclos->firstWhere('activo', true),
            'grados'             => Grado::orderBy('numero')->get(['id', 'numero', 'descripcion']),
            'turnos_disponibles' => ConfiguracionEscuela::value('turnos_disponibles') ?? 'matutino',
        ]);
    }

    public function archivar(CicloEscolar $ciclo): JsonResponse
    {
        if (!$ciclo->cerrado) {
            return response()->json(['message' => 'Solo se pueden archivar ciclos cerrados.'], 422);
        }

        $ciclo->update(['archivado' => true]);

        return response()->json(['message' => 'Ciclo escolar archivado.']);
    }

    public function store(Request $request): JsonResponse
    {
        $turnosDisponibles = ConfiguracionEscuela::value('turnos_disponibles') ?? 'matutino';
        $tieneAmbos        = $turnosDisponibles === 'ambos';

        $validated = $request->validate([
            'nombre'             => ['required', 'string', 'max:20', 'unique:ciclos_escolares,nombre'],
            'fecha_inicio'       => ['required', 'date'],
            'fecha_fin'          => ['required', 'date', 'after:fecha_inicio'],
            'grupos_matutino'    => ['nullable', 'integer', 'min:0', 'max:13'],
            'grupos_vespertino'  => ['nullable', 'integer', 'min:0', 'max:13'],
        ]);

        $ciclo = CicloEscolar::create([
            'nombre'      => $validated['nombre'],
            'fecha_inicio' => $validated['fecha_inicio'],
            'fecha_fin'   => $validated['fecha_fin'],
            'activo'      => false,
            'cerrado'     => false,
        ]);

        $cantMat  = ($turnosDisponibles !== 'vespertino') ? (int) ($validated['grupos_matutino'] ?? 0)   : 0;
        $cantVesp = ($tieneAmbos)                        ? (int) ($validated['grupos_vespertino'] ?? 0) : 0;

        // Si solo es vespertino, usar el campo matutino como cantidad única del turno disponible
        if ($turnosDisponibles === 'vespertino') {
            $cantVesp = (int) ($validated['grupos_matutino'] ?? 0);
        }

        $gruposCreados = 0;
        if ($cantMat > 0 || $cantVesp > 0) {
            $gruposCreados = $this->generarGrupos($ciclo, $cantMat, $cantVesp);
        }

        $msg = 'Ciclo escolar creado correctamente.';
        if ($gruposCreados > 0) {
            $msg .= " Se generaron {$gruposCreados} grupos.";
        }

        return response()->json([
            'message' => $msg,
            'ciclo'   => $ciclo,
        ], 201);
    }

    private function generarGrupos(CicloEscolar $ciclo, int $cantMat, int $cantVesp): int
    {
        $grados  = Grado::orderBy('numero')->get();
        $letras  = range('A', 'Z');
        $creados = 0;

        foreach ($grados as $grado) {
            for ($i = 0; $i < $cantMat; $i++) {
                Grupo::firstOrCreate(
                    [
                        'ciclo_escolar_id' => $ciclo->id,
                        'grado_id'         => $grado->id,
                        'nombre'           => $letras[$i],
                        'turno'            => 'matutino',
                    ],
                    ['capacidad_maxima' => 40]
                );
                $creados++;
            }

            for ($i = 0; $i < $cantVesp; $i++) {
                Grupo::firstOrCreate(
                    [
                        'ciclo_escolar_id' => $ciclo->id,
                        'grado_id'         => $grado->id,
                        'nombre'           => $letras[$cantMat + $i],
                        'turno'            => 'vespertino',
                    ],
                    ['capacidad_maxima' => 40]
                );
                $creados++;
            }
        }

        return $creados;
    }

    public function update(Request $request, CicloEscolar $ciclo): JsonResponse
    {
        if ($ciclo->cerrado) {
            return response()->json(['message' => 'No se puede editar un ciclo cerrado.'], 422);
        }

        $validated = $request->validate([
            'nombre'      => ['required', 'string', 'max:20', "unique:ciclos_escolares,nombre,{$ciclo->id}"],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin'   => ['required', 'date', 'after:fecha_inicio'],
        ]);

        $ciclo->update($validated);

        return response()->json([
            'message' => 'Ciclo escolar actualizado.',
            'ciclo'   => $ciclo->fresh(),
        ]);
    }

    public function destroy(CicloEscolar $ciclo): JsonResponse
    {
        if ($ciclo->grupos()->exists()) {
            return response()->json(['message' => 'No se puede eliminar: el ciclo tiene grupos asignados.'], 422);
        }

        $ciclo->delete();

        return response()->json(['message' => 'Ciclo escolar eliminado.']);
    }

    public function activate(CicloEscolar $ciclo): JsonResponse
    {
        if ($ciclo->cerrado) {
            return response()->json(['message' => 'No se puede activar un ciclo cerrado.'], 422);
        }

        DB::transaction(function () use ($ciclo): void {
            CicloEscolar::where('activo', true)->update(['activo' => false]);
            $ciclo->update(['activo' => true]);
        });

        return response()->json([
            'message' => 'Ciclo escolar activado.',
            'ciclo'   => $ciclo->fresh(),
        ]);
    }

    public function verificarCierre(CicloEscolar $ciclo): JsonResponse
    {
        $periodosAbiertos = $ciclo->periodos()->where('captura_abierta', true)->count();
        $totalPeriodos    = $ciclo->periodos()->count();

        $checks = [
            [
                'label' => 'Períodos de evaluación con captura cerrada',
                'ok'    => $periodosAbiertos === 0,
                'detalle' => $periodosAbiertos > 0
                    ? "{$periodosAbiertos} período(s) aún con captura abierta"
                    : "{$totalPeriodos} período(s) cerrado(s)",
            ],
        ];

        return response()->json([
            'puede_cerrar' => collect($checks)->every('ok'),
            'checks'       => $checks,
        ]);
    }

    public function close(CicloEscolar $ciclo): JsonResponse
    {
        $periodosAbiertos = $ciclo->periodos()->where('captura_abierta', true)->count();

        if ($periodosAbiertos > 0) {
            return response()->json([
                'message' => "No se puede cerrar el ciclo: hay {$periodosAbiertos} período(s) de evaluación con captura abierta.",
            ], 422);
        }

        $ciclo->update(['activo' => false, 'cerrado' => true]);

        return response()->json([
            'message' => 'Ciclo escolar cerrado.',
            'ciclo'   => $ciclo->fresh(),
        ]);
    }
}
