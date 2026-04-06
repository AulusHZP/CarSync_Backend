import { Response } from 'express';
import { z } from 'zod';
import { ApiResponse } from '../utils/responses';
import { AuthRequest } from '../types/express';
import authService, { AuthServiceError } from '../services/authService';
import { loginSchema, registerSchema } from '../validators/authValidator';

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const auth = await authService.register(
        validatedData.name,
        validatedData.email,
        validatedData.password,
      );

      ApiResponse.created(res, auth, 'User registered successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const auth = await authService.login(validatedData.email, validatedData.password);

      ApiResponse.success(res, auth, 'Login successful');
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, unknown> = {};
      for (const issue of error.issues) {
        const path = issue.path.join('.');
        fieldErrors[path] = issue.message;
      }
      ApiResponse.validationError(res, fieldErrors);
      return;
    }

    if (error instanceof AuthServiceError) {
      ApiResponse.error(res, error.message, error.statusCode);
      return;
    }

    if (error instanceof Error) {
      console.error('AuthController error:', error.message);
      ApiResponse.error(res, 'Internal server error', 500);
      return;
    }

    ApiResponse.error(res, 'Internal server error', 500);
  }
}

export default new AuthController();
