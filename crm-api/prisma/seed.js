import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hash = await bcrypt.hash('admin1234', 10);
  await prisma.user.upsert({
    where: { email: 'admin@ndembo.com' },
    update: {},
    create: { email: 'admin@ndembo.com', password: hash, nom: 'Admin Ndembo', role: 'admin' },
  });

  // Clients
  const clients = await Promise.all([
    prisma.client.upsert({ where: { ref: 'CLI-001' }, update: {}, create: { ref: 'CLI-001', nom: 'AS Monaco FC', type: 'Club', email: 'contact@monaco.fr', tel: '+377 98 06 02 00', ville: 'Monaco', pays: 'Monaco', contact: 'Jean-Marc Doublons' } }),
    prisma.client.upsert({ where: { ref: 'CLI-002' }, update: {}, create: { ref: 'CLI-002', nom: 'Nike France', type: 'Sponsor', email: 'partenariats@nike.fr', tel: '+33 1 45 00 11 22', ville: 'Paris', pays: 'France', contact: 'Sophie Laurent' } }),
    prisma.client.upsert({ where: { ref: 'CLI-003' }, update: {}, create: { ref: 'CLI-003', nom: 'Fédération Française de Football', type: 'Fédération', email: 'direction@fff.fr', tel: '+33 1 44 31 73 00', ville: 'Paris', pays: 'France', contact: 'Pierre Dupont' } }),
  ]);

  // Athletes (field names aligned with frontend seed)
  await Promise.all([
    prisma.athlete.upsert({ where: { ref: 'ATH-007' }, update: {}, create: { ref: 'ATH-007', nom: 'Ndembo', prenom: 'Marcus', poste: 'Attaquant', club: 'AS Monaco', nationalite: 'Français', age: 24, valeur: 18000000, commissionPct: 5, bio: 'Attaquant explosif formé au PSG, international espoir.', email: 'marcus@ndembo-sports.com', tel: '+33 6 12 34 56 78' } }),
    prisma.athlete.upsert({ where: { ref: 'ATH-008' }, update: {}, create: { ref: 'ATH-008', nom: 'Diallo', prenom: 'Sébastien', poste: 'Milieu central', club: 'OGC Nice', nationalite: 'Franco-Sénégalais', age: 27, valeur: 9000000, commissionPct: 4.5, bio: 'Milieu de récupération expérimenté, capitaine à Nice.', email: 'seb.diallo@ndembo-sports.com', tel: '+33 6 98 76 54 32' } }),
  ]);

  // Devis
  await prisma.devis.upsert({
    where: { ref: 'DEV-2026-001' }, update: {}, create: {
      ref: 'DEV-2026-001', clientId: clients[0].id, statut: 'Envoyé', date: '2026-01-15', montant: 45000,
      lignes: { create: [
        { description: 'Commission transfert Marcus Ndembo', qte: 1, prix: 40000 },
        { description: 'Frais de négociation', qte: 1, prix: 5000 },
      ]},
    },
  });

  await prisma.devis.upsert({
    where: { ref: 'DEV-2026-002' }, update: {}, create: {
      ref: 'DEV-2026-002', clientId: clients[1].id, statut: 'Brouillon', date: '2026-02-01', montant: 12000,
      lignes: { create: [{ description: 'Contrat image Nike 6 mois', qte: 1, prix: 12000 }]},
    },
  });

  // Factures
  await prisma.facture.upsert({ where: { ref: 'FAC-2026-001' }, update: {}, create: { ref: 'FAC-2026-001', clientId: clients[0].id, statut: 'Payée', date: '2026-02-01', echeance: '2026-02-15', montant: 45000 } });
  await prisma.facture.upsert({ where: { ref: 'FAC-2026-002' }, update: {}, create: { ref: 'FAC-2026-002', clientId: clients[1].id, statut: 'En retard', date: '2026-03-01', echeance: '2026-04-01', montant: 12000 } });

  // Contrats
  await prisma.contrat.upsert({ where: { ref: 'CTR-2026-001' }, update: {}, create: { ref: 'CTR-2026-001', clientId: clients[0].id, type: 'Représentation', valeur: 45000, statut: 'Signé', dateDebut: '2026-01-01', expire: '2027-01-01' } });
  await prisma.contrat.upsert({ where: { ref: 'CTR-2026-002' }, update: {}, create: { ref: 'CTR-2026-002', clientId: clients[1].id, type: 'Sponsoring', valeur: 60000, statut: 'Signé', dateDebut: '2026-03-01', expire: '2027-03-01' } });

  // Projets
  await prisma.projet.upsert({
    where: { ref: 'PRJ-2026-001' }, update: {}, create: {
      ref: 'PRJ-2026-001', clientId: clients[0].id, nom: 'Transfert Monaco → PSG', description: 'Négociation transfert estival Marcus Ndembo', statut: 'En cours', avancement: 60, dateDebut: '2026-01-10', dateFin: '2026-07-31',
      taches: { create: [
        { texte: 'Obtenir accord de principe du joueur', fait: true },
        { texte: 'Négocier indemnité avec Monaco', fait: true },
        { texte: 'Finaliser termes contrat PSG', fait: false },
        { texte: 'Visite médicale', fait: false },
        { texte: 'Signature contrat', fait: false },
      ]},
    },
  });

  // Evenements (field names aligned with frontend seed)
  await prisma.evenement.upsert({ where: { ref: 'EVT-2026-001' }, update: {}, create: { ref: 'EVT-2026-001', nom: 'Gala Annuel Ndembo Sports', type: 'Gala', dateDebut: '2026-06-20', statut: 'Planifié', lieu: 'Monaco', budget: 15000, notes: 'Soirée de gala avec partenaires' } });
  await prisma.evenement.upsert({ where: { ref: 'EVT-2026-002' }, update: {}, create: { ref: 'EVT-2026-002', nom: 'Camp de pré-saison', type: 'Camp', dateDebut: '2026-07-05', statut: 'Planifié', lieu: 'Nice', budget: 8000, notes: 'Camp de préparation estival' } });

  // VIP Members (field names aligned with frontend seed)
  await prisma.vipMember.upsert({ where: { ref: 'VIP-001' }, update: {}, create: { ref: 'VIP-001', clientId: clients[0].id, nom: 'Jean-Marc Doublons', tier: 'Or', statut: 'Actif', email: 'jm.doublons@monaco.fr', tel: '+377 06 00 11 22', carte: '4588 2201 0001 0001', depuis: '2025-01-01', expire: '2027-01-01' } });
  await prisma.vipMember.upsert({ where: { ref: 'VIP-002' }, update: {}, create: { ref: 'VIP-002', clientId: clients[1].id, nom: 'Sophie Laurent', tier: 'Argent', statut: 'Actif', email: 's.laurent@nike.fr', tel: '+33 6 55 44 33 22', carte: '4588 2201 0002 0001', depuis: '2025-06-01', expire: '2027-06-01' } });

  // Activités
  const actCount = await prisma.activite.count();
  if (actCount === 0) {
    await prisma.activite.createMany({
      data: [
        { entityType: 'client', entityId: 'CLI-001', type: 'Note', description: 'Premier contact établi avec AS Monaco', date: '2026-01-10', auteur: 'Admin' },
        { entityType: 'athlete', entityId: 'ATH-007', type: 'Appel', description: 'Appel de bilan avec Marcus Ndembo', date: '2026-03-15', auteur: 'Admin' },
        { entityType: 'projet', entityId: 'PRJ-2026-001', type: 'Réunion', description: 'Réunion de négociation transfert', date: '2026-04-20', auteur: 'Admin' },
      ],
    });
  }

  console.log('✅ Seed terminé — admin@ndembo.com / admin1234');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
