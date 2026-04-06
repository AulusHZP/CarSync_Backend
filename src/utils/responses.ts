import { Response } from 'express';
import { ErrorResponse, SuccessResponse, PaginatedResponse } from '../types/entities';

export class ApiResponse {
  /**
   * Send a success response with data
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
  ): Response {
    const payload: SuccessResponse<T> = {
      data,
      message,
    };
    return res.status(statusCode).json(payload);
  }

  /**
   * Send a paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Success',
    statusCode: number = 200,
  ): Response {
    const pages = Math.ceil(total / limit);
    const payload: PaginatedResponse<T> = {
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
      message,
    };
    return res.status(statusCode).json(payload);
  }

  /**
   * Send an error response
   */
  static error(
    res: Response,
    error: string,
    statusCode: number = 500,
    details?: Record<string, unknown>,
  ): Response {
    const payload: ErrorResponse = {
      error,
      ...(details && { details }),
    };
    return res.status(statusCode).json(payload);
  }

  /**
   * Send a validation error response
   */
  static validationError(
    res: Response,
    errors: Record<string, unknown>,
  ): Response {
    return this.error(res, 'Validation failed', 400, errors);
  }

  /**
   * Send a not found error response
   */
  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return this.error(res, message, 404);
  }

  /**
   * Send a created response
   */
  static created<T>(res: Response, data: T, message: string = 'Created successfully'): Response {
    return this.success(res, data, message, 201);
  }

  /**
   * Send a no content response
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
