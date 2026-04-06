import { ServiceStatus } from '@prisma/client';

/**
 * Output DTO for a Service
 */
export class ServiceDTO {
  id: string;
  serviceType: string;
  date: string;
  notes: string | null;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;

  constructor(data: {
    id: string;
    serviceType: string;
    date: Date;
    notes: string | null;
    status: ServiceStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.serviceType = data.serviceType;
    this.date = data.date.toISOString();
    this.notes = data.notes;
    this.status = data.status;
    this.createdAt = data.createdAt.toISOString();
    this.updatedAt = data.updatedAt.toISOString();
  }
}

/**
 * Input DTO for creating a Service
 */
export class CreateServiceDTO {
  serviceType: string;
  date: Date;
  notes?: string | null;

  constructor(data: { serviceType: string; date: Date; notes?: string | null }) {
    this.serviceType = data.serviceType;
    this.date = data.date;
    this.notes = data.notes || null;
  }
}

/**
 * Input DTO for updating a Service
 */
export class UpdateServiceDTO {
  serviceType?: string;
  date?: Date;
  notes?: string | null;

  constructor(data: { serviceType?: string; date?: Date; notes?: string | null }) {
    this.serviceType = data.serviceType;
    this.date = data.date;
    this.notes = data.notes;
  }
}

/**
 * Paginated response DTO
 */
export class PaginatedResponseDTO<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor(data: T[], page: number, limit: number, total: number) {
    this.data = data;
    this.pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
