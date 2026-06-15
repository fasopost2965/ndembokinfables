import { useMemo } from 'react';
import { useCRM } from '../contexts/CRMContext';
import { dateFr } from '../crm-data';

function daysDiff(isoDate, today) {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  if (isNaN(d)) return null;
  return Math.round((d - today) / 86400000);
}

function buildNotifications(state) {
  const TODAY = new Date();
  const notes = [];

  state.factures.forEach(f => {
    if (f.statut === 'En retard') {
      const diff = daysDiff(f.echeance, TODAY);
      const label = diff !== null && diff < 0 ? `${Math.abs(diff)} j de retard` : 'En retard';
      notes.push({ id: `fac-retard-${f.ref}`, type: 'danger', icon: '⚠️', title: `Facture ${f.ref} en retard`, body: `${f.objet || '—'} — ${label}`, to: '/factures' });
    }
    if (f.statut === 'En attente' && f.echeance) {
      const diff = daysDiff(f.echeance, TODAY);
      if (diff !== null && diff >= 0 && diff <= 7) {
        notes.push({ id: `fac-echeance-${f.ref}`, type: 'warning', icon: '🕐', title: `Facture ${f.ref} — échéance dans ${diff} j`, body: f.objet || '—', to: '/factures' });
      }
    }
  });

  state.contrats.forEach(c => {
    const dateExpiry = c.expire || c.dateFin;
    const isActif = ['Signé', 'Actif', 'Expire bientôt'].includes(c.statut);
    if (isActif && dateExpiry) {
      const diff = daysDiff(dateExpiry, TODAY);
      if (diff !== null && diff >= 0 && diff <= 30) {
        notes.push({ id: `ctr-expire-${c.ref}`, type: 'warning', icon: '📄', title: `Contrat ${c.ref} expire dans ${diff} j`, body: `${c.type || '—'} — fin le ${dateFr(dateExpiry)}`, to: '/contrats' });
      }
    }
  });

  state.devis.forEach(d => {
    if (['En attente', 'Envoyé'].includes(d.statut) && d.date) {
      const age = -daysDiff(d.date, TODAY);
      if (age !== null && age > 14) {
        notes.push({ id: `dev-attente-${d.ref}`, type: 'info', icon: '📋', title: `Devis ${d.ref} sans réponse (${age} j)`, body: d.objet || '—', to: '/devis' });
      }
    }
  });

  return notes;
}

export function useNotifications() {
  const { state } = useCRM();
  const all = useMemo(() => buildNotifications(state), [state]);
  const nonLues = all.filter(n => !state.notificationsLues.includes(n.id));
  return { all, nonLues };
}
