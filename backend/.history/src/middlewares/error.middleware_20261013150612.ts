import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

interface PgError extends Error {
  code?: string;
  detail?: string;
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let status = 500;
  let message = 'Internal server error';
  let details: unknown = undefined;

  if (err instanceof AppError) {
    status = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    status = 400;
    message = 'Validation failed';
    details = err.flatten().fieldErrors;
  } else if (err instanceof Error) {
    const e = err as PgError;

    if (e.code === '23505') {
      status = 409;
      message = 'Resource already exists';
      details = e.detail;
    } else if (e.code === '22P02') {
      status = 400;
      message = 'Invalid identifier format';
    } else if (e.code === '23503') {
      status = 400;
      message = 'Referenced resource does not exist or is still in use';
    } else if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      status = 401;
      message = 'Invalid or expired token';
    } else if (e.name === 'SyntaxError' && 'body' in e) {
      status = 400;
      message = 'Malformed JSON body';
    }
    else if (e.code === '23P01') {   // exclusion violation (30-min rule)
  status = 409;
  message = 'Patient already has a confirmed appointment within 30 minutes';
}
  }

  if (status === 500) console.error(err);

  res.status(status).json({
    success: false,
    message,
    ...(details !== undefined && { details }),
    ...(env.nodeEnv === 'development' && status === 500 && { stack: (err as Error).stack }),
  });
};