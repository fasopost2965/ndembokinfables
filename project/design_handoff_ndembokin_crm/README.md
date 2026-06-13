# Handoff : Ndembo Kin Connect CRM

## Vue d'ensemble

CRM de management sportif pour **Ndembo Kin Connect SARL** (Kinshasa, RDC).
Périmètre : gestion des clients, devis, factures, contrats, projets, événements/camps, membres VIP avec cartes NFC, paramètres, et authentification.

## À propos des fichiers de design

Les fichiers `.dc.html` sont des **maquettes interactives haute-fidélité** — prototypes HTML montrant l'apparence finale et le comportement attendu. Ce ne sont pas du code de production à copier directement.

**La tâche de Claude Code est de recréer ces designs dans le codebase cible** (React + framework choisi, ou tout environnement existant) en utilisant ses patterns et libraries établis. Les maquettes servent de référence pixel-perfect pour les couleurs, la typographie, les espacements, les interactions et la logique métier.

## Fidélité

**Haute-fidélité (hifi).** Toutes les couleurs, typographies, espacements, états hover/focus/error, animations, et logique métier sont finalisés dans les maquettes. L'implémentation doit être pixel-perfect.

---

## Design Tokens

### Couleurs

```
--navy-deep:      #254354   /* primaire, titres, en-têtes */
--navy-mid:       #3D5A6C   /* hover primaire, barres graphique */
--navy-dark:      #16242F   /* sidebar, brand panel auth */
--sidebar:        #203243   /* fond sidebar */
--on-dark:        #091D2E   /* fond page sombre, texte principal */

--red:            #BC000D   /* CTA principal, urgence */
--red-hover:      #E61B1C   /* hover bouton rouge */

--gold:           #F4A800   /* VIP Or, victoires, objectifs */
--gold-text:      #9A6B00   /* texte sur fond or */
--gold-dark:      #B07800   /* texte secondaire or */

--cyan:           #1E9FD8   /* info, focus, liens actifs */
--cyan-text:      #1E78A8   /* texte cyan sur fond clair */

--success:        #177E54   /* payé, terminé, succès */
--bronze:         #C08A4D   /* niveau VIP Bronze */
--bronze-text:    #A86B2F

--bg-page:        #F2F5F8   /* fond général */
--bg-subtle:      #F8FAFC   /* fond alternatif, drawers footer */
--white:          #FFFFFF

--text-1:         #091D2E   /* corps principal */
--text-2:         #5B6B77   /* secondaire */
--text-3:         #8896A0   /* tertiaire, placeholders */

--border:         rgba(37,67,84,0.10)   /* cartes */
--border-input:   rgba(37,67,84,0.18)   /* inputs */
--border-focus:   #1E9FD8               /* focus ring */
```

### Typographie

| Token | Famille | Taille | Poids | Usage |
|---|---|---|---|---|
| display | Oswald | 42px | 600–700 | Titres brand panel |
| headline-page | Oswald | 30px | 600 | H1 de chaque écran |
| headline-section | Oswald | 17–20px | 600 | Titres de sections |
| headline-card | Oswald | 16px | 600 | Titres de cartes |
| title | Open Sans | 13–13.5px | 700 | Labels, boutons |
| body | Open Sans | 13–13.5px | 400 | Contenu tableaux |
| body-sm | Open Sans | 12–12.5px | 400 | Texte secondaire |
| label-caps | Open Sans | 10–11px | 700 | Étiquettes uppercase, letter-spacing 0.1–0.16em |
| mono | JetBrains Mono | 12–13px | 500–700 | Montants, références, dates, KPI |
| kpi | JetBrains Mono | 22–27px | 700 | Valeurs KPI cards |
| stats-lg | JetBrains Mono | 30px | 700 | Stats brand panel |

**Google Fonts import :**
```
https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Open+Sans:wght@400;600;700&family=JetBrains+Mono:wght@500;700&display=swap
```

### Espacement & Formes

