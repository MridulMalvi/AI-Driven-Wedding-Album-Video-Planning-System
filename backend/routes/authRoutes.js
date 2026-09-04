import { Router } from 'express';
import { login, me, register } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validators } from '../middleware/validate.js';

const router = Router();

router.post('/register', validators.register, register);
router.post('/login', validators.login, login);
router.get('/me', protect, me);

export default router;
