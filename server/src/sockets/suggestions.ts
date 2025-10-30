import logger from '../utils/logger';
import type { SocketIOServer, Socket } from 'socket.io';
import type { SuggestionEvent } from '../types/socket';

// Socket.io namespace for proactive chat suggestions
export default function attachSuggestionNamespace(io: SocketIOServer) {
  const nsp = io.of('/suggestions');

  nsp.on('connection', (socket: Socket) => {
    logger.info('Suggestions client connected', { socketId: socket.id });

    socket.on('joinMatch', (matchId: string) => {
      socket.join(matchId);
    });

    socket.on('disconnect', () => {
      logger.info('Suggestions client disconnected', { socketId: socket.id });
    });
  });

  function pushSuggestion(matchId: string, suggestionEvent: SuggestionEvent) {
    nsp.to(matchId).emit('suggestion', suggestionEvent);
  }

  return { pushSuggestion };
}

