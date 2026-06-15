import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { factureSchema } from '../schemas/index.js';
import prisma from '../lib/prisma.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    res.json(await prisma.facture.findMany({ orderBy: { createdAt: 'desc' } }));
  } catch (e) { next(e); }
});

router.post('/', validate(factureSchema), async (req, res, next) => {
  try {
    res.status(201).json(await prisma.facture.create({ data: req.body }));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    res.json(await prisma.facture.findUniqueOrThrow({ where: { id: Number(req.params.id) } }));
  } catch (e) { next(e); }
});

router.put('/:id', validate(factureSchema), async (req, res, next) => {
  try {
    res.json(await prisma.facture.update({ where: { id: Number(req.params.id) }, data: req.body }));
  } catch (e) { next(e); }
});

router.patch('/:id/statut', async (req, res, next) => {
  try {
    const { statut } = req.body;
    if (!statut) return res.status(422).json({ error: 'statut requis' });
    res.json(await prisma.facture.update({ where: { id: Number(req.params.id) }, data: { statut } }));
  } catch (e) { next(e); }
});

router.patch('/:id/relance', async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    res.json(await prisma.facture.update({ where: { id: Number(req.params.id) }, data: { dateRelance: today } }));
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.facture.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) { next(e); }
});

// Ref-based routes for frontend sync
router.put('/by-ref/:ref', validate(factureSchema), async (req, res, next) => {
  try {
    res.json(await prisma.facture.update({ where: { ref: req.params.ref }, data: req.body }));
  } catch (e) { next(e); }
});

router.patch('/by-ref/:ref/statut', async (req, res, next) => {
  try {
    const { statut } = req.body;
    if (!statut) return res.status(422).json({ error: 'statut requis' });
    res.json(await prisma.facture.update({ where: { ref: req.params.ref }, data: { statut } }));
  } catch (e) { next(e); }
});

router.patch('/by-ref/:ref/relance', async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    res.json(await prisma.facture.update({ where: { ref: req.params.ref }, data: { dateRelance: today } }));
  } catch (e) { next(e); }
});

router.delete('/by-ref/:ref', async (req, res, next) => {
  try {
    await prisma.facture.delete({ where: { ref: req.params.ref } });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
