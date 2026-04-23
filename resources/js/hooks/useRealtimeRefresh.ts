import { useEcho } from '@laravel/echo-react';
import { usePage } from '@inertiajs/react';

type Seccion = 'circulares' | 'notificaciones' | 'agenda' | 'tareas' | 'reportes';

/**
 * Escucha el canal privado del usuario autenticado.
 * Llama a `onRefresh` cuando llegue un evento de la sección indicada.
 *
 * Uso en una página:
 *   useRealtimeRefresh('circulares', cargarCirculares);
 */
export function useRealtimeRefresh(seccion: Seccion, onRefresh: () => void): void {
    const { auth } = usePage().props as { auth: { user?: { id?: number } } };
    const userId = auth?.user?.id;

    useEcho(
        `usuario.${userId ?? 0}`,
        '.badge.actualizado',
        (data: { seccion: string }) => {
            if (data.seccion === seccion) {
                onRefresh();
            }
        },
        [seccion, onRefresh],
    );
}
