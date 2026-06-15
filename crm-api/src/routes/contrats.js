import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { contratSchema } from '../schemas/index.js';
import prisma from '../lib/prisma.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    res.json(await prisma.contrat.findMany({ orderBy: { createdAt: 'desc' } }));
  } catch (e) { next(e); }
});

router.post('/', validate(contratSchema), async (req, res, next) => {
  try {
    res.status(201).json(await prisma.contrat.create({ data: req.body }));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    res.json(await prisma.contrat.findUniqueOrThrow({ where: { id: Number(req.params.id) } }));
  } catch (e) { next(e); }
});

router.put('/:id', validate(contratSchema), async (req, res, next) => {
  try {
    res.json(await prisma.contrat.update({ where: { id: Number(req.params.id) }, data: req.body }));
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.contrat.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) { next(e); }
});

// Ref-based routes for frontend sync
router.put('/by-ref/:ref', validate(contratSchema), async (req, res, next) => {
  try {
    res.json(await prisma.contrat.update({ where: { ref: req.params.ref }, data: req.body }));
  } catch (e) { next(e); }
});

router.delete('/by-ref/:ref', async (req, res, next) => {
  try {
    await prisma.contrat.delete({ where: { ref: req.params.ref } });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
