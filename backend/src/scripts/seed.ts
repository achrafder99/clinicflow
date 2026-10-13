import { pool } from '../config/db';
import { env } from '../config/env';
import { hashPassword } from '../services/auth.service';

const users = [
  { name: 'Admin User', email: 'admin@clinic.com', password: 'Admin123!', role: 'admin' },
  { name: 'Sara Staff', email: 'staff1@clinic.com', password: 'Staff123!', role: 'staff' },
  { name: 'Omar Staff', email: 'staff2@clinic.com', password: 'Staff123!', role: 'staff' },
];

const patients = [
  ['Ahmed Alaoui', 'AB123456', '0612345678', '1990-05-10', 'Casablanca'],
  ['Fatima Zahra Benani', 'BK234567', '0623456789', '1985-11-22', 'Rabat'],
  ['Youssef El Idrissi', 'CD345678', '0634567890', '2000-02-14', null],
  ['Salma Tazi', 'EF456789', '0645678901', '1978-08-03', 'Marrakech'],
  ['Karim Bennani', 'GH567890', '0656789012', '1995-12-30', 'Tanger'],
];

// [patientIndex, dayOffset from today, hour, minute, status, reason]
// Same patient is never confirmed twice within 30 min.
const appointments: [number, number, number, number, string, string][] = [
  [0, 0, 9, 0, 'confirmed', 'Checkup'],
  [1, 0, 10, 0, 'pending', 'Headache'],
  [2, 0, 11, 30, 'confirmed', 'Blood test results'],
  [3, 0, 14, 0, 'cancelled', 'Follow-up'],
  [0, 1, 9, 0, 'pending', 'Vaccination'],
  [1, 1, 10, 30, 'confirmed', 'Consultation'],
  [4, 1, 15, 0, 'confirmed', 'Back pain'],
  [2, 2, 9, 30, 'pending', 'Dental referral'],
  [3, 3, 11, 0, 'confirmed', 'Annual exam'],
  [4, -1, 16, 0, 'cancelled', 'Allergy'],
];

async function run() {
  if (env.nodeEnv === 'production') throw new Error('Seed is disabled in production');

  const existing = await pool.query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM users'
  );

  if (Number(existing.rows[0]?.count ?? 0) > 0) {
    console.log('Seed skipped: database already contains users');
    await pool.end();
    return;
  }

  const userIds: string[] = [];
  for (const u of users) {
    const { rows } = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [u.name, u.email, await hashPassword(u.password), u.role]
    );
    userIds.push(rows[0].id);
  }

  const patientIds: string[] = [];
  for (const p of patients) {
    const { rows } = await pool.query(
      'INSERT INTO patients (full_name, cin, phone, birth_date, address) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      p
    );
    patientIds.push(rows[0].id);
  }

  for (const [i, [pIdx, dayOffset, h, m, status, reason]] of appointments.entries()) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(h, m, 0, 0);
    await pool.query(
      `INSERT INTO appointments (patient_id, created_by, appointment_date, status, reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [patientIds[pIdx], userIds[i % userIds.length], date.toISOString(), status, reason]
    );
  }

  console.log('Seed done: 3 users, 5 patients, 10 appointments');
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});