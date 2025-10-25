export {};// Added to mark file as a module
// Socket.io namespace for Local Pulse real-time pins
const logger = require('../utils/logger');

module.exports = function attachPulseNamespace(io) {
  const nsp = io.of('/pulse');

  nsp.on('connection', (socket) => {
    logger.info('Pulse client connected', { socketId: socket.id });

    // Client may join geo-grid room (e.g., "grid:37_122")
    socket.on('joinGrid', (gridId) => {
      socket.join(gridId);
    });

    socket.on('disconnect', () => {
      logger.info('Pulse client disconnected', { socketId: socket.id });
    });
  });

  // Helper to broadcast pin updates to specific grid
  function broadcastPin(gridId, pin) {
    nsp.to(gridId).emit('pin:update', pin);
  }

  return { broadcastPin };
};
