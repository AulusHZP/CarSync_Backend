import { Router } from 'express';
import expensesRouter from './expenses';
import servicesRouter from './services';
import authRouter from './auth';
import vehiclesRouter from './vehicles';

const router = Router();

// Mount expense routes on /api/expenses
router.use('/expenses', expensesRouter);

// Mount service routes on /api/services
router.use('/services', servicesRouter);

// Mount auth routes on /api/auth
router.use('/auth', authRouter);

// Mount vehicle routes on /api/vehicles
router.use('/vehicles', vehiclesRouter);

export default router;
