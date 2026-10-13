import { Router } from 'express';
import { asyncHandler as h } from '../utils/asyncHandler';
import { authenticate } from '../middlewares/auth.middleware';
import * as service from '../services/dashboard.service';

const router = Router();

router.get('/stats', authenticate, h(async (_req, res) => {
  res.json(await service.getStats());
}));

export default router;