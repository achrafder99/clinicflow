import { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';

// Parses req.body with Zod. A ZodError is turned into a 400 by the error middleware.
export const validate =
  (schema: ZodTypeAny): RequestHandler =>
  (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
  };