import { Router } from 'express';
import serviceController from '../controllers/serviceController';
import { requireUserScope } from '../middlewares/userScope';

const router = Router();

router.use(requireUserScope);

/**
 * POST /api/services - Create a new service
 */
router.post('/', (req, res) => serviceController.createService(req, res));

/**
 * GET /api/services - Get all services with pagination
 */
router.get('/', (req, res) => serviceController.getAllServices(req, res));

/**
 * GET /api/services/upcoming/list - Get upcoming services
 */
router.get('/upcoming/list', (req, res) => serviceController.getUpcomingServices(req, res));

/**
 * GET /api/services/statistics/summary - Get service statistics
 */
router.get('/statistics/summary', (req, res) => serviceController.getServiceStatistics(req, res));

/**
 * GET /api/services/:id - Get service by ID
 */
router.get('/:id', (req, res) => serviceController.getServiceById(req, res));

/**
 * PUT /api/services/:id - Update service details
 */
router.put('/:id', (req, res) => serviceController.updateService(req, res));

/**
 * PATCH /api/services/:id/status - Update service status
 */
router.patch('/:id/status', (req, res) => serviceController.updateServiceStatus(req, res));

/**
 * DELETE /api/services/:id - Delete a service
 */
router.delete('/:id', (req, res) => serviceController.deleteService(req, res));

export default router;
