import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { authenticate,authorize } from '../middlewares/auth.middleware';
import { loginSchema ,registerSchema} from '../validators/auth.validator';
import * as controller from '../controllers/auth.controller';


const router = Router();

router.post('/login', validate(loginSchema), asyncHandler(controller.login));
router.get('/me', authenticate, asyncHandler(controller.me));
router.post(
  '/register',
  authenticate,
  authorize('admin'),
  validate(registerSchema),
  asyncHandler(controller.register)
);

export default router;