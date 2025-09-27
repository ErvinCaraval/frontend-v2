let socket = null;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function getSocket() {
  if (socket) return socket;
  const { io } = await import('socket.io-client');
  socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 3,
    timeout: 8000,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    try { socket.disconnect(); } catch (e) { /* noop */ }
    socket = null;
  }
}