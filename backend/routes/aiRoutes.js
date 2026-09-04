import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { generate, generationStatus, regenerateVideo, regenerateAlbum } from '../controllers/aiController.js';

const router = Router();
router.use(protect);

router.post('/generate-plan/:weddingId', generate);
router.get('/status/:weddingId', generationStatus);
router.post('/regenerate-video/:weddingId', regenerateVideo);
router.post('/regenerate-album/:weddingId', regenerateAlbum);

export default router;
