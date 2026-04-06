import { Service, ServiceStatus } from '@prisma/client';
import prisma from '../config/database';
import { CreateServiceDTO, UpdateServiceDTO } from '../dtos/serviceDTO';

interface FindAllOptions {
  userEmail: string;
  page?: number;
  limit?: number;
  status?: ServiceStatus;
  orderBy?: 'date' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

export class ServiceRepository {
  /**
   * Create a new service
   */
  async create(data: CreateServiceDTO, userEmail: string): Promise<Service> {
    return prisma.service.create({
      data: {
        userEmail,
        serviceType: data.serviceType,
        date: data.date,
        notes: data.notes || null,
        status: ServiceStatus.SCHEDULED,
      },
    });
  }

  /**
   * Find service by ID
   */
  async findById(id: string, userEmail: string): Promise<Service | null> {
    return prisma.service.findFirst({
      where: {
        id,
        userEmail,
      },
    });
  }

  /**
   * Find all services with pagination and optional filters
   */
  async findAll(options: FindAllOptions): Promise<{
    services: Service[];
    total: number;
  }> {
    const {
      userEmail,
      page = 1,
      limit = 10,
      status,
      orderBy = 'date',
      orderDirection = 'asc',
    } = options;

    const skip = (page - 1) * limit;
    const where = {
      userEmail,
      ...(status ? { status } : {}),
    };

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [orderBy]: orderDirection,
        },
      }),
      prisma.service.count({ where }),
    ]);

    return { services, total };
  }

  /**
   * Update service details
   */
  async update(id: string, userEmail: string, data: UpdateServiceDTO): Promise<Service> {
    const owned = await prisma.service.findFirst({
      where: { id, userEmail },
      select: { id: true },
    });

    if (!owned) {
      throw new Error('Service not found');
    }

    return prisma.service.update({
      where: { id },
      data: {
        ...(data.serviceType && { serviceType: data.serviceType }),
        ...(data.date && { date: data.date }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
      },
    });
  }

  /**
   * Update service status
   */
  async updateStatus(id: string, userEmail: string, status: ServiceStatus): Promise<Service> {
    const owned = await prisma.service.findFirst({
      where: { id, userEmail },
      select: { id: true },
    });

    if (!owned) {
      throw new Error('Service not found');
    }

    return prisma.service.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Delete a service
   */
  async delete(id: string, userEmail: string): Promise<Service> {
    const owned = await prisma.service.findFirst({
      where: { id, userEmail },
      select: { id: true },
    });

    if (!owned) {
      throw new Error('Service not found');
    }

    return prisma.service.delete({
      where: { id },
    });
  }

  /**
   * Get upcoming services (for dashboard/notifications)
   */
  async getUpcomingServices(userEmail: string, days: number = 7): Promise<Service[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return prisma.service.findMany({
      where: {
        userEmail,
        date: {
          gte: today,
          lte: futureDate,
        },
        status: {
          in: [ServiceStatus.SCHEDULED, ServiceStatus.UPCOMING],
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  /**
   * Get service statistics
   */
  async getStatistics(userEmail: string): Promise<{
    total: number;
    completed: number;
    scheduled: number;
    upcoming: number;
  }> {
    const [total, completed, scheduled, upcoming] = await Promise.all([
      prisma.service.count({ where: { userEmail } }),
      prisma.service.count({ where: { userEmail, status: ServiceStatus.COMPLETED } }),
      prisma.service.count({ where: { userEmail, status: ServiceStatus.SCHEDULED } }),
      prisma.service.count({ where: { userEmail, status: ServiceStatus.UPCOMING } }),
    ]);

    return { total, completed, scheduled, upcoming };
  }
}
