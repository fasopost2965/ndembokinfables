# Ndembo Kin Connect — Système Complet

_Started 2026-06-13 00:02 UTC_

---

## User

/Gost J'ai une seule instruction et sur la base de tyoutes les infoq que je t'ai données  corrige améliore et repense le design Prépare tous les écrant et toutes les vues
 L'objectif et de tout préparer pour apres donner la main à claude code pour l'implémentation Design a premium quote creation screen for Ndembo Kin Connect SARL, a Congolese sports management company.

The screen must feel modern, elegant, and highly intuitive, with desktop-first design and full mobile responsiveness. Use the brand logo and the visual identity inspired by the logo colors: blue-gray, sky blue, red, yellow, and white.

Include:
- Quote list view with search, filters, status badges, and sorting.
- A clean quote editor form with guided fields.
- Client information, quote number, date, valid until, currency, items/services, tax, discounts, notes, and total.
- Beautiful document preview on the side or bottom.
- Action buttons: Save, Preview PDF, Send by email, Convert to invoice.
- A template that looks professional and printable, with logo, company details, and legal information.
- Smooth UX, modern cards, clear hierarchy, and minimal clutter.
Design a premium invoice management screen for Ndembo Kin Connect SARL, a Congolese sports management company.

The screen must be modern, clean, elegant, and responsive, optimized for desktop but fully usable on mobile. Use the company logo and brand colors inspired by the logo.

Include:
- Invoice list with search, filters, payment status, due date, and sorting.
- Invoice creation form with client details, invoice number, date, due date, line items, taxes, discounts, payment method, and notes.
- Beautiful invoice preview with logo, legal information, payment terms, and totals.
- Action buttons: Save, Preview PDF, Send by email, Mark as paid, Convert to project.
- Professional template design, highly readable and printable.
- Clear layout, strong typography, badges for status, and modern UI components.
Design a smart contract creation screen for Ndembo Kin Connect SARL, a Congolese sports management company.

The screen should be elegant, premium, and very easy to use, with desktop-first layout and responsive mobile support. Use the company logo and brand colors.

Include:
- Contract templates list with 1 or 2 standard contract models.
- Guided contract builder with step-by-step questions.
- Fields for client/athlete info, service type, duration, payment terms, responsibilities, clauses, and signatures.
- A live contract preview with professional formatting, logo, company identity, and legal structure.
- Action buttons: Save draft, Generate PDF, Send by email, Convert to project, Convert to invoice.
- Clean legal document style, minimal friction, and strong visual hierarchy.
Design a project management screen for Ndembo Kin Connect SARL, a Congolese sports management company.

The screen must be modern, structured, and productive, with a premium look, desktop-first design, and mobile responsiveness. Use the brand logo and colors inspired by the logo.

Include:
- Project overview header with status, progress, priority, client, and dates.
- Project stages timeline or step tracker.
- Task management with add, edit, delete, complete, and priority levels.
- Color-coded tags for priority: low, medium, high, urgent.
- Activity log, notes, and recent updates.
- Action buttons: Add task, Edit project, Archive, Convert from contract or invoice.
- Clean cards, strong hierarchy, and an easy-to-scan layout.
Design a VIP membership management screen for Ndembo Kin Connect SARL, a Congolese sports management company.

The screen should feel premium, exclusive, and modern, with desktop-first design and full mobile responsiveness. Use the company logo and brand identity.

Include:
- VIP member list with search, filters, status, and membership type.
- VIP card profile with NFC membership card visual.
- Member details: name, contact info, membership status, benefits, discounts, join date, expiration date, and event access.
- Actions: Add member, Renew membership, Assign card, Send card by email, Apply discount.
- A premium card-style interface, elegant visuals, and clear data organization.
- A section for VIP advantages linked to events, tournaments, and stages.
Design a premium CRM for Ndembo Kin Connect SARL, a Congolese sports management company.

Use the provided logo and a clean brand identity inspired by its colors: blue-gray, sky blue, red, yellow, and white.

Create a modern, desktop-first, mobile-friendly interface with:
- A left sidebar navigation.
- A top bar with search, create action, notifications, and profile.
- A dashboard with KPI cards, recent activity, and quick actions.
- Separate elegant screens for Quotes, Invoices, Contracts, Projects, and VIP Members.

