<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\EmiteBadge;
use App\Models\Alumno;
use App\Models\CicloEscolar;
use App\Models\ReporteConducta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReporteConductaController extends Controller
{
    use EmiteBadge;
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
            'archivo_adjunto' => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png,gif,webp', 'max:10240'], // 10 MB
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
            'estatus'         => $this->normalizarEstatus($validated['estatus'] ?? 'Abierto'),
            'archivo_adjunto' => $archivoPath,
        ]);

        $this->emitirBadge('reportes', 'reportes.view');

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
            'archivo_adjunto' => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png,gif,webp', 'max:10240'],
            'estatus'         => ['sometimes', 'string', 'max:50'],
        ]);

        if ($request->hasFile('archivo_adjunto')) {
            if ($reporte->archivo_adjunto) {
                Storage::disk('public')->delete($reporte->archivo_adjunto);
            }
            $validated['archivo_adjunto'] = $request->file('archivo_adjunto')->store('reportes_conducta', 'public');
        } elseif ($request->boolean('eliminar_adjunto')) {
            if ($reporte->archivo_adjunto) {
                Storage::disk('public')->delete($reporte->archivo_adjunto);
            }
            $validated['archivo_adjunto'] = null;
        }

        if (isset($validated['estatus'])) {
            $validated['estatus'] = $this->normalizarEstatus($validated['estatus']);
        }

        $reporte->update($validated);

        $this->emitirBadge('reportes', 'reportes.view');

        return response()->json([
            'message' => 'Reporte actualizado.',
            'reporte' => $this->formatReporte($reporte->fresh()->load(['alumno.persona:id,nombre,apellidos', 'reportadoPor:id,name'])),
        ]);
    }

    /**
     * GET /api/tutor/reportes-conducta/{alumno}
     * GET /api/trabajador-social/reportes-conducta/{alumno}
     * Reportes de conducta de un alumno.
     * Acepta ciclo_id opcional; si se pasa, filtra por el rango de fechas del ciclo.
     */
    public function forAlumno(Request $request, Alumno $alumno): JsonResponse
    {
        $query = ReporteConducta::where('alumno_id', $alumno->id)
            ->with('reportadoPor:id,name')
            ->latest('fecha');

        if ($request->filled('ciclo_id')) {
            $ciclo = CicloEscolar::find($request->integer('ciclo_id'));
            if ($ciclo) {
                $query->whereBetween('fecha', [
                    $ciclo->fecha_inicio->toDateString(),
                    $ciclo->fecha_fin->toDateString(),
                ]);
            }
        }

        $reportes = $query->get()->map(fn ($r) => $this->formatReporte($r));

        return response()->json(['reportes' => $reportes]);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function normalizarEstatus(string $estatus): string
    {
        return match (strtolower(str_replace([' ', '-'], '_', $estatus))) {
            'en_seguimiento' => 'En seguimiento',
            'abierto'        => 'Abierto',
            'cerrado'        => 'Cerrado',
            'archivado'      => 'Archivado',
            default          => $estatus,
        };
    }

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
            'estatus'            => $this->normalizarEstatus($r->estatus ?? 'Abierto'),
            'reportadoPor'       => $r->reportadoPor?->id ?? $r->reportado_por,
            'reportadoPorNombre' => $r->reportadoPor?->name ?? 'Desconocido',
        ];
    }
}