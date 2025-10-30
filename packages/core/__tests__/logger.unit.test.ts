/**
 * Logger Service Unit Tests
 * Tests core logging functionality, console output, and configuration
 */

import { logger, LoggerService } from '../src/services/Logger';

// Mock console methods
const mockConsole = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Store original console
const originalConsole = global.console;

describe('LoggerService', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock console methods
    global.console = mockConsole as any;
    
    // Reset logger to default config
    logger.updateConfig({
      level: 'debug',
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      enablePerformanceLogging: true,
      enableErrorTracking: true,
    });
    
    // Clear log queue
    logger.clearQueue();
  });

  afterEach(() => {
    // Restore original console
    global.console = originalConsole;
  });

  describe('Basic Logging Methods', () => {
    it('should call console.debug for debug messages', () => {
      logger.debug('Test debug message', { component: 'TestComponent' });
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG TestComponent: Test debug message')
      );
    });

    it('should call console.info for info messages', () => {
      logger.info('Test info message', { component: 'TestComponent' });
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO TestComponent: Test info message')
      );
    });

    it('should call console.warn for warning messages', () => {
      logger.warn('Test warning message', { component: 'TestComponent' });
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN TestComponent: Test warning message')
      );
    });

    it('should call console.error for error messages', () => {
      const testError = new Error('Test error');
      logger.error('Test error message', testError, { component: 'TestComponent' });
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR TestComponent: Test error message')
      );
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Error: Error: Test error')
      );
    });

    it('should call console.error for critical messages', () => {
      const testError = new Error('Test critical error');
      logger.critical('Test critical message', testError, { component: 'TestComponent' });
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL TestComponent: Test critical message')
      );
    });
  });

  describe('Log Levels', () => {
    it('should respect log level configuration', () => {
      logger.updateConfig({ level: 'warn' });
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    it('should log all levels when set to debug', () => {
      logger.updateConfig({ level: 'debug' });
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      logger.critical('Critical message');
      
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(2); // error + critical
    });
  });

  describe('Performance Logging', () => {
    it('should track performance measurements', () => {
      logger.startPerformance('test-operation');
      
      // Simulate some work
      jest.advanceTimersByTime(100);
      
      logger.endPerformance('test-operation', { component: 'TestComponent' });
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('Performance: test-operation')
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('Performance: 100ms')
      );
    });

    it('should not track performance when disabled', () => {
      logger.updateConfig({ enablePerformanceLogging: false });
      
      logger.startPerformance('test-operation');
      logger.endPerformance('test-operation');
      
      expect(mockConsole.info).not.toHaveBeenCalled();
    });
  });

  describe('API Request Logging', () => {
    it('should log successful API requests as info', () => {
      logger.logApiRequest('GET', '/api/test', 200, 150, {
        component: 'APIClient',
      });
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO APIClient [api_request]: API GET /api/test')
      );
    });

    it('should log failed API requests as error', () => {
      logger.logApiRequest('POST', '/api/test', 500, 250, {
        component: 'APIClient',
      });
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR APIClient [api_request]: API POST /api/test')
      );
    });
  });

  describe('User Action Logging', () => {
    it('should log user actions with context', () => {
      logger.logUserAction('button_click', 'user123', { buttonId: 'submit' }, {
        component: 'UIComponent',
      });
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO UIComponent [user_action]: User action: button_click')
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"userId":"user123"')
      );
    });
  });

  describe('Security Event Logging', () => {
    it('should log critical security events as critical', () => {
      logger.logSecurityEvent('unauthorized_access', 'critical', {
        component: 'AuthService',
      });
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL AuthService [security_event]: Security event: unauthorized_access')
      );
    });

    it('should log high security events as error', () => {
      logger.logSecurityEvent('suspicious_activity', 'high', {
        component: 'SecurityMonitor',
      });
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR SecurityMonitor [security_event]: Security event: suspicious_activity')
      );
    });

    it('should log medium security events as warn', () => {
      logger.logSecurityEvent('failed_login', 'medium', {
        component: 'AuthService',
      });
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN AuthService [security_event]: Security event: failed_login')
      );
    });

    it('should log low security events as info', () => {
      logger.logSecurityEvent('password_change', 'low', {
        component: 'AuthService',
      });
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO AuthService [security_event]: Security event: password_change')
      );
    });
  });

  describe('Statistics and Queue Management', () => {
    it('should provide accurate log statistics', () => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      const stats = logger.getStats();
      
      expect(stats.totalLogs).toBe(4);
      expect(stats.byLevel.debug).toBe(1);
      expect(stats.byLevel.info).toBe(1);
      expect(stats.byLevel.warn).toBe(1);
      expect(stats.byLevel.error).toBe(1);
      expect(stats.byLevel.critical).toBe(0);
    });

    it('should clear log queue', () => {
      logger.info('Test message');
      expect(logger.getStats().totalLogs).toBe(1);
      
      logger.clearQueue();
      expect(logger.getStats().totalLogs).toBe(0);
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration dynamically', () => {
      logger.updateConfig({ level: 'error', enableConsole: false });
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      
      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors with stack traces in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const testError = new Error('Test error with stack');
      logger.error('Test message', testError);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Stack: Error: Test error with stack')
      );
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack traces in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const testError = new Error('Test error with stack');
      logger.error('Test message', testError);
      
      expect(mockConsole.error).not.toHaveBeenCalledWith(
        expect.stringContaining('Stack:')
      );
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Package Import Tests', () => {
    it('should import logger from package name', () => {
      // This test verifies the package export surface
      expect(() => {
        require('@pawfectmatch/core');
      }).not.toThrow();
    });
  });

  describe('No Node-only APIs', () => {
    it('should not use Node-specific APIs in browser environment', () => {
      // Mock browser environment
      const mockWindow = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      
      // Mock getWindowObject to return browser window
      jest.doMock('../src/utils/environment', () => ({
        getWindowObject: () => mockWindow,
        addEventListenerSafely: jest.fn(),
      }));
      
      // Create logger instance in browser-like environment
      const browserLogger = new LoggerService({
        enableConsole: true,
        enableErrorTracking: true,
      });
      
      // Should not throw when accessing browser APIs
      expect(() => {
        browserLogger.info('Browser test message');
      }).not.toThrow();
      
      expect(mockConsole.info).toHaveBeenCalled();
    });
  });
});