Business features:
- Create quotes and invoices with beautiful printable templates.
- Convert quote to invoice.
- Convert invoice to project.
- Create contracts from guided questions using 1 or 2 standard templates.
- Export contracts to PDF and email.
- Convert contract to project and optionally invoice.
- Manage projects with stages, tasks, priorities, and color codes.
- Manage VIP NFC membership cards with benefits and discounts.
- Include settings for logo, legal info, currency, and document templates.

Style:
- Premium, sporty, professional, simple, and highly readable.
- Clean cards, tables, badges, document previews, and intuitive forms.
- No clutter, no complex visual noise, strong hierarchy, and polished UI.
/gost

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: update_todos]_

_[tool: dc_write]_

_[tool: dc_write]_

_[tool: update_todos]_

_[tool: dc_write]_

Composants partagés OK. Maintenant le Dashboard.

_[tool: dc_write]_

_[tool: dc_write]_

Devis OK. Maintenant Factures.

_[tool: dc_write]_

_[tool: dc_write]_

Contrats OK. Maintenant Projets.

_[tool: dc_write]_

_[tool: copy_starter_component]_

Maintenant Paramètres — j'ajoute d'abord le composant image-slot pour que vous puissiez déposer votre vrai logo.

_[tool: dc_write]_

_[tool: write_file]_

Maintenant le document de handoff pour Claude Code.

## User

/Gost 
 je précise que je ne vois pas la création de client Mais 
avant de passer à claude code fait Audit critique et apres Correction brief ci apres
 You are now the lead product designer.

Based on the previous audit, produce a correction plan for the Ndembo Kin Connect SARL CRM.

Rules:
- Fix only what is necessary.
- Preserve the best parts of the current design.
- Improve coherence, usability, hierarchy, and business fit.
- Add only the missing screens and missing states.
- Standardize the design system.
- Make the CRM feel premium, sporty, professional, and easy to use.

Apply corrections to:
- Dashboard
- Quotes
- Invoices
- Contracts
- Projects
- VIP membership
- Settings
- Mobile layout

Required improvements:
1. Make the document workflow fully logical.
2. Clarify all conversion actions:
   - quote to invoice
   - invoice to project
   - contract to project
   - contract to invoice
3. Add missing empty states, loading states, success states, and validation states.
4. Add missing confirmation dialogs for delete, convert, send, archive, and publish actions.
5. Add missing project states and task priority color system.
6. Add a proper VIP NFC membership flow.
7. Add a settings page for legal data, branding, currency, numbering, and templates.
8. Ensure the mobile version stays usable and not crowded.
9. Standardize buttons, badges, cards, forms, tables, and previews.
10. Make the contract builder guided and intuitive.

Deliverables:
- Updated screen-by-screen correction notes
- Missing screens to add
- Missing interactions to add
- UI components to standardize
- Final prioritized implementation checklist

Be concise but very precise. Do not repeat the audit. Only describe the corrections and the exact improvements to make.

 en fin tu prépare claude code 
/gost

## Assistant

## Assistant

## Assistant

_[tool: update_todos]_

Compris. D'abord l'audit critique, puis je corrige le manque le plus criant — **la gestion des clients (création incluse)**, absente du CRM — plus les états et confirmations manquants, avant de re-préparer le handoff.

## Audit critique — synthèse

**1. Écran Clients manquant (HIGH)** — Où : partout. Les devis/factures/contrats référencent des clients via un `<select>` figé, mais aucun écran ne permet de **créer, lister ou éditer un client**. C'est un trou central du modèle de données : impossible d'alimenter le CRM. → Créer `Clients.dc.html` (liste + fiche + création).

**2. Conversions sans confirmation ni feedback (HIGH)** — Où : Devis→Facture, Facture→Projet, Contrat→Projet/Facture, « Marquer payée », envois email. Les boutons agissent en silence, sans dialogue de confirmation ni état de succès. Actions destructrices/irréversibles dangereuses. → Ajouter modale de confirmation + toast de succès.

**3. États vides absents (MEDIUM)** — Où : toutes les listes (filtres). Un filtre sans résultat affiche un tableau vide sans message. → Empty states avec CTA.

