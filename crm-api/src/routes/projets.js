import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { projetSchema } from '../schemas/index.js';
import prisma from '../lib/prisma.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    res.json(await prisma.projet.findMany({ include: { taches: true }, orderBy: { createdAt: 'desc' } }));
  } catch (e) { next(e); }
});

router.post('/', validate(projetSchema), async (req, res, next) => {
  try {
    const { taches, ...data } = req.body;
    const projet = await prisma.projet.create({
      data: { ...data, taches: { create: taches } },
      include: { taches: true },
    });
    res.status(201).json(projet);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    res.json(await prisma.projet.findUniqueOrThrow({ where: { id: Number(req.params.id) }, include: { taches: true } }));
  } catch (e) { next(e); }
});

router.put('/:id', validate(projetSchema), async (req, res, next) => {
  try {
    const { taches, ...data } = req.body;
    const id = Number(req.params.id);
    await prisma.tache.deleteMany({ where: { projetId: id } });
    res.json(await prisma.projet.update({
      where: { id },
      data: { ...data, taches: { create: taches } },
      include: { taches: true },
    }));
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.projet.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;

