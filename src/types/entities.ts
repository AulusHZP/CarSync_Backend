import { ExpenseCategory, ServiceStatus } from '@prisma/client';

// Request DTOs
export interface CreateExpenseRequest {
  category: ExpenseCategory;
  amount: number;
  fuelType?: string;
  liters?: number;
  pricePerLiter?: number;
}

export interface UpdateExpenseRequest {
  category?: ExpenseCategory;
  amount?: number;
  fuelType?: string;
  liters?: number;
  pricePerLiter?: number;
}

export interface CreateServiceRequest {
  serviceType: string;
  date: string;
  notes?: string;
}

export interface UpdateServiceRequest {
  serviceType?: string;
  date?: string;
  notes?: string;
}

export interface UpdateServiceStatusRequest {
  status: ServiceStatus;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// Response DTOs
export interface ExpenseResponse {
  id: string;
  category: string;
  amount: number;
  categoryLabel: string;
  fuelType?: string;
  liters?: number;
  pricePerLiter?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceResponse {
  id: string;
  serviceType: string;
  date: string;
  notes: string | null;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message: string;
}

export interface SuccessResponse<T> {
  data: T;
  message: string;
}

export interface ErrorResponse {
  error: string;
  details?: Record<string, unknown>;
}

// Category mapping for UI display
export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  FUEL: 'Combustível',
  MAINTENANCE: 'Manutenção',
  INSURANCE: 'Seguro',
  CAR_WASH: 'Lava-rápido',
  PARKING: 'Estacionamento',
  TOLL: 'Pedágio',
  OTHER: 'Outro',
};

// Status mapping for UI display
export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  COMPLETED: 'Concluído',
  SCHEDULED: 'Agendado',
  UPCOMING: 'Em breve',
};
