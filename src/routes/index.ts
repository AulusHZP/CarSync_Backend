import { Router } from 'express';
import expensesRouter from './expenses';
import servicesRouter from './services';
import authRouter from './auth';

const router = Router();

// Mount expense routes on /api/expenses
router.use('/expenses', expensesRouter);

// Mount service routes on /api/services
router.use('/services', servicesRouter);

// Mount auth routes on /api/auth
router.use('/auth', authRouter);

export default router;
