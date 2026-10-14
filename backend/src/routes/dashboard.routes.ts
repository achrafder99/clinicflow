import { Router } from 'express';
import { asyncHandler as h } from '../utils/asyncHandler';
import { authenticate } from '../middlewares/auth.middleware';
import * as service from '../services/dashboard.service';

const router = Router();

/**
 * @openapi
 * /dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Aggregated stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/stats', authenticate, h(async (_req, res) => {
  res.json(await service.getStats());
}));

export default router;