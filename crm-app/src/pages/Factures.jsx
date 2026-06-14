import { useState } from 'react';
import { fmtUsd, dateFr } from '../crm-data';
import { useCRM } from '../contexts/CRMContext';
import StatusBadge from '../components/ui/StatusBadge';
import Drawer from '../components/ui/Drawer';
import { useToast } from '../contexts/ToastContext';
import EmptyState from '../components/ui/EmptyState';


const STATUTS = ['Tous', 'En attente', 'En retard', 'Payée'];

export default function Factures() {
  const { state: { factures, clients }, dispatch, confirmAction } = useCRM();

  const clientNom = (id) => { const c = clients.find(c => c.id === id); return c ? c.nom : '—'; };
  const [filter, setFilter] = useState('Tous');
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const addToast = useToast();
  const [fClient, setFClient] = useState('');
  const [fObjet, setFObjet] = useState('');
  const [fMontant, setFMontant] = useState('');

  const filtered = factures.filter(d => {
    const matchFilter = filter === 'Tous' || d.statut === filter;
    const matchSearch = d.ref.toLowerCase().includes(search.toLowerCase()) || clientNom(d.clientId).toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalPayee = factures.filter(f => f.statut === 'Payée').reduce((s,f) => s+f.montant,0);
  const totalRetard = factures.filter(f => f.statut === 'En retard').reduce((s,f) => s+f.montant,0);

  const handleSave = () => {
    if (!fObjet.trim() || !fMontant) { addToast('Remplissez tous les champs requis', 'error'); return; }
    const now = new Date().toISOString().slice(0,10);
    const nextRef = 'FAC-2026-' + String(factures.length + 22).padStart(3,'0');
    dispatch({ type: 'ADD_FACTURE', payload: { ref: nextRef, clientId: Number(fClient) || 1, objet: fObjet, montant: Number(fMontant), statut: 'En attente', echeance: now } });
    setIsDrawerOpen(false);
    addToast('Facture créée avec succès !');
    setFObjet(''); setFMontant(''); setFClient('');
  };

  const handleDelete = (e, f) => {
    e.stopPropagation();
    confirmAction(
      'Supprimer cette facture ?',
      `La facture ${f.ref} sera définitivement supprimée. Cette action est irréversible.`,
      () => {
        dispatch({ type: 'DELETE_FACTURE', payload: f.ref });
        addToast(`Facture ${f.ref} supprimée avec succès.`);
      }
    );
  };

  const handleMarkPaid = (e, f) => {
    e.stopPropagation();
    confirmAction(
      'Marquer comme payée ?',
      `La facture ${f.ref} sera marquée comme encaissée.`,
      () => {
        dispatch({ type: 'UPDATE_FACTURE_STATUT', payload: { ref: f.ref, statut: 'Payée' } });
        addToast(`Facture ${f.ref} marquée comme payée.`, 'success');
      }
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.18s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Commercial</div>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Factures</h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-2)' }}>Suivi des paiements, relances et encaissements.</p>
        </div>
        <button onClick={() => setIsDrawerOpen(true)} style={{ background: 'var(--red)', color: 'var(--white)', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
          + Nouvelle facture
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Total factures', value: factures.length, accent: 'var(--navy-mid)' },
          { label: 'En attente', value: factures.filter(f=>f.statut==='En attente').length, accent: 'var(--gold)' },
          { label: 'En retard', value: factures.filter(f=>f.statut==='En retard').length, accent: 'var(--red)' },
          { label: 'Encaissé', value: fmtUsd(totalPayee), accent: 'var(--success)' },
          { label: 'Retard total', value: fmtUsd(totalRetard), accent: 'var(--red)' },
        ].map((k, i) => (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderLeft: `3px solid ${k.accent}`, borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: '0.1em' }}>{k.label}</div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '20px', marginTop: '6px' }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-page)', padding: '4px', borderRadius: '6px' }}>
            {STATUTS.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ background: filter === s ? 'var(--white)' : 'transparent', color: filter === s ? 'var(--navy-deep)' : 'var(--text-2)', border: 'none', padding: '5px 12px', borderRadius: '4px', fontWeight: filter === s ? 700 : 600, fontSize: '12px', cursor: 'pointer' }}>
                {s}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: '1px solid var(--border-input)', borderRadius: '6px', padding: '7px 12px', fontSize: '12.5px', outline: 'none' }} />
        </div>

        <div className="responsive-table-header" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1.2fr 120px 130px 110px', padding: '10px 20px', background: 'var(--navy-deep)', color: 'var(--white)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <span>Référence</span><span>Client</span><span>Objet</span><span style={{ textAlign: 'right' }}>Montant</span><span style={{ textAlign: 'right' }}>Échéance</span><span style={{ textAlign: 'right' }}>Statut</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px' }}>
            <EmptyState 
              title="Aucune facture trouvée" 
              description="Modifiez vos filtres ou créez une nouvelle facture."
              actionLabel="+ Nouvelle facture"
              onAction={() => setIsDrawerOpen(true)}
            />
          </div>
        ) : (
          <div className="responsive-table">
            {filtered.map((f) => (
          <div key={f.ref} className="responsive-table-row" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1.2fr 120px 130px 110px', alignItems: 'center', padding: '13px 20px', borderTop: '1px solid var(--border)', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
          >
            <span className="responsive-table-cell" data-label="Référence" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)' }}>{f.ref}</span>
            <span className="responsive-table-cell" data-label="Client" style={{ fontSize: '13px', fontWeight: 600 }}>{clientNom(f.clientId)}</span>
            <span className="responsive-table-cell" data-label="Objet" style={{ fontSize: '12.5px', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{f.objet}</span>
            <span className="responsive-table-cell" data-label="Montant" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12.5px', fontWeight: 700, textAlign: 'right' }}>{fmtUsd(f.montant)}</span>
            <span className="responsive-table-cell" data-label="Échéance" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11.5px', color: f.statut === 'En retard' ? 'var(--red)' : 'var(--text-2)', textAlign: 'right' }}>{dateFr(f.echeance)}</span>
            <span className="responsive-table-cell" data-label="Statut" style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
              <StatusBadge status={f.statut} />
              {['En attente', 'En retard', 'Attente'].includes(f.statut) && (
                <button onClick={(e) => handleMarkPaid(e, f)} style={{ background: 'rgba(23,126,84,0.1)', border: '1px solid rgba(23,126,84,0.3)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--success)', display: 'flex', alignItems: 'center' }} title="Marquer payée">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
              )}
              <button onClick={(e) => handleDelete(e, f)} style={{ background: 'transparent', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }} title="Supprimer" onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </span>
          </div>
            ))}
          </div>
        )}

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-3)' }}>
          <span>{filtered.length} factures affichées</span>
          <span style={{ fontFamily: 'var(--font-jetbrains)' }}>Page 1 / 1</span>
        </div>
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Nouvelle facture" width="460px"
        footer={
          <>
            <button onClick={() => setIsDrawerOpen(false)} style={{ padding: '10px 18px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSave} style={{ padding: '10px 22px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Créer la facture</button>
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
            <input type="text" value={fObjet} onChange={e => setFObjet(e.target.value)} placeholder="Ex. Activation sponsoring — acompte" style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
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
