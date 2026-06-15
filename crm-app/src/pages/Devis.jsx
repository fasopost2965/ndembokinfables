import { useState } from 'react';
import { fmtUsd, dateFr, nextNumero, TYPE_QUALITE } from '../crm-data';
import { useCRM } from '../contexts/CRMContext';
import { printDocument } from '../utils/documentBuilder';
import StatusBadge from '../components/ui/StatusBadge';
import Drawer from '../components/ui/Drawer';
import { useToast } from '../contexts/ToastContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import { FormSection, FormRow, TextField, TextareaField, DateField, TypeCards, EntitySelector, ValidationSummary } from '../components/ui/FormControls';

const STATUTS = ['Tous', 'Brouillon', 'Envoyé', 'Accepté', 'Converti', 'Expiré'];

const KANBAN_COLS = [
  { id: 'Brouillon', color: '#5B6B77', bg: 'rgba(91,107,119,0.07)' },
  { id: 'Envoyé',    color: '#1E78A8', bg: 'rgba(30,159,216,0.07)' },
  { id: 'Accepté',   color: '#177E54', bg: 'rgba(23,126,84,0.08)'  },
  { id: 'Converti',  color: '#254354', bg: 'rgba(37,67,84,0.07)'   },
  { id: 'Expiré',    color: '#BC000D', bg: 'rgba(188,0,13,0.06)'   },
];

function KanbanCard({ d, col, clientNom, openEdit, handleDelete, handleConvert, onMove }) {
  const FLOW = ['Brouillon', 'Envoyé', 'Accepté'];
  const nextSt = FLOW[FLOW.indexOf(d.statut) + 1];
  const bs = { background: 'none', border: '1px solid ' + col.color + '33', borderRadius: '5px', padding: '3px 7px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: col.color, display: 'inline-flex', alignItems: 'center', gap: '4px' };
  return (
    <div style={{ background: 'var(--white)', borderRadius: '8px', padding: '12px 14px', border: '1px solid ' + col.color + '22', boxShadow: '0 1px 5px rgba(0,0,0,0.06)', transition: 'box-shadow 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 5px rgba(0,0,0,0.06)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-3)' }}>{d.ref}</span>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12.5px', fontWeight: 700, color: col.color }}>{fmtUsd(d.montant)}</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--navy-deep)', marginBottom: '2px', lineHeight: 1.25 }}>{clientNom(d.clientId)}</div>
      <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.objet}</div>
      {d.date && <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: 'var(--text-3)', marginBottom: '10px' }}>{dateFr(d.date)}</div>}
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {nextSt && <button style={{ ...bs, color: '#177E54', borderColor: '#177E5440' }} onClick={() => onMove(d.ref, nextSt)}>→ {nextSt}</button>}
        {d.statut === 'Accepté' && <button style={{ ...bs, color: '#254354', borderColor: '#25435440' }} onClick={(e) => handleConvert(e, d)}>💰 Facturer</button>}
        {d.statut !== 'Converti' && <button style={bs} onClick={() => openEdit(d)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg></button>}
        <button style={{ ...bs, color: '#BC000D', borderColor: '#BC000D33' }} onClick={(e) => handleDelete(e, d)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
      </div>
    </div>
  );
}

