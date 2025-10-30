import { ErrorHandler } from '../ErrorHandler';

const errorLogger = jest.fn();
const notificationHandler = jest.fn();

beforeAll(() => {
  ErrorHandler.onErrorLog(errorLogger);
  ErrorHandler.onNotification(notificationHandler);
});

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ErrorHandler.clearQueue();
    errorLogger.mockClear();
    notificationHandler.mockClear();
  });

  describe('handleError', () => {
    it('processes generic errors with provided context', () => {
      const processed = ErrorHandler.handleError(
        new Error('Something went wrong'),
        {
          component: 'TestComponent',
          action: 'test-action',
          severity: 'high',
        },
        { showNotification: true },
      );

      expect(processed.message).toBe('Something went wrong');
      expect(processed.context.component).toBe('TestComponent');
      expect(processed.context.action).toBe('test-action');
      expect(processed.context.severity).toBe('high');
      expect(errorLogger).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Something went wrong' }),
      );
      expect(notificationHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleApiError', () => {
    it('enriches API error context with endpoint metadata', () => {
      const apiError = new Error('Unauthorized');
      const processed = ErrorHandler.handleApiError(
        apiError,
        { userId: 'user-123' },
        {
          endpoint: '/pets',
          method: 'GET',
          statusCode: 401,
          showNotification: false,
        },
      );

      expect(processed.context.component).toBe('API');
      expect(processed.context.action).toBe('GET /pets');
      expect(processed.context.metadata).toMatchObject({
        endpoint: '/pets',
        method: 'GET',
        statusCode: 401,
      });
      expect(processed.context.severity).toBe('high');
    });
  });

  describe('handleAuthError', () => {
    it('returns high severity authentication errors', () => {
      const processed = ErrorHandler.handleAuthError(
        new Error('Token expired'),
        { sessionId: 'session-1' },
        { authMethod: 'password', showNotification: false },
      );

      expect(processed.context.component).toBe('Authentication');
      expect(processed.context.metadata).toMatchObject({ authMethod: 'password' });
      expect(processed.context.severity).toBe('high');
      expect(processed.message.toLowerCase()).toContain('token expired');
    });
  });

  describe('handleNetworkError', () => {
    it('provides recovery options for retryable network errors', () => {
      const processed = ErrorHandler.handleNetworkError(
        new Error('Connection timeout'),
        {},
        { retryable: true, showNotification: false },
      );

      expect(processed.context.component).toBe('Network');
      expect(processed.context.metadata).toMatchObject({ retryable: true });
      expect(processed.recovery?.canRetry).toBe(true);
      expect(notificationHandler).not.toHaveBeenCalled();
    });
  });

  describe('getErrorStats', () => {
    it('aggregates error statistics over recent events', () => {
      ErrorHandler.handleError(
        new Error('First error'),
        { component: 'API' },
        { showNotification: false },
      );
      ErrorHandler.handleNetworkError(new Error('Network issue'), {}, { showNotification: false });
      ErrorHandler.handleAuthError(new Error('Auth failed'), {}, { showNotification: false });

      const stats = ErrorHandler.getErrorStats();

      expect(stats.total).toBeGreaterThanOrEqual(3);
      expect(stats.byComponent['API'] ?? 0).toBeGreaterThanOrEqual(1);
      expect(stats.byComponent['Network'] ?? 0).toBeGreaterThanOrEqual(1);
      expect(stats.byComponent['Authentication'] ?? 0).toBeGreaterThanOrEqual(1);
    });
  });

  describe('clearQueue', () => {
    it('resets internal error queue state', () => {
      ErrorHandler.handleError(
        new Error('Queued error'),
        { component: 'Test' },
        { showNotification: false },
      );
      expect(ErrorHandler.getErrorStats().total).toBeGreaterThanOrEqual(1);

      ErrorHandler.clearQueue();

      expect(ErrorHandler.getErrorStats().total).toBe(0);
    });
  });
});
