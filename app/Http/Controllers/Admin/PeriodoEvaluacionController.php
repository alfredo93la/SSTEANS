<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CicloEscolar;
use App\Models\PeriodoEvaluacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PeriodoEvaluacionController extends Controller
{
    private function format(PeriodoEvaluacion $p): array
    {
        return [
            'id'             => $p->id,
            'cicloId'        => $p->ciclo_escolar_id,
            'nombre'         => $p->nombre,
            'fechaInicio'    => $p->fecha_inicio->format('d/m/Y'),
            'fechaFin'       => $p->fecha_fin->format('d/m/Y'),
            'capturaAbierta' => $p->captura_abierta,
        ];
    }

    /** GET /api/periodos */
    public function index(Request $request): JsonResponse
    {
        $query = PeriodoEvaluacion::orderBy('fecha_inicio');

        if ($request->filled('ciclo_id')) {
            $query->where('ciclo_escolar_id', $request->integer('ciclo_id'));
        }

        return response()->json(['periodos' => $query->get()->map(fn ($p) => $this->format($p))]);
    }

    /** GET /api/periodos/ciclo-activo — todos los periodos del ciclo activo (profesores y tutores) */
    public function cicloActivo(): JsonResponse
    {
        $cicloId = CicloEscolar::where('activo', true)->value('id');

        $periodos = PeriodoEvaluacion::where('ciclo_escolar_id', $cicloId)
            ->orderBy('fecha_inicio')
            ->get()
            ->map(fn ($p) => $this->format($p));

        return response()->json(['periodos' => $periodos]);
    }

    /** POST /api/periodos */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cicloId'     => ['required', 'integer', 'exists:ciclos_escolares,id'],
            'nombre'      => ['required', 'string', 'max:100'],
            'fechaInicio' => ['required', 'date'],
            'fechaFin'    => ['required', 'date', 'after:fechaInicio'],
        ]);

        $periodo = PeriodoEvaluacion::create([
            'ciclo_escolar_id' => $validated['cicloId'],
            'nombre'           => $validated['nombre'],
            'fecha_inicio'     => $validated['fechaInicio'],
            'fecha_fin'        => $validated['fechaFin'],
            'captura_abierta'  => false,
        ]);

        return response()->json(['periodo' => $this->format($periodo)], 201);
    }

    /** PUT /api/periodos/{periodo} */
    public function update(Request $request, PeriodoEvaluacion $periodo): JsonResponse
    {
        $validated = $request->validate([
            'nombre'      => ['sometimes', 'string', 'max:100'],
            'fechaInicio' => ['sometimes', 'date'],
            'fechaFin'    => ['sometimes', 'date'],
        ]);

        $periodo->update([
            'nombre'       => $validated['nombre'] ?? $periodo->nombre,
            'fecha_inicio' => $validated['fechaInicio'] ?? $periodo->fecha_inicio,
            'fecha_fin'    => $validated['fechaFin'] ?? $periodo->fecha_fin,
        ]);

        return response()->json(['periodo' => $this->format($periodo->fresh())]);
    }

    /** PATCH /api/periodos/{periodo}/captura */
    public function toggleCaptura(PeriodoEvaluacion $periodo): JsonResponse
    {
        $periodo->update(['captura_abierta' => ! $periodo->captura_abierta]);

        return response()->json(['capturaAbierta' => $periodo->captura_abierta]);
    }

    /** DELETE /api/periodos/{periodo} */
    public function destroy(PeriodoEvaluacion $periodo): JsonResponse
    {
        $periodo->delete();

        return response()->json(['message' => 'Periodo eliminado.']);
    }
}