function KanbanView({ devis, clientNom, openEdit, handleDelete, handleConvert, onMove, openCreate }) {
  return (
    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', alignItems: 'flex-start' }}>
      {KANBAN_COLS.map(col => {
        const cards = devis.filter(d => d.statut === col.id);
        const total = cards.reduce((s, d) => s + (d.montant || 0), 0);
        return (
          <div key={col.id} style={{ minWidth: '220px', flex: '1', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 14px', borderRadius: '8px 8px 0 0', background: col.bg, borderBottom: `3px solid ${col.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: col.color }}>{col.id}</div>
                {total > 0 && <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10.5px', color: col.color, opacity: 0.75, marginTop: '2px' }}>{fmtUsd(total)}</div>}
              </div>
              <span style={{ background: col.color, color: '#fff', borderRadius: '99px', padding: '1px 8px', fontSize: '11px', fontWeight: 700 }}>{cards.length}</span>
            </div>
            <div style={{ background: col.bg, flex: 1, minHeight: '180px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px', borderRadius: '0 0 8px 8px' }}>
              {cards.map(d => <KanbanCard key={d.ref} d={d} col={col} clientNom={clientNom} openEdit={openEdit} handleDelete={handleDelete} handleConvert={handleConvert} onMove={onMove} />)}
              {col.id === 'Brouillon' && (
                <button onClick={openCreate} style={{ border: '1px dashed ' + col.color + '55', borderRadius: '6px', padding: '8px', background: 'none', cursor: 'pointer', color: col.color, fontSize: '12px', fontWeight: 700, opacity: 0.7, marginTop: 'auto' }}>
                  + Nouveau devis
                </button>
              )}
              {cards.length === 0 && col.id !== 'Brouillon' && <div style={{ textAlign: 'center', padding: '20px 10px', fontSize: '11.5px', color: col.color, opacity: 0.4, fontStyle: 'italic' }}>Vide</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const SERVICES_NDEMBO = [
  { label: 'Organisation de tournoi', prix: 5000 },
  { label: "Camp d'entraînement", prix: 3500 },
  { label: 'Gala sportif', prix: 8000 },
  { label: 'Détection / Scouting', prix: 2500 },
  { label: 'Activation sponsoring', prix: 12000 },
  { label: "Management d'athlète", prix: 0 },
  { label: 'Formation / Stage sportif', prix: 1800 },
  { label: 'Prestation événementielle', prix: 4000 },
  { label: 'Coaching sportif', prix: 1200 },
  { label: 'Négociation de contrat', prix: 0 },
  { label: 'Scouting international', prix: 3000 },
  { label: 'Communication & médias', prix: 1500 },
];

const newLigne = () => ({ _id: Math.random().toString(36).slice(2), description: '', quantite: 1, prixUnitaire: '' });

export default function Devis() {
  const { state: { devis, clients, factures, company }, dispatch, confirmAction } = useCRM();
  const [filter, setFilter] = useState('Tous');
  const [search, setSearch] = useState('');
  const addToast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const clientNom = (id) => { const c = clients.find(c => c.id === id); return c ? c.nom : '—'; };

  const today = () => new Date().toISOString().slice(0,10);
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };

  const [editTarget, setEditTarget] = useState(null);
  const [fClient, setFClient] = useState(() => searchParams.get('clientId') || '');
  const [fObjet, setFObjet] = useState('');
  const [fDescription, setFDescription] = useState('');
  const [fLignes, setFLignes] = useState([newLigne()]);
  const [fDateEmission, setFDateEmission] = useState(() => searchParams.get('clientId') || searchParams.get('action') === 'new' ? new Date().toISOString().slice(0,10) : '');
  const [fExpiration, setFExpiration] = useState(() => { if (!(searchParams.get('clientId') || searchParams.get('action') === 'new')) return ''; const d = new Date(); d.setDate(d.getDate()+30); return d.toISOString().slice(0,10); });
  const [fStatut, setFStatut] = useState('Brouillon');
  const [errors, setErrors] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(() => !!(searchParams.get('clientId') || searchParams.get('action') === 'new'));
  const [previewTarget, setPreviewTarget] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [ncNom, setNcNom] = useState('');
  const [ncType, setNcType] = useState('Sponsor');
  const [ncEmail, setNcEmail] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const totalLignes = fLignes.reduce((s, l) => s + (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0), 0);

  const resetNewClient = () => { setShowNewClient(false); setNcNom(''); setNcType('Sponsor'); setNcEmail(''); };

  const handleCreateClient = () => {
    if (!ncNom.trim()) return;
    const newId = Math.max(0, ...clients.map(c => c.id)) + 1;
    dispatch({ type: 'ADD_CLIENT', payload: { id: newId, nom: ncNom.trim(), type: ncType, ville: '', email: ncEmail.trim(), tel: '', adresse: '', ca: 0, docs: 0 } });
    setFClient(String(newId));
    addToast(`Client "${ncNom.trim()}" créé et sélectionné.`);
    resetNewClient();
  };

  const openCreate = () => {
    setEditTarget(null); setFClient(''); setFObjet(''); setFDescription('');
    setFLignes([newLigne()]); setFDateEmission(today()); setFExpiration(addDays(30));
    setFStatut('Brouillon'); setErrors({}); resetNewClient(); setIsDrawerOpen(true);
  };
  const openEdit = (d) => {
    if (d.statut === 'Converti') { addToast('Un devis converti ne peut plus être modifié.', 'error'); return; }
    setEditTarget(d); setFClient(String(d.clientId)); setFObjet(d.objet);
    setFDescription(d.description || '');
    if (d.lignes && d.lignes.length > 0) {
      setFLignes(d.lignes.map(l => ({ ...l, _id: Math.random().toString(36).slice(2) })));
    } else {
      setFLignes([{ _id: Math.random().toString(36).slice(2), description: d.objet || '', quantite: 1, prixUnitaire: String(d.montant || '') }]);
    }
    setFDateEmission(d.date || today()); setFExpiration(d.expiration || addDays(30));
    setFStatut(d.statut); setErrors({}); resetNewClient(); setIsDrawerOpen(true);
  };

  const filtered = devis.filter(d => {
    const matchFilter = filter === 'Tous' || d.statut === filter;
    const matchSearch = d.ref.toLowerCase().includes(search.toLowerCase()) || clientNom(d.clientId).toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalEncours = devis.filter(d => ['Brouillon','Envoyé'].includes(d.statut)).reduce((s,d) => s+d.montant,0);
  const totalAccepte = devis.filter(d => d.statut === 'Accepté').reduce((s,d) => s+d.montant,0);

  const handleSave = () => {
    const errs = {};
    if (!fClient) errs.client = 'Veuillez sélectionner un client';
    if (!fObjet.trim()) errs.objet = "L'objet / titre est requis";
    const lignesValides = fLignes.filter(l => l.description.trim());
    if (lignesValides.length === 0) errs.lignes = 'Ajoutez au moins une prestation ou un service';
    const montantCalc = fLignes.reduce((s, l) => s + (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0), 0);
    if (montantCalc <= 0) errs.montant = 'Le total doit être supérieur à 0 — renseignez les prix unitaires';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const lignesPayload = lignesValides.map(l => ({ description: l.description, quantite: Number(l.quantite) || 1, prixUnitaire: Number(l.prixUnitaire) || 0 }));

    if (editTarget) {
      dispatch({ type: 'UPDATE_DEVIS', payload: { ...editTarget, clientId: Number(fClient), objet: fObjet, description: fDescription, lignes: lignesPayload, montant: montantCalc, date: fDateEmission, expiration: fExpiration, statut: fStatut } });
      addToast('Devis mis à jour.');
    } else {
      const nextRef = nextNumero('DEV-', new Date().getFullYear(), devis.map(d => d.ref));
      dispatch({ type: 'ADD_DEVIS', payload: { ref: nextRef, clientId: Number(fClient), objet: fObjet, description: fDescription, lignes: lignesPayload, montant: montantCalc, statut: 'Brouillon', date: fDateEmission, expiration: fExpiration } });
      addToast('Devis créé avec succès !');
    }
    setIsDrawerOpen(false);
  };

  const handleConvert = (e, devisToConvert) => {
    e.stopPropagation();
    const nextRef = nextNumero('FAC-', new Date().getFullYear(), factures.map(f => f.ref));
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

  const handleMoveStatus = (ref, newStatut) => {
    dispatch({ type: 'UPDATE_DEVIS_STATUT', payload: { ref, statut: newStatut } });
    addToast(`Devis ${ref} → ${newStatut}`);
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

  const handleDuplicate = (e, d) => {
    e.stopPropagation();
    const nextRef = nextNumero('DEV-', new Date().getFullYear(), devis.map(x => x.ref));
    dispatch({ type: 'ADD_DEVIS', payload: { ...d, ref: nextRef, statut: 'Brouillon', date: today() } });
    addToast(`Devis ${nextRef} créé par duplication.`);
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
        <button onClick={openCreate} style={{ background: 'var(--red)', color: 'var(--white)', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {viewMode === 'list' && (
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-page)', padding: '4px', borderRadius: '6px', overflowX: 'auto' }}>
                {STATUTS.map(s => (
                  <button key={s} onClick={() => setFilter(s)} style={{ whiteSpace: 'nowrap', background: filter === s ? 'var(--white)' : 'transparent', color: filter === s ? 'var(--navy-deep)' : 'var(--text-2)', border: 'none', padding: '5px 12px', borderRadius: '4px', fontWeight: filter === s ? 700 : 600, fontSize: '12px', cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {viewMode === 'kanban' && <span style={{ fontSize: '12px', color: 'var(--text-3)', fontStyle: 'italic' }}>Vue pipeline — tous les devis</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: '1px solid var(--border-input)', borderRadius: '6px', padding: '7px 12px', fontSize: '12.5px', outline: 'none' }} />
            <div style={{ display: 'flex', background: 'var(--bg-page)', padding: '3px', borderRadius: '6px', gap: '2px' }}>
              {[
                { mode: 'list', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5"/><circle cx="3" cy="12" r="1.5"/><circle cx="3" cy="18" r="1.5"/></svg>, title: 'Liste' },
                { mode: 'kanban', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="5" height="18" rx="2"/><rect x="9.5" y="3" width="5" height="13" rx="2"/><rect x="17" y="3" width="5" height="15" rx="2"/></svg>, title: 'Kanban' },
              ].map(v => (
                <button key={v.mode} title={v.title} onClick={() => setViewMode(v.mode)} style={{ background: viewMode === v.mode ? 'var(--white)' : 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px', padding: '5px 8px', color: viewMode === v.mode ? 'var(--navy-deep)' : 'var(--text-3)', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}>
                  {v.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Kanban view */}
        {viewMode === 'kanban' && (
          <div style={{ padding: '16px' }}>
            <KanbanView
              devis={devis.filter(d => search ? (d.ref.toLowerCase().includes(search.toLowerCase()) || clientNom(d.clientId).toLowerCase().includes(search.toLowerCase())) : true)}
              clientNom={clientNom}
              openEdit={openEdit}
              handleDelete={handleDelete}
              handleConvert={handleConvert}
              onMove={handleMoveStatus}
              openCreate={openCreate}
            />
          </div>
        )}

        {/* Header Row — list only */}
        {viewMode === 'list' && <div className="desktop-only" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1.2fr 110px 110px minmax(200px, auto)', padding: '10px 20px', background: 'var(--navy-deep)', color: 'var(--white)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <span>Référence</span><span>Client</span><span>Objet</span><span style={{ textAlign: 'right' }}>Montant</span><span style={{ textAlign: 'right' }}>Date</span><span style={{ textAlign: 'right' }}>Statut</span>
        </div>}

        {/* Rows — list only */}
        {viewMode === 'list' && (filtered.length === 0 ? (
          <div style={{ padding: '40px 20px' }}>
            <EmptyState
              title="Aucun devis trouvé"
              description="Modifiez vos filtres ou créez une nouvelle proposition commerciale."
              actionLabel="+ Nouveau devis"
              onAction={openCreate}
            />
          </div>
        ) : filtered.map((d) => (
          <div key={d.ref} style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px', borderTop: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
          >
            <div className="desktop-only" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1.2fr 110px 110px minmax(200px, auto)', alignItems: 'center' }}>
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
                <button onClick={(e) => { e.stopPropagation(); setPreviewTarget(d); setIsPreviewOpen(true); }} style={{ background: 'transparent', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }} title="Aperçu du devis" onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button onClick={(e) => handleDuplicate(e, d)} style={{ background: 'transparent', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }} title="Dupliquer ce devis" onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); openEdit(d); }} style={{ background: 'transparent', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }} title="Modifier" onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
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
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {d.statut === 'Accepté' && (
                    <button onClick={(e) => handleConvert(e, d)} style={{ background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--navy-deep)', display: 'flex', alignItems: 'center' }} title="Convertir">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); openEdit(d); }} style={{ background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }} title="Modifier">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={(e) => handleDelete(e, d)} style={{ background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }} title="Supprimer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                  <StatusBadge status={d.statut} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                 <span style={{ color: 'var(--text-2)' }}>{d.objet}</span>
                 <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700 }}>{fmtUsd(d.montant)}</span>
              </div>
            </div>
          </div>
        )))}

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-3)' }}>
          {viewMode === 'list' ? `${filtered.length} devis affiché${filtered.length > 1 ? 's' : ''}` : `${devis.length} devis au total`}
        </div>
      </div>

      {/* Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editTarget ? 'Modifier le devis' : 'Nouveau devis'} width="660px"
        footer={
          <>
            <button onClick={() => setIsDrawerOpen(false)} style={{ padding: '10px 18px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSave} style={{ padding: '10px 22px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>{editTarget ? 'Enregistrer les modifications' : 'Créer le devis'}</button>
          </>
        }
      >
        <ValidationSummary errors={errors} />

        <FormSection title="Client" subtitle="Partie à qui ce devis est adressé">
          <EntitySelector
            label="Client" value={fClient} onChange={v => { setFClient(v); setShowNewClient(false); }} required
            options={clients} error={errors.client}
            placeholder="Rechercher un client existant…"
          />
          <div style={{ marginTop: '-4px' }}>
            <button type="button" onClick={() => setShowNewClient(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cyan)', fontWeight: 700, fontSize: '12px', padding: 0, textDecoration: 'underline' }}>
              {showNewClient ? '↑ Annuler' : '+ Créer un nouveau client rapidement'}
            </button>
          </div>
          {showNewClient && (
            <div style={{ border: '1px solid rgba(30,159,216,0.3)', borderRadius: '8px', padding: '14px 16px', background: 'rgba(30,159,216,0.04)', animation: 'fadeIn 0.15s ease-out' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--cyan)', marginBottom: '10px' }}>Nouveau client rapide</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-2)' }}>Nom / Raison sociale *</span>
                  <input value={ncNom} onChange={e => setNcNom(e.target.value)} placeholder="Ex. Mazembe Corp"
                    style={{ height: '36px', border: '1px solid var(--border-input)', borderRadius: '5px', padding: '0 10px', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', width: '100%' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-2)' }}>Type</span>
                  <select value={ncType} onChange={e => setNcType(e.target.value)}
                    style={{ height: '36px', border: '1px solid var(--border-input)', borderRadius: '5px', padding: '0 8px', fontSize: '12.5px', outline: 'none', background: 'var(--white)', boxSizing: 'border-box', width: '100%' }}>
                    {Object.entries(TYPE_QUALITE).filter(([t]) => t !== 'Athlète').map(([t, l]) => <option key={t} value={t}>{l}</option>)}
                  </select>
                </label>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-2)' }}>Email</span>
                <input value={ncEmail} onChange={e => setNcEmail(e.target.value)} placeholder="contact@exemple.cd" type="email"
                  style={{ height: '36px', border: '1px solid var(--border-input)', borderRadius: '5px', padding: '0 10px', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', width: '100%' }} />
              </label>
              <button onClick={handleCreateClient} disabled={!ncNom.trim()}
                style={{ width: '100%', padding: '8px', background: ncNom.trim() ? 'var(--navy-deep)' : 'var(--border)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: ncNom.trim() ? 'pointer' : 'not-allowed', fontSize: '12.5px' }}>
                Créer et sélectionner ce client
              </button>
            </div>
          )}
        </FormSection>

        <FormSection title="Intitulé du devis" subtitle="Titre commercial et description générale">
          <TextField label="Objet / Titre" value={fObjet} onChange={setFObjet} required
            placeholder="Ex. Activation sponsoring — Tournoi International 2026" maxLength={100} error={errors.objet} />
          <TextareaField label="Description générale (optionnelle)" value={fDescription} onChange={setFDescription}
            placeholder="Contexte, conditions particulières, remarques pour le client…" rows={2} maxLength={500} />
        </FormSection>

        <FormSection title="Prestations & Services" subtitle="Lignes de détail — cliquez un service pour l'ajouter">
          {/* Catalogue rapide */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
            {SERVICES_NDEMBO.map((s, i) => (
              <button key={i} type="button"
                onClick={() => setFLignes(ls => [...ls, { _id: Math.random().toString(36).slice(2), description: s.label, quantite: 1, prixUnitaire: String(s.prix) }])}
                style={{ padding: '4px 10px', border: '1px solid var(--border-input)', borderRadius: '99px', background: 'var(--white)', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-2)', transition: 'all 0.12s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--navy-deep)'; e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.borderColor = 'var(--navy-deep)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border-input)'; }}>
                + {s.label}
              </button>
            ))}
          </div>

          {/* En-tête colonnes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 100px 80px 22px', gap: '4px', padding: '0 2px', marginBottom: '5px' }}>
            {['Prestation / description', 'Qté', 'Prix U. ($)', 'Sous-total', ''].map((h, i) => (
              <div key={i} style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-3)' }}>{h}</div>
            ))}
          </div>

          {/* Lignes */}
          {fLignes.map((ligne, i) => {
            const sousTotal = (Number(ligne.quantite) || 0) * (Number(ligne.prixUnitaire) || 0);
            return (
              <div key={ligne._id} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 100px 80px 22px', gap: '4px', marginBottom: '5px', alignItems: 'center' }}>
                <input value={ligne.description}
                  onChange={e => setFLignes(ls => ls.map((l, j) => j === i ? { ...l, description: e.target.value } : l))}
                  placeholder="Description du service"
                  style={{ padding: '7px 10px', border: `1px solid ${errors.lignes && !ligne.description.trim() ? 'var(--red)' : 'var(--border-input)'}`, borderRadius: '5px', fontSize: '12px', outline: 'none', width: '100%', boxSizing: 'border-box', background: 'var(--white)', color: 'var(--text-1)' }} />
                <input value={ligne.quantite}
                  onChange={e => setFLignes(ls => ls.map((l, j) => j === i ? { ...l, quantite: e.target.value } : l))}
                  type="number" min="1" step="1"
                  style={{ padding: '7px 6px', border: '1px solid var(--border-input)', borderRadius: '5px', fontSize: '12px', textAlign: 'center', outline: 'none', width: '100%', boxSizing: 'border-box', background: 'var(--white)', color: 'var(--text-1)' }} />
                <input value={ligne.prixUnitaire}
                  onChange={e => setFLignes(ls => ls.map((l, j) => j === i ? { ...l, prixUnitaire: e.target.value } : l))}
                  type="number" min="0" step="0.01" placeholder="0"
                  style={{ padding: '7px 8px', border: '1px solid var(--border-input)', borderRadius: '5px', fontSize: '12px', textAlign: 'right', outline: 'none', width: '100%', boxSizing: 'border-box', background: 'var(--white)', color: 'var(--text-1)' }} />
                <div style={{ textAlign: 'right', fontSize: '11.5px', fontWeight: 700, fontFamily: 'var(--font-jetbrains)', color: sousTotal > 0 ? 'var(--navy-deep)' : 'var(--text-3)' }}>
                  {sousTotal > 0 ? '$' + sousTotal.toLocaleString('fr-FR') : '—'}
                </div>
                <button onClick={() => fLignes.length > 1 && setFLignes(ls => ls.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: fLignes.length > 1 ? 'pointer' : 'default', color: 'var(--text-3)', fontSize: '17px', lineHeight: 1, opacity: fLignes.length > 1 ? 1 : 0.25, padding: 0 }}
                  onMouseEnter={e => fLignes.length > 1 && (e.currentTarget.style.color = 'var(--red)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>×</button>
              </div>
            );
          })}
          {errors.lignes && <div style={{ fontSize: '12px', color: 'var(--red)', marginBottom: '6px' }}>{errors.lignes}</div>}

          <button onClick={() => setFLignes(ls => [...ls, newLigne()])}
            style={{ width: '100%', padding: '7px', border: '1px dashed var(--border-input)', borderRadius: '6px', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--navy-deep)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
            + Ajouter une ligne
          </button>

          {/* Total */}
          <div style={{ borderTop: '2px solid var(--navy-deep)', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)' }}>Total HT</span>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '22px', fontWeight: 700, color: totalLignes > 0 ? 'var(--navy-deep)' : 'var(--text-3)' }}>
              {fmtUsd(totalLignes)}
            </span>
          </div>
          {errors.montant && <div style={{ fontSize: '12px', color: 'var(--red)', textAlign: 'right', marginTop: '4px' }}>{errors.montant}</div>}
        </FormSection>

        <FormSection title="Validité" subtitle="Période de validité de l'offre">
          <FormRow>
            <DateField label="Date d'émission" value={fDateEmission} onChange={setFDateEmission} required />
            <DateField label="Date d'expiration" value={fExpiration} onChange={setFExpiration}
              shortcuts={[{ label: '+15 j', value: addDays(15) }, { label: '+30 j', value: addDays(30) }, { label: '+45 j', value: addDays(45) }]}
              hint="Validité de l'offre" />
          </FormRow>
        </FormSection>

        {editTarget && (
          <FormSection title="Statut du devis">
            <TypeCards label="Statut" value={fStatut} onChange={setFStatut} options={[
              { value: 'Brouillon', label: 'Brouillon', icon: '✏️', color: 'var(--text-2)', bg: 'var(--bg-page)' },
              { value: 'Envoyé', label: 'Envoyé', icon: '📤', color: 'var(--cyan)', bg: 'rgba(30,159,216,0.08)' },
              { value: 'Accepté', label: 'Accepté', icon: '✅', color: 'var(--success)', bg: 'rgba(23,126,84,0.08)' },
              { value: 'Expiré', label: 'Expiré', icon: '⌛', color: 'var(--red)', bg: 'rgba(188,0,13,0.06)' },
            ]} />
          </FormSection>
        )}
      </Drawer>

      {/* Drawer Aperçu */}
      <Drawer isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={previewTarget ? `Aperçu — ${previewTarget.ref}` : 'Aperçu'} width="620px"
        footer={
          <>
            <button onClick={() => setIsPreviewOpen(false)} style={{ padding: '10px 18px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer' }}>Fermer</button>
            {previewTarget && (
              <button
                onClick={() => {
                  const lignes = previewTarget.lignes?.length
                    ? previewTarget.lignes
                    : [{ description: previewTarget.objet, quantite: 1, prixUnitaire: previewTarget.montant }];
                  printDocument({ type: 'devis', doc: previewTarget, lignes, client: clients.find(c => c.id === previewTarget.clientId) || null, company });
                }}
                style={{ padding: '10px 18px', background: 'var(--gold)', color: 'var(--navy-deep)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Télécharger PDF
              </button>
            )}
            {previewTarget && previewTarget.statut !== 'Converti' && (
              <button onClick={() => { setIsPreviewOpen(false); openEdit(previewTarget); }} style={{ padding: '10px 20px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Modifier</button>
            )}
          </>
        }
      >
        {previewTarget && (() => {
          const lignesAffich = previewTarget.lignes && previewTarget.lignes.length > 0
            ? previewTarget.lignes
            : [{ description: previewTarget.objet, quantite: 1, prixUnitaire: previewTarget.montant }];
          const clientInfo = clients.find(c => c.id === previewTarget.clientId);
          return (
            <div>
              {/* Header */}
              <div style={{ background: 'var(--navy-deep)', borderRadius: '10px', padding: '18px 20px', marginBottom: '20px', color: 'var(--white)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '4px' }}>{previewTarget.ref}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-oswald)', letterSpacing: '0.03em' }}>{previewTarget.objet}</div>
                  </div>
                  <StatusBadge status={previewTarget.statut} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)', marginBottom: '3px' }}>Client</div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{clientNom(previewTarget.clientId)}</div>
                    {clientInfo?.ville && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '1px' }}>{clientInfo.ville}</div>}
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)', marginBottom: '3px' }}>Émis / Expire</div>
                    <div style={{ fontSize: '12px', fontFamily: 'var(--font-jetbrains)' }}>{dateFr(previewTarget.date)}</div>
                    {previewTarget.expiration && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '1px' }}>→ {dateFr(previewTarget.expiration)}</div>}
                  </div>
                </div>
              </div>

              {/* Description générale */}
              {previewTarget.description && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'var(--bg-page)', borderRadius: '8px', borderLeft: '3px solid var(--cyan)', fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6 }}>
                  {previewTarget.description}
                </div>
              )}

              {/* Lignes table */}
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 100px 90px', padding: '8px 16px', background: 'var(--navy-deep)', color: 'var(--white)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <span>Prestation / Service</span><span style={{ textAlign: 'center' }}>Qté</span><span style={{ textAlign: 'right' }}>Prix U.</span><span style={{ textAlign: 'right' }}>Sous-total</span>
                </div>
                {lignesAffich.map((ligne, i) => {
                  const st = (Number(ligne.quantite) || 0) * (Number(ligne.prixUnitaire) || 0);
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 100px 90px', padding: '11px 16px', borderTop: '1px solid var(--border)', fontSize: '13px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{ligne.description}</span>
                      <span style={{ textAlign: 'center', color: 'var(--text-3)' }}>{ligne.quantite}</span>
                      <span style={{ textAlign: 'right', fontFamily: 'var(--font-jetbrains)', fontSize: '12px', color: 'var(--text-2)' }}>{ligne.prixUnitaire > 0 ? fmtUsd(Number(ligne.prixUnitaire)) : '—'}</span>
                      <span style={{ textAlign: 'right', fontFamily: 'var(--font-jetbrains)', fontWeight: 700, color: 'var(--navy-deep)' }}>{st > 0 ? fmtUsd(st) : '—'}</span>
                    </div>
                  );
                })}
                <div style={{ padding: '12px 16px', borderTop: '2px solid var(--navy-deep)', background: 'rgba(37,67,84,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)' }}>Total HT</span>
                  <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '20px', color: 'var(--navy-deep)' }}>{fmtUsd(previewTarget.montant)}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
}
