import { useState } from 'react';
import { STATUT_BADGE, fmtUsd, dateFr } from '../crm-data';
import { useCRM } from '../contexts/CRMContext';
import StatusBadge from '../components/ui/StatusBadge';
import Drawer from '../components/ui/Drawer';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';

const STATUTS = ['Tous', 'Brouillon', 'Envoyé', 'Accepté', 'Converti', 'Expiré'];

export default function Devis() {
  const { state: { devis, clients, factures }, dispatch, confirmAction } = useCRM();
  const [filter, setFilter] = useState('Tous');
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const addToast = useToast();
  const navigate = useNavigate();

  const clientNom = (id) => { const c = clients.find(c => c.id === id); return c ? c.nom : '—'; };

  const [fClient, setFClient] = useState('');
  const [fObjet, setFObjet] = useState('');
  const [fMontant, setFMontant] = useState('');

  const filtered = devis.filter(d => {
    const matchFilter = filter === 'Tous' || d.statut === filter;
    const matchSearch = d.ref.toLowerCase().includes(search.toLowerCase()) || clientNom(d.clientId).toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalEncours = devis.filter(d => ['Brouillon','Envoyé'].includes(d.statut)).reduce((s,d) => s+d.montant,0);
  const totalAccepte = devis.filter(d => d.statut === 'Accepté').reduce((s,d) => s+d.montant,0);

  const handleSave = () => {
    if (!fObjet.trim() || !fMontant) { addToast('Remplissez tous les champs requis', 'error'); return; }
    const now = new Date().toISOString().slice(0,10);
    const nextRef = 'DEV-2026-' + String(devis.length + 43).padStart(3,'0');
    dispatch({ 
      type: 'ADD_DEVIS', 
      payload: { ref: nextRef, clientId: Number(fClient) || 1, objet: fObjet, montant: Number(fMontant), statut: 'Brouillon', date: now } 
    });
    setIsDrawerOpen(false);
    addToast('Devis créé avec succès !');
    setFObjet(''); setFMontant(''); setFClient('');
  };

  const handleConvert = (e, devisToConvert) => {
    e.stopPropagation();
    const nextRef = 'FAC-2026-' + String(factures.length + 19).padStart(3,'0');
    const now = new Date().toISOString().slice(0,10);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const due = nextMonth.toISOString().slice(0,10);

    dispatch({
      type: 'ADD_FACTURE',
      payload: { ref: nextRef, devisRef: devisToConvert.ref, clientId: devisToConvert.clientId, objet: devisToConvert.objet, montant: devisToConvert.montant, statut: 'En attente', date: now, echeance: due }
    });
    dispatch({
      type: 'UPDATE_DEVIS_STATUT',
      payload: { ref: devisToConvert.ref, statut: 'Converti' }
    });
    
    addToast(`Facture ${nextRef} générée !`);
    navigate('/factures');
  };

  const handleDelete = (e, d) => {
    e.stopPropagation();
    confirmAction(
      'Supprimer ce devis ?',
      `Le devis ${d.ref} sera définitivement supprimé. Cette action est irréversible.`,
      () => {
        dispatch({ type: 'DELETE_DEVIS', payload: d.ref });
        addToast(`Devis ${d.ref} supprimé avec succès.`);
      }
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.18s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Commercial</div>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Devis</h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-2)' }}>Gestion des propositions commerciales et suivi des conversions.</p>
        </div>
        <button onClick={() => setIsDrawerOpen(true)} style={{ background: 'var(--red)', color: 'var(--white)', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
          + Nouveau devis
        </button>
      </div>

      {/* KPI Mini */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Total devis', value: devis.length, accent: 'var(--navy-mid)' },
          { label: 'En cours', value: devis.filter(d=>['Brouillon','Envoyé'].includes(d.statut)).length, accent: 'var(--gold)' },
          { label: 'Acceptés', value: devis.filter(d=>d.statut==='Accepté').length, accent: 'var(--success)' },
          { label: 'Montant en attente', value: fmtUsd(totalEncours), accent: 'var(--cyan)' },
          { label: 'Montant accepté', value: fmtUsd(totalAccepte), accent: 'var(--red)' },
        ].map((k, i) => (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderLeft: `3px solid ${k.accent}`, borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: '0.1em' }}>{k.label}</div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '20px', marginTop: '6px' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-page)', padding: '4px', borderRadius: '6px', overflowX: 'auto' }}>
            {STATUTS.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ whiteSpace: 'nowrap', background: filter === s ? 'var(--white)' : 'transparent', color: filter === s ? 'var(--navy-deep)' : 'var(--text-2)', border: 'none', padding: '5px 12px', borderRadius: '4px', fontWeight: filter === s ? 700 : 600, fontSize: '12px', cursor: 'pointer' }}>
                {s}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: '1px solid var(--border-input)', borderRadius: '6px', padding: '7px 12px', fontSize: '12.5px', outline: 'none' }} />
        </div>

        {/* Header Row */}
        <div className="desktop-only" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1.2fr 120px 120px 120px', padding: '10px 20px', background: 'var(--navy-deep)', color: 'var(--white)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <span>Référence</span><span>Client</span><span>Objet</span><span style={{ textAlign: 'right' }}>Montant</span><span style={{ textAlign: 'right' }}>Date</span><span style={{ textAlign: 'right' }}>Statut</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px' }}>
            <EmptyState 
              title="Aucun devis trouvé" 
              description="Modifiez vos filtres ou créez une nouvelle proposition commerciale."
              actionLabel="+ Nouveau devis"
              onAction={() => setIsDrawerOpen(true)}
            />
          </div>
        ) : filtered.map((d, i) => (
          <div key={d.ref} style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px', borderTop: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
          >
            <div className="desktop-only" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1.2fr 120px 120px 120px', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)' }}>{d.ref}</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{clientNom(d.clientId)}</span>
              <span style={{ fontSize: '12.5px', color: 'var(--text-2)', paddingRight: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.objet}</span>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12.5px', fontWeight: 700, textAlign: 'right' }}>{fmtUsd(d.montant)}</span>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11.5px', color: 'var(--text-2)', textAlign: 'right' }}>{dateFr(d.date)}</span>
              <span style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                <StatusBadge status={d.statut} />
                {d.statut === 'Accepté' && (
                  <button onClick={(e) => handleConvert(e, d)} style={{ background: 'transparent', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--navy-deep)', display: 'flex', alignItems: 'center' }} title="Convertir en facture">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                  </button>
                )}
                <button onClick={(e) => handleDelete(e, d)} style={{ background: 'transparent', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }} title="Supprimer" onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </span>
            </div>
            
            {/* Mobile View */}
            <div className="mobile-only" style={{ display: 'none', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)', display: 'block' }}>{d.ref}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{clientNom(d.clientId)}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {d.statut === 'Accepté' && (
                    <button onClick={(e) => handleConvert(e, d)} style={{ background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--navy-deep)' }} title="Convertir">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                    </button>
                  )}
                  <StatusBadge status={d.statut} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                 <span style={{ color: 'var(--text-2)' }}>{d.objet}</span>
                 <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700 }}>{fmtUsd(d.montant)}</span>
              </div>
            </div>
          </div>
        ))}

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-3)' }}>
          <span>{filtered.length} devis affichés</span>
          <span style={{ fontFamily: 'var(--font-jetbrains)' }}>Page 1 / 1</span>
        </div>
      </div>

      {/* Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Créer un devis" width="460px"
        footer={
          <>
            <button onClick={() => setIsDrawerOpen(false)} style={{ padding: '10px 18px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSave} style={{ padding: '10px 22px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Créer le devis</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Client <span style={{ color: 'var(--red)' }}>*</span></span>
            <select value={fClient} onChange={e => setFClient(e.target.value)} style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'var(--white)' }}>
              <option value="">— Choisir un client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Objet <span style={{ color: 'var(--red)' }}>*</span></span>
            <input type="text" value={fObjet} onChange={e => setFObjet(e.target.value)} placeholder="Ex. Tournoi corporate — Stade des Martyrs" style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Montant USD <span style={{ color: 'var(--red)' }}>*</span></span>
            <input type="number" value={fMontant} onChange={e => setFMontant(e.target.value)} placeholder="0" style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px', fontFamily: 'var(--font-jetbrains)' }} />
          </label>
        </div>
      </Drawer>
    </div>
  );
}
