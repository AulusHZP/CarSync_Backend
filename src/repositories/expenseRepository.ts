import { Expense, ExpenseCategory } from '@prisma/client';
import prisma from '../config/database';

interface CreateExpenseData {
  userEmail: string;
  category: ExpenseCategory;
  amount: string | number;
}

interface UpdateExpenseData {
  category?: ExpenseCategory;
  amount?: string | number;
}

interface FindAllOptions {
  userEmail: string;
  page?: number;
  limit?: number;
  category?: ExpenseCategory;
}

export class ExpenseRepository {
  /**
   * Create a new expense
   */
  async create(data: CreateExpenseData): Promise<Expense> {
    return prisma.expense.create({
      data: {
        userEmail: data.userEmail,
        category: data.category,
        amount: this.normalizeAmount(data.amount),
      },
    });
  }

  /**
   * Find expense by ID
   */
  async findById(id: string, userEmail: string): Promise<Expense | null> {
    return prisma.expense.findFirst({
      where: {
        id,
        userEmail,
      },
    });
  }

  /**
   * Find all expenses with pagination and optional filters
   */
  async findAll(options: FindAllOptions): Promise<{
    expenses: Expense[];
    total: number;
  }> {
    const { userEmail, page = 1, limit = 10, category } = options;

    const skip = (page - 1) * limit;

    const where = {
      userEmail,
      ...(category ? { category } : {}),
    };

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.expense.count({ where }),
    ]);

    return { expenses, total };
  }

  /**
   * Update an expense
   */
  async update(id: string, userEmail: string, data: UpdateExpenseData): Promise<Expense> {
    const owned = await prisma.expense.findFirst({
      where: { id, userEmail },
      select: { id: true },
    });

    if (!owned) {
      throw new Error('Expense not found');
    }

    return prisma.expense.update({
      where: { id },
      data: {
        ...(data.category && { category: data.category }),
        ...(data.amount !== undefined && { amount: this.normalizeAmount(data.amount) }),
      },
    });
  }

  /**
   * Delete an expense
   */
  async delete(id: string, userEmail: string): Promise<Expense> {
    const owned = await prisma.expense.findFirst({
      where: { id, userEmail },
      select: { id: true },
    });

    if (!owned) {
      throw new Error('Expense not found');
    }

    return prisma.expense.delete({
      where: { id },
    });
  }

  /**
   * Get aggregate data (for future reports)
   */
  async getAggregates(userEmail: string, category?: ExpenseCategory): Promise<{
    total: number;
    count: number;
    average: number;
  }> {
    const where = {
      userEmail,
      ...(category ? { category } : {}),
    };

    const result = await prisma.expense.aggregate({
      where,
      _sum: {
        amount: true,
      },
      _count: true,
      _avg: {
        amount: true,
      },
    });

    return {
      total: Number(result._sum.amount || 0),
      count: result._count,
      average: Number(result._avg.amount || 0),
    };
  }

  /**
   * Normalize amount to Decimal format
   */
  private normalizeAmount(amount: string | number): number {
    if (typeof amount === 'string') {
      return parseFloat(amount);
    }
    return amount;
  }
}

export default new ExpenseRepository();
