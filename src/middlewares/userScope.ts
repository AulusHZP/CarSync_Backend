import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/responses';
import { AuthRequest } from '../types/express';

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function requireUserScope(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const rawEmail = req.header('x-user-email') || req.header('X-User-Email');
  const userEmail = rawEmail?.trim().toLowerCase();

  if (!userEmail) {
    ApiResponse.error(res, 'Missing x-user-email header', 401);
    return;
  }

  if (!emailRegex.test(userEmail)) {
    ApiResponse.error(res, 'Invalid x-user-email header', 400);
    return;
  }

  req.userEmail = userEmail;
  next();
}
