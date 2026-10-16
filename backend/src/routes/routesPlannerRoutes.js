import { Router } from 'express';
import { routesController } from '../controllers/routesController.js';

const router = Router();

router.post('/plan', routesController.plan);

export default router;
