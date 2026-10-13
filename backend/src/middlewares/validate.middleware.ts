
import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';


export const validate =
  (schema: ZodTypeAny): RequestHandler =>
  (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
