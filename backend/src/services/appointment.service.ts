import { query } from '../config/db';
import { AppError } from '../utils/AppError';

const SELECT = `
  SELECT a.id, a.patient_id AS "patientId", p.full_name AS "patientName",
         a.appointment_date AS "appointmentDate", a.status, a.reason, a.notes,
         a.created_by AS "createdBy", a.created_at AS "createdAt"
  FROM appointments a JOIN patients p ON p.id = a.patient_id`;

interface CreateInput {
  patientId: string;
  appointmentDate: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  reason: string;
  notes?: string;
}

interface AppointmentFilters {
  page?: number;
  limit?: number;
  date?: string;
  status?: string;
  patientId?: string;
}


export const create = async (d: CreateInput, userId: string) => {
  const patient = await query('SELECT 1 FROM patients WHERE id = $1 AND deleted_at IS NULL', [d.patientId]);
  if (!patient.rowCount) throw new AppError('Patient not found', 404);

  const { rows } = await query<{ id: string }>(
    `INSERT INTO appointments (patient_id, created_by, appointment_date, status, reason, notes)
     VALUES ($1, $2, $3, COALESCE($4::appointment_status, 'pending'), $5, $6) RETURNING id`,
    [d.patientId, userId, d.appointmentDate, d.status ?? null, d.reason, d.notes ?? null]
  );
  return getById(rows[0].id);
};

export const getById = async (id: string) => {
  const { rows } = await query(`${SELECT} WHERE a.id = $1`, [id]);
  if (!rows[0]) throw new AppError('Appointment not found', 404);
  return rows[0];
};

export const list = async (f: AppointmentFilters) => {
  const page = f.page ?? 1;
  const limit = f.limit ?? 10;
  const offset = (page - 1) * limit;

  const filters = `
    WHERE ($1::date IS NULL OR (
      a.appointment_date >= $1::date
      AND a.appointment_date < $1::date + 1
    ))
    AND ($2::appointment_status IS NULL
      OR a.status = $2::appointment_status)
    AND ($3::uuid IS NULL
      OR a.patient_id = $3::uuid)
  `;

  const values = [
    f.date ?? null,
    f.status ?? null,
    f.patientId ?? null,
  ];

  // Fetch only the requested page.
  const { rows } = await query(
    `${SELECT}
     ${filters}
     ORDER BY a.appointment_date ASC, a.id ASC
     LIMIT $4 OFFSET $5`,
    [...values, limit, offset]
  );

  const countResult = await query<{ total: string }>(
    `SELECT COUNT(*) AS total
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     ${filters}`,
    values
  );

  const total = Number(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  return {
    data: rows,
    page,
    limit,
    total,
    totalPages,
  };
};

export const updateStatus = async (id: string, status: string) => {
  const { rowCount } = await query(
    'UPDATE appointments SET status = $2::appointment_status, updated_at = now() WHERE id = $1',
    [id, status]
  );
  if (!rowCount) throw new AppError('Appointment not found', 404);
  return getById(id);
};