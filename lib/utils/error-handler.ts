/**
 * Structured error handling and response formatting
 */

import type { ApiResponse } from '@/lib/types/presentation';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT');
  }
}

/**
 * Standardized error response
 */
export function errorResponse<T = any>(
  error: Error | AppError | string,
  statusCode?: number
): ApiResponse<T> {
  let message = 'An error occurred';
  let code = statusCode || 500;

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof AppError) {
    message = error.message;
    code = error.statusCode;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return {
    success: false,
    error: message,
  };
}

/**
 * Success response
 */
export function successResponse<T>(data: T, jobId?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(jobId && { jobId }),
  };
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retry attempts exceeded');
}

/**
 * Log errors with context
 */
export function logError(context: string, error: Error | unknown, additionalData?: any) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(`[${timestamp}] ERROR: ${context}`, {
    error: errorMessage,
    stack,
    ...additionalData,
  });
}
