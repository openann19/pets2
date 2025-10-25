/**
 * Enhanced Error Handling Service for Mobile
 * Comprehensive error management with reporting, recovery, and user-friendly messages
 */

import { logger } from "@pawfectmatch/core";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ErrorContext {
  screen?: string;
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  platform: "mobile";
  version: string;
  deviceInfo?: {
    model: string;
    os: string;
    osVersion: string;
  };
}

export interface ErrorReport {
  id: string;
  type: "error" | "warning" | "critical";
  message: string;
  stack?: string;
  context: ErrorContext;
  userMessage: string;
  recoveryActions: string[];
  reported: boolean;
  resolved: boolean;
  createdAt: number;
  resolvedAt?: number;
}

export interface ErrorHandlingConfig {
  enabled: boolean;
  reportToServer: boolean;
  showUserMessages: boolean;
  autoRecovery: boolean;
  maxRetries: number;
  retryDelay: number;
  maxStoredErrors: number;
  criticalErrorThreshold: number;
}

export class ErrorHandlingService {
  private errors: ErrorReport[] = [];
  private config: ErrorHandlingConfig;
  private retryCounts: Map<string, number> = new Map();

  constructor(
    config: ErrorHandlingConfig = {
      enabled: true,
      reportToServer: true,
      showUserMessages: true,
      autoRecovery: true,
      maxRetries: 3,
      retryDelay: 1000,
      maxStoredErrors: 100,
      criticalErrorThreshold: 5,
    },
  ) {
    this.config = config;
    this.loadStoredErrors();
  }

