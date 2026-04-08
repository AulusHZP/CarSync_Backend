import { Router } from 'express';
import vehicleController from '../controllers/vehicleController';
import { requireUserScope } from '../middlewares/userScope';

const router = Router();

router.use(requireUserScope);

router.post('/', (req, res) => vehicleController.createVehicle(req, res));
router.get('/', (req, res) => vehicleController.listVehicles(req, res));
router.delete('/:plate', (req, res) => vehicleController.deleteVehicle(req, res));

export default router;
