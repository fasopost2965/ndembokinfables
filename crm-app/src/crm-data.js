// ──────────────────────────────────────────────────────────────────────────
// NDEMBO KIN CONNECT — Données de référence partagées (source unique)
// Un seul fichier alimente Clients, Contrats, Devis, Factures et Membres VIP.
// Objectif : éviter la dispersion des données — chaque objet CRM référence un
// client par `id`. Côté backend, ces structures correspondent à vos routes.
// ──────────────────────────────────────────────────────────────────────────

export const COMPANY = {
  nom: 'NDEMBO KIN CONNECT SARL',
  rccm: 'CD/KIN/RCCM/23-B-0158',
  idNat: '01-83-N12345K',
  nif: 'A1234567B',
  adresse: 'Av. Citroniers, Q/ Golf, C/ Gombe — Immeuble USAID, 4ᵉ étage (Réf. HEC, ex ISC) — Kinshasa, RDC',
  adresseCourte: 'Av. Citroniers, Q/ Golf, C/ Gombe — Immeuble USAID, 4ᵉ étage — Kinshasa, RDC',
  email: 'contact@ndembokin.com',
  tel: '+243 810 188 880',
  whatsapp: '0810188880',
  banque: 'Rawbank — compte USD n° 0501-1234567-89',
  swift: 'RAWBCDKI',
};

// Le « type » de client se mappe directement sur la qualité contractuelle.
export const TYPE_QUALITE = {
  'Club': 'Club sportif',
  'Sponsor': 'Sponsor / Partenaire',
  'Académie': 'Académie / Centre de formation',
  'Athlète': 'Athlète professionnel',
  'Institution': 'Institution / Fédération',
};

// Source unique des comptes clients (clubs, sponsors, académies, athlètes…).
export const CLIENTS = [
  { id: 1, nom: 'Mazembe Corp',          type: 'Sponsor',     ville: 'Kinshasa',    email: 'finance@mazembecorp.cd',     tel: '+243 990 112 233', adresse: '45 Boulevard du 30 Juin, Gombe — Kinshasa, RDC',          ca: 33400, docs: 4 },
  { id: 2, nom: 'Orange RDC',            type: 'Sponsor',     ville: 'Kinshasa',    email: 'sponsoring@orange.cd',       tel: '+243 991 445 566', adresse: 'Immeuble Orange, Blvd du 30 Juin — Kinshasa, RDC',        ca: 43800, docs: 6 },
  { id: 3, nom: 'Lupopo FC Academy',     type: 'Académie',    ville: 'Lubumbashi',  email: 'contact@lupopo.cd',          tel: '+243 997 223 110', adresse: 'Av. Kasavubu 218 — Lubumbashi, RDC',                     ca: 8500,  docs: 3 },
  { id: 4, nom: 'Académie Les Aiglons',  type: 'Académie',    ville: 'Kinshasa',    email: 'direction@aiglons.cd',       tel: '+243 815 667 788', adresse: 'Av. de l’École 7, Limete — Kinshasa, RDC',               ca: 12040, docs: 2 },
  { id: 5, nom: 'Union Kinshasa',        type: 'Club',        ville: 'Kinshasa',    email: 'sg@unionkin.cd',             tel: '+243 812 334 556', adresse: 'Av. des Huileries 102, Gombe — Kinshasa, RDC',           ca: 5500,  docs: 2 },
  { id: 6, nom: 'FECOFA',                type: 'Institution', ville: 'Kinshasa',    email: 'competitions@fecofa.cd',     tel: '+243 990 778 001', adresse: 'Av. de la Démocratie — Kinshasa, RDC',                   ca: 36700, docs: 5 },
];

// Niveaux d'adhésion VIP — réductions et cotisations annuelles.
export const VIP_TIERS = {
  'Or':     { remise: '−15 %', remiseNum: 15, prix: 1200, accent: '#F4A800', accentText: '#B07800', bg: 'rgba(244,168,0,0.16)',  color: '#9A6B00', chip: '#C98E1B' },
  'Argent': { remise: '−10 %', remiseNum: 10, prix: 600,  accent: '#B9C4CC', accentText: '#5B6B77', bg: 'rgba(37,67,84,0.10)',   color: '#5B6B77', chip: '#9AA7B0' },
  'Bronze': { remise: '−5 %',  remiseNum: 5,  prix: 250,  accent: '#C08A4D', accentText: '#A86B2F', bg: 'rgba(168,107,47,0.14)', color: '#A86B2F', chip: '#A86B2F' },
};

