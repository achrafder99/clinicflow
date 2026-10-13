import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { getUserById } from '../services/auth.service';
import { UserRole } from '../types/express';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError('Authentication required', 401);

  // Throws JsonWebTokenError / TokenExpiredError, mapped to 401 by the error middleware
  const payload = jwt.verify(header.slice(7), env.jwtSecret) as jwt.JwtPayload;

  // Reload the user so deleted users or changed roles are respected immediately
  const user = await getUserById(payload.sub as string);
  if (!user) throw new AppError('User no longer exists', 401);

  req.user = user;
  next();
});

export const authorize =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(new AppError('Authentication required', 401));
    if (!roles.includes(req.user.role)) return next(new AppError('Forbidden: insufficient permissions', 403));
    next();
  };