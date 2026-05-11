<?php

namespace App\Http\Controllers\Administrativo;

use App\Http\Controllers\Controller;
use App\Models\Clase;
use App\Models\Grupo;
use App\Models\Materia;
use App\Models\Salon;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClaseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['grupo_id' => ['required', 'exists:grupos,id']]);

        $clases = Clase::with([
            'materia:id,nombre,horas_semanales',
            'profesor:id,name',
            'salon:id,nombre,edificio',
        ])
            ->where('grupo_id', $request->integer('grupo_id'))
            ->orderByRaw("FIELD(dia_semana,'lunes','martes','miercoles','jueves','viernes')")
            ->orderBy('hora_inicio')
            ->get();

        return response()->json([
            'clases'     => $clases,
            'materias'   => Materia::orderBy('nombre')->get(['id', 'nombre', 'grado_id']),
            'profesores' => User::whereHas('roles', fn ($q) => $q->where('nombre', 'Profesor'))
                ->with('persona:id,nombre,apellidos')
                ->orderBy('name')
                ->get(['id', 'name', 'persona_id']),
            'salones'    => Salon::orderBy('nombre')->get(['id', 'nombre', 'edificio', 'capacidad', 'turno']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'grupo_id'        => ['required', 'exists:grupos,id'],
            'materia_id'      => ['required', 'exists:materias,id'],
            'profesor_user_id' => ['required', 'exists:users,id'],
            'salon_id'        => ['nullable', 'exists:salones,id'],
            'dia_semana'      => ['required', Rule::in(['lunes', 'martes', 'miercoles', 'jueves', 'viernes'])],
            'hora_inicio'     => ['required', 'date_format:H:i'],
            'hora_fin'        => ['required', 'date_format:H:i', 'after:hora_inicio'],
        ]);

        $grupo = Grupo::findOrFail($validated['grupo_id']);

        // Conflicto: mismo profesor ya tiene clase ese dia/hora en el ciclo
        $conflictoProfesor = Clase::where('ciclo_escolar_id', $grupo->ciclo_escolar_id)
            ->where('profesor_user_id', $validated['profesor_user_id'])
            ->where('dia_semana', $validated['dia_semana'])
            ->where(function ($q) use ($validated): void {
                $q->where('hora_inicio', '<', $validated['hora_fin'])
                    ->where('hora_fin', '>', $validated['hora_inicio']);
            })->exists();

        if ($conflictoProfesor) {
            return response()->json(['message' => 'El profesor ya tiene una clase asignada en ese horario.'], 422);
        }

        // Conflicto: el grupo ya tiene otra clase en ese día/hora
        $conflictoGrupo = Clase::where('ciclo_escolar_id', $grupo->ciclo_escolar_id)
            ->where('grupo_id', $validated['grupo_id'])
            ->where('dia_semana', $validated['dia_semana'])
            ->where(function ($q) use ($validated): void {
                $q->where('hora_inicio', '<', $validated['hora_fin'])
                    ->where('hora_fin', '>', $validated['hora_inicio']);
            })->exists();

        if ($conflictoGrupo) {
            return response()->json(['message' => 'El grupo ya tiene una clase asignada en ese horario.'], 422);
        }

        // Conflicto: mismo salón ya ocupado (si se especificó salón)
        if ($validated['salon_id']) {
            $conflictoSalon = Clase::where('ciclo_escolar_id', $grupo->ciclo_escolar_id)
                ->where('salon_id', $validated['salon_id'])
                ->where('dia_semana', $validated['dia_semana'])
                ->where(function ($q) use ($validated): void {
                    $q->where('hora_inicio', '<', $validated['hora_fin'])
                        ->where('hora_fin', '>', $validated['hora_inicio']);
                })->exists();

            if ($conflictoSalon) {
                return response()->json(['message' => 'El salón ya está ocupado en ese horario.'], 422);
            }
        }

        $clase = Clase::create([
            ...$validated,
            'ciclo_escolar_id' => $grupo->ciclo_escolar_id,
        ]);

        return response()->json([
            'message' => 'Clase agregada al horario.',
            'clase'   => $clase->load(['materia:id,nombre', 'profesor:id,name', 'salon:id,nombre,edificio']),
        ], 201);
    }

    public function update(Request $request, Clase $clase): JsonResponse
    {
        $validated = $request->validate([
            'materia_id'      => ['required', 'exists:materias,id'],
            'profesor_user_id' => ['required', 'exists:users,id'],
            'salon_id'        => ['nullable', 'exists:salones,id'],
            'dia_semana'      => ['required', Rule::in(['lunes', 'martes', 'miercoles', 'jueves', 'viernes'])],
            'hora_inicio'     => ['required', 'date_format:H:i'],
            'hora_fin'        => ['required', 'date_format:H:i', 'after:hora_inicio'],
        ]);

        // Conflicto profesor (excluyendo la clase actual)
        $conflictoProfesor = Clase::where('ciclo_escolar_id', $clase->ciclo_escolar_id)
            ->where('id', '!=', $clase->id)
            ->where('profesor_user_id', $validated['profesor_user_id'])
            ->where('dia_semana', $validated['dia_semana'])
            ->where(function ($q) use ($validated): void {
                $q->where('hora_inicio', '<', $validated['hora_fin'])
                    ->where('hora_fin', '>', $validated['hora_inicio']);
            })->exists();

        if ($conflictoProfesor) {
            return response()->json(['message' => 'El profesor ya tiene una clase asignada en ese horario.'], 422);
        }

        // Conflicto: el grupo ya tiene otra clase en ese día/hora (excluyendo la clase actual)
        $conflictoGrupo = Clase::where('ciclo_escolar_id', $clase->ciclo_escolar_id)
            ->where('id', '!=', $clase->id)
            ->where('grupo_id', $clase->grupo_id)
            ->where('dia_semana', $validated['dia_semana'])
            ->where(function ($q) use ($validated): void {
                $q->where('hora_inicio', '<', $validated['hora_fin'])
                    ->where('hora_fin', '>', $validated['hora_inicio']);
            })->exists();

        if ($conflictoGrupo) {
            return response()->json(['message' => 'El grupo ya tiene una clase asignada en ese horario.'], 422);
        }

        // Conflicto salón (excluyendo la clase actual)
        if ($validated['salon_id']) {
            $conflictoSalon = Clase::where('ciclo_escolar_id', $clase->ciclo_escolar_id)
                ->where('id', '!=', $clase->id)
                ->where('salon_id', $validated['salon_id'])
                ->where('dia_semana', $validated['dia_semana'])
                ->where(function ($q) use ($validated): void {
                    $q->where('hora_inicio', '<', $validated['hora_fin'])
                        ->where('hora_fin', '>', $validated['hora_inicio']);
                })->exists();

            if ($conflictoSalon) {
                return response()->json(['message' => 'El salón ya está ocupado en ese horario.'], 422);
            }
        }

        $clase->update($validated);

        return response()->json([
            'message' => 'Clase actualizada.',
            'clase'   => $clase->fresh()->load(['materia:id,nombre', 'profesor:id,name', 'salon:id,nombre,edificio']),
        ]);
    }

    public function destroy(Clase $clase): JsonResponse
    {
        $clase->delete();

        return response()->json(['message' => 'Clase eliminada del horario.']);
    }
}
