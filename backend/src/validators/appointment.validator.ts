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
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  patientId: z.string().uuid().optional(),
});

export const appointmentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  patientId: z.string().uuid().optional(),
});