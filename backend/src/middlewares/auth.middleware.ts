
import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { getUserById } from '../services/auth.service';
import { UserRole } from '../types/express';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    throw new AppError('Authentication required', 401);
  }

  const payload = jwt.verify(token, env.jwtSecret);

  if (
    typeof payload === 'string' ||
    typeof payload.sub !== 'string' ||
    payload.sub.length === 0
  ) {
    throw new AppError('Invalid authentication token', 401);
  }

  const user = await getUserById(payload.sub);

  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  req.user = user;

  next();
});

export const authorize =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Forbidden: insufficient permissions', 403),
      );
    }

    next();
  };
