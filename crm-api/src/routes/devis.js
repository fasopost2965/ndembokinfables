import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { devisSchema } from '../schemas/index.js';
import prisma from '../lib/prisma.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    res.json(await prisma.devis.findMany({ include: { lignes: true }, orderBy: { createdAt: 'desc' } }));
  } catch (e) { next(e); }
});

router.post('/', validate(devisSchema), async (req, res, next) => {
  try {
    const { lignes, ...data } = req.body;
    const devis = await prisma.devis.create({
      data: { ...data, lignes: { create: lignes } },
      include: { lignes: true },
    });
    res.status(201).json(devis);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    res.json(await prisma.devis.findUniqueOrThrow({ where: { id: Number(req.params.id) }, include: { lignes: true } }));
  } catch (e) { next(e); }
});

router.put('/:id', validate(devisSchema), async (req, res, next) => {
  try {
    const { lignes, ...data } = req.body;
    const id = Number(req.params.id);
    await prisma.ligneDevis.deleteMany({ where: { devisId: id } });
    res.json(await prisma.devis.update({
      where: { id },
      data: { ...data, lignes: { create: lignes } },
      include: { lignes: true },
    }));
  } catch (e) { next(e); }
});

router.patch('/:id/statut', async (req, res, next) => {
  try {
    const { statut } = req.body;
    if (!statut) return res.status(422).json({ error: 'statut requis' });
    res.json(await prisma.devis.update({ where: { id: Number(req.params.id) }, data: { statut } }));
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.devis.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) { next(e); }
});

// Ref-based routes for frontend sync
router.put('/by-ref/:ref', validate(devisSchema), async (req, res, next) => {
  try {
    const { lignes, ...data } = req.body;
    const existing = await prisma.devis.findUniqueOrThrow({ where: { ref: req.params.ref } });
    await prisma.ligneDevis.deleteMany({ where: { devisId: existing.id } });
    res.json(await prisma.devis.update({
      where: { ref: req.params.ref },
      data: { ...data, lignes: { create: lignes } },
      include: { lignes: true },
    }));
  } catch (e) { next(e); }
});

router.patch('/by-ref/:ref/statut', async (req, res, next) => {
  try {
    const { statut } = req.body;
    if (!statut) return res.status(422).json({ error: 'statut requis' });
    res.json(await prisma.devis.update({ where: { ref: req.params.ref }, data: { statut } }));
  } catch (e) { next(e); }
});

router.delete('/by-ref/:ref', async (req, res, next) => {
  try {
    await prisma.devis.delete({ where: { ref: req.params.ref } });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
