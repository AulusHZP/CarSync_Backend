import { Router } from 'express';
import expenseController from '../controllers/expenseController';
import { requireUserScope } from '../middlewares/userScope';

const router = Router();

router.use(requireUserScope);

/**
 * POST /api/expenses - Create a new expense
 */
router.post('/', (req, res) => expenseController.createExpense(req, res));

/**
 * GET /api/expenses - Get all expenses with pagination
 */
router.get('/', (req, res) => expenseController.getAllExpenses(req, res));

/**
 * GET /api/expenses/:id - Get expense by ID
 */
router.get('/:id', (req, res) => expenseController.getExpenseById(req, res));

/**
 * PUT /api/expenses/:id - Update an expense
 */
router.put('/:id', (req, res) => expenseController.updateExpense(req, res));

/**
 * DELETE /api/expenses/:id - Delete an expense
 */
router.delete('/:id', (req, res) => expenseController.deleteExpense(req, res));

export default router;
