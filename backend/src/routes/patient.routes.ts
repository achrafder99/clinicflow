import { Router } from 'express';
import { asyncHandler as h } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createPatientSchema, updatePatientSchema } from '../validators/patient.validator';
import * as c from '../controllers/patient.controller';

const router = Router();

router.use(authenticate);

router.post('/', validate(createPatientSchema), h(c.create));
router.get('/', h(c.list));
router.get('/:id', h(c.getById));
router.put('/:id', validate(updatePatientSchema), h(c.update));
router.delete('/:id', authorize('admin'), h(c.remove));

export default router;