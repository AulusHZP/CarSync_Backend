import { ServiceStatus } from '@prisma/client';
import { ServiceRepository } from '../repositories/serviceRepository';
import { CreateServiceDTO, UpdateServiceDTO } from '../dtos/serviceDTO';
import { ServiceResponse } from '../types/entities';

export class ServiceService {
  private repository: ServiceRepository;

  constructor() {
    this.repository = new ServiceRepository();
  }

  /**
   * Create a new service
   */
  async createService(
    userEmail: string,
    serviceType: string,
    date: Date,
    notes?: string,
  ): Promise<ServiceResponse> {
    const createDTO = new CreateServiceDTO({
      serviceType,
      date,
      notes: notes || null,
    });

    const service = await this.repository.create(createDTO, userEmail);
    return this.mapToResponse(service);
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: string, userEmail: string): Promise<ServiceResponse | null> {
    const service = await this.repository.findById(id, userEmail);
    if (!service) {
      return null;
    }
    return this.mapToResponse(service);
  }

  /**
   * Get all services with pagination and filters
   */
  async getAllServices(
    userEmail: string,
    page: number = 1,
    limit: number = 10,
    status?: ServiceStatus,
  ): Promise<{
    services: ServiceResponse[];
    total: number;
  }> {
    const { services, total } = await this.repository.findAll({
      userEmail,
      page,
      limit,
      status,
      orderBy: 'date',
      orderDirection: 'asc',
    });

    return {
      services: services.map((service) => this.mapToResponse(service)),
      total,
    };
  }

  /**
   * Update service details
   */
  async updateService(
    id: string,
    userEmail: string,
    updates: {
      serviceType?: string;
      date?: Date;
      notes?: string;
    },
  ): Promise<ServiceResponse | null> {
    try {
      const updateDTO = new UpdateServiceDTO({
        serviceType: updates.serviceType,
        date: updates.date,
        notes: updates.notes || null,
      });

      const service = await this.repository.update(id, userEmail, updateDTO);
      return this.mapToResponse(service);
    } catch (error: unknown) {
      // Prisma throws NotFoundError if record doesn't exist
      if (
        error instanceof Error &&
        error.message.includes('An operation failed because it depends on one or more records that were required but not found')
      ) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update service status
   */
  async updateServiceStatus(
    id: string,
    userEmail: string,
    status: ServiceStatus,
  ): Promise<ServiceResponse | null> {
    try {
      const service = await this.repository.updateStatus(id, userEmail, status);
      return this.mapToResponse(service);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.includes('An operation failed because it depends on one or more records that were required but not found')
      ) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete a service
   */
  async deleteService(id: string, userEmail: string): Promise<boolean> {
    try {
      await this.repository.delete(id, userEmail);
      return true;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.includes('An operation failed because it depends on one or more records that were required but not found')
      ) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get upcoming services
   */
  async getUpcomingServices(userEmail: string, days: number = 7): Promise<ServiceResponse[]> {
    const services = await this.repository.getUpcomingServices(userEmail, days);
    return services.map((service) => this.mapToResponse(service));
  }

  /**
   * Get service statistics
   */
  async getServiceStatistics(userEmail: string): Promise<{
    total: number;
    completed: number;
    scheduled: number;
    upcoming: number;
  }> {
    return this.repository.getStatistics(userEmail);
  }

  /**
   * Map service entity to response DTO
   */
  private mapToResponse(service: any): ServiceResponse {
    return {
      id: service.id,
      serviceType: service.serviceType,
      date: service.date.toISOString(),
      notes: service.notes,
      status: service.status,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };
  }
}

// Export singleton instance
export default new ServiceService();
