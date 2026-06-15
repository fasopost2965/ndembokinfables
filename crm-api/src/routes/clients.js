import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { clientSchema } from '../schemas/index.js';
import prisma from '../lib/prisma.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { nom: 'asc' } });
    res.json(clients);
  } catch (e) { next(e); }
});

router.post('/', validate(clientSchema), async (req, res, next) => {
  try {
    const client = await prisma.client.create({ data: req.body });
    res.status(201).json(client);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const client = await prisma.client.findUniqueOrThrow({ where: { id: Number(req.params.id) } });
    res.json(client);
  } catch (e) { next(e); }
});

router.put('/:id', validate(clientSchema), async (req, res, next) => {
  try {
    const client = await prisma.client.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(client);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.client.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;

