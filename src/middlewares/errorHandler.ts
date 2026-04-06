import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/responses';

export class ErrorHandler {
  /**
   * Global error handling middleware
   */
  static handle(err: Error, req: Request, res: Response, _next: NextFunction): void {
    console.error('Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    });

    // Default to 500 Internal Server Error
    let statusCode = 500;
    let message = 'Internal server error';

    // Handle specific error types
    if (err.message && err.message.includes('not found')) {
      statusCode = 404;
      message = 'Resource not found';
    }

    ApiResponse.error(res, message, statusCode);
  }

  /**
   * 404 Not Found middleware (should be called last)
   */
  static notFound(req: Request, res: Response, _next: NextFunction): void {
    ApiResponse.notFound(res, `Route ${req.method} ${req.path} not found`);
  }
}

export default ErrorHandler;
