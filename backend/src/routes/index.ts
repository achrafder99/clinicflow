import { Router } from 'express';
import { query } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import patientRoutes from './patient.routes';
import authRoutes from './auth.routes';
import appointmentRoutes from './appointment.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    await query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  })
);

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;