```
Grille : 8px
Padding cartes : 18–22px
Padding main content : 28px 32px (desktop) / 16px (< 920px)
Max-width content : 1380px

Radius :
  inputs / boutons : 6–8px
  cartes : 8px
  drawers : 0 (full height)
  NFC card : 14px
  pills / badges : 99px
  avatar : 99px
  brand panel logo : 18px

Shadows :
  cartes : border 1px + border-top/left accent 3px (pas de box-shadow)
  drawers : -12px 0 40px rgba(9,29,46,0.2)
  topbar : border-bottom 1px rgba(37,67,84,0.12)
  auth card : 0 20px 56px rgba(9,29,46,0.10)
  brand panel logo : 0 18px 44px rgba(0,0,0,0.35)
```

### Badges de statut (canon)

```js
const STATUT_BADGE = {
  'Brouillon':        { bg: 'rgba(37,67,84,.10)',   color: '#42474C' },
  'Planifié':         { bg: 'rgba(37,67,84,.10)',   color: '#42474C' },
  'Planification':    { bg: 'rgba(37,67,84,.10)',   color: '#42474C' },
  'Envoyé':           { bg: 'rgba(244,168,0,.16)',  color: '#9A6B00' },
  'En attente':       { bg: 'rgba(244,168,0,.16)',  color: '#9A6B00' },
  'Inscriptions':     { bg: 'rgba(244,168,0,.16)',  color: '#9A6B00' },
  'Expire bientôt':   { bg: 'rgba(244,168,0,.16)',  color: '#9A6B00' },
  'Accepté':          { bg: 'rgba(30,159,216,.14)', color: '#1E78A8' },
  'En cours':         { bg: 'rgba(30,159,216,.14)', color: '#1E78A8' },
  'Confirmé':         { bg: 'rgba(30,159,216,.14)', color: '#1E78A8' },
  'Payée':            { bg: 'rgba(23,126,84,.12)',  color: '#177E54' },
  'Signé':            { bg: 'rgba(23,126,84,.12)',  color: '#177E54' },
  'Terminé':          { bg: 'rgba(23,126,84,.12)',  color: '#177E54' },
  'Actif':            { bg: 'rgba(23,126,84,.12)',  color: '#177E54' },
  'En retard':        { bg: 'rgba(188,0,13,.10)',   color: '#BC000D' },
  'Expiré':           { bg: 'rgba(188,0,13,.10)',   color: '#BC000D' },
}
```

---

## Architecture & Source de données

### crm-data.js — Source unique

Toutes les données de référence sont dans `crm-data.js`. **Chaque objet CRM référence un `clientId` issu de `CLIENTS`.** Ne jamais saisir un nom client en texte libre.

Exports :
- `COMPANY` — Données légales (RCCM, ID NAT, NIF, adresse, banque)
- `CLIENTS[]` — Base clients (clubs, sponsors, académies, athlètes, institutions)
- `DEVIS[]` — Référencent `clientId`
- `FACTURES[]` — Référencent `clientId`
- `CONTRATS[]` — Référencent `clientId`
- `PROJETS[]` — Référencent `clientId`
- `EVENEMENTS[]` — Référencent `clientId` (organisateur/sponsor, optionnel)
- `CAMPS[]` — Référencent `clientId` (optionnel)
- `VIP_MEMBERS[]` — Référencent `clientId` (relation 1-1 optionnelle)
- `ATHLETES{}` — Profils carrière (clé = clientId, types Athlète seulement)
- `VIP_TIERS{}` — Niveaux Or/Argent/Bronze (réductions, prix, couleurs)
- `STATUT_BADGE{}` — Mapping statut → fond/texte (canon global)
- `genCarteNFC()` — Générateur numéro NFC 16 chiffres
- `fmtUsd(n)` — Formateur montant USD (séparateurs FR)
- `dateFr(iso)` — Date ISO → "12 JUN 2026"
- `nextNumero(prefix, annee, refs)` — Numérotation auto DEV-/FAC-/CTR-/PRJ-
- `clientAggregate(id)` — Tous les objets liés à un client (vue 360°)

### Flux de conversion (cœur métier)

```
DEVIS (Accepté) ──▶ FACTURE ──▶ PROJET
CONTRAT (Signé) ──▶ PROJET (+ FACTURE optionnelle)
```
Chaque conversion copie les données et trace la source (`Converti depuis DEV-2026-035`).

### Numérotation automatique

Format : `PREFIX-AAAA-NNN` (ex: `DEV-2026-042`). Préfixes configurables dans Paramètres.

---

## Composants partagés

### Sidebar (`Sidebar.dc.html`)

