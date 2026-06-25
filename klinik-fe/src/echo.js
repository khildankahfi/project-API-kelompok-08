import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const createEcho = () => new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'klinik-key',
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? 8080),
    wssPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? 8080),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    // Endpoint auth private channels — route ada di api.php via Broadcast::routes()
    authEndpoint: 'http://localhost:8000/broadcasting/auth',
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('klinik_token') || ''}`,
        },
    },
});

let echoInstance = null;

export const getEcho = () => {
    if (!echoInstance) {
        echoInstance = createEcho();
    }
    return echoInstance;
};

// Panggil ini setelah login agar token terbaru dipakai
export const refreshEcho = () => {
    if (echoInstance) {
        try { echoInstance.disconnect(); } catch (e) {}
    }
    echoInstance = createEcho();
    return echoInstance;
};

export default getEcho();
