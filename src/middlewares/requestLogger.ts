import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

  // Capture response end to log response time
  const originalEnd = res.end.bind(res);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.end = function (chunk?: any, encoding?: any, callback?: any) {
    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`,
    );

    // Call original end method with proper typing
    if (typeof encoding === 'function') {
      return originalEnd(chunk, encoding);
    }
    if (typeof callback === 'function') {
      return originalEnd(chunk, encoding, callback);
    }
    return originalEnd(chunk);
  } as any;

  next();
};

export default requestLogger;
