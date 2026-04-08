import authRepository from '../repositories/authRepository';
import vehicleRepository from '../repositories/vehicleRepository';

export interface VehicleResponse {
  id: string;
  model: string;
  year: string;
  plate: string;
  totalKm: number;
  createdAt: string;
  updatedAt: string;
}

export class VehicleServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'VehicleServiceError';
  }
}

export class VehicleService {
  async createVehicle(
    userEmail: string,
    model: string,
    year: string,
    plate: string,
    totalKm: number,
  ): Promise<VehicleResponse> {
    const normalizedEmail = userEmail.trim().toLowerCase();
    const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');

    const user = await authRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new VehicleServiceError('User not found', 404);
    }

    const existing = await vehicleRepository.findByPlate(normalizedPlate);
    if (existing) {
      throw new VehicleServiceError('Vehicle already registered', 409);
    }

    const vehicle = await vehicleRepository.create({
      userId: user.id,
      model: model.trim(),
      year: year.trim(),
      plate: normalizedPlate,
      totalKm,
    });

    return this.mapToResponse(vehicle);
  }

  async listVehicles(userEmail: string): Promise<VehicleResponse[]> {
    const normalizedEmail = userEmail.trim().toLowerCase();

    const user = await authRepository.findByEmail(normalizedEmail);
    if (!user) {
      return [];
    }

    const vehicles = await vehicleRepository.findAllByUserId(user.id);
    return vehicles.map((vehicle) => this.mapToResponse(vehicle));
  }

  async deleteVehicle(userEmail: string, plate: string): Promise<void> {
    const normalizedEmail = userEmail.trim().toLowerCase();
    const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');

    const user = await authRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new VehicleServiceError('User not found', 404);
    }

    const vehicle = await vehicleRepository.findByUserIdAndPlate(
      user.id,
      normalizedPlate,
    );
    if (!vehicle) {
      throw new VehicleServiceError('Vehicle not found', 404);
    }

    await vehicleRepository.deleteById(vehicle.id);
  }

  private mapToResponse(vehicle: {
    id: string;
    model: string;
    year: string;
    plate: string;
    totalKm: number;
    createdAt: Date;
    updatedAt: Date;
  }): VehicleResponse {
    return {
      id: vehicle.id,
      model: vehicle.model,
      year: vehicle.year,
      plate: vehicle.plate,
      totalKm: vehicle.totalKm,
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
    };
  }
}

export default new VehicleService();
