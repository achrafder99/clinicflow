
import type { Request, Response } from 'express';

import * as service from '../services/appointment.service';
import { listQuerySchema } from '../validators/appointment.validator';

export const create = async (req: Request, res: Response) => {
  res.status(201).json(await service.create(req.body, req.user!.id));
};

export const list = async (req: Request, res: Response) => {
  const filters = listQuerySchema.parse(req.query);
  const result = await service.list(filters);

  res.json(result);
};

export const updateStatus = async (req: Request, res: Response) => {
  res.json(
    await service.updateStatus(req.params.id as string, req.body.status),
  );
};
