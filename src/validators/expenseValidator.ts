import { z } from 'zod';
import { ExpenseCategory } from '@prisma/client';

// Enum values for Zod validation
const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);

// Create Expense validation schema
export const createExpenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES as [string, ...string[]], {
    errorMap: () => ({
      message: `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
    }),
  }),
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be greater than 0')
    .max(999999.99, 'Amount must be less than 999999.99'),
});

// Update Expense validation schema
export const updateExpenseSchema = createExpenseSchema.partial();

// Pagination validation schema
export const paginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Page must be a positive number')
    .optional()
    .default('1')
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val)),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .optional()
    .default('10')
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val)),
});

/** Type exports for use in services/controllers */
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
