# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `crm-app/`:

```bash
npm run dev       # Dev server on http://localhost:3000 (strictPort)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

No test suite exists.

## Project structure

The CRM app lives entirely in `crm-app/src/`. The rest of the repo contains design handoff files and chat logs (`project/`, `chats/`) that are read-only reference material.

```
crm-app/src/
  main.jsx              # Entry: ErrorBoundary > CRMProvider > ToastProvider > App
  App.jsx               # BrowserRouter + RequireAuth guard + all routes
  index.css             # CSS custom properties (design system tokens)
  crm-data.js           # Static seed data + shared utilities
  contexts/
    CRMContext.jsx      # useReducer state + localStorage persistence
    ToastContext.jsx    # Toast notification system
  components/
    Layout.jsx          # Shell with Sidebar + <Outlet />
    Sidebar.jsx         # Navigation
    ErrorBoundary.jsx
    ui/
      Drawer.jsx        # Slide-in panel used by all create/edit forms
      FormControls.jsx  # Shared form component library (see below)
      ConfirmModal.jsx  # Global confirm dialog driven by reducer
      StatusBadge.jsx   # Badge mapped via STATUT_BADGE from crm-data.js
      EmptyState.jsx
  pages/
    Dashboard.jsx
    Clients.jsx / Athletes.jsx / VIP.jsx
    Devis.jsx / Factures.jsx / Contrats.jsx
    ContratWizard.jsx   # 4-step contract generator wizard at /contrats/nouveau
    Projets.jsx / Evenements.jsx
    Parametres.jsx / Login.jsx
```

## State management

`CRMContext.jsx` holds all app state via `useReducer`. State persists to `localStorage` under the key `ndemboCrmState` and is rehydrated on mount (with `confirmModal` reset).

Reducer action naming: `ADD_X`, `UPDATE_X`, `DELETE_X` where X is the entity (CLIENT, DEVIS, FACTURE, CONTRAT, PROJET, VIP, EVENEMENT, CAMP, ATHLETE). Additional actions: `UPDATE_DEVIS_STATUT`, `UPDATE_COMPANY`, `OPEN_CONFIRM`, `CLOSE_CONFIRM`.

`DELETE_CLIENT` cascades to devis, factures, contrats, projets, vipMembers — but does **not** cascade to evenements or camps. This is a known data integrity gap.

Helpers exposed by `useCRM()`:
- `getNom(id)` — resolves a name from clients then athletes by id
- `confirmAction(title, message, onConfirm)` — opens the global confirm modal
- `clientCA(clientId)` — sum of paid invoices (statut === 'Payée') for a client

## crm-data.js — utilities and seed data

- `nextNumero(prefix, year, refs)` — generates the next ref (e.g. `DEV-2026-043`) from the max existing number in `refs`
- `fmtUsd(n)` — formats USD amounts with French locale separators
- `dateFr(iso)` — converts ISO date to `12 JUN 2026` format
- `STATUT_BADGE` — canonical status → `{ bg, color }` mapping used by `StatusBadge`
- `genCarteNFC()` — generates a 16-digit NFC card number with prefix `4588 2201`
- Seed data: CLIENTS, ATHLETES, DEVIS, FACTURES, CONTRATS, PROJETS, EVENEMENTS, CAMPS, VIP_MEMBERS

Athletes (ids 7, 8) and clients (ids 1–6) share the same id namespace for `clientId` references in contracts. Athletes are stored separately in `state.athletes` and their ids can appear as `clientId` on contrats.

## FormControls.jsx — shared form library

All module drawers import from `components/ui/FormControls.jsx`:

| Component | Purpose |
|---|---|
| `FormSection` | Titled section with subtitle, groups fields |
| `FormRow` | CSS grid row, default `1fr 1fr` |
| `TextField` | Input with validation border (cyan=filled, red=error), char counter, hint |
| `SelectField` | Styled select with error state |
| `TextareaField` | Textarea with char counter |
| `AmountField` | USD amount input with $ prefix |
| `DateField` | Date input with shortcut pills |
| `SliderField` | Range slider with dynamic color |
| `TypeCards` | Visual card group for enum selection |
| `EntitySelector` | Searchable dropdown for clients/athletes, with avatar |
| `ToggleSwitch` | Boolean toggle |
| `ValidationSummary` | Lists all errors at top of form |

Pattern for every drawer: build an `errs` object in `handleSave()`, call `setErrors(errs)`, return early if any errors.

## ContratWizard (4-step wizard)

Route: `/contrats/nouveau` — accessed via "Générer un contrat" button in Contrats.jsx.

Steps: (1) party + type selection, (2) financials + dates, (3) type-specific clauses, (4) status + summary.

`buildContractHTML(form, partyName, company)` produces type-specific contract HTML (Représentation / Sponsoring / Prestation) injected into a preview pane and used for `window.print()` PDF export.

On save: dispatches `ADD_CONTRAT`, optionally `UPDATE_ATHLETE` if type is Représentation, then navigates to `/contrats`.

## Design system

CSS custom properties defined in `index.css`:
- Colors: `--navy-deep`, `--gold`, `--cyan`, `--red`, `--success`, `--white`, `--bg-page`, `--border`, `--border-input`, `--text-1/2/3`
- Fonts: `--font-oswald` (display headers), `--font-jetbrains` (refs/data), Open Sans (body default)
- All monetary values are in USD (`$`), with optional CDF conversion via `company.tauxUSD`

## Authentication

`RequireAuth` in App.jsx checks `localStorage.getItem('isAuthenticated') === 'true'`. No real auth — Login.jsx sets this flag. Protected routes live under the `/` parent route with `<Layout />`.
