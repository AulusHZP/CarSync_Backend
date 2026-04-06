import { Response } from 'express';
import { ServiceStatus } from '@prisma/client';
import serviceService from '../services/serviceService';
import {
  createServiceSchema,
  updateServiceSchema,
  updateServiceStatusSchema,
  paginationSchema,
} from '../validators/serviceValidator';
import { ApiResponse } from '../utils/responses';
import { AuthRequest } from '../types/express';

export class ServiceController {
  /**
   * POST /api/services - Create a new service
   */
  async createService(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      // Validate request body
      const validatedData = createServiceSchema.parse(req.body);

      // Call service
      const service = await serviceService.createService(
        userEmail,
        validatedData.serviceType,
        validatedData.date,
        validatedData.notes || undefined,
      );

      // Return response
      ApiResponse.created(res, service, 'Service created successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /api/services - Get all services with pagination
   */
  async getAllServices(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      // Validate query params
      const validatedQuery = paginationSchema.parse(req.query);

      // Extract optional status filter from query
      const status = req.query.status as ServiceStatus | undefined;

      // Call service
      const { services, total } = await serviceService.getAllServices(
        userEmail,
        validatedQuery.page,
        validatedQuery.limit,
        status,
      );

      // Return paginated response
      ApiResponse.paginated(
        res,
        services,
        validatedQuery.page,
        validatedQuery.limit,
        total,
        'Services retrieved successfully',
      );
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /api/services/:id - Get service by ID
   */
  async getServiceById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      const { id } = req.params;

      // Validate ID format (basic check)
      if (!id || typeof id !== 'string') {
        ApiResponse.error(res, 'Invalid service ID', 400);
        return;
      }

      // Call service
      const service = await serviceService.getServiceById(id, userEmail);

      if (!service) {
        ApiResponse.notFound(res, 'Service not found');
        return;
      }

      // Return response
      ApiResponse.success(res, service, 'Service retrieved successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PUT /api/services/:id - Update service details
   */
  async updateService(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      const { id } = req.params;

      // Validate ID format
      if (!id || typeof id !== 'string') {
        ApiResponse.error(res, 'Invalid service ID', 400);
        return;
      }

      // Validate request body
      const validatedData = updateServiceSchema.parse(req.body);

      // Call service
      const updatedService = await serviceService.updateService(
        id,
        userEmail,
        {
          serviceType: validatedData.serviceType,
          date: validatedData.date,
          notes: validatedData.notes || undefined,
        },
      );

      if (!updatedService) {
        ApiResponse.notFound(res, 'Service not found');
        return;
      }

      // Return response
      ApiResponse.success(res, updatedService, 'Service updated successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PATCH /api/services/:id/status - Update service status
   */
  async updateServiceStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      const { id } = req.params;

      // Validate ID format
      if (!id || typeof id !== 'string') {
        ApiResponse.error(res, 'Invalid service ID', 400);
        return;
      }

      // Validate request body
      const validatedData = updateServiceStatusSchema.parse(req.body);

      // Call service
      const service = await serviceService.updateServiceStatus(
        id,
        userEmail,
        validatedData.status,
      );

      if (!service) {
        ApiResponse.notFound(res, 'Service not found');
        return;
      }

      // Return response
      ApiResponse.success(res, service, 'Service status updated successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * DELETE /api/services/:id - Delete a service
   */
  async deleteService(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      const { id } = req.params;

      // Validate ID format
      if (!id || typeof id !== 'string') {
        ApiResponse.error(res, 'Invalid service ID', 400);
        return;
      }

      // Call service
      const deleted = await serviceService.deleteService(id, userEmail);

      if (!deleted) {
        ApiResponse.notFound(res, 'Service not found');
        return;
      }

      // Return success response
      ApiResponse.noContent(res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /api/services/upcoming/list - Get upcoming services
   */
  async getUpcomingServices(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      // Optional days parameter, defaults to 7
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;

      // Call service
      const services = await serviceService.getUpcomingServices(userEmail, days);

      // Return response
      ApiResponse.success(res, services, 'Upcoming services retrieved successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /api/services/statistics/summary - Get service statistics
   */
  async getServiceStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      // Call service
      const stats = await serviceService.getServiceStatistics(userEmail);

      // Return response
      ApiResponse.success(res, stats, 'Service statistics retrieved successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Error handler for controller methods
   */
  private handleError(error: unknown, res: Response): void {
    if (error instanceof SyntaxError) {
      ApiResponse.error(res, 'Invalid JSON in request body', 400);
      return;
    }

    if (error instanceof Error) {
      // Zod validation error
      if ('errors' in error) {
        const errors = (error as any).errors;
        const details = errors.reduce(
          (acc: Record<string, unknown>, err: any) => {
            const path = err.path.join('.');
            acc[path || 'body'] = err.message;
            return acc;
          },
          {},
        );
        ApiResponse.validationError(res, details);
        return;
      }

      // Other known errors
      if (error.message.includes('Validation')) {
        ApiResponse.error(res, error.message, 400);
        return;
      }

      if (error.message.includes('not found')) {
        ApiResponse.notFound(res);
        return;
      }
    }

    // Default server error
    console.error('Unexpected error:', error);
    ApiResponse.error(res, 'An unexpected error occurred', 500);
  }
}

// Export singleton instance
export default new ServiceController();
