<?php

namespace App\Http\Controllers;

use App\Models\Alumno;
use App\Models\ReporteConducta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReporteConductaController extends Controller
{
    /**
     * GET /api/reportes-conducta
     * Trabajador Social: todos los reportes (con filtros).
     * Tutor: reportes de sus alumnos.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ReporteConducta::with([
            'alumno.persona:id,nombre,apellidos',
            'reportadoPor:id,name',
        ])->latest('fecha');

        if ($request->filled('alumno_id')) {
            $query->where('alumno_id', $request->integer('alumno_id'));
        }

        if ($request->filled('estatus')) {
            $query->where('estatus', $request->estatus);
        }

        $reportes = $query->get()->map(fn ($r) => $this->formatReporte($r));

        return response()->json(['reportes' => $reportes]);
    }

    /**
     * POST /api/reportes-conducta
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'alumno_id'      => ['required', 'integer', 'exists:alumnos,id'],
            'tipo_reporte'   => ['required', 'string', 'max:100'],
            'gravedad'       => ['nullable', 'string', 'in:Baja,Media,Alta'],
            'descripcion'    => ['required', 'string', 'max:1000'],
            'observaciones'  => ['nullable', 'string', 'max:1000'],
            'archivo_adjunto' => ['nullable', 'file', 'max:10240'], // 10 MB
            'fecha'          => ['required', 'date'],
            'estatus'        => ['nullable', 'string', 'max:50'],
        ]);

        $archivoPath = null;
        if ($request->hasFile('archivo_adjunto')) {
            $archivoPath = $request->file('archivo_adjunto')->store('reportes_conducta', 'public');
        }

        $reporte = ReporteConducta::create([
            ...$validated,
            'reportado_por'   => $request->user()->id,
            'gravedad'        => $validated['gravedad'] ?? 'Media',
            'estatus'         => $validated['estatus'] ?? 'Abierto',
            'archivo_adjunto' => $archivoPath,
        ]);

        return response()->json([
            'message' => 'Reporte registrado correctamente.',
            'reporte' => $this->formatReporte($reporte->load(['alumno.persona:id,nombre,apellidos', 'reportadoPor:id,name'])),
        ], 201);
    }

    /**
     * PUT /api/reportes-conducta/{reporte}
     */
    public function update(Request $request, ReporteConducta $reporte): JsonResponse
    {
        $validated = $request->validate([
            'tipo_reporte'    => ['sometimes', 'string', 'max:100'],
            'gravedad'        => ['sometimes', 'string', 'in:Baja,Media,Alta'],
            'descripcion'     => ['sometimes', 'string', 'max:1000'],
            'observaciones'   => ['nullable', 'string', 'max:1000'],
            'archivo_adjunto' => ['nullable', 'file', 'max:10240'],
            'estatus'         => ['sometimes', 'string', 'max:50'],
        ]);

        if ($request->hasFile('archivo_adjunto')) {
            $validated['archivo_adjunto'] = $request->file('archivo_adjunto')->store('reportes_conducta', 'public');
        }

        $reporte->update($validated);

        return response()->json([
            'message' => 'Reporte actualizado.',
            'reporte' => $this->formatReporte($reporte->fresh()->load(['alumno.persona:id,nombre,apellidos', 'reportadoPor:id,name'])),
        ]);
    }

    /**
     * GET /api/tutor/reportes-conducta/{alumno}
     * Reportes de conducta de un alumno (para tutor).
     */
    public function forAlumno(Request $request, Alumno $alumno): JsonResponse
    {
        $reportes = ReporteConducta::where('alumno_id', $alumno->id)
            ->with('reportadoPor:id,name')
            ->latest('fecha')
            ->get()
            ->map(fn ($r) => $this->formatReporte($r));

        return response()->json(['reportes' => $reportes]);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private function formatReporte(ReporteConducta $r): array
    {
        $fecha = $r->fecha instanceof \Illuminate\Support\Carbon
            ? $r->fecha->format('d/m/Y')
            : \Illuminate\Support\Carbon::parse($r->fecha)->format('d/m/Y');

        return [
            'id'                 => $r->id,
            'alumnoId'           => $r->alumno_id,
            'tipoReporte'        => $r->tipo_reporte,
            'gravedad'           => $r->gravedad ?? 'Media',
            'descripcion'        => $r->descripcion,
            'observaciones'      => $r->observaciones ?? '',
            'archivoAdjunto'     => $r->archivo_adjunto ? asset('storage/' . $r->archivo_adjunto) : null,
            'fecha'              => $fecha,
            'estatus'            => $r->estatus,
            'reportadoPor'       => $r->reportadoPor?->id ?? $r->reportado_por,
            'reportadoPorNombre' => $r->reportadoPor?->name ?? 'Desconocido',
        ];
    }
}