import { Expense, ExpenseCategory } from '@prisma/client';
import expenseRepository from '../repositories/expenseRepository';
import { CATEGORY_LABELS, ExpenseResponse } from '../types/entities';

export class ExpenseService {
  /**
   * Create a new expense
   */
  async createExpense(
    userEmail: string,
    category: ExpenseCategory,
    amount: number,
  ): Promise<ExpenseResponse> {
    const expense = await expenseRepository.create({
      userEmail,
      category,
      amount,
    });

    return this.mapToResponse(expense);
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(id: string, userEmail: string): Promise<ExpenseResponse | null> {
    const expense = await expenseRepository.findById(id, userEmail);
    if (!expense) {
      return null;
    }
    return this.mapToResponse(expense);
  }

  /**
   * Get all expenses with pagination
   */
  async getAllExpenses(
    userEmail: string,
    page: number = 1,
    limit: number = 10,
    category?: ExpenseCategory,
  ): Promise<{
    expenses: ExpenseResponse[];
    total: number;
  }> {
    const { expenses, total } = await expenseRepository.findAll({
      userEmail,
      page,
      limit,
      category,
    });

    return {
      expenses: expenses.map((expense) => this.mapToResponse(expense)),
      total,
    };
  }

  /**
   * Update an expense
   */
  async updateExpense(
    id: string,
    userEmail: string,
    updates: {
      category?: ExpenseCategory;
      amount?: number;
    },
  ): Promise<ExpenseResponse | null> {
    try {
      const expense = await expenseRepository.update(id, userEmail, updates);
      return this.mapToResponse(expense);
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
   * Delete an expense
   */
  async deleteExpense(id: string, userEmail: string): Promise<boolean> {
    try {
      await expenseRepository.delete(id, userEmail);
      return true;
    } catch (error: unknown) {
      // Prisma throws NotFoundError if record doesn't exist
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
   * Map Expense model to Response DTO
   */
  private mapToResponse(expense: Expense): ExpenseResponse {
    return {
      id: expense.id,
      category: expense.category,
      categoryLabel: CATEGORY_LABELS[expense.category],
      amount: Number(expense.amount),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    };
  }
}

export default new ExpenseService();
