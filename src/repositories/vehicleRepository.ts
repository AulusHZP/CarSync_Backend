import { Vehicle } from '@prisma/client';
import prisma from '../config/database';

interface CreateVehicleData {
  userId: string;
  model: string;
  year: string;
  plate: string;
  totalKm: number;
}

export class VehicleRepository {
  async create(data: CreateVehicleData): Promise<Vehicle> {
    return prisma.vehicle.create({
      data: {
        userId: data.userId,
        model: data.model,
        year: data.year,
        plate: data.plate,
        totalKm: data.totalKm,
      },
    });
  }

  async findByPlate(plate: string): Promise<Vehicle | null> {
    return prisma.vehicle.findUnique({
      where: { plate },
    });
  }

  async findAllByUserId(userId: string): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserIdAndPlate(userId: string, plate: string): Promise<Vehicle | null> {
    return prisma.vehicle.findFirst({
      where: {
        userId,
        plate,
      },
    });
  }

  async deleteById(id: string): Promise<void> {
    await prisma.vehicle.delete({
      where: { id },
    });
  }
}

export default new VehicleRepository();
