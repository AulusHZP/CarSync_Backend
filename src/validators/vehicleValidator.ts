import { z } from 'zod';

export const createVehicleSchema = z.object({
  model: z
    .string()
    .trim()
    .min(2, 'Model is required')
    .max(120, 'Model must be less than 120 characters'),
  year: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'Year must have 4 digits'),
  plate: z
    .string()
    .trim()
    .min(7, 'Plate is required')
    .max(10, 'Plate too long')
    .transform((value) => value.toUpperCase()),
  totalKm: z
    .number()
    .int('totalKm must be an integer')
    .min(0, 'totalKm must be non-negative')
    .max(3000000, 'totalKm is out of expected range'),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
