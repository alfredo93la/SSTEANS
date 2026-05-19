import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Recarga automática cuando la sesión expira o hay error de conexión
window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        // 401 = no autenticado, 419 = CSRF expirado — sesión perdida
        if (status === 401 || status === 419) {
            window.location.href = '/login';
            return new Promise(() => {}); // detiene la cadena de promesas
        }

        // Sin respuesta = se cayó la conexión o el servidor
        if (!error.response) {
            // Espera 3 segundos y recarga para dar chance al servidor de recuperarse
            setTimeout(() => window.location.reload(), 3000);
            return new Promise(() => {});
        }

        return Promise.reject(error);
    }
);
