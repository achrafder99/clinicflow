export type UserRole = 'admin' | 'staff';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}