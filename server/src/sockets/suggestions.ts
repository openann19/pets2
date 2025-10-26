import logger from '../utils/logger';

// Socket.io namespace for proactive chat suggestions
export default function attachSuggestionNamespace(io: any) {
  const nsp = io.of('/suggestions');

  nsp.on('connection', (socket: any) => {
    logger.info('Suggestions client connected', { socketId: socket.id });

    socket.on('joinMatch', (matchId: string) => {
      socket.join(matchId);
    });

    socket.on('disconnect', () => {
      logger.info('Suggestions client disconnected', { socketId: socket.id });
    });
  });

  function pushSuggestion(matchId: string, suggestionEvent: any) {
    nsp.to(matchId).emit('suggestion', suggestionEvent);
  }

  return { pushSuggestion };
}

