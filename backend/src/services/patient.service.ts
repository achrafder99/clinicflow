import { query } from '../config/db';
import { AppError } from '../utils/AppError';

const COLS = `id, full_name AS "fullName", cin, phone,
  to_char(birth_date, 'YYYY-MM-DD') AS "birthDate",
  address, created_at AS "createdAt"`;

interface PatientInput {
  fullName?: string;
  cin?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
}

export const create = async (d: Required<Omit<PatientInput, 'address'>> & { address?: string }) => {
  const { rows } = await query(
    `INSERT INTO patients (full_name, cin, phone, birth_date, address)
     VALUES ($1, $2, $3, $4, $5) RETURNING ${COLS}`,
    [d.fullName, d.cin, d.phone, d.birthDate, d.address ?? null]
  );
  return rows[0];
};

export const list = async (search: string | undefined, page: number, limit: number) => {
  const like = search ? `%${search}%` : null;
  const where = `deleted_at IS NULL AND ($1::text IS NULL OR full_name ILIKE $1 OR cin ILIKE $1)`;

  const [data, count] = await Promise.all([
    query(
      `SELECT ${COLS} FROM patients WHERE ${where}
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [like, limit, (page - 1) * limit]
    ),
    query<{ total: string }>(`SELECT count(*) AS total FROM patients WHERE ${where}`, [like]),
  ]);

  const total = Number(count.rows[0].total);
  return { data: data.rows, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const getById = async (id: string) => {
  const { rows } = await query(
    `SELECT ${COLS} FROM patients WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  if (!rows[0]) throw new AppError('Patient not found', 404);
  return rows[0];
};

export const update = async (id: string, d: PatientInput) => {
  const { rows } = await query(
    `UPDATE patients SET
       full_name  = COALESCE($2, full_name),
       cin        = COALESCE($3, cin),
       phone      = COALESCE($4, phone),
       birth_date = COALESCE($5::date, birth_date),
       address    = COALESCE($6, address),
       updated_at = now()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING ${COLS}`,
    [id, d.fullName ?? null, d.cin ?? null, d.phone ?? null, d.birthDate ?? null, d.address ?? null]
  );
  if (!rows[0]) throw new AppError('Patient not found', 404);
  return rows[0];
};

// Soft delete
export const remove = async (id: string) => {
  const { rowCount } = await query(
    'UPDATE patients SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );
  if (!rowCount) throw new AppError('Patient not found', 404);
};