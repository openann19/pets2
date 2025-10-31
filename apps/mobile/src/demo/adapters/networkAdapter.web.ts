import { setupWorker } from 'msw/browser'
import { logger } from '@pawfectmatch/core';
;
import { http, HttpResponse, delay } from 'msw';
import { demoPets } from '../fixtures/pets';
import { demoMatches, demoLikedYou } from '../fixtures/matches';
import { demoChatThread, demoQuickReplies } from '../fixtures/chatThreads';
import { demoPremiumStates } from '../fixtures/premiumStates';
import { demoMapPins } from '../fixtures/mapPins';
import { demoAdoptionItems } from '../fixtures/adoptionItems';
import { demoStories } from '../fixtures/stories';
import { demoHomeStats, demoRecentActivity } from '../fixtures/home';

/**
 * Enhanced MSW worker with realistic delays, error simulation, and offline support
 * Provides comprehensive demo mode functionality for web platform
 */
export const worker = setupWorker(
  // Pets endpoints
  http.get('/api/pets', async ({ request }) => {
    // Simulate network delay for realism
    await delay(Math.random() * 300 + 100);
    
    // Simulate occasional errors (5% chance)
    if (Math.random() < 0.05) {
      return HttpResponse.json(
        { error: 'Failed to fetch pets', code: 'NETWORK_ERROR' },
        { status: 500 }
      );
    }
    
    return HttpResponse.json(demoPets);
  }),

  // Matches endpoints
  http.get('/api/matches', async () => {
    await delay(Math.random() * 200 + 100);
    return HttpResponse.json(demoMatches);
  }),

  http.get('/api/matches/liked-you', async () => {
    await delay(Math.random() * 200 + 100);
    return HttpResponse.json(demoLikedYou);
  }),

  // Chat endpoints
  http.get('/api/chat/thread', async ({ request }) => {
    await delay(Math.random() * 150 + 50);
    
    // Extract matchId from query params if present
    const url = new URL(request.url);
    const matchId = url.searchParams.get('matchId');
    
    if (matchId) {
      // Return thread-specific data if needed
      return HttpResponse.json({
        ...demoChatThread,
        matchId,
      });
    }
    
    return HttpResponse.json(demoChatThread);
  }),

  http.get('/api/chat/quick-replies', async () => {
    await delay(50);
    return HttpResponse.json(demoQuickReplies);
  }),

  // Premium endpoints
  http.get('/api/premiumStates', async () => {
    await delay(100);
    return HttpResponse.json(demoPremiumStates);
  }),

  // Map endpoints
  http.get('/api/mapPins', async () => {
    await delay(Math.random() * 300 + 200);
    return HttpResponse.json(demoMapPins);
  }),

  // Adoption endpoints
  http.get('/api/adoptionItems', async () => {
    await delay(Math.random() * 250 + 150);
    return HttpResponse.json(demoAdoptionItems);
  }),

  // Stories endpoints
  http.get('/api/stories', async () => {
    await delay(Math.random() * 200 + 100);
    return HttpResponse.json(demoStories);
  }),

  // Home endpoints
  http.get('/api/home/stats', async () => {
    await delay(Math.random() * 150 + 50);
    return HttpResponse.json(demoHomeStats);
  }),

  http.get('/api/home/recent-activity', async () => {
    await delay(Math.random() * 200 + 100);
    return HttpResponse.json(demoRecentActivity);
  }),

  // Catch-all for unmatched routes
  http.all('*', ({ request }) => {
    logger.warn(`[MSW] Unhandled request: ${request.method} ${request.url}`);
    return HttpResponse.json(
      { error: 'Endpoint not found in demo mode', url: request.url },
      { status: 404 }
    );
  })
);

/**
 * Start the MSW worker with enhanced error handling
 */
export const startDemoWorker = async (): Promise<void> => {
  try {
    await worker.start({
      onUnhandledRequest: 'bypass', // Don't log unhandled requests from external resources
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    logger.info('[MSW] Demo worker started successfully');
  } catch (error) {
    logger.error('[MSW] Failed to start demo worker:', { error });
    throw error;
  }
};

/**
 * Stop the MSW worker gracefully
 */
export const stopDemoWorker = async (): Promise<void> => {
  try {
    await worker.stop();
    logger.info('[MSW] Demo worker stopped');
  } catch (error) {
    logger.error('[MSW] Failed to stop demo worker:', { error });
  }
};