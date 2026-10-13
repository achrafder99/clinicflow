import { Request, Response } from 'express';
import * as service from '../services/patient.service';

export const create = async (req: Request, res: Response) => {
  res.status(201).json(await service.create(req.body));
};

export const list = async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
  res.json(await service.list(search || undefined, page, limit));
};

export const getById = async (req: Request, res: Response) => {
  res.json(await service.getById(req.params.id as string));
};

export const update = async (req: Request, res: Response) => {
  res.json(await service.update(req.params.id as string, req.body));
};

export const remove = async (req: Request, res: Response) => {
  await service.remove(req.params.id as string);
  res.status(204).send();
};