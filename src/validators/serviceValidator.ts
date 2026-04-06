import { z } from 'zod';
import { ServiceStatus } from '@prisma/client';

/**
 * Validator for creating a new service
 */
export const createServiceSchema = z.object({
  serviceType: z
    .string()
    .min(1, 'Service type is required')
    .max(255, 'Service type must be less than 255 characters')
    .trim(),
  date: z
    .string()
    .datetime('Invalid date format. Use ISO 8601 format')
    .transform((val) => new Date(val)),
  notes: z
    .string()
    .max(1024, 'Notes must be less than 1024 characters')
    .optional()
    .nullable(),
});

/**
 * Validator for updating service details
 */
export const updateServiceSchema = z.object({
  serviceType: z
    .string()
    .min(1, 'Service type is required')
    .max(255, 'Service type must be less than 255 characters')
    .trim()
    .optional(),
  date: z
    .string()
    .datetime('Invalid date format. Use ISO 8601 format')
    .transform((val) => new Date(val))
    .optional(),
  notes: z
    .string()
    .max(1024, 'Notes must be less than 1024 characters')
    .optional()
    .nullable(),
});

/**
 * Validator for updating service status
 */
export const updateServiceStatusSchema = z.object({
  status: z
    .enum([ServiceStatus.COMPLETED, ServiceStatus.SCHEDULED, ServiceStatus.UPCOMING], {
      errorMap: () => ({
        message: `Status must be one of: ${Object.values(ServiceStatus).join(', ')}`,
      }),
    }),
});

/**
 * Validator for pagination parameters
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, 'Page must be at least 1')
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 100, 'Limit must be between 1 and 100')
    .optional()
    .default('10'),
});

// Type inference from validators
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type UpdateServiceStatusInput = z.infer<typeof updateServiceStatusSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
