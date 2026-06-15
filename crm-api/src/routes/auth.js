import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { loginSchema } from '../schemas/index.js';
import { z } from 'zod';
import prisma from '../lib/prisma.js';

const router = Router();

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }
    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email, nom: user.nom, role: user.role } });
  } catch (e) { next(e); }
});

const registerSchema = loginSchema.extend({ nom: z.string().min(1) });
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, nom } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hash, nom } });
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email, nom: user.nom, role: user.role } });
  } catch (e) { next(e); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, email: true, nom: true, role: true } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    res.json(user);
  } catch (e) { next(e); }
});

export default router;

