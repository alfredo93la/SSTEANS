<?php

namespace App\Http\Controllers;

use App\Events\BadgeActualizado;
use App\Models\Notificacion;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NotificacionController extends Controller
{
    /**
     * GET /api/notificaciones
     * Tutor: notificaciones recibidas.
     */
    public function index(Request $request): JsonResponse
    {
        $notificaciones = Notificacion::where('destinatario_user_id', $request->user()->id)
            ->with([
                'remitente:id,name',
                'alumno.persona:id,nombre,apellidos',
                'grupo:id,nombre,grado_id',
                'grupo.grado:id,numero',
            ])
            ->latest()
            ->get()
            ->map(fn ($n) => $this->format($n));

        return response()->json(['notificaciones' => $notificaciones]);
    }

    /**
     * GET /api/notificaciones/enviadas
     * Profesor / Trabajador Social: notificaciones enviadas (una fila por envío).
     */
    public function enviadas(Request $request): JsonResponse
    {
        $remitenteId = $request->user()->id;

        // Conteos por grupo_envio
        $conteos = DB::table('notificaciones')
            ->where('remitente_user_id', $remitenteId)
            ->selectRaw('grupo_envio, COUNT(*) as total, SUM(leida) as leidas_count')
            ->groupBy('grupo_envio')
            ->get()
            ->keyBy('grupo_envio');

        // Un representante por grupo_envio (el de menor id)
        $notificaciones = Notificacion::whereIn('id', function ($q) use ($remitenteId) {
            $q->from('notificaciones')
                ->selectRaw('MIN(id)')
                ->where('remitente_user_id', $remitenteId)
                ->groupBy('grupo_envio');
        })
            ->with('destinatario:id,name', 'alumno.persona:id,nombre,apellidos')
            ->latest()
            ->get()
            ->map(fn ($n) => $this->formatEnviada($n, $conteos->get($n->grupo_envio)));

        return response()->json(['notificaciones' => $notificaciones]);
    }

    /**
     * POST /api/notificaciones
     * Enviar notificación a uno o varios tutores.
     * Body: destinatarios = [{ userId, alumnoId? }] o [userId, ...]
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

        $remitenteId = $request->user()->id;
        $grupoEnvio  = (string) Str::uuid();
        $creadas     = 0;

        foreach ($validated['destinatarios'] as $dest) {
            Notificacion::create([
                'remitente_user_id'    => $remitenteId,
                'destinatario_user_id' => $dest['userId'],
                'alumno_id'            => $dest['alumnoId'] ?? null,
                'grupo_id'             => $dest['grupoId'] ?? null,
                'grupo_envio'          => $grupoEnvio,
                'titulo'               => $validated['titulo'],
                'mensaje'              => $validated['mensaje'],
                'categoria'            => $validated['categoria'],
                'prioridad'            => $validated['prioridad'],
            ]);
            broadcast(new BadgeActualizado($dest['userId'], 'notificaciones'));
            $creadas++;
        }

        return response()->json([
            'message' => "Notificación enviada a {$creadas} destinatario(s).",
        ], 201);
    }

    /**
     * PATCH /api/notificaciones/{notificacion}/leer
     * Marcar una notificación como leída (solo el destinatario).
     */
    public function marcarLeida(Request $request, Notificacion $notificacion): JsonResponse
    {
        if ($notificacion->destinatario_user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $notificacion->update(['leida' => true]);

        return response()->json(['message' => 'Marcada como leída.']);
    }

    /**
     * PATCH /api/notificaciones/leer-todas
     * Marcar todas las notificaciones del tutor autenticado como leídas.
     */
    public function marcarTodasLeidas(Request $request): JsonResponse
    {
        Notificacion::where('destinatario_user_id', $request->user()->id)
            ->where('leida', false)
            ->update(['leida' => true]);

        return response()->json(['message' => 'Todas marcadas como leídas.']);
    }

    /**
     * GET /api/notificaciones/tutores
     * Lista plana de tutores (compatibilidad).
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
     * Alumnos (con sus tutores user_id) y grupos (con tutores únicos de sus alumnos activos).
     * Profesor: solo sus grupos asignados. Trabajador Social: todos.
     */
    public function destinatarios(Request $request): JsonResponse
    {
        $cicloId = \App\Models\CicloEscolar::where('activo', true)->value('id');
        $user    = $request->user();

        // Grupos permitidos para el usuario
        $grupoIdsPermitidos = null; // null = sin restricción (Trabajador Social)
        if ($user->role === 'Profesor') {
            $grupoIdsPermitidos = \App\Models\Clase::where('profesor_user_id', $user->id)
                ->when($cicloId, fn ($q) => $q->where('ciclo_escolar_id', $cicloId))
                ->pluck('grupo_id')
                ->unique()
                ->values()
                ->all();
        }

        // ── Alumnos con tutor vinculado ───────────────────────────────────────
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

            // Para Profesor: omitir alumnos que no tengan asignación en sus grupos
            if ($grupoIdsPermitidos !== null && ! $asignacion) return null;

            $grupo      = $asignacion?->grupo;
            $grado      = $grupo?->grado;
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

        // ── Grupos con tutores únicos de sus alumnos activos ──────────────────
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
                'id'          => $grupo->id,
                'nombre'      => $grupo->grado ? "{$grupo->grado->numero}°{$grupo->nombre}" : $grupo->nombre,
                'numAlumnos'  => $grupo->asignaciones->count(),
                'tutores'     => array_values($tutoresMap),
            ];
        })
        ->filter()
        ->values();

        return response()->json(compact('alumnos', 'grupos'));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function alumnoNombre(Notificacion $n): ?string
    {
        $a = $n->alumno;
        if (! $a || ! $a->persona) return null;
        return trim("{$a->persona->nombre} {$a->persona->apellidos}");
    }

    private function format(Notificacion $n): array
    {
        $grupo = $n->grupo;
        $grupoNombre = $grupo
            ? ($grupo->grado ? "{$grupo->grado->numero}°{$grupo->nombre}" : $grupo->nombre)
            : null;

        return [
            'id'           => $n->id,
            'titulo'       => $n->titulo,
            'mensaje'      => $n->mensaje,
            'tipo'         => $n->tipo,
            'categoria'    => $n->categoria,
            'prioridad'    => $n->prioridad,
            'leida'        => $n->leida,
            'remitente'    => $n->remitente?->name ?? 'Sistema',
            'alumnoId'     => $n->alumno_id,
            'alumno'       => $this->alumnoNombre($n),
            'grupoId'      => $n->grupo_id,
            'grupo'        => $grupoNombre,
            'fecha'        => $n->created_at->format('d/m/Y'),
            'hora'         => $n->created_at->format('H:i'),
        ];
    }

    private function formatEnviada(Notificacion $n, ?object $conteo = null): array
    {
        $total       = (int) ($conteo?->total ?? 1);
        $leidasCount = (int) ($conteo?->leidas_count ?? ($n->leida ? 1 : 0));

        return [
            'id'                 => $n->id,
            'titulo'             => $n->titulo,
            'mensaje'            => $n->mensaje,
            'categoria'          => $n->categoria,
            'prioridad'          => $n->prioridad,
            'destinatario'       => $total > 1 ? "{$total} destinatarios" : ($n->destinatario?->name ?? '—'),
            'totalDestinatarios' => $total,
            'leidasCount'        => $leidasCount,
            'alumno'             => $this->alumnoNombre($n),
            'estado'             => $leidasCount >= $total ? 'leída' : 'enviada',
            'fecha'              => $n->created_at->format('d/m/Y'),
        ];
    }
}
