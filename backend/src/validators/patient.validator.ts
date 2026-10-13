import { z } from 'zod';

export const createPatientSchema = z.object({
  fullName: z.string().trim().min(2),
  cin: z.string().trim().toUpperCase().min(4),
  phone: z.string().trim().min(6),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use format YYYY-MM-DD'),
  address: z.string().trim().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();