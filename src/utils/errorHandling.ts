import { toast } from 'sonner';

/**
 * Error types for better error categorization
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  FILE_OPERATION = 'FILE_OPERATION',
  PDF_GENERATION = 'PDF_GENERATION',
  DATA_PROCESSING = 'DATA_PROCESSING',
  STORAGE = 'STORAGE',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly originalError?: Error;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code?: string,
    originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.originalError = originalError;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Error handler utility
 */
export class ErrorHandler {
  /**
   * Handle errors with appropriate user feedback
   */
  static handle(error: Error | AppError, context?: string): void {
    console.error(`Error in ${context || 'application'}:`, error);

    let message = 'An unexpected error occurred';
    let description = error.message;

    if (error instanceof AppError) {
      switch (error.type) {
        case ErrorType.VALIDATION:
          message = 'Validation Error';
          break;
        case ErrorType.NETWORK:
          message = 'Network Error';
          description = 'Please check your internet connection and try again.';
          break;
        case ErrorType.FILE_OPERATION:
          message = 'File Operation Error';
          break;
        case ErrorType.PDF_GENERATION:
          message = 'PDF Generation Error';
          description = 'Failed to generate PDF. Please check your data and try again.';
          break;
        case ErrorType.DATA_PROCESSING:
          message = 'Data Processing Error';
          break;
        case ErrorType.STORAGE:
          message = 'Storage Error';
          description = 'Failed to save data. Your browser storage may be full.';
          break;
      }
    }

    // Show toast notification
    toast.error(message, {
      description,
      duration: 5000,
    });

    // Log to error reporting service
    this.logError(error, context);
  }

  /**
   * Log error to reporting service
   */
  private static logError(error: Error, context?: string): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Store in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(errorData);
      localStorage.setItem('app_errors', JSON.stringify(errors.slice(-20)));
    } catch (e) {
      console.error('Failed to log error', e);
    }

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  }

  /**
   * Wrap async function with error handling
   */
  static async handleAsync<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error as Error, context);
      return null;
    }
  }

  /**
   * Wrap sync function with error handling
   */
  static handleSync<T>(fn: () => T, context?: string): T | null {
    try {
      return fn();
    } catch (error) {
      this.handle(error as Error, context);
      return null;
    }
  }
}

/**
 * Validation helper
 */
export class ValidationError extends AppError {
  constructor(message: string, code?: string) {
    super(message, ErrorType.VALIDATION, code);
    this.name = 'ValidationError';
  }
}

/**
 * Retry mechanism for network operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }

  throw new AppError(
    `Operation failed after ${maxRetries} attempts: ${lastError!.message}`,
    ErrorType.NETWORK,
    'RETRY_EXHAUSTED',
    lastError!
  );
}

/**
 * Safe JSON parse with error handling
 */
export function safeJSONParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
}

/**
 * Safe localStorage operations
 */
export const SafeStorage = {
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  },

  setItem(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      ErrorHandler.handle(
        new AppError('Failed to save data to local storage', ErrorType.STORAGE),
        'SafeStorage.setItem'
      );
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  },

  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },
};
