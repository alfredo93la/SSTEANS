<?php

namespace App\Http\Controllers\Administrativo;

use App\Http\Controllers\Controller;
use App\Models\AsignacionGrupo;
use App\Models\CicloEscolar;
use App\Models\Grupo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AsignacionGrupoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['grupo_id' => ['required', 'exists:grupos,id']]);

        $asignaciones = AsignacionGrupo::with([
            'alumno.persona:id,nombre,apellidos,curp',
        ])
            ->where('grupo_id', $request->integer('grupo_id'))
            ->where('estado', 'activo')
            ->get();

        return response()->json(['asignaciones' => $asignaciones]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'alumno_id' => ['required', 'exists:alumnos,id'],
            'grupo_id'  => ['required', 'exists:grupos,id'],
        ]);

        $grupo = Grupo::findOrFail($validated['grupo_id']);
        $cicloId = $grupo->ciclo_escolar_id;

        if ($grupo->cicloEscolar->cerrado) {
            return response()->json(['message' => 'No se puede asignar alumnos a grupos de un ciclo cerrado.'], 422);
        }

        // Verificar que el alumno no tenga ya grupo en este ciclo
        $yaAsignado = AsignacionGrupo::where('alumno_id', $validated['alumno_id'])
            ->where('ciclo_escolar_id', $cicloId)
            ->where('estado', 'activo')
            ->exists();

        if ($yaAsignado) {
            return response()->json(['message' => 'El alumno ya tiene un grupo asignado en este ciclo escolar.'], 422);
        }

        // Verificar capacidad del grupo
        $totalActivos = AsignacionGrupo::where('grupo_id', $validated['grupo_id'])
            ->where('estado', 'activo')
            ->count();

        if ($totalActivos >= $grupo->capacidad_maxima) {
            return response()->json(['message' => "El grupo ha alcanzado su capacidad máxima ({$grupo->capacidad_maxima} alumnos)."], 422);
        }

        $asignacion = AsignacionGrupo::create([
            'alumno_id'        => $validated['alumno_id'],
            'grupo_id'         => $validated['grupo_id'],
            'ciclo_escolar_id' => $cicloId,
            'fecha_asignacion' => now()->toDateString(),
            'estado'           => 'activo',
        ]);

        return response()->json([
            'message'    => 'Alumno asignado al grupo correctamente.',
            'asignacion' => $asignacion->load('alumno.persona:id,nombre,apellidos,curp'),
        ], 201);
    }

    public function destroy(AsignacionGrupo $asignacionGrupo): JsonResponse
    {
        if ($asignacionGrupo->grupo->cicloEscolar->cerrado) {
            return response()->json(['message' => 'No se puede modificar asignaciones de un ciclo cerrado.'], 422);
        }

        $asignacionGrupo->update(['estado' => 'baja']);

        return response()->json(['message' => 'Alumno dado de baja del grupo.']);
    }
}
