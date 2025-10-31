import type { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import logger from '../utils/logger';

export interface SuggestionEvent {
  type: string;
  text?: string;
  context?: Record<string, unknown>;
}

export interface SuggestionNamespace {
  pushSuggestion: (matchId: string, suggestionEvent: SuggestionEvent) => void;
}

export default function attachSuggestionNamespace(io: Server): SuggestionNamespace {
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

  function pushSuggestion(matchId: string, suggestionEvent: SuggestionEvent): void {
    nsp.to(matchId).emit('suggestion', suggestionEvent);
  }

  return { pushSuggestion };
}
