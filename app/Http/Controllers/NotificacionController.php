<?php

namespace App\Http\Controllers;

use App\Events\BadgeActualizado;
use App\Models\Notificacion;
use App\Models\NotificacionDestinatario;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificacionController extends Controller
{
    /**
     * GET /api/notificaciones
     * Notificaciones recibidas del usuario autenticado.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $notificaciones = Notificacion::whereHas('destinatarios', fn ($q) => $q->where('destinatario_user_id', $userId))
            ->with([
                'remitente:id,name',
                'destinatarios' => fn ($q) => $q
                    ->where('destinatario_user_id', $userId)
                    ->with([
                        'alumno.persona:id,nombre,apellidos',
                        'grupo:id,nombre,grado_id',
                        'grupo.grado:id,numero',
                    ]),
            ])
            ->latest()
            ->get()
            ->map(fn ($n) => $this->format($n, $n->destinatarios->first()));

        return response()->json(['notificaciones' => $notificaciones]);
    }

    /**
     * GET /api/notificaciones/enviadas
     * Notificaciones enviadas por el usuario autenticado.
     */
    public function enviadas(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $notificaciones = Notificacion::where('remitente_user_id', $userId)
            ->withCount('destinatarios as total_destinatarios')
            ->withCount(['destinatarios as leidas_count' => fn ($q) => $q->where('leida', true)])
            ->with(['destinatarios' => fn ($q) => $q->with('alumno.persona:id,nombre,apellidos')->limit(1)])
            ->latest()
            ->get()
            ->map(fn ($n) => $this->formatEnviada($n));

        return response()->json(['notificaciones' => $notificaciones]);
    }

    /**
     * POST /api/notificaciones
     * Enviar una notificación a uno o varios destinatarios.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'destinatarios'            => ['required', 'array', 'min:1'],
            'destinatarios.*.userId'   => ['required', 'integer', 'exists:users,id'],
            'destinatarios.*.alumnoId' => ['nullable', 'integer', 'exists:alumnos,id'],
            'destinatarios.*.grupoId'  => ['nullable', 'integer', 'exists:grupos,id'],
            'titulo'                   => ['required', 'string', 'max:255'],
            'mensaje'                  => ['required', 'string', 'max:2000'],
            'categoria'                => ['required', 'string', 'in:Académico,Asistencia,Conducta,Citatorio,Administrativo,Aviso,Orientación'],
            'prioridad'                => ['required', 'string', 'in:Alta,Media,Baja'],
        ]);

        $notificacion = DB::transaction(function () use ($validated, $request): Notificacion {
            $notificacion = Notificacion::create([
                'remitente_user_id' => $request->user()->id,
                'titulo'            => $validated['titulo'],
                'mensaje'           => $validated['mensaje'],
                'categoria'         => $validated['categoria'],
                'prioridad'         => $validated['prioridad'],
            ]);

            foreach ($validated['destinatarios'] as $dest) {
                NotificacionDestinatario::create([
                    'notificacion_id'      => $notificacion->id,
                    'destinatario_user_id' => $dest['userId'],
                    'alumno_id'            => $dest['alumnoId'] ?? null,
                    'grupo_id'             => $dest['grupoId'] ?? null,
                ]);
            }

            return $notificacion;
        });

        foreach ($validated['destinatarios'] as $dest) {
            broadcast(new BadgeActualizado($dest['userId'], 'notificaciones'));
        }

        $total = count($validated['destinatarios']);

        return response()->json([
            'message' => "Notificación enviada a {$total} destinatario(s).",
        ], 201);
    }

    /**
     * PATCH /api/notificaciones/{notificacion}/leer
     * Marcar como leída (solo el destinatario).
     */
    public function marcarLeida(Request $request, Notificacion $notificacion): JsonResponse
    {
        $dest = NotificacionDestinatario::where('notificacion_id', $notificacion->id)
            ->where('destinatario_user_id', $request->user()->id)
            ->first();

        if (! $dest) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $dest->update(['leida' => true, 'leida_at' => now()]);

        return response()->json(['message' => 'Marcada como leída.']);
    }

    /**
     * PATCH /api/notificaciones/leer-todas
     * Marcar todas las notificaciones del usuario como leídas.
     */
    public function marcarTodasLeidas(Request $request): JsonResponse
    {
        NotificacionDestinatario::where('destinatario_user_id', $request->user()->id)
            ->where('leida', false)
            ->update(['leida' => true, 'leida_at' => now()]);

        return response()->json(['message' => 'Todas marcadas como leídas.']);
    }

    /**
     * GET /api/notificaciones/tutores
     */
    public function tutores(): JsonResponse
    {
        $tutores = User::where('role', 'Tutor')
            ->where('status', 'Activo')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn ($u) => ['id' => $u->id, 'nombre' => $u->name]);

        return response()->json(['tutores' => $tutores]);
    }

    /**
     * GET /api/notificaciones/destinatarios
     * Alumnos (con sus tutores) y grupos disponibles según el rol del usuario.
     */
    public function destinatarios(Request $request): JsonResponse
    {
        $cicloId = \App\Models\CicloEscolar::where('activo', true)->value('id');
        $user    = $request->user();

        $grupoIdsPermitidos = null;
        if ($user->role === 'Profesor') {
            $grupoIdsPermitidos = \App\Models\Clase::where('profesor_user_id', $user->id)
                ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId))
                ->pluck('grupo_id')
                ->unique()
                ->values()
                ->all();
        }

        $alumnos = \App\Models\Alumno::with([
            'persona:id,nombre,apellidos',
            'tutores.persona:id,nombre,apellidos',
            'asignaciones' => fn ($q) => $q
                ->where('estado', 'activo')
                ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId))
                ->when($grupoIdsPermitidos !== null, fn ($q) => $q->whereIn('grupo_id', $grupoIdsPermitidos))
                ->with('grupo:id,nombre,grado_id', 'grupo.grado:id,numero'),
        ])
        ->where('estado', 'activo')
        ->get()
        ->map(function ($alumno) use ($grupoIdsPermitidos) {
            $asignacion = $alumno->asignaciones->first();

            if ($grupoIdsPermitidos !== null && ! $asignacion) return null;

            $grupo       = $asignacion?->grupo;
            $grado       = $grupo?->grado;
            $grupoNombre = $grado && $grupo ? "{$grado->numero}°{$grupo->nombre}" : null;

            $tutores = $alumno->tutores
                ->map(function ($tutor) {
                    $userId = User::where('persona_id', $tutor->persona_id)->value('id');
                    if (! $userId) return null;
                    return [
                        'userId' => $userId,
                        'nombre' => trim("{$tutor->persona?->nombre} {$tutor->persona?->apellidos}"),
                    ];
                })
                ->filter()
                ->values();

            if ($tutores->isEmpty()) return null;

            return [
                'id'      => $alumno->id,
                'nombre'  => trim("{$alumno->persona?->nombre} {$alumno->persona?->apellidos}"),
                'grupo'   => $grupoNombre,
                'grupoId' => $grupo?->id,
                'tutores' => $tutores,
            ];
        })
        ->filter()
        ->values();

        $grupos = \App\Models\Grupo::with([
            'grado:id,numero',
            'asignaciones' => fn ($q) => $q
                ->where('estado', 'activo')
                ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId))
                ->with(['alumno.tutores.persona:id,nombre,apellidos']),
        ])
        ->when($grupoIdsPermitidos !== null, fn ($q) => $q->whereIn('id', $grupoIdsPermitidos))
        ->get()
        ->map(function ($grupo) {
            $tutoresMap = [];

            foreach ($grupo->asignaciones as $asig) {
                foreach ($asig->alumno?->tutores ?? [] as $tutor) {
                    $userId = User::where('persona_id', $tutor->persona_id)->value('id');
                    if ($userId && ! isset($tutoresMap[$userId])) {
                        $tutoresMap[$userId] = [
                            'userId' => $userId,
                            'nombre' => trim("{$tutor->persona?->nombre} {$tutor->persona?->apellidos}"),
                        ];
                    }
                }
            }

            if (empty($tutoresMap)) return null;

            return [
                'id'         => $grupo->id,
                'nombre'     => $grupo->grado ? "{$grupo->grado->numero}°{$grupo->nombre}" : $grupo->nombre,
                'numAlumnos' => $grupo->asignaciones->count(),
                'tutores'    => array_values($tutoresMap),
            ];
        })
        ->filter()
        ->values();

        return response()->json(compact('alumnos', 'grupos'));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function format(Notificacion $n, ?NotificacionDestinatario $dest): array
    {
        $grupo       = $dest?->grupo;
        $grupoNombre = $grupo
            ? ($grupo->grado ? "{$grupo->grado->numero}°{$grupo->nombre}" : $grupo->nombre)
            : null;

        $alumno      = $dest?->alumno;
        $alumnoNombre = $alumno?->persona
            ? trim("{$alumno->persona->nombre} {$alumno->persona->apellidos}")
            : null;

        return [
            'id'        => $n->id,
            'titulo'    => $n->titulo,
            'mensaje'   => $n->mensaje,
            'tipo'      => $n->tipo,
            'categoria' => $n->categoria,
            'prioridad' => $n->prioridad,
            'leida'     => $dest?->leida ?? false,
            'remitente' => $n->remitente?->name ?? 'Sistema',
            'alumnoId'  => $dest?->alumno_id,
            'alumno'    => $alumnoNombre,
            'grupoId'   => $dest?->grupo_id,
            'grupo'     => $grupoNombre,
            'fecha'     => $n->created_at->format('d/m/Y'),
            'hora'      => $n->created_at->format('H:i'),
        ];
    }

    private function formatEnviada(Notificacion $n): array
    {
        $total       = (int) ($n->total_destinatarios ?? 0);
        $leidasCount = (int) ($n->leidas_count ?? 0);

        $primerDest  = $n->destinatarios->first();
        $alumno      = $primerDest?->alumno;
        $alumnoNombre = $alumno?->persona
            ? trim("{$alumno->persona->nombre} {$alumno->persona->apellidos}")
            : null;

        return [
            'id'                 => $n->id,
            'titulo'             => $n->titulo,
            'mensaje'            => $n->mensaje,
            'categoria'          => $n->categoria,
            'prioridad'          => $n->prioridad,
            'destinatario'       => $total > 1 ? "{$total} destinatarios" : ($primerDest?->destinatario?->name ?? '—'),
            'totalDestinatarios' => $total,
            'leidasCount'        => $leidasCount,
            'alumno'             => $alumnoNombre,
            'estado'             => $leidasCount >= $total ? 'leída' : 'enviada',
            'fecha'              => $n->created_at->format('d/m/Y'),
        ];
    }
}
