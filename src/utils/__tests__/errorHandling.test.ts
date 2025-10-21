import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AppError,
  ErrorType,
  ErrorHandler,
  ValidationError,
  retryOperation,
  safeJSONParse,
  SafeStorage,
} from '../errorHandling';

describe('AppError', () => {
  it('should create error with correct properties', () => {
    const error = new AppError('Test error', ErrorType.VALIDATION, 'TEST_CODE');

    expect(error.message).toBe('Test error');
    expect(error.type).toBe(ErrorType.VALIDATION);
    expect(error.code).toBe('TEST_CODE');
    expect(error.name).toBe('AppError');
  });

  it('should default to UNKNOWN type if not specified', () => {
    const error = new AppError('Test error');
    expect(error.type).toBe(ErrorType.UNKNOWN);
  });

  it('should capture original error', () => {
    const originalError = new Error('Original');
    const error = new AppError('Wrapped', ErrorType.NETWORK, undefined, originalError);

    expect(error.originalError).toBe(originalError);
  });
});

describe('ValidationError', () => {
  it('should create validation error', () => {
    const error = new ValidationError('Invalid input', 'INVALID_INPUT');

    expect(error.message).toBe('Invalid input');
    expect(error.type).toBe(ErrorType.VALIDATION);
    expect(error.code).toBe('INVALID_INPUT');
    expect(error.name).toBe('ValidationError');
  });
});

describe('ErrorHandler', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should handle errors without crashing', () => {
    const error = new Error('Test error');
    expect(() => ErrorHandler.handle(error, 'Test context')).not.toThrow();
  });

  it('should handle async operations successfully', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await ErrorHandler.handleAsync(fn, 'Test');

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalled();
  });

  it('should handle async operation failures', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Async error'));
    const result = await ErrorHandler.handleAsync(fn, 'Test');

    expect(result).toBeNull();
    expect(fn).toHaveBeenCalled();
  });

  it('should handle sync operations successfully', () => {
    const fn = vi.fn().mockReturnValue('success');
    const result = ErrorHandler.handleSync(fn, 'Test');

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalled();
  });

  it('should handle sync operation failures', () => {
    const fn = vi.fn().mockImplementation(() => {
      throw new Error('Sync error');
    });
    const result = ErrorHandler.handleSync(fn, 'Test');

    expect(result).toBeNull();
    expect(fn).toHaveBeenCalled();
  });
});

describe('retryOperation', () => {
  it('should succeed on first attempt', async () => {
    const operation = vi.fn().mockResolvedValue('success');
    const result = await retryOperation(operation, 3, 100);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const result = await retryOperation(operation, 3, 10);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should throw after max retries exceeded', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Always fails'));

    await expect(retryOperation(operation, 3, 10)).rejects.toThrow(AppError);
    expect(operation).toHaveBeenCalledTimes(3);
  });
});

describe('safeJSONParse', () => {
  it('should parse valid JSON', () => {
    const result = safeJSONParse('{"key": "value"}', {});
    expect(result).toEqual({ key: 'value' });
  });

  it('should return default value for invalid JSON', () => {
    const defaultValue = { default: true };
    const result = safeJSONParse('invalid json', defaultValue);
    expect(result).toBe(defaultValue);
  });

  it('should handle empty string', () => {
    const result = safeJSONParse('', { default: true });
    expect(result).toEqual({ default: true });
  });
});

describe('SafeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should get item from localStorage', () => {
    localStorage.setItem('test', JSON.stringify({ value: 123 }));
    const result = SafeStorage.getItem('test', { value: 0 });

    expect(result).toEqual({ value: 123 });
  });

  it('should return default value if item does not exist', () => {
    const result = SafeStorage.getItem('nonexistent', { default: true });
    expect(result).toEqual({ default: true });
  });

  it('should set item in localStorage', () => {
    const success = SafeStorage.setItem('test', { value: 456 });

    expect(success).toBe(true);
    expect(localStorage.getItem('test')).toBe(JSON.stringify({ value: 456 }));
  });

  it('should remove item from localStorage', () => {
    localStorage.setItem('test', 'value');
    const success = SafeStorage.removeItem('test');

    expect(success).toBe(true);
    expect(localStorage.getItem('test')).toBeNull();
  });

  it('should clear localStorage', () => {
    localStorage.setItem('key1', 'value1');
    localStorage.setItem('key2', 'value2');

    const success = SafeStorage.clear();

    expect(success).toBe(true);
    expect(localStorage.length).toBe(0);
  });

  it('should handle corrupted data gracefully', () => {
    localStorage.setItem('corrupted', 'not valid json');
    const result = SafeStorage.getItem('corrupted', { default: true });

    expect(result).toEqual({ default: true });
  });
});
