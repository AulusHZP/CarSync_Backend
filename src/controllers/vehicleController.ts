import { Response } from 'express';
import { z } from 'zod';
import vehicleService, { VehicleServiceError } from '../services/vehicleService';
import { createVehicleSchema } from '../validators/vehicleValidator';
import { ApiResponse } from '../utils/responses';
import { AuthRequest } from '../types/express';

export class VehicleController {
  async createVehicle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      const data = createVehicleSchema.parse(req.body);

      const vehicle = await vehicleService.createVehicle(
        userEmail,
        data.model,
        data.year,
        data.plate,
        data.totalKm,
      );

      ApiResponse.created(res, vehicle, 'Vehicle created successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async listVehicles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      const vehicles = await vehicleService.listVehicles(userEmail);
      ApiResponse.success(res, vehicles, 'Vehicles retrieved successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteVehicle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      const plate = (req.params.plate ?? '').toString().trim();
      if (!plate) {
        ApiResponse.validationError(res, { plate: 'Plate is required' });
        return;
      }

      await vehicleService.deleteVehicle(userEmail, plate);
      ApiResponse.noContent(res);
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

    if (error instanceof VehicleServiceError) {
      ApiResponse.error(res, error.message, error.statusCode);
      return;
    }

    if (error instanceof Error) {
      console.error('Vehicle controller error:', error.message);
      ApiResponse.error(res, 'Internal server error', 500);
      return;
    }

    ApiResponse.error(res, 'Internal server error', 500);
  }
}

export default new VehicleController();
