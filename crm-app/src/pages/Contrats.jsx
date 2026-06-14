import { useState } from 'react';
import { fmtUsd, dateFr, nextNumero } from '../crm-data';
import { useCRM } from '../contexts/CRMContext';
import StatusBadge from '../components/ui/StatusBadge';
import Drawer from '../components/ui/Drawer';
import { useToast } from '../contexts/ToastContext';
import EmptyState from '../components/ui/EmptyState';


const TYPES_CONTRAT = ['Représentation', 'Sponsoring', 'Prestation'];

export default function Contrats() {
  const { state: { contrats: items, clients, athletes }, dispatch, confirmAction, getNom } = useCRM();
  const clientNom = (id) => getNom(id);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const addToast = useToast();
  const [fClient, setFClient] = useState('');
  const [fType, setFType] = useState('Représentation');
  const [fValeur, setFValeur] = useState('');
  const [fExpire, setFExpire] = useState('');
  const [fStatut, setFStatut] = useState('Brouillon');

  const openCreate = () => { setEditTarget(null); setFClient(''); setFType('Représentation'); setFValeur(''); setFExpire(''); setFStatut('Brouillon'); setIsDrawerOpen(true); };
  const openEdit = (c) => { setEditTarget(c); setFClient(String(c.clientId)); setFType(c.type); setFValeur(String(c.valeur)); setFExpire(c.expire || ''); setFStatut(c.statut); setIsDrawerOpen(true); };

  const filtered = items.filter(d => {
    const matchType = filterType === 'Tous' || d.type === filterType;
    const matchSearch = d.ref.toLowerCase().includes(search.toLowerCase()) || clientNom(d.clientId).toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleSave = () => {
    if (!fValeur) { addToast('Remplissez tous les champs requis', 'error'); return; }
    if (editTarget) {
      dispatch({ type: 'UPDATE_CONTRAT', payload: { ...editTarget, clientId: Number(fClient) || editTarget.clientId, type: fType, valeur: Number(fValeur), expire: fExpire, statut: fStatut } });
      addToast('Contrat mis à jour.');
    } else {
      const nextRef = nextNumero('CTR-', new Date().getFullYear(), items.map(c => c.ref));
      dispatch({ type: 'ADD_CONTRAT', payload: { ref: nextRef, clientId: Number(fClient) || 1, type: fType, valeur: Number(fValeur), statut: fStatut, expire: fExpire } });
      addToast('Contrat créé avec succès !');
    }
    setIsDrawerOpen(false);
    setFValeur(''); setFExpire(''); setFClient(''); setFType('Représentation'); setFStatut('Brouillon');
  };

  const handleDelete = (e, c) => {
    e.stopPropagation();
    confirmAction(
      'Supprimer ce contrat ?',
      `Le contrat ${c.ref} sera définitivement supprimé. Cette action est irréversible.`,
      () => {
        dispatch({ type: 'DELETE_CONTRAT', payload: c.ref });
        addToast(`Contrat ${c.ref} supprimé.`);
      }
    );
  };

  const totalValeur = items.filter(c => c.statut === 'Signé').reduce((s,c) => s+c.valeur, 0);

  return (
    <div style={{ animation: 'fadeIn 0.18s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Commercial</div>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Contrats</h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-2)' }}>Représentation, sponsoring et prestation — suivi des engagements contractuels.</p>
        </div>
        <button onClick={openCreate} style={{ background: 'var(--red)', color: 'var(--white)', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
          + Nouveau contrat
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Contrats signés', value: items.filter(c=>c.statut==='Signé').length, accent: 'var(--success)' },
          { label: 'En cours rédaction', value: items.filter(c=>c.statut==='Brouillon').length, accent: 'var(--navy-mid)' },
          { label: 'Expire bientôt', value: items.filter(c=>c.statut==='Expire bientôt').length, accent: 'var(--gold)' },
          { label: 'Valeur totale signée', value: fmtUsd(totalValeur), accent: 'var(--cyan)' },
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
            {['Tous', ...TYPES_CONTRAT].map(t => (
              <button key={t} onClick={() => setFilterType(t)} style={{ whiteSpace: 'nowrap', background: filterType === t ? 'var(--white)' : 'transparent', color: filterType === t ? 'var(--navy-deep)' : 'var(--text-2)', border: 'none', padding: '5px 12px', borderRadius: '4px', fontWeight: filterType === t ? 700 : 600, fontSize: '12px', cursor: 'pointer' }}>
                {t}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: '1px solid var(--border-input)', borderRadius: '6px', padding: '7px 12px', fontSize: '12.5px', outline: 'none' }} />
        </div>

        <div className="responsive-table-header" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr 130px 130px 110px', padding: '10px 20px', background: 'var(--navy-deep)', color: 'var(--white)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <span>Référence</span><span>Client</span><span>Type</span><span style={{ textAlign: 'right' }}>Valeur</span><span style={{ textAlign: 'right' }}>Expiration</span><span style={{ textAlign: 'right' }}>Statut</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px' }}>
            <EmptyState 
              title="Aucun contrat trouvé" 
              description="Modifiez vos filtres ou créez un nouveau contrat."
              actionLabel="+ Nouveau contrat"
              onAction={openCreate}
            />
          </div>
        ) : (
          <div className="responsive-table">
            {filtered.map((c) => (
          <div key={c.ref} className="responsive-table-row" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr 130px 130px 110px', alignItems: 'center', padding: '13px 20px', borderTop: '1px solid var(--border)', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
          >
            <span className="responsive-table-cell" data-label="Référence" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)' }}>{c.ref}</span>
            <span className="responsive-table-cell" data-label="Client" style={{ fontSize: '13px', fontWeight: 600 }}>{clientNom(c.clientId)}</span>
            <span className="responsive-table-cell" data-label="Type" style={{ fontSize: '12.5px', color: 'var(--text-2)' }}>{c.type}</span>
            <span className="responsive-table-cell" data-label="Valeur" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12.5px', fontWeight: 700, textAlign: 'right' }}>{fmtUsd(c.valeur)}</span>
            <span className="responsive-table-cell" data-label="Expiration" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11.5px', color: 'var(--text-2)', textAlign: 'right' }}>{c.expire ? dateFr(c.expire) : '—'}</span>
            <span className="responsive-table-cell" data-label="Statut" style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
              <StatusBadge status={c.statut} />
              <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} style={{ background: 'transparent', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }} title="Modifier" onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button onClick={(e) => handleDelete(e, c)} style={{ background: 'transparent', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }} title="Supprimer" onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </span>
          </div>
            ))}
          </div>
        )}

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-3)' }}>
          {filtered.length} contrats affichés
        </div>
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editTarget ? 'Modifier le contrat' : 'Nouveau contrat'} width="460px"
        footer={
          <>
            <button onClick={() => setIsDrawerOpen(false)} style={{ padding: '10px 18px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSave} style={{ padding: '10px 22px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>{editTarget ? 'Enregistrer' : 'Créer le contrat'}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Client</span>
            <select value={fClient} onChange={e => setFClient(e.target.value)} style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'var(--white)' }}>
              <option value="">— Choisir une entité —</option>
              <optgroup label="Clients B2B">
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </optgroup>
              <optgroup label="Athlètes">
                {athletes.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
              </optgroup>
            </select>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Type</span>
              <select value={fType} onChange={e => setFType(e.target.value)} style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'var(--white)' }}>
                {TYPES_CONTRAT.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Valeur USD</span>
              <input type="number" value={fValeur} onChange={e => setFValeur(e.target.value)} placeholder="0" style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
            </label>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Date d'expiration</span>
            <input type="date" value={fExpire} onChange={e => setFExpire(e.target.value)} style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Statut</span>
            <select value={fStatut} onChange={e => setFStatut(e.target.value)} style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'var(--white)' }}>
              {['Brouillon', 'Signé', 'Expire bientôt', 'Expiré'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
      </Drawer>
    </div>
  );
}