- **Fond :** #203243, sticky, height 100vh, width 248px
- **Logo :** 42×42px, bg white, radius 8px + "NDEMBO KIN / Connect SARL"
- **Nav :** sections (Pilotage / Commercial / Opérations / Relations / Système), items avec icône SVG 18px, label, badge compteur optionnel
- **Item actif :** bg #BC000D, texte blanc, poids 700
- **Item inactif :** bg transparent, texte #B9CBD8, poids 400, hover texte blanc
- **Badge compteur :** pill JetBrains Mono, bg rgba(30,159,216,0.18) / color #6FC4EA (inactif), bg rgba(255,255,255,0.22) / blanc (actif)
- **Pied :** "Aide & support" + "CRM v1.0 · Kinshasa, RDC"
- **Prop `active` :** enum string (dashboard / devis / factures / contrats / projets / evenements / clients / vip / parametres)

### Topbar (`Topbar.dc.html`)

- **Fond :** blanc, border-bottom 1px, height 64px, sticky top 0, z-index 60
- **Hamburger :** visible < 920px → ouvre nav mobile (drawer depuis la gauche, overlay sombre)
- **Recherche :** input 420px max, bg #F8FAFC, typeahead sur Clients + Documents + Écrans, dropdown avec groupes
- **Bouton Créer :** rouge #BC000D, dropdown 7 items (Devis / Facture / Contrat / Projet / Événement / Client / Membre VIP)
- **Notifications :** badge rouge compteur non-lus, dropdown 326px, "Tout marquer comme lu"
- **Profil :** avatar rond navy initiales "AN", nom "A. Ndembo / Directeur Général", chevron → dropdown avec Paramètres + **Se déconnecter → Connexion.dc.html**
- **Prop `active` :** string (même valeurs que Sidebar)
- **Prop `searchPlaceholder` :** string contextuel par écran

---

## Écrans

### 1. Connexion (`Connexion.dc.html`)

**Layout :** Split-screen 100vh. Gauche (46%, max 620px) = brand panel sombre. Droite (flex:1) = formulaire centré.

**Brand panel (gauche) :**
- Gradient : `linear-gradient(150deg, #16242F 0%, #091D2E 58%, #16242F 100%)`
- Barre accent top : gradient cyan→rouge→or
- Dot grid overlay : `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)` / 26px
- Orbes flottantes : cyan (top-left, animation float 9s) + rouge (bottom-right, 11s)
- Logo 92×92px, bg blanc, radius 18px, shadow forte
- H1 Oswald 42px blanc uppercase
- Tagline Open Sans 15px rgba(255,255,255,0.62)
- Stats : 2 badges "2.4k Talents gérés" (cyan) + "50+ Tournois" (gold)
- Pied : "Kinshasa · RDC" icône pin

**Formulaire (droite) :**
- Fond : #F2F5F8 + dot pattern
- Carte : max-width 432px, bg blanc, border 1px, radius 14px, shadow 0 20px 56px rgba(9,29,46,0.10), padding 38px 36px
- Mobile : brand panel caché, logo compact visible

**Vue Login :**
- Badge icône lock (cyan tint), H2 "CONNEXION", subtitle
- Email input (icône mail à gauche)
- Password input (icône lock + toggle afficher/masquer)
- Row : "Se souvenir de moi" (checkbox custom navy) + "Mot de passe oublié ?" (lien cyan)
- Bouton rouge 50px "Se connecter →"
- Validation : email regex + pwd non-vide → bordures rouges + message d'erreur
- Submit réussi : loading 1.1s → `window.location.href = 'Dashboard.dc.html'`

**Vue Récupération :**
- Badge icône clé (gold tint), H2 "MOT DE PASSE OUBLIÉ"
- Email input
- Bouton rouge "Envoyer le lien ✈"
- "← Retour à la connexion"
- Submit réussi : loading 1.1s → vue Confirmation

**Vue Confirmation (envoyé) :**
- Badge check-circle vert
- H2 "LIEN ENVOYÉ" + email en JetBrains Mono
- Info box cyan "Vérifiez spams, lien expire 30 min"
- Bouton navy "← Retour à la connexion"
- Lien "Renvoyer le lien"

**State :**
```ts
{ view: 'login' | 'recovery', sent: boolean, email: string, pwd: string,
  remember: boolean, showPwd: boolean, loading: boolean,
  emailErr: boolean, loginErr: boolean, sentEmail: string }
```

