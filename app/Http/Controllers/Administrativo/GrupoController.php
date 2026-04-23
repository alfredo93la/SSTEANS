<?php

namespace App\Http\Controllers\Administrativo;

use App\Http\Controllers\Controller;
use App\Models\CicloEscolar;
use App\Models\Grado;
use App\Models\Grupo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GrupoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Si no se especifica ciclo, usar el activo; si no hay activo, devolver vacío
        $cicloId = $request->filled('ciclo_id')
            ? $request->integer('ciclo_id')
            : CicloEscolar::where('activo', true)->value('id');

        if (! $cicloId) {
            return response()->json([
                'grupos'             => [],
                'ciclos'             => CicloEscolar::orderByDesc('fecha_inicio')->get(),
                'grados'             => Grado::orderBy('numero')->get(['id', 'numero', 'descripcion']),
                'turnos_disponibles' => \App\Models\ConfiguracionEscuela::value('turnos_disponibles') ?? 'matutino',
                'mensaje'            => 'No hay ciclo escolar activo.',
            ]);
        }

        $grupos = Grupo::with(['grado:id,numero,descripcion', 'cicloEscolar:id,nombre'])
            ->where('ciclo_escolar_id', $cicloId)
            ->withCount(['asignaciones' => fn ($q) => $q->where('estado', 'activo')])
            ->orderBy('grado_id')
            ->orderBy('nombre')
            ->get();

        return response()->json([
            'grupos'              => $grupos,
            'ciclos'              => CicloEscolar::orderByDesc('fecha_inicio')->get(),
            'ciclo_actual_id'     => $cicloId,
            'grados'              => Grado::orderBy('numero')->get(['id', 'numero', 'descripcion']),
            'turnos_disponibles'  => \App\Models\ConfiguracionEscuela::value('turnos_disponibles') ?? 'matutino',
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $cicloActivo = CicloEscolar::where('activo', true)->first();

        if (! $cicloActivo) {
            return response()->json(['message' => 'No hay ciclo escolar activo. Activa un ciclo antes de crear grupos.'], 422);
        }

        if ($cicloActivo->cerrado) {
            return response()->json(['message' => 'El ciclo escolar está cerrado.'], 422);
        }

        // Validar turno contra configuración de la escuela
        $turnosPermitidos = $this->turnosPermitidos();

        $validated = $request->validate([
            'grado_id'        => ['required', 'exists:grados,id'],
            'nombre'          => ['required', 'string', 'max:5'],
            'turno'           => ['required', Rule::in($turnosPermitidos)],
            'capacidad_maxima' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        // Verificar duplicado dentro del mismo ciclo
        $existe = Grupo::where('ciclo_escolar_id', $cicloActivo->id)
            ->where('grado_id', $validated['grado_id'])
            ->where('nombre', strtoupper($validated['nombre']))
            ->where('turno', $validated['turno'])
            ->exists();

        if ($existe) {
            return response()->json(['message' => 'Ya existe ese grupo en el ciclo activo.'], 422);
        }

        $grupo = Grupo::create([
            ...$validated,
            'nombre'          => strtoupper($validated['nombre']),
            'ciclo_escolar_id' => $cicloActivo->id,
            'capacidad_maxima' => $validated['capacidad_maxima'] ?? 40,
        ]);

        return response()->json([
            'message' => 'Grupo creado correctamente.',
            'grupo'   => $grupo->load(['grado:id,numero,descripcion', 'cicloEscolar:id,nombre']),
        ], 201);
    }

    public function update(Request $request, Grupo $grupo): JsonResponse
    {
        if ($grupo->cicloEscolar->cerrado) {
            return response()->json(['message' => 'No se puede editar grupos de un ciclo cerrado.'], 422);
        }

        $turnosPermitidos = $this->turnosPermitidos();

        $validated = $request->validate([
            'nombre'          => ['required', 'string', 'max:5'],
            'turno'           => ['required', Rule::in($turnosPermitidos)],
            'capacidad_maxima' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $grupo->update([
            ...$validated,
            'nombre' => strtoupper($validated['nombre']),
        ]);

        return response()->json([
            'message' => 'Grupo actualizado.',
            'grupo'   => $grupo->fresh()->load(['grado:id,numero,descripcion', 'cicloEscolar:id,nombre']),
        ]);
    }

    public function destroy(Grupo $grupo): JsonResponse
    {
        if ($grupo->cicloEscolar->cerrado) {
            return response()->json(['message' => 'No se puede eliminar grupos de un ciclo cerrado.'], 422);
        }

        if ($grupo->asignaciones()->where('estado', 'activo')->exists()) {
            return response()->json(['message' => 'No se puede eliminar: el grupo tiene alumnos asignados.'], 422);
        }

        $grupo->delete();

        return response()->json(['message' => 'Grupo eliminado.']);
    }

    /** @return string[] */
    private function turnosPermitidos(): array
    {
        $disponibles = \App\Models\ConfiguracionEscuela::value('turnos_disponibles') ?? 'matutino';

        return match ($disponibles) {
            'ambos'      => ['matutino', 'vespertino'],
            'vespertino' => ['vespertino'],
            default      => ['matutino'],
        };
    }
}
