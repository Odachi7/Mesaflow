import { io, Socket } from 'socket.io-client';

// URL do WebSocket (Backend)
const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

type SocketSingleton = {
    socket: Socket | null;
};

// Singleton para manter uma única conexão
const socketInstance: SocketSingleton = {
    socket: null,
};

export const getSocket = (token?: string): Socket => {
    if (!socketInstance.socket) {
        socketInstance.socket = io(SOCKET_URL + '/events', { // Namespace /events
            autoConnect: false, // Conexão manual para injetar token
            auth: {
                token,
            },
            transports: ['websocket'],
        });

        socketInstance.socket.on('connect', () => {
            console.log('Socket connected:', socketInstance.socket?.id);
        });

        socketInstance.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    } else if (token) {
        // Atualizar token se fornecido e reconectar se necessário
        socketInstance.socket.auth = { token };
    }

    return socketInstance.socket;
};

export const connectSocket = (token: string) => {
    const socket = getSocket(token);
    if (!socket.connected) {
        socket.auth = { token };
        socket.connect();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socketInstance.socket) {
        socketInstance.socket.disconnect();
        // socketInstance.socket = null; // Opcional: manter instância mas desconectada
    }
};
