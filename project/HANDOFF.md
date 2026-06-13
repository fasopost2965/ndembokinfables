# NDEMBO KIN CONNECT SARL — CRM · Handoff d'implémentation (Claude Code)

Design finalisé et validé en maquettes interactives HTML (fichiers `*.dc.html` à la racine).
Ce document résume le système de design, l'architecture des écrans et la logique métier à implémenter.

---

## 1. Écrans livrés (maquettes de référence)

| Fichier | Écran | Vues internes |
|---|---|---|
| `Dashboard.dc.html` | Tableau de bord | KPI, pipeline Devis→Factures→Projets, graphique revenus, documents récents, actions rapides, échéances, teaser VIP |
| `Devis.dc.html` | Devis | Liste (filtres par statut + recherche) ⇄ Éditeur (formulaire guidé + aperçu document A4 synchronisé en direct) |
| `Factures.dc.html` | Factures | Liste (statuts paiement, échéances) ⇄ Éditeur (+ tampon « PAYÉE », coordonnées de règlement, mode de paiement) |
| `Contrats.dc.html` | Contrats | Liste (2 modèles standard + contrats en cours) ⇄ Assistant guidé 4 étapes + aperçu juridique en direct |
| `Projets.dc.html` | Projets | Liste (cartes, filtres) ⇄ Détail (tracker 5 étapes, tâches cochables, priorités, notes, journal d'activité) |
| `Membres VIP.dc.html` | Membres VIP | Liste filtrable par niveau + carte NFC visuelle + fiche membre + grille d'avantages Or/Argent/Bronze |
| `Clients.dc.html` | Clients & comptes | Liste filtrable (type) + recherche + **création/édition en drawer** (validation nom + email) + états vides + toast succès |
| `Parametres.dc.html` | Paramètres | Logo (zone de dépôt), couleurs, légal (RCCM/ID NAT/NIF), devises USD/CDF + taux, TVA, numérotation, modèles de contrat |

Composants partagés : `Sidebar.dc.html` (prop `active`, inclut Clients) et `Topbar.dc.html` (recherche globale, menu « Créer » incluant client, notifications, profil).

> **Clients est la base du modèle de données.** Tout devis/facture/contrat doit référencer un `client_id` issu de cet écran (le `<select>` client de chaque éditeur lit cette liste). Ne pas saisir de client en texte libre.

> **Source unique de données : `crm-data.js`.** Un seul module ES (`CLIENTS`, `VIP_TIERS`, `COMPANY`, helpers) alimente désormais Clients, Contrats et Membres VIP (chargé via `import('./crm-data.js')`). La création d'un **membre VIP** sélectionne un client existant (drawer, bouton « Ajouter un membre » câblé) ; la **partie contractante** d'un contrat est aussi un client de cette liste (plus de saisie libre). Côté backend, mappez ces structures sur vos routes — aucune donnée client n'est dispersée.

## 2. Design tokens (source : design system NDEMBO KIN Sport v1.0)

### Couleurs
```
--navy-deep:    #254354   /* primaire, titres, en-têtes de tables */
--navy-mid:     #3D5A6C   /* hover primaire, barres graphique */
--sidebar:      #203243   /* fond sidebar (inverse-surface) */
--red:          #BC000D   /* CTA principal, urgence ; hover #E61B1C */
--gold:         #F4A800   /* VIP, victoires, surlignage contrats ; texte assoc. #9A6B00 / #B07800 */
--cyan:         #1E9FD8   /* info, focus, liens ; texte assoc. #1E78A8 */
--success:      #177E54   /* payé, terminé, validation (oklch harmonisé, hors palette d'origine) */
--bronze:       #C08A4D   /* niveau VIP Bronze ; texte #A86B2F */
--bg-page:      #F2F5F8
--bg-subtle:    #F8FAFC
--text:         #091D2E   /* corps */
--text-2:       #5B6B77   /* secondaire */  --text-3: #8896A0  /* tertiaire */
--border:       rgba(37,67,84,0.10)  /* cartes */ ; inputs rgba(37,67,84,0.16–0.18)
```

### Typographie (Google Fonts)
- **Oswald** 500–700 — titres de pages (uppercase, letter-spacing 0.02–0.06em), titres de sections, monogramme.
- **Open Sans** 400/600/700 — UI et corps (13–13.5px tableaux, 12.5px secondaire).
- **JetBrains Mono** 500/700 — montants, références (DEV-/FAC-/CTR-), dates, KPI, numéros de carte.
- Labels en capitales : 10–11px, weight 700, letter-spacing 0.1–0.16em.

### Formes & élévation
- Radius : 6px (boutons/inputs), 8px (cartes), pill pour badges de statut, 14px carte NFC.
- Pas d'ombres lourdes : bordures 1px + accent `border-top: 3px` coloré (priorité/urgence).
- Documents (aperçus) : ombre `0 16px 40px rgba(9,29,46,0.14)` + barre de marque 5px (dégradé navy/rouge/or).
- Grille 8px ; padding cartes 18–22px ; tables zébrées blanc/`#F8FAFC`, en-tête navy texte blanc.

### Badges de statut (canon)
| Statut | Fond | Texte |
|---|---|---|
| Brouillon / Planifié | rgba(37,67,84,.10) | #42474C |
| Envoyé / En attente / Expire bientôt / Moyenne | rgba(244,168,0,.16) | #9A6B00 |
| Accepté / En cours / Faible / Info | rgba(30,159,216,.14) | #1E78A8 |
| Payée / Signé / Terminé | rgba(23,126,84,.12) | #177E54 |
| En retard / Expiré / Haute | rgba(188,0,13,.10) | #BC000D |
| Urgente | #BC000D plein | #FFFFFF |

## 3. Logique métier à implémenter

### Flux de conversion (cœur du produit)
```
DEVIS ──accepté──▶ FACTURE ──payée/lancée──▶ PROJET
CONTRAT ──signé──▶ PROJET (+ optionnellement FACTURE)
```
- Toute conversion copie les données (client, lignes, montants) et trace la source (`Converti depuis DEV-2026-035` affiché dans le détail projet et le journal).
- Numérotation auto par préfixe configurable (Paramètres) : `DEV-AAAA-NNN`, `FAC-AAAA-NNN`, `CTR-AAAA-NNN`.

### Devis / Factures
- Lignes : description, qté, P.U. (saisie USD) ; total ligne calculé. Remise % → TVA % (défaut 16) sur base remisée → Total TTC.
- Devise d'affichage USD ⇄ CDF (taux configurable, défaut 1 USD = 2 850 CDF) : conversion à l'affichage du document.
- Statuts devis : Brouillon → Envoyé → Accepté | Expiré (validité par date).
- Statuts factures : Brouillon → En attente → Payée | En retard (échéance dépassée). « Marquer payée » appose le tampon PAYÉE sur le document.
- Documents générés (PDF/email) : en-tête logo + dénomination, bloc client, tableau lignes, totaux, conditions, pied légal (RCCM, ID NAT, NIF, adresse, banque Rawbank), barre de marque.

### Contrats
- 2 modèles : **A — Représentation d'athlète** (commission %, clause de sortie : indemnité fixe OU % de transfert) ; **B — Prestation événementielle**.
- Assistant en 4 étapes : Parties → Mission & durée (tacite reconduction oui/non) → Finances → Clauses (confidentialité, exclusivité, droit à l'image) ; aperçu juridique mis à jour en direct, valeurs clés surlignées (or = montants, rouge = clause de sortie).
- Date de fin = début + durée (mois). Signature électronique : deux blocs (Agence / partie contractante).

### Projets
- Étapes fixes : Cadrage → Planification → Préparation → Exécution → Clôture.
- Tâches : titre, fait/à faire, priorité (Faible/Moyenne/Haute/Urgente), échéance, assigné. Avancement % = tâches faites / total.
- Journal d'activité automatique (création, conversions, changements de priorité…), notes libres.

### Membres VIP
- Niveaux : **Or −15 % ($1 200/an)**, **Argent −10 % ($600/an)**, **Bronze −5 % ($250/an)** ; avantages liés aux tournois/camps/stages (voir grille dans la maquette).
- Carte NFC : numéro 16 chiffres, titulaire, niveau, validité ; statuts Actif / Expire bientôt / Expiré.
- Actions : Renouveler, Assigner une carte, Envoyer par email, Appliquer une réduction.

### Paramètres
- Légal : dénomination, RCCM, ID NAT, NIF, adresse, email, téléphone → injectés dans tous les documents.
- Devises : USD principale, CDF secondaire + taux ; TVA par défaut.
- Logo uploadable (PNG transparent) — remplace le monogramme « NK » placeholder partout.

## 4. Données de démonstration
Clients : Mazembe Corp, Orange RDC, Lupopo FC Academy, Académie Les Aiglons, Union Kinshasa, FECOFA.
Voir les tableaux `DEVIS`, `FACTURES`, `CONTRATS`, `PROJETS`, `MEMBRES` dans la logique de chaque maquette — réutilisables comme seed data.

## 5. Responsive
Desktop-first (≥ 1280px, contenu max 1380px). < 920px : sidebar masquée (prévoir un menu hamburger / drawer — non maquetté), grilles en `auto-fit/minmax` qui se replient en une colonne, éditeurs document passent en pile (formulaire puis aperçu). Cibles tactiles ≥ 44px à prévoir en mobile.

## 6. À fournir / décisions ouvertes
- **Logo officiel** — ✅ intégré (`assets/logo.png`), affiché sidebar, en-têtes de documents (devis/factures/contrats) et carte NFC VIP.
- **Coordonnées réelles** — ✅ intégrées (Paramètres + pieds de page documents) : Av. Citroniers, Q/ Golf, C/ Gombe — Immeuble USAID, 4ᵉ étage (Réf. HEC, ex ISC), Kinshasa, RDC · contact@ndembokin.com · +243 810 188 880 (WhatsApp).
- Coordonnées légales restantes (ID NAT, NIF, banque Rawbank) — à confirmer (valeurs de démonstration).
- Envoi email / génération PDF : côté maquette, boutons non câblés (intégration backend).
- Authentification, rôles et permissions : non couverts par le design.

---

## 7. Plan de correction appliqué (post-audit)

Corrections déjà intégrées aux maquettes :
- **Écran Clients** (`Clients.dc.html`) — création/édition en drawer avec validation (nom requis, format email), états vides contextuels, toast de succès. Ajouté à la sidebar (section Relations) et au menu « Créer ».
- **Confirmations + toasts** sur toutes les conversions et actions sensibles : Devis→Facture, Devis envoi ; Facture→Projet, envoi, « Marquer payée » ; Contrat→Projet, Contrat→Facture, envoi pour signature. Modale standard (icône + titre + corps + Annuler/Confirmer) + toast vert de succès auto-dismiss (2,6 s).
- **États vides** sur les listes Devis, Factures et Clients (message + CTA quand un filtre ne renvoie rien).
- **Validation de formulaire** visible dans le drawer Clients (bordure rouge + message). À répliquer sur les éditeurs Devis/Factures (client requis, au moins une ligne, montants > 0) côté implémentation.

### Composants à standardiser (design system partagé pour Claude Code)
À extraire en composants réutilisables — déjà homogènes visuellement dans les maquettes, à factoriser en code :
- `ConfirmDialog` (props : titre, corps, libellé, couleur d'action, icône) — utilisé partout.
- `Toast` (succès / erreur / info) — file unique, auto-dismiss.
- `StatusBadge` (mapping statut → fond/texte, voir §2) — un seul composant piloté par enum.
- `Drawer` latéral (création/édition) — réutilisé Clients, à réutiliser pour membres VIP et tâches.
- `DocumentPreview` (en-tête marque, bloc parties, table lignes, totaux, pied légal) — partagé Devis/Factures, variante Contrat.
- `DataTable` (en-tête navy, lignes zébrées, ligne cliquable, footer pagination, slot état vide).
- `Stepper` (assistant contrat / étapes projet).
- `EmptyState`, `KpiCard`, `FilterTabs`, `PriorityTag`.

### États restant à implémenter côté code (non bloquants pour le design)
- **Loading / skeleton** sur listes et aperçus pendant chargement async.
- **Erreur réseau** (envoi email, génération PDF échoués) → toast rouge + réessayer.
- **Drawer / menu mobile** (< 920px) remplaçant la sidebar masquée (hamburger dans la topbar).
- Confirmations de **suppression** (devis/facture/contrat/client/membre) et **archivage** projet — réutiliser `ConfirmDialog` en variante « danger » (action rouge).

## 8. Checklist d'implémentation priorisée
1. Modèle de données + écran **Clients** comme source unique (client_id partout).
2. Composants partagés : `StatusBadge`, `ConfirmDialog`, `Toast`, `DataTable`, `DocumentPreview`.
3. Flux de conversion câblés (devis→facture→projet, contrat→projet/facture) avec confirmation + traçabilité de la source.
4. Génération PDF + envoi email (backend) derrière les boutons déjà présents.
5. Validation des éditeurs Devis/Factures/Contrats.
6. Numérotation auto par préfixe (Paramètres) + injection des données légales dans les documents.
7. États loading / erreur / vide systématiques.
8. Layout mobile (drawer nav + éditeurs en pile) + cibles ≥ 44px.
9. VIP : flux émission/renouvellement de carte NFC en drawer (réutiliser le pattern Clients).
10. Auth / rôles / permissions (hors design).
