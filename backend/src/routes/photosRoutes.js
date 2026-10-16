import { Router } from 'express';
import { photosController } from '../controllers/photosController.js';
import { uploadPhoto } from '../middleware/upload.js';

const router = Router();

router.get('/', photosController.getAll);
router.get('/:id', photosController.getById);
router.post('/', uploadPhoto.single('photo'), photosController.upload);
router.patch('/:id', photosController.update);
router.delete('/:id', photosController.delete);

export default router;