// Génère un numéro de carte NFC à 16 chiffres (préfixe programme 4588 2201).
export function genCarteNFC() {
  const block = () => String(Math.floor(1000 + Math.random() * 9000));
  return '4588 2201 ' + block() + ' ' + block();
}

// Retourne la qualité contractuelle d'un client à partir de son type.
export function qualitePourType(type) {
  return TYPE_QUALITE[type] || 'Partie contractante';
}

// ──────────────────────────────────────────────────────────────────────────
// Objets liés — chacun référence un client par `clientId` (relation 1‑N).
// Alimentent la fiche client 360° et les liens inter‑écrans.
// ──────────────────────────────────────────────────────────────────────────

export const DEVIS = [
  { ref: 'DEV-2026-042', clientId: 1, objet: 'Tournoi corporate — Stade des Martyrs', montant: 8190, statut: 'Brouillon', date: '2026-06-10' },
  { ref: 'DEV-2026-039', clientId: 4, objet: 'Camp d’entraînement U17 — Lubumbashi', montant: 8600, statut: 'Envoyé', date: '2026-06-04' },
  { ref: 'DEV-2026-035', clientId: 2, objet: 'Activation sponsoring — saison 2026', montant: 24500, statut: 'Accepté', date: '2026-05-28' },
  { ref: 'DEV-2026-031', clientId: 3, objet: 'Détection régionale — académie', montant: 4200, statut: 'Accepté', date: '2026-05-19' },
  { ref: 'DEV-2026-028', clientId: 6, objet: 'Organisation phase finale FECOFA', montant: 31000, statut: 'Expiré', date: '2026-04-30' },
];

export const FACTURES = [
  { ref: 'FAC-2026-021', clientId: 2, objet: 'Activation sponsoring — acompte', montant: 9800, statut: 'Payée', echeance: '2026-05-30' },
  { ref: 'FAC-2026-019', clientId: 1, objet: 'Conseil & cadrage tournoi', montant: 3500, statut: 'En retard', echeance: '2026-06-17' },
  { ref: 'FAC-2026-017', clientId: 6, objet: 'Prestation arbitrage & logistique', montant: 12400, statut: 'En attente', echeance: '2026-06-25' },
  { ref: 'FAC-2026-014', clientId: 4, objet: 'Camp U17 — solde', montant: 5160, statut: 'Payée', echeance: '2026-05-12' },
];

export const CONTRATS = [
  { ref: 'CTR-2026-018', clientId: 7, type: 'Représentation', valeur: 75000, statut: 'Signé', expire: '2028-08-01' },
  { ref: 'CTR-2026-016', clientId: 2, type: 'Sponsoring', valeur: 2500000, statut: 'Signé', expire: '2027-12-31' },
  { ref: 'CTR-2026-015', clientId: 8, type: 'Représentation', valeur: 120000, statut: 'Signé', expire: '2028-06-12' },
  { ref: 'CTR-2026-019', clientId: 4, type: 'Prestation', valeur: 8600, statut: 'Brouillon', expire: '' },
  { ref: 'CTR-2026-012', clientId: 1, type: 'Sponsoring', valeur: 45000, statut: 'Expire bientôt', expire: '2026-07-20' },
];

export const PROJETS = [
  { ref: 'PRJ-2026-008', clientId: 2, nom: 'Activation sponsoring Orange — saison', statut: 'En cours', avancement: 62 },
  { ref: 'PRJ-2026-006', clientId: 4, nom: 'Camp d’entraînement U17 Lubumbashi', statut: 'En cours', avancement: 40 },
  { ref: 'PRJ-2026-004', clientId: 1, nom: 'Tournoi corporate Mazembe', statut: 'Planifié', avancement: 12 },
  { ref: 'PRJ-2026-001', clientId: 6, nom: 'Phase finale Coupe FECOFA', statut: 'Terminé', avancement: 100 },
];

// Un client peut aussi être membre du programme VIP (relation 1‑1 optionnelle).
export const VIP_MEMBERS = [
  { clientId: 1, tier: 'Or', statut: 'Actif', carte: '4588 2201 9833 0042', depuis: 'OCT 2023', expire: '10/2026' },
  { clientId: 2, tier: 'Or', statut: 'Actif', carte: '4588 2201 9833 0107', depuis: 'JAN 2024', expire: '01/2027' },
  { clientId: 6, tier: 'Argent', statut: 'Expire bientôt', carte: '4588 2201 9833 0211', depuis: 'MAR 2024', expire: '07/2026' },
];

