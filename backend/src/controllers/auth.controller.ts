import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  res.json(await authService.login(email, password));
};

export const me = async (req: Request, res: Response) => {
  res.json({ user: req.user });
};