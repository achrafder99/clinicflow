import { z } from 'zod';

const status = z.enum(['pending', 'confirmed', 'cancelled']);

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  appointmentDate: z.string().datetime({ offset: true }),
  status: status.optional(), 
  reason: z.string().trim().min(2),
  notes: z.string().trim().optional(),
});

export const updateStatusSchema = z.object({ status });

export const listQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use format YYYY-MM-DD').optional(),
  status: status.optional(),
  patientId: z.string().uuid().optional(), 
});