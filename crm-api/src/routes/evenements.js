import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { evenementSchema } from '../schemas/index.js';
import prisma from '../lib/prisma.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    res.json(await prisma.evenement.findMany({ orderBy: { date: 'asc' } }));
  } catch (e) { next(e); }
});

router.post('/', validate(evenementSchema), async (req, res, next) => {
  try {
    res.status(201).json(await prisma.evenement.create({ data: req.body }));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    res.json(await prisma.evenement.findUniqueOrThrow({ where: { id: Number(req.params.id) } }));
  } catch (e) { next(e); }
});

router.put('/:id', validate(evenementSchema), async (req, res, next) => {
  try {
    res.json(await prisma.evenement.update({ where: { id: Number(req.params.id) }, data: req.body }));
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.evenement.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;

