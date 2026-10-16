import { Router } from 'express';
import { wishlistController } from '../controllers/wishlistController.js';

const router = Router();

router.get('/', wishlistController.getAll);
router.get('/:id', wishlistController.getById);
router.post('/', wishlistController.create);
router.patch('/:id', wishlistController.update);
router.delete('/:id', wishlistController.delete);

export default router;