**4. États de validation/chargement absents (MEDIUM)** — Formulaires sans validation visible (champs requis, email, montants), pas de skeleton de chargement. → Documenté pour Claude Code.

**5. Navigation incomplète (MEDIUM)** — Sidebar sans entrée Clients ; le menu « Créer » n'inclut pas client. → Corrigé.

**6. Cohérence visuelle (LOW)** — Globalement bonne (tokens partagés), mais badges/boutons à figer comme composants canoniques. → Standardisé dans le handoff.

**7. Mobile (MEDIUM)** — Sidebar masquée < 920px sans menu hamburger de remplacement ; éditeurs document non testés en pile. → Drawer mobile documenté.

**Top fixes** : (1) Clients, (2) confirmations+toasts conversions, (3) empty states, (4) nav Clients, (5) validation formulaires, (6) drawer mobile.

Je passe à la correction. Je construis l'écran Clients, l'ajoute à la navigation, et ajoute confirmations + toasts + états vides aux flux de conversion.Je crée d'abord l'écran Clients (liste + fiche + création avec états vides et succès).

_[tool: dc_write]_

Maintenant j'ajoute Clients à la sidebar et au menu Créer du topbar.

_[tool: read_file]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: str_replace_edit]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

Maintenant j'ajoute les confirmations + toasts aux conversions. Je commence par Devis (convertir / envoyer).

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

Maintenant j'ajoute l'état vide à la liste Devis et la modale + toast.

_[tool: dc_html_str_replace]_

Maintenant la logique Devis (confirm + toast + listeVide).

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

Maintenant Factures — mêmes confirmations + toast.

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

Maintenant la logique Factures (confirm/toast/listeVide + toast sur marquerPayee).

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

Maintenant Contrats — confirmations pour convertir en projet / facture / envoyer.

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: str_replace_edit]_

Maintenant je mets à jour le handoff avec les corrections et le plan d'implémentation.

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: update_todos]_

Vérifions le rendu de l'écran Clients (le plus critique) et le flux de confirmation.

_[tool: show_html]_

_[tool: show_html]_

_[tool: eval_js]_

Le rendu est bon (sidebar masquée car l'iframe est étroite < 920px — comportement responsive attendu). Testons le drawer de création.

_[tool: save_screenshot]_

_[tool: save_screenshot]_

Le drawer de création fonctionne parfaitement — formulaire guidé, champs requis marqués, footer d'actions. Vérifions une vue large (sidebar visible) sur le Dashboard et livrons.

_[tool: done]_

Audit traité et corrigé. Voici ce qui a changé.

**Le manque que vous aviez repéré — la gestion des clients — est comblé :**
- **`Clients.dc.html`** : liste filtrable (type, recherche), stats, et **création/édition de client en drawer** avec validation (nom requis, format email vérifié), état vide contextuel et toast de succès. Ajouté à la sidebar (Relations) et au menu « Créer ». C'est désormais la base de données centrale : devis, factures et contrats référencent ces comptes.

**Corrections du brief appliquées :**
- **Confirmations + toasts** sur toutes les actions sensibles : Devis→Facture, Facture→Projet, Contrat→Projet, Contrat→Facture, « Marquer payée », envois email, et signature. Modale standard (icône/titre/corps/Annuler-Confirmer) + toast vert auto-dismiss.
- **États vides** ajoutés aux listes (Devis, Factures, Clients) avec message + CTA.
- **Validation visible** dans le drawer Clients (bordure rouge + message d'erreur).

**Le `HANDOFF.md` est prêt pour Claude Code** : il contient désormais le plan de correction post-audit, la liste des composants à standardiser (`ConfirmDialog`, `Toast`, `StatusBadge`, `DataTable`, `DocumentPreview`, `Drawer`, `Stepper`…), les états restant à coder (loading, erreur réseau, drawer mobile, confirmations de suppression/archivage) et une **checklist d'implémentation priorisée en 10 points**.

Restent volontairement non câblés (intégration backend) : génération PDF, envoi email réel, et le menu hamburger mobile — tous documentés dans le handoff. Il vous faudra fournir le **logo officiel** (un monogramme « NK » sert de placeholder) et les **coordonnées légales réelles**.

