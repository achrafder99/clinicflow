import { Router } from 'express';
import { asyncHandler as h } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { createAppointmentSchema, updateStatusSchema } from '../validators/appointment.validator';
import * as c from '../controllers/appointment.controller';

const router = Router();

router.use(authenticate);

router.post('/', validate(createAppointmentSchema), h(c.create));
router.get('/', h(c.list));
router.patch('/:id/status', validate(updateStatusSchema), h(c.updateStatus));

export default router;