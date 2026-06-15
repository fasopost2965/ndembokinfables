import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const clientSchema = z.object({
  ref: z.string().min(1),
  nom: z.string().min(1),
  type: z.string().default('Club'),
  email: z.string().email().optional().or(z.literal('')),
  tel: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  contact: z.string().optional(),
  siteWeb: z.string().optional(),
  notes: z.string().optional(),
  avatar: z.string().optional(),
});

export const athleteSchema = z.object({
  ref: z.string().min(1),
  nom: z.string().min(1),
  prenom: z.string().optional(),
  poste: z.string().optional(),
  clubActuel: z.string().optional(),
  nationalite: z.string().optional(),
  age: z.number().int().positive().optional(),
  valeurMarchande: z.number().nonnegative().optional(),
  commission: z.number().nonnegative().optional(),
  bio: z.string().optional(),
  notes: z.string().optional(),
  contractRef: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  tel: z.string().optional(),
});

const ligneSchema = z.object({
  description: z.string().min(1),
  qte: z.number().positive().default(1),
  prix: z.number().nonnegative().default(0),
});

export const devisSchema = z.object({
  ref: z.string().min(1),
  clientId: z.number().int().positive().optional().nullable(),
  statut: z.string().default('Brouillon'),
  date: z.string(),
  expiration: z.string().optional().nullable(),
  objet: z.string().optional().nullable(),
  montant: z.number().nonnegative().default(0),
  notes: z.string().optional().nullable(),
  lignes: z.array(ligneSchema).default([]),
});

export const factureSchema = z.object({
  ref: z.string().min(1),
  clientId: z.number().int().positive().optional().nullable(),
  statut: z.string().default('En attente'),
  date: z.string(),
  echeance: z.string().optional().nullable(),
  dateRelance: z.string().optional().nullable(),
  objet: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  montant: z.number().nonnegative().default(0),
});

export const contratSchema = z.object({
  ref: z.string().min(1),
  clientId: z.number().int().positive().optional().nullable(),
  type: z.string().min(1),
  valeur: z.number().nonnegative().default(0),
  statut: z.string().default('Brouillon'),
  dateDebut: z.string().optional().nullable(),
  expire: z.string().optional().nullable(),
  clauses: z.string().optional().nullable(),
});

const tacheSchema = z.object({
  texte: z.string().min(1),
  fait: z.boolean().default(false),
});

export const projetSchema = z.object({
  ref: z.string().min(1),
  clientId: z.number().int().positive().optional().nullable(),
  nom: z.string().min(1),
  description: z.string().optional().nullable(),
  statut: z.string().default('Planifié'),
  avancement: z.number().int().min(0).max(100).default(0),
  dateDebut: z.string().optional().nullable(),
  dateFin: z.string().optional().nullable(),
  taches: z.array(tacheSchema).default([]),
});

export const evenementSchema = z.object({
  ref: z.string().min(1),
  titre: z.string().min(1),
  type: z.string().min(1),
  date: z.string(),
  lieu: z.string().optional().nullable(),
  budget: z.number().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
  participants: z.string().optional().nullable(),
});

export const campSchema = evenementSchema;

export const vipSchema = z.object({
  ref: z.string().min(1),
  clientId: z.number().int().positive().optional().nullable(),
  nom: z.string().min(1),
  tier: z.enum(['Or', 'Argent', 'Bronze']).default('Argent'),
  email: z.string().email().optional().or(z.literal('')),
  tel: z.string().optional().nullable(),
  carteNFC: z.string().optional().nullable(),
  dateAdhesion: z.string().optional().nullable(),
  avantages: z.string().optional().nullable(),
});

export const activiteSchema = z.object({
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
  date: z.string(),
  auteur: z.string().default('Système'),
});
