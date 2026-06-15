import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { vipSchema } from '../schemas/index.js';
import prisma from '../lib/prisma.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    res.json(await prisma.vipMember.findMany({ orderBy: { createdAt: 'desc' } }));
  } catch (e) { next(e); }
});

router.post('/', validate(vipSchema), async (req, res, next) => {
  try {
    res.status(201).json(await prisma.vipMember.create({ data: req.body }));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    res.json(await prisma.vipMember.findUniqueOrThrow({ where: { id: Number(req.params.id) } }));
  } catch (e) { next(e); }
});

router.put('/:id', validate(vipSchema), async (req, res, next) => {
  try {
    res.json(await prisma.vipMember.update({ where: { id: Number(req.params.id) }, data: req.body }));
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.vipMember.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) { next(e); }
});

// Ref-based routes for frontend sync
router.put('/by-ref/:ref', validate(vipSchema), async (req, res, next) => {
  try {
    res.json(await prisma.vipMember.update({ where: { ref: req.params.ref }, data: req.body }));
  } catch (e) { next(e); }
});

router.delete('/by-ref/:ref', async (req, res, next) => {
  try {
    await prisma.vipMember.delete({ where: { ref: req.params.ref } });
    res.status(204).end();
  } catch (e) { next(e); }
});

// ClientId-based routes (frontend VIP seed keyed by clientId, no ref)
router.put('/by-client/:clientId', validate(vipSchema), async (req, res, next) => {
  try {
    const clientId = Number(req.params.clientId);
    const existing = await prisma.vipMember.findFirst({ where: { clientId } });
    if (!existing) return res.status(404).json({ error: 'VIP not found' });
    res.json(await prisma.vipMember.update({ where: { id: existing.id }, data: req.body }));
  } catch (e) { next(e); }
});

router.delete('/by-client/:clientId', async (req, res, next) => {
  try {
    const clientId = Number(req.params.clientId);
    const existing = await prisma.vipMember.findFirst({ where: { clientId } });
    if (!existing) return res.status(404).json({ error: 'VIP not found' });
    await prisma.vipMember.delete({ where: { id: existing.id } });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
