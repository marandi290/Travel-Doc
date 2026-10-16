import { Router } from 'express';
import { visitsController } from '../controllers/visitsController.js';

const router = Router();

router.get('/', visitsController.getAll);
router.get('/:id', visitsController.getById);
router.post('/', visitsController.create);
router.put('/:id', visitsController.update);
router.delete('/:id', visitsController.delete);

export default router;
