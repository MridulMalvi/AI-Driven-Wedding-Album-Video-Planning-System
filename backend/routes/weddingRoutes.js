import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validators } from '../middleware/validate.js';
import * as c from '../controllers/weddingController.js';

const router = Router();
router.use(protect);

router.route('/')
  .post(validators.wedding, c.createWedding)
  .get(c.listWeddings);

router.route('/:id')
  .get(c.getWedding)
  .put(validators.weddingUpdate, c.updateWedding)
  .delete(c.deleteWedding);

router.route('/:weddingId/functions')
  .post(validators.fn, c.addFunction)
  .get(c.listFunctions);

export default router;
