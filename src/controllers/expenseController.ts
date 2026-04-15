import { Response } from 'express';
import { z } from 'zod';
import { ExpenseCategory } from '@prisma/client';
import expenseService from '../services/expenseService';
import {
  createExpenseSchema,
  updateExpenseSchema,
  paginationSchema,
} from '../validators/expenseValidator';
import { ApiResponse } from '../utils/responses';
import { AuthRequest } from '../types/express';

export class ExpenseController {
  /**
   * POST /api/expenses - Create a new expense
   */
  async createExpense(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      // Validate request body
      const validatedData = createExpenseSchema.parse(req.body);

      // Call service (cast string to ExpenseCategory enum)
      const expense = await expenseService.createExpense(
        userEmail,
        validatedData.category as ExpenseCategory,
        validatedData.amount,
        validatedData.fuelType,
        validatedData.liters,
        validatedData.pricePerLiter,
      );

      // Return response
      ApiResponse.created(res, expense, 'Expense created successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /api/expenses - Get all expenses with pagination
   */
  async getAllExpenses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      // Validate query params
      const validatedQuery = paginationSchema.parse(req.query);

      // Call service
      const { expenses, total } = await expenseService.getAllExpenses(
        userEmail,
        validatedQuery.page,
        validatedQuery.limit,
      );

      // Return paginated response
      ApiResponse.paginated(
        res,
        expenses,
        validatedQuery.page,
        validatedQuery.limit,
        total,
        'Expenses retrieved successfully',
      );
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /api/expenses/:id - Get expense by ID
   */
  async getExpenseById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      const { id } = req.params;

      // Validate UUID format (basic check)
      if (!id || typeof id !== 'string') {
        ApiResponse.error(res, 'Invalid expense ID', 400);
        return;
      }

      // Call service
      const expense = await expenseService.getExpenseById(id, userEmail);

      if (!expense) {
        ApiResponse.notFound(res, 'Expense not found');
        return;
      }

      // Return response
      ApiResponse.success(res, expense, 'Expense retrieved successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PUT /api/expenses/:id - Update an expense
   */
  async updateExpense(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      const { id } = req.params;

      // Validate UUID format (basic check)
      if (!id || typeof id !== 'string') {
        ApiResponse.error(res, 'Invalid expense ID', 400);
        return;
      }

      // Validate request body
      const validatedData = updateExpenseSchema.parse(req.body);

      // Ensure at least one field is being updated
      if (Object.keys(validatedData).length === 0) {
        ApiResponse.error(res, 'No fields to update', 400);
        return;
      }

      // Cast category to ExpenseCategory enum if present
      const updateData = {
        ...(validatedData.category && { category: validatedData.category as ExpenseCategory }),
        ...(validatedData.amount !== undefined && { amount: validatedData.amount }),
        ...(validatedData.fuelType !== undefined && { fuelType: validatedData.fuelType }),
        ...(validatedData.liters !== undefined && { liters: validatedData.liters }),
        ...(validatedData.pricePerLiter !== undefined && { pricePerLiter: validatedData.pricePerLiter }),
      };

      // Call service
      const updatedExpense = await expenseService.updateExpense(
        id,
        userEmail,
        updateData,
      );

      if (!updatedExpense) {
        ApiResponse.notFound(res, 'Expense not found');
        return;
      }

      // Return response
      ApiResponse.success(res, updatedExpense, 'Expense updated successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * DELETE /api/expenses/:id - Delete an expense
   */
  async deleteExpense(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.userEmail;
      if (!userEmail) {
        ApiResponse.error(res, 'Missing user scope', 401);
        return;
      }

      const { id } = req.params;

      // Validate UUID format (basic check)
      if (!id || typeof id !== 'string') {
        ApiResponse.error(res, 'Invalid expense ID', 400);
        return;
      }

      // Call service
      const deleted = await expenseService.deleteExpense(id, userEmail);

      if (!deleted) {
        ApiResponse.notFound(res, 'Expense not found');
        return;
      }

      // Return response
      ApiResponse.noContent(res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Handle errors from Zod validation and service calls
   */
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

    if (error instanceof Error) {
      console.error('Error:', error.message);
      ApiResponse.error(res, 'Internal server error', 500);
      return;
    }

    ApiResponse.error(res, 'Internal server error', 500);
  }
}

export default new ExpenseController();
