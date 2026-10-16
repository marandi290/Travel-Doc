import { Router } from 'express';
import { placesController } from '../controllers/placesController.js';

const router = Router();

router.get('/', placesController.getAll);
router.get('/:id', placesController.getById);
router.post('/', placesController.create);
router.put('/:id', placesController.update);
router.delete('/:id', placesController.delete);

export default router;
