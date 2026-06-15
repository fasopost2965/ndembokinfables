import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { activiteSchema } from '../schemas/index.js';
import prisma from '../lib/prisma.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const { entityType, entityId } = req.query;
    const where = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = String(entityId);
    res.json(await prisma.activite.findMany({ where, orderBy: { createdAt: 'desc' } }));
  } catch (e) { next(e); }
});

router.post('/', validate(activiteSchema), async (req, res, next) => {
  try {
    res.status(201).json(await prisma.activite.create({ data: req.body }));
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.activite.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;

