import logger from '../utils/logger';

// Socket.io namespace for Local Pulse real-time pins
export default function attachPulseNamespace(io: any) {
  const nsp = io.of('/pulse');

  nsp.on('connection', (socket: any) => {
    logger.info('Pulse client connected', { socketId: socket.id });

    // Client may join geo-grid room (e.g., "grid:37_122")
    socket.on('joinGrid', (gridId: string) => {
      socket.join(gridId);
    });

    socket.on('disconnect', () => {
      logger.info('Pulse client disconnected', { socketId: socket.id });
    });
  });

  // Helper to broadcast pin updates to specific grid
  function broadcastPin(gridId: string, pin: any) {
    nsp.to(gridId).emit('pin:update', pin);
  }

  return { broadcastPin };
}

