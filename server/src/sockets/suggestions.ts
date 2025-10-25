// Socket.io namespace for proactive chat suggestions
const logger = require('../utils/logger');

module.exports = function attachSuggestionNamespace(io) {
  const nsp = io.of('/suggestions');

  nsp.on('connection', (socket) => {
    logger.info('Suggestions client connected', { socketId: socket.id });

    socket.on('joinMatch', (matchId) => {
      socket.join(matchId);
    });

    socket.on('disconnect', () => {
      logger.info('Suggestions client disconnected', { socketId: socket.id });
    });
  });

  function pushSuggestion(matchId, suggestionEvent) {
    nsp.to(matchId).emit('suggestion', suggestionEvent);
  }

  return { pushSuggestion };
};