// Profil carrière pour les clients de type Athlète (clé = clientId).
export const ATHLETES = [
  { id: 7, nom: 'Jean-Luc Mobutu', email: 'jl.mobutu@gmail.com', tel: '+243 998 220 114', adresse: 'Centre Académique de Kinshasa, RDC', photo: 'https://i.pravatar.cc/150?u=mobutu',
    club: 'AS V.Club (Kinshasa)', poste: 'Milieu offensif', pied: 'Droit', age: 21, nationalite: 'RDC',
    valeur: 850000, contractRef: 'CTR-2026-018', commissionPct: 15,
    transferts: [
      { date: '2024', de: 'Académie Ndembo Kin', vers: 'DC Motema Pembe', montant: 0, type: 'Formation' },
      { date: '2025', de: 'DC Motema Pembe', vers: 'AS V.Club', montant: 180000, type: 'Transfert' },
    ],
    commissions: [
      { date: '2026-07-01', libelle: 'Commission transfert AS V.Club', montant: 27000, statut: 'Payée' },
      { date: '2026-09-15', libelle: 'Prime de performance Q3', montant: 4500, statut: 'En attente' },
    ],
  },
  { id: 8, nom: 'Yaya Diallo', email: 'y.diallo@kinshasafc.cd', tel: '+243 990 551 207', adresse: 'Kinshasa FC — Centre d’entraînement, RDC', photo: 'https://i.pravatar.cc/150?u=diallo',
    club: 'Kinshasa FC', poste: 'Attaquant', pied: 'Gauche', age: 19, nationalite: 'Sénégal',
    valeur: 1200000, contractRef: 'CTR-2026-015', commissionPct: 12,
    transferts: [
      { date: '2025', de: 'Académie Les Aiglons', vers: 'Kinshasa FC', montant: 95000, type: 'Transfert' },
    ],
    commissions: [
      { date: '2026-06-30', libelle: 'Commission représentation S1', montant: 14400, statut: 'Payée' },
    ],
  },
];

// Événements / tournois — peuvent être rattachés à un client organisateur/sponsor.
export const EVENEMENTS = [
  { id: 'EVT-01', nom: 'Tournoi International de Kinshasa 2026', type: 'Tournoi', lieu: 'Stade des Martyrs, Kinshasa', dateDebut: '2026-12-04', dateFin: '2026-12-18', budget: 320000, statut: 'Planification', inscrits: 12, capacite: 16, clientId: 6 },
  { id: 'EVT-02', nom: 'Gala d’Excellence Ndembo Kin', type: 'Gala', lieu: 'Pullman Kinshasa', dateDebut: '2026-09-20', dateFin: '2026-09-20', budget: 85000, statut: 'Confirmé', inscrits: 240, capacite: 300, clientId: 1 },
  { id: 'EVT-03', nom: 'Coupe Corporate Mazembe', type: 'Tournoi', lieu: 'Lubumbashi', dateDebut: '2026-08-08', dateFin: '2026-08-10', budget: 48000, statut: 'Confirmé', inscrits: 8, capacite: 8, clientId: 1 },
  { id: 'EVT-04', nom: 'Détection Panafricaine U20', type: 'Détection', lieu: 'Kinshasa', dateDebut: '2026-07-15', dateFin: '2026-07-17', budget: 22000, statut: 'Inscriptions', inscrits: 140, capacite: 200, clientId: null },
];

// Camps d'entraînement / stages.
export const CAMPS = [
  { id: 'CMP-01', nom: 'Camp Élite U17', lieu: 'Lubumbashi', dateDebut: '2026-07-01', dateFin: '2026-07-14', categorie: 'U17', places: 40, inscrits: 33, statut: 'En cours', clientId: 4, participants: [7, 8] },
  { id: 'CMP-02', nom: 'Stage gardiens de but', lieu: 'Kinshasa', dateDebut: '2026-08-05', dateFin: '2026-08-12', categorie: 'Spécifique', places: 18, inscrits: 11, statut: 'Inscriptions', clientId: null, participants: [7] },
  { id: 'CMP-03', nom: 'Camp de présaison — clubs partenaires', lieu: 'Matadi', dateDebut: '2026-09-02', dateFin: '2026-09-16', categorie: 'Senior', places: 30, inscrits: 0, statut: 'Planifié', clientId: 5, participants: [] },
];

