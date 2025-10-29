import { io, Socket } from 'socket.io-client';

const URL = process.env.EXPO_PUBLIC_SOCKET_URL || process.env.SOCKET_URL || '';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(URL, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
  }
  return socket;
}

export const socketClient = getSocket();

// Export as socketService for test compatibility
export const socketService = {
  connect: () => getSocket(),
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },
  getSocket,
  socketClient,
};
