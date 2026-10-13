import { query } from '../config/db';

export const getStats = async () => {
  const { rows } = await query<{
    totalPatients: string;
    todayAppointments: string;
    pending: string;
    confirmed: string;
  }>(`
    SELECT
      (SELECT count(*) FROM patients WHERE deleted_at IS NULL) AS "totalPatients",
      (SELECT count(*) FROM appointments
         WHERE appointment_date >= CURRENT_DATE
           AND appointment_date < CURRENT_DATE + 1) AS "todayAppointments",
      (SELECT count(*) FROM appointments WHERE status = 'pending') AS pending,
      (SELECT count(*) FROM appointments WHERE status = 'confirmed') AS confirmed
  `);

  const r = rows[0];
  return {
    totalPatients: Number(r.totalPatients),
    todayAppointments: Number(r.todayAppointments),
    pending: Number(r.pending),
    confirmed: Number(r.confirmed),
  };
};