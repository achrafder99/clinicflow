import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { query } from '../config/db';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { AuthUser, UserRole } from '../types/express';

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  password_hash: string;
}

const toAuthUser = (u: UserRow): AuthUser => ({
  id: u.id,
  email: u.email,
  fullName: u.full_name,
  role: u.role,
});

export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);

export const login = async (email: string, password: string) => {
  const { rows } = await query<UserRow>(
    'SELECT id, email, full_name, role, password_hash FROM users WHERE email = $1',
    [email]
  );
  const user = rows[0];

  // Same message for unknown email and wrong password (no user enumeration)
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!user || !ok) throw new AppError('Invalid email or password', 401);

  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  });

  return { token, user: toAuthUser(user) };
};

export const getUserById = async (id: string): Promise<AuthUser | null> => {
  const { rows } = await query<UserRow>(
    'SELECT id, email, full_name, role, password_hash FROM users WHERE id = $1',
    [id]
  );
  return rows[0] ? toAuthUser(rows[0]) : null;
};