---

### 2. Tableau de bord (`Dashboard.dc.html`)

**Données :** chargées depuis `crm-data.js` au mount.

**KPIs (4 cartes, grid auto-fit minmax 230px) :**
- Border-top 3px accent coloré
- Icône 30×30px bg teinté + valeur JetBrains Mono 27px + delta

**Pipeline commercial :**
- 3 blocs flex : Devis (cyan) → Factures (gold) → Projets (rouge)
- Flèches entre blocs + taux de conversion calculés

**Graphique revenus (6 derniers mois) :**
- SVG 560×200 viewBox, barres #3D5A6C (passé) / #BC000D (mois courant)
- Ligne objectif dashed #F4A800
- Données calculées depuis `FACTURES` (statut Payée par mois d'échéance)

**Documents récents :** tableau 5 colonnes (Ref / Client / Objet / Montant / Statut), données triées par date desc depuis DEVIS + FACTURES

**Échéances à venir :** liste depuis FACTURES en retard/attente + CONTRATS expirant + EVENEMENTS prochains

**Actions rapides :** 4 liens (Créer devis / Facture / Contrat / Membre VIP)

**Teaser VIP :** carte navy gradient, barre or/rouge, CTA "Gérer les renouvellements"

---

### 3. Devis (`Devis.dc.html`)

**Layout :** Vue liste ⇄ Vue éditeur (toggle interne).

**Liste :**
- Filtres tabs : Tous / Brouillon / Envoyé / Accepté / Expiré
- Recherche + tableau (Ref / Client / Objet / Montant / Statut / Date)
- Ligne cliquable → ouvre l'éditeur

**Éditeur (split) :**
- Gauche : formulaire (client select, objet, validité, lignes avec description/qté/PU, remise %, TVA 16%)
- Droite : aperçu A4 synchronisé en direct (en-tête logo + adresses, tableau lignes, totaux, CGV, pied légal)
- Barre de marque 5px (gradient navy/rouge/or)
- Actions : Sauvegarder / Envoyer / Convertir en facture (→ FACTURES)

**Calculs :** Total ligne = qté × PU ; Base remisée ; TVA sur base remisée ; Total TTC

**Numérotation :** `nextNumero('DEV-', 2026, devis.map(d => d.ref))`

---

### 4. Factures (`Factures.dc.html`)

Structure identique à Devis. Différences :
- Statuts : Brouillon / En attente / Payée / En retard
- Action "Marquer payée" → tampon PAYÉE rouge sur l'aperçu A4
- Action "Convertir en projet" (→ PROJETS)
- Champ échéance (date)
- Coordonnées de règlement (banque Rawbank) dans le pied

---

### 5. Contrats (`Contrats.dc.html`)

**Assistant 4 étapes :** Parties → Mission & durée → Finances → Clauses

**2 modèles :**
- A — Représentation d'athlète (commission %, clause de sortie : indemnité fixe OU % transfert)
- B — Prestation événementielle

**Aperçu juridique live :** texte mis à jour en direct, montants en or, clause de sortie en rouge.

**Actions :** Envoyer pour signature / Convertir en projet / Convertir en facture

**Champs clés :** parties (client existant), durée en mois, tacite reconduction, date début/fin calculée, commission, clauses confidentialité/exclusivité/droit à l'image

---

### 6. Projets (`Projets.dc.html`)

**Vue liste :** cartes filtres (statut + recherche), lien source (converti depuis...)

**Vue détail :**
- Stepper 5 étapes : Cadrage → Planification → Préparation → Exécution → Clôture
- Barre progression % = tâches faites / total
- Tâches : titre, fait/à faire, priorité (Faible/Moyenne/Haute/Urgente), échéance, assigné
- Journal d'activité auto (création, conversions, changements)
- Notes libres

**Priorités (badges) :** Faible=cyan, Moyenne=gold, Haute=rouge, Urgente=rouge plein blanc

---

### 7. Événements & Camps (`Evenements.dc.html`)

**Tabs :** Événements / Camps d'entraînement

**Vue liste :** KPIs contextuels + cartes (type badge, statut badge, lieu, dates, barre d'inscriptions, budget/catégorie)

**Vue détail :** KPIs individuels + taux de remplissage + objets liés (client organisateur, projet, accès VIP)

**Création (drawer) :**
- Événement : nom*, type (Tournoi/Gala/Détection), lieu*, dates début/fin, capacité, budget, statut, client organisateur (optionnel)
- Camp : nom*, catégorie (U13/U15/U17/Senior/Spécifique), lieu*, dates, places, statut, client (optionnel)
- Validation : nom + lieu requis
- Résultat : toast vert "Événement « X » créé."

---

### 8. Clients (`Clients.dc.html`)

**Base centrale.** Tout devis/facture/contrat/projet référence un `clientId` de cette liste.

**Types :** Club / Sponsor / Académie / Athlète / Institution

**Vue liste :** KPIs (total, CA cumulé, docs, actifs) + filtres type + recherche + tableau

**Drawer création/édition :**
- Champs : nom* (requis), type*, email* (format validé), téléphone, ville, adresse
- Validation visible (bordure rouge + message)
- Toast succès "Client « X » créé."

**Vue détail client (360°) :** résumé + onglets Devis / Factures / Contrats / Projets + profil athlète (si type Athlète) + journal d'activité

---

### 9. Membres VIP (`Membres VIP.dc.html`)

**Niveaux :**
| Niveau | Remise | Cotisation | Accent |
|---|---|---|---|
| Or | −15 % | $1 200/an | #F4A800 |
| Argent | −10 % | $600/an | #B9C4CC |
| Bronze | −5 % | $250/an | #C08A4D |

**Vue principale (split) :**
- Gauche : liste filtrée (tabs Or/Argent/Bronze + recherche), item sélectionné = bg cyan teinté + border-left cyan
- Droite sticky : carte NFC visuelle + fiche membre

**Carte NFC visuelle :**
- Gradient : `linear-gradient(135deg, #16242F 0%, #203243 55%, #2D4A5C 100%)`
- Barre accent top (couleur du niveau)
- Logo, nom programme, icône NFC
- Chip EMV (gradient or)
- Numéro JetBrains Mono 18px letter-spacing 0.16em
- Titulaire (Oswald uppercase) + validité (couleur selon statut)
- Aspect ratio 1.66 (format carte bancaire)

**Drawer nouveau membre :**
- Sélection client existant* (→ Clients.dc.html si inexistant)
- Niveau (Or/Argent/Bronze)
- Numéro carte NFC (+ bouton "⟳ Générer" = `genCarteNFC()`)
- Date d'émission → validité +1 an calculée auto
- Statut

**Actions sur fiche :** Renouveler / Assigner une carte / Envoyer par email / Appliquer une réduction

---

### 10. Paramètres (`Parametres.dc.html`)

**Sections :**
- Logo : zone de dépôt PNG transparent (remplace monogramme NK partout)
- Légal : dénomination, RCCM, ID NAT, NIF, adresse, email, téléphone
- Devises : USD principale, CDF secondaire, taux (défaut 1 USD = 2 850 CDF)
- TVA : % par défaut (défaut 16 %)
- Numérotation : préfixes DEV- / FAC- / CTR- / PRJ-
- Modèles de contrat : labels et clauses par défaut

---

## Interactions & Comportements globaux

### Pattern Drawer (Clients / VIP / Événements)

```
Ouverture : slide depuis la droite (translateX 100% → 0, 0.22s ease)
Overlay : rgba(9,29,46,0.42), clic → ferme
Largeur : 470px desktop, 100% < 920px
Footer sticky : Annuler (blanc) + action principale (rouge)
```

### Pattern Toast

```
Position : fixed, bottom 26px, centré horizontalement
Style : bg #16242F, texte blanc, icône check vert #177E54
Animation : opacity 0 + translateY(12px) → 1 + 0 (0.25s)
Auto-dismiss : 2800ms
```

### Pattern Confirmation (modale)

```
Overlay + carte centrée, icône + titre + corps + Annuler / Confirmer
Action dangereuse : bouton rouge
```

### États système requis

| État | Où | Implémentation |
|---|---|---|
| Loading async mount | Toutes listes | Skeleton loader (rectangles animés) |
| Empty (filtre vide) | Listes filtrées | Message + icône + CTA |
| Error réseau | Envois email/PDF | Toast rouge + "Réessayer" |
| Validation formulaire | Drawers, éditeurs | Bordure rouge input + message sous le champ |
| Success | Toutes actions | Toast vert auto-dismiss 2.8s |
| Confirm destructive | Supprimer/archiver | Modale ConfirmDialog |

### Responsive (< 920px)

- Sidebar masquée
- Topbar hamburger → nav mobile drawer (gauche, overlay sombre, animation slide-right)
- Grilles `auto-fit/minmax` → colonne unique
- Éditeurs A4 : formulaire puis aperçu en pile
- Drawers : width 100%
- Cibles tactiles : min 44px
- `data-main-pad` : padding réduit à 16px

---

## Flux de navigation

```
Connexion.dc.html
  └─[submit login]──▶ Dashboard.dc.html
                           └─[topbar profile]──▶ Connexion.dc.html (déconnexion)

Dashboard ──▶ tous les écrans via Sidebar + Actions rapides
Devis ──[Convertir]──▶ Factures
Factures ──[Convertir]──▶ Projets
Contrats ──[Convertir]──▶ Projets / Factures
Clients ──[détail]──▶ Devis / Factures / Contrats / Projets liés
Événements ──[détail objets liés]──▶ Clients / Projets / Membres VIP
Membres VIP ──[Assigner]──▶ drawer NFC
Topbar [Créer ▾] ──▶ ouverture directe de l'écran correspondant
```

---

## Assets

| Fichier | Usage |
|---|---|
| `assets/logo.png` | Logo Ndembo Kin Connect (PNG transparent) — sidebar, topbar mobile, en-têtes documents, carte NFC VIP, brand panel auth |

Icônes : **SVG inline uniquement** (pas de font icons). Tous les chemins `d=""` sont dans les fichiers de référence. Stroke-width généralement 1.8–2.2px.

---

## Données légales (COMPANY)

```js
nom:      'NDEMBO KIN CONNECT SARL'
rccm:     'CD/KIN/RCCM/23-B-0158'
idNat:    '01-83-N12345K'            // ⚠ À confirmer
nif:      'A1234567B'                // ⚠ À confirmer
adresse:  'Av. Citroniers, Q/ Golf, C/ Gombe — Immeuble USAID, 4ᵉ étage (Réf. HEC, ex ISC) — Kinshasa, RDC'
email:    'contact@ndembokin.com'
tel:      '+243 810 188 880'
banque:   'Rawbank — compte USD n° 0501-1234567-89'  // ⚠ À confirmer
swift:    'RAWBCDKI'
```

---

## Backlog P2 (non bloquant)

1. **Skeleton loader** au mount async de crm-data.js sur toutes les listes
2. **Bouton "Exporter"** (Dashboard) → génération PDF à connecter au backend
3. **Bouton "30 derniers jours"** (Dashboard) → filtre temporel dynamique
4. **Standardiser KPI border** : `border-left: 3px` partout (Dashboard utilise `border-top`)
5. **Suppression / archivage** (devis / factures / contrats / clients / membres) → ConfirmDialog variante danger + toast
6. **Profil utilisateur en sidebar** (pied de nav) — actuellement seulement dans Topbar
7. **Rôles & permissions** — non couverts en design, à définir côté implémentation

---

## Fichiers de référence

```
design_handoff_ndembokin_crm/
├── README.md                    ← ce fichier
├── crm-data.js                  ← source unique de données (seed + helpers)
├── Connexion.dc.html            ← auth (login + récupération)
├── Dashboard.dc.html            ← tableau de bord
├── Devis.dc.html                ← devis (liste + éditeur A4)
├── Factures.dc.html             ← factures (liste + éditeur + tampon)
├── Contrats.dc.html             ← contrats (assistant 4 étapes + aperçu)
├── Projets.dc.html              ← projets (liste + détail + tâches)
├── Evenements.dc.html           ← événements & camps (liste + création)
├── Clients.dc.html              ← clients (liste + drawer + détail 360°)
├── Membres VIP.dc.html          ← VIP (liste + carte NFC + drawer)
├── Parametres.dc.html           ← paramètres système
├── Sidebar.dc.html              ← composant nav partagé
└── Topbar.dc.html               ← composant header partagé
```

> **Note :** Les fichiers `.dc.html` s'ouvrent directement dans un navigateur pour inspection interactive. Ils nécessitent `support.js` dans le même dossier pour s'exécuter.