// Journal d'activité par client (les plus récents en premier).
export const ACTIVITES = [
  { clientId: 1, date: '2026-06-10', texte: 'Devis DEV-2026-042 créé (brouillon).' },
  { clientId: 1, date: '2026-06-02', texte: 'Facture FAC-2026-019 émise — échéance 17 juin.' },
  { clientId: 1, date: '2026-05-20', texte: 'Contrat CTR-2026-012 signé (sponsoring).' },
  { clientId: 2, date: '2026-05-30', texte: 'Facture FAC-2026-021 payée — acompte sponsoring.' },
  { clientId: 2, date: '2026-05-28', texte: 'Devis DEV-2026-035 accepté → projet PRJ-2026-008.' },
  { clientId: 4, date: '2026-06-04', texte: 'Devis DEV-2026-039 envoyé (camp U17).' },
  { clientId: 7, date: '2026-05-12', texte: 'Commission transfert AS V.Club programmée (27 000 $).' },
];

// Agrège tous les objets liés à un client (relation 1‑N résolue côté client).
export function clientAggregate(id) {
  const key = Number(id);
  return {
    devis: DEVIS.filter((d) => d.clientId === key),
    factures: FACTURES.filter((f) => f.clientId === key),
    contrats: CONTRATS.filter((c) => c.clientId === key),
    projets: PROJETS.filter((p) => p.clientId === key),
    vip: VIP_MEMBERS.find((v) => v.clientId === key) || null,
    activites: ACTIVITES.filter((a) => a.clientId === key),
  };
}

export function athleteAggregate(id) {
  const key = Number(id);
  const athlete = ATHLETES.find(a => a.id === key);
  return {
    ...athlete,
    devis: DEVIS.filter((d) => d.clientId === key),
    factures: FACTURES.filter((f) => f.clientId === key),
    contrats: CONTRATS.filter((c) => c.clientId === key),
    projets: PROJETS.filter((p) => p.clientId === key),
    vip: VIP_MEMBERS.find((v) => v.clientId === key) || null,
    activites: ACTIVITES.filter((a) => a.clientId === key),
  };
}

// Numérotation auto : renvoie le prochain numéro pour un préfixe (DEV-/FAC-/CTR-/PRJ-).
export function nextNumero(prefix, annee, refs) {
  const max = (refs || []).reduce((m, r) => {
    const mt = String(r).match(/-(\d+)$/);
    return mt ? Math.max(m, parseInt(mt[1], 10)) : m;
  }, 0);
  return prefix + (annee || new Date().getFullYear()) + '-' + String(max + 1).padStart(3, '0');
}

// Formate un montant USD (séparateurs FR).
export function fmtUsd(n) {
  return '$' + (Number(n) || 0).toLocaleString('fr-FR');
}

// Date ISO → « 12 JUN 2026 ».
export function dateFr(iso) {
  if (!iso) return '—';
  const MOIS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];
  const [y, m, d] = iso.split('-');
  return d + ' ' + MOIS[parseInt(m, 10) - 1] + ' ' + y;
}

// Styles de badge de statut canoniques (mapping statut → fond/texte).
export const STATUT_BADGE = {
  'Brouillon': { bg: 'rgba(37,67,84,.10)', color: '#42474C' },
  'Planifié': { bg: 'rgba(37,67,84,.10)', color: '#42474C' },
  'Planification': { bg: 'rgba(37,67,84,.10)', color: '#42474C' },
  'Envoyé': { bg: 'rgba(244,168,0,.16)', color: '#9A6B00' },
  'En attente': { bg: 'rgba(244,168,0,.16)', color: '#9A6B00' },
  'Inscriptions': { bg: 'rgba(244,168,0,.16)', color: '#9A6B00' },
  'Expire bientôt': { bg: 'rgba(244,168,0,.16)', color: '#9A6B00' },
  'Accepté': { bg: 'rgba(30,159,216,.14)', color: '#1E78A8' },
  'En cours': { bg: 'rgba(30,159,216,.14)', color: '#1E78A8' },
  'Confirmé': { bg: 'rgba(30,159,216,.14)', color: '#1E78A8' },
  'Payée': { bg: 'rgba(23,126,84,.12)', color: '#177E54' },
  'Signé': { bg: 'rgba(23,126,84,.12)', color: '#177E54' },
  'Terminé': { bg: 'rgba(23,126,84,.12)', color: '#177E54' },
  'Actif': { bg: 'rgba(23,126,84,.12)', color: '#177E54' },
  'En retard': { bg: 'rgba(188,0,13,.10)', color: '#BC000D' },
  'Expiré': { bg: 'rgba(188,0,13,.10)', color: '#BC000D' },
};