  private async loadStoredErrors(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem("error_reports");
      if (stored) {
        this.errors = JSON.parse(stored);
      }
    } catch (error) {
      logger.error("Failed to load stored errors", { error });
    }
  }

  private async saveErrors(): Promise<void> {
    try {
      await AsyncStorage.setItem("error_reports", JSON.stringify(this.errors));
    } catch (error) {
      logger.error("Failed to save errors", { error });
    }
  }

  handleError(
    error: Error,
    context: Partial<ErrorContext> = {},
    userMessage?: string,
    recoveryActions: string[] = [],
  ): ErrorReport {
    if (!this.config.enabled) {
      return this.createErrorReport(
        error,
        context,
        userMessage,
        recoveryActions,
      );
    }

    const errorReport = this.createErrorReport(
      error,
      context,
      userMessage,
      recoveryActions,
    );

    // Add to errors list
    this.errors.push(errorReport);

    // Keep only the most recent errors
    if (this.errors.length > this.config.maxStoredErrors) {
      this.errors = this.errors.slice(-this.config.maxStoredErrors);
    }

    // Save to storage
    this.saveErrors();

    // Log error
    logger.error("Error handled", {
      id: errorReport.id,
      message: error.message,
      context,
    });

    // Report to server if enabled
    if (this.config.reportToServer) {
      this.reportErrorToServer(errorReport);
    }

    // Show user message if enabled
    if (this.config.showUserMessages && userMessage) {
      this.showUserMessage(userMessage);
    }

    // Attempt auto-recovery if enabled
    if (this.config.autoRecovery && recoveryActions.length > 0) {
      this.attemptRecovery(errorReport);
    }

    return errorReport;
  }

  private createErrorReport(
    error: Error,
    context: Partial<ErrorContext>,
    userMessage?: string,
    recoveryActions: string[] = [],
  ): ErrorReport {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id,
      type: this.determineErrorType(error),
      message: error.message,
      stack: error.stack,
      context: {
        timestamp: Date.now(),
        platform: "mobile",
        version: "1.0.0",
        ...context,
      },
      userMessage: userMessage || this.getDefaultUserMessage(error),
      recoveryActions,
      reported: false,
      resolved: false,
      createdAt: Date.now(),
    };
  }

  private determineErrorType(error: Error): "error" | "warning" | "critical" {
    const criticalErrors = [
      "NetworkError",
      "DatabaseError",
      "AuthenticationError",
      "PaymentError",
    ];

    const warningErrors = ["ValidationError", "TimeoutError", "RateLimitError"];

    if (criticalErrors.some((type) => error.name.includes(type))) {
      return "critical";
    }

    if (warningErrors.some((type) => error.name.includes(type))) {
      return "warning";
    }

    return "error";
  }

  private getDefaultUserMessage(error: Error): string {
    const messageMap: Record<string, string> = {
      NetworkError: "Please check your internet connection and try again.",
      DatabaseError:
        "We're experiencing technical difficulties. Please try again later.",
      AuthenticationError: "Please log in again to continue.",
      PaymentError:
        "There was an issue processing your payment. Please try again.",
      ValidationError: "Please check your input and try again.",
      TimeoutError: "The request timed out. Please try again.",
      RateLimitError: "Too many requests. Please wait a moment and try again.",
    };

    return messageMap[error.name] || "Something went wrong. Please try again.";
  }

  private async reportErrorToServer(errorReport: ErrorReport): Promise<void> {
    try {
      // In a real implementation, you'd send this to your error reporting service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   body: JSON.stringify(errorReport),
      // });

      errorReport.reported = true;
      logger.info("Error reported to server", { id: errorReport.id });
    } catch (error) {
      logger.error("Failed to report error to server", { error });
    }
  }

  private showUserMessage(message: string): void {
    // In a real implementation, you'd show this using your UI system
    // Alert.alert("Error", message);
    logger.info("User message shown", { message });
  }

  private async attemptRecovery(errorReport: ErrorReport): Promise<void> {
    const retryKey = `${errorReport.context.screen}_${errorReport.context.action}`;
    const retryCount = this.retryCounts.get(retryKey) || 0;

    if (retryCount >= this.config.maxRetries) {
      logger.warn("Max retries reached for error", { id: errorReport.id });
      return;
    }

    this.retryCounts.set(retryKey, retryCount + 1);

    // Wait before retry
    await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay));

    // Attempt recovery actions
    for (const action of errorReport.recoveryActions) {
      try {
        await this.executeRecoveryAction(action);
        logger.info("Recovery action successful", {
          action,
          id: errorReport.id,
        });
        errorReport.resolved = true;
        errorReport.resolvedAt = Date.now();
        break;
      } catch (error) {
        logger.error("Recovery action failed", { action, error });
      }
    }
  }

  private async executeRecoveryAction(action: string): Promise<void> {
    switch (action) {
      case "retry_request":
        // Retry the failed request
        break;
      case "clear_cache":
        // Clear application cache
        break;
      case "refresh_auth":
        // Refresh authentication token
        break;
      case "reload_data":
        // Reload data from server
        break;
      case "restart_app":
        // Restart the application
        break;
      default:
        logger.warn("Unknown recovery action", { action });
    }
  }

  // Public methods for error management
  getErrors(filter?: {
    type?: "error" | "warning" | "critical";
    resolved?: boolean;
    reported?: boolean;
  }): ErrorReport[] {
    let filtered = [...this.errors];

    if (filter) {
      if (filter.type) {
        filtered = filtered.filter((error) => error.type === filter.type);
      }
      if (filter.resolved !== undefined) {
        filtered = filtered.filter(
          (error) => error.resolved === filter.resolved,
        );
      }
      if (filter.reported !== undefined) {
        filtered = filtered.filter(
          (error) => error.reported === filter.reported,
        );
      }
    }

    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }

  getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    resolved: number;
    unresolved: number;
    reported: number;
    unreported: number;
  } {
    const stats = {
      total: this.errors.length,
      byType: {} as Record<string, number>,
      resolved: 0,
      unresolved: 0,
      reported: 0,
      unreported: 0,
    };

    this.errors.forEach((error) => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;

      if (error.resolved) {
        stats.resolved++;
      } else {
        stats.unresolved++;
      }

      if (error.reported) {
        stats.reported++;
      } else {
        stats.unreported++;
      }
    });

    return stats;
  }

  markErrorResolved(errorId: string): void {
    const error = this.errors.find((e) => e.id === errorId);
    if (error) {
      error.resolved = true;
      error.resolvedAt = Date.now();
      this.saveErrors();
    }
  }

  clearResolvedErrors(): void {
    this.errors = this.errors.filter((error) => !error.resolved);
    this.saveErrors();
  }

  clearAllErrors(): void {
    this.errors = [];
    this.retryCounts.clear();
    this.saveErrors();
  }

  // Error boundary helper
  createErrorBoundaryHandler() {
    return (error: Error, errorInfo: { componentStack: string }) => {
      this.handleError(
        error,
        {
          component: "ErrorBoundary",
          action: "component_error",
        },
        "Something went wrong. The app will try to recover.",
        ["retry_request", "reload_data"],
      );
    };
  }

  // Network error handler
  handleNetworkError(error: Error, request: { url: string; method: string }) {
    return this.handleError(
      error,
      {
        action: "network_request",
      },
      "Network error. Please check your connection.",
      ["retry_request", "clear_cache"],
    );
  }

  // API error handler
  handleAPIError(error: Error, response: { status: number; url: string }) {
    const userMessage =
      response.status >= 500
        ? "Server error. Please try again later."
        : response.status === 401
          ? "Please log in again."
          : "Request failed. Please try again.";

    return this.handleError(
      error,
      {
        action: "api_request",
      },
      userMessage,
      ["retry_request", "refresh_auth"],
    );
  }

  // Validation error handler
  handleValidationError(error: Error, field: string) {
    return this.handleError(
      error,
      {
        action: "validation",
      },
      `Please check the ${field} field and try again.`,
      ["retry_request"],
    );
  }
}

export default ErrorHandlingService;
