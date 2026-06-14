import { useState } from 'react';
import { dateFr, nextNumero } from '../crm-data';
import { useCRM } from '../contexts/CRMContext';
import Drawer from '../components/ui/Drawer';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../contexts/ToastContext';
import StatusBadge from '../components/ui/StatusBadge';
import { FormSection, FormRow, TextField, AmountField, DateField, TypeCards, EntitySelector, ValidationSummary } from '../components/ui/FormControls';

const TYPE_CONFIG = {
  Tournoi:   { color: '#F4A800', bg: 'rgba(244,168,0,0.14)',  icon: '🏆', label: 'Tournoi' },
  Gala:      { color: '#254354', bg: 'rgba(37,67,84,0.10)',   icon: '🎖️', label: 'Gala' },
  Détection: { color: '#177E54', bg: 'rgba(23,126,84,0.12)',  icon: '🔍', label: 'Détection' },
  Camp:      { color: '#1E9FD8', bg: 'rgba(30,159,216,0.12)', icon: '⚽', label: 'Camp' },
  Stage:     { color: '#1E9FD8', bg: 'rgba(30,159,216,0.12)', icon: '🏃', label: 'Stage' },
};

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || { color: 'var(--text-2)', bg: 'var(--bg-page)', icon: '📅', label: type };
}

function DateBlock({ dateDebut, dateFin }) {
  const MOIS = ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC'];
  const parseDate = (iso) => {
    if (!iso) return null;
    const [y, m, d] = iso.split('-');
    return { day: d, month: MOIS[parseInt(m,10)-1], year: y };
  };
  const start = parseDate(dateDebut);
  const end = parseDate(dateFin);
  const sameDay = dateDebut === dateFin;
  if (!start) return null;
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
      <div style={{ background: 'var(--navy-deep)', borderRadius: '8px', padding: '6px 10px', textAlign: 'center', minWidth: '44px' }}>
        <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '18px', fontWeight: 700, color: 'var(--white)', lineHeight: 1 }}>{start.day}</div>
        <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{start.month}</div>
      </div>
      {!sameDay && end && (
        <>
          <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 700 }}>→</div>
          <div style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', textAlign: 'center', minWidth: '44px' }}>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '18px', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1 }}>{end.day}</div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{end.month}</div>
          </div>
        </>
      )}
    </div>
  );
}

function ParticipantChips({ participantIds, athletes, max = 3 }) {
  if (!participantIds || participantIds.length === 0) return null;
  const shown = participantIds.slice(0, max);
  const extra = participantIds.length - max;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {shown.map((id, i) => {
        const athlete = athletes.find(a => a.id === id);
        if (!athlete) return null;
        return (
          <div
            key={id}
            title={athlete.nom}
            style={{
              width: '28px', height: '28px', borderRadius: '50%',
              backgroundImage: `url(${athlete.photo})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              background: athlete.photo ? undefined : 'var(--navy-mid)',
              border: '2px solid var(--white)',
              marginLeft: i > 0 ? '-8px' : '0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              position: 'relative', zIndex: max - i,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 700, color: 'var(--white)',
            }}
          >
            {!athlete.photo && athlete.nom?.charAt(0)}
          </div>
        );
      })}
      {extra > 0 && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'var(--bg-page)', border: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 700, color: 'var(--text-2)',
          marginLeft: '-8px',
        }}>+{extra}</div>
      )}
    </div>
  );
}

function FillBar({ value, max }) {
  const pct = max > 0 ? Math.round(value / max * 100) : 0;
  const color = pct >= 100 ? 'var(--red)' : pct >= 80 ? 'var(--gold)' : 'var(--success)';
  return (
    <div>
      <div style={{ height: '4px', background: 'var(--bg-page)', borderRadius: '99px', overflow: 'hidden', marginBottom: '3px' }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: '99px' }} />
      </div>
      <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: 'var(--text-3)' }}>{value} / {max} inscrits</div>
    </div>
  );
}

function EventCard({ item, kind, athletes, onDelete, onEdit, onViewParticipants }) {
  const [hovered, setHovered] = useState(false);
  const tc = getTypeConfig(kind === 'camp' ? 'Camp' : item.type);
  const participants = kind === 'camp' ? (item.participants || []) : [];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--white)',
        border: `1px solid ${hovered ? tc.color + '60' : 'var(--border)'}`,
        borderTop: `3px solid ${tc.color}`,
        borderRadius: '12px',
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(37,67,84,0.12)' : '0 1px 4px rgba(37,67,84,0.06)',
        display: 'flex', flexDirection: 'column', gap: '14px',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Type badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: tc.bg, borderRadius: '99px', padding: '3px 10px',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '11px' }}>{tc.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: tc.color }}>{tc.label}</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy-deep)', lineHeight: 1.3, marginBottom: '4px' }}>{item.nom}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-3)' }}>📍 {item.lieu}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
          <DateBlock dateDebut={item.dateDebut} dateFin={item.dateFin} />
        </div>
      </div>

      {/* Status + fill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <StatusBadge status={item.statut} />
        {(item.capacite || item.places) && (
          <div style={{ flex: 1, maxWidth: '140px', marginLeft: '12px' }}>
            <FillBar value={item.inscrits || 0} max={item.capacite || item.places || 0} />
          </div>
        )}
      </div>

      {/* Participants (camps only) */}
      {kind === 'camp' && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {participants.length > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ParticipantChips participantIds={participants} athletes={athletes} />
                <span style={{ fontSize: '11px', color: 'var(--text-3)', marginLeft: '4px' }}>
                  {participants.length} athlète{participants.length > 1 ? 's' : ''} de l'agence
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onViewParticipants(item); }}
                style={{ background: 'none', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--cyan-text)', cursor: 'pointer' }}
              >Voir</button>
            </>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>Aucun athlète de l'agence inscrit</span>
          )}
        </div>
      )}

      {/* Budget + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {item.budget != null && (
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', fontWeight: 700, color: 'var(--text-2)' }}>
            Budget : ${(item.budget || 0).toLocaleString('fr-FR')}
          </span>
        )}
        {kind === 'camp' && item.categorie && (
          <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>Catégorie : <strong>{item.categorie}</strong></span>
        )}
        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', opacity: hovered ? 1 : 0.35, transition: 'opacity 0.2s' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(item, kind); }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-3)' }}
            title="Modifier"
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(e, item, kind); }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-3)' }}
            title="Supprimer"
            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const ALL_TYPES = ['Tous', 'Tournoi', 'Gala', 'Détection', 'Camp'];
const CAMP_CATEGORIES = ['U15', 'U17', 'U20', 'Senior', 'Spécifique'];

export default function Evenements() {
  const { state: { evenements, camps, clients, athletes }, dispatch, confirmAction } = useCRM();
  const [filterType, setFilterType] = useState('Tous');
  const [search, setSearch] = useState('');
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerKind, setDrawerKind] = useState('evenement');
  const [editTarget, setEditTarget] = useState(null);
  const addToast = useToast();

  const [fNom, setFNom] = useState('');
  const [fType, setFType] = useState('Tournoi');
  const [fLieu, setFLieu] = useState('');
  const [fDateDebut, setFDateDebut] = useState('');
  const [fDateFin, setFDateFin] = useState('');
  const [fCapacite, setFCapacite] = useState('');
  const [fBudget, setFBudget] = useState('');
  const [fCategorie, setFCategorie] = useState('U17');
  const [fStatut, setFStatut] = useState('Planification');
  const [fClientId, setFClientId] = useState('');

  const allItems = [
    ...evenements.map(e => ({ ...e, _kind: 'evenement' })),
    ...camps.map(c => ({ ...c, _kind: 'camp', type: 'Camp' })),
  ].sort((a, b) => (a.dateDebut || '').localeCompare(b.dateDebut || ''));

  const filtered = allItems.filter(item => {
    const matchType = filterType === 'Tous'
      ? true
      : filterType === 'Camp'
        ? item._kind === 'camp'
        : item._kind === 'evenement' && item.type === filterType;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || item.nom?.toLowerCase().includes(q) || item.lieu?.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const handleDelete = (e, item, kind) => {
    e.stopPropagation();
    confirmAction(
      `Supprimer ${kind === 'camp' ? 'ce camp' : 'cet événement'} ?`,
      `"${item.nom}" sera définitivement supprimé.`,
      () => {
        dispatch({ type: kind === 'camp' ? 'DELETE_CAMP' : 'DELETE_EVENEMENT', payload: item.id });
        addToast(`${item.nom} supprimé.`);
      }
    );
  };

  const [errors, setErrors] = useState({});
  const today = () => new Date().toISOString().slice(0,10);

  const openDrawer = (kind) => {
    setEditTarget(null);
    setDrawerKind(kind);
    setFNom(''); setFType('Tournoi'); setFLieu('');
    setFDateDebut(today()); setFDateFin(''); setFCapacite(''); setFBudget('');
    setFCategorie('U17');
    setFStatut(kind === 'evenement' ? 'Planification' : 'Planifié');
    setFClientId(''); setErrors({});
    setIsDrawerOpen(true);
  };

  const openEdit = (item, kind) => {
    setEditTarget({ item, kind });
    setDrawerKind(kind);
    setFNom(item.nom);
    setFLieu(item.lieu);
    setFDateDebut(item.dateDebut || '');
    setFDateFin(item.dateFin || '');
    setFClientId(item.clientId ? String(item.clientId) : '');
    if (kind === 'evenement') {
      setFType(item.type || 'Tournoi');
      setFBudget(String(item.budget || ''));
      setFCapacite(String(item.capacite || ''));
      setFStatut(item.statut || 'Planification');
    } else {
      setFCategorie(item.categorie || 'U17');
      setFCapacite(String(item.places || ''));
      setFStatut(item.statut || 'Planifié');
    }
    setErrors({});
    setIsDrawerOpen(true);
  };

  const handleSave = () => {
    const errs = {};
    if (!fNom.trim()) errs.nom = 'Le nom est requis';
    if (!fLieu.trim()) errs.lieu = 'Le lieu est requis';
    if (!fDateDebut) errs.dateDebut = 'La date de début est requise';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const year = new Date().getFullYear();
    if (editTarget) {
      const { item, kind } = editTarget;
      if (kind === 'evenement') {
        dispatch({ type: 'UPDATE_EVENEMENT', payload: { ...item, nom: fNom, type: fType, lieu: fLieu, dateDebut: fDateDebut, dateFin: fDateFin || fDateDebut, budget: Number(fBudget) || 0, capacite: Number(fCapacite) || 0, statut: fStatut, clientId: fClientId ? Number(fClientId) : null } });
      } else {
        dispatch({ type: 'UPDATE_CAMP', payload: { ...item, nom: fNom, lieu: fLieu, dateDebut: fDateDebut, dateFin: fDateFin || fDateDebut, categorie: fCategorie, places: Number(fCapacite) || 0, statut: fStatut, clientId: fClientId ? Number(fClientId) : null } });
      }
      addToast(`"${fNom}" mis à jour.`);
    } else if (drawerKind === 'evenement') {
      const nextId = nextNumero('EVT-', year, evenements.map(e => e.id));
      dispatch({ type: 'ADD_EVENEMENT', payload: { id: nextId, nom: fNom, type: fType, lieu: fLieu, dateDebut: fDateDebut, dateFin: fDateFin || fDateDebut, budget: Number(fBudget) || 0, statut: fStatut, inscrits: 0, capacite: Number(fCapacite) || 0, clientId: fClientId ? Number(fClientId) : null } });
      addToast(`Événement "${fNom}" créé !`);
    } else {
      const nextId = nextNumero('CMP-', year, camps.map(c => c.id));
      dispatch({ type: 'ADD_CAMP', payload: { id: nextId, nom: fNom, lieu: fLieu, dateDebut: fDateDebut, dateFin: fDateFin || fDateDebut, categorie: fCategorie, places: Number(fCapacite) || 0, inscrits: 0, statut: fStatut, clientId: fClientId ? Number(fClientId) : null, participants: [] } });
      addToast(`Camp "${fNom}" créé !`);
    }
    setIsDrawerOpen(false);
  };

  const totalBudget = evenements.reduce((s, e) => s + (e.budget || 0), 0);
  const totalInscrits = [...evenements, ...camps].reduce((s, e) => s + (e.inscrits || 0), 0);

  return (
    <div style={{ animation: 'fadeIn 0.18s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cyan-text)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Opérations</div>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Événements & Camps</h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-2)', fontSize: '13.5px' }}>
            Tournois, galas, stages et détections — gestion opérationnelle.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => openDrawer('camp')} style={{ background: 'var(--white)', color: 'var(--navy-deep)', border: '1px solid var(--border-input)', padding: '10px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
            + Camp
          </button>
          <button onClick={() => openDrawer('evenement')} style={{ background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 14px rgba(37,67,84,0.2)' }}>
            + Événement
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Événements', value: evenements.length, accent: 'var(--gold)' },
          { label: 'Camps actifs', value: camps.filter(c => c.statut === 'En cours').length, accent: 'var(--cyan)' },
          { label: 'Total inscrits', value: totalInscrits, accent: 'var(--success)' },
          { label: 'Budget total', value: '$' + totalBudget.toLocaleString('fr-FR'), accent: 'var(--navy-deep)' },
        ].map((k, i) => (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderLeft: `3px solid ${k.accent}`, borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: '0.1em' }}>{k.label}</div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '20px', marginTop: '6px' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Search + Type filter */}
      <div style={{ marginBottom: '12px' }}>
        <input
          type="search"
          placeholder="Rechercher par nom ou lieu…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', height: '38px', padding: '0 14px', border: '1px solid var(--border-input)', borderRadius: '8px', fontSize: '13px', background: 'var(--white)', color: 'var(--text-1)', boxSizing: 'border-box', outline: 'none' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-page)', padding: '4px', borderRadius: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        {ALL_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              whiteSpace: 'nowrap',
              background: filterType === t ? 'var(--white)' : 'transparent',
              color: filterType === t ? 'var(--navy-deep)' : 'var(--text-3)',
              border: 'none', padding: '7px 14px', borderRadius: '6px',
              fontWeight: filterType === t ? 700 : 500, fontSize: '12px',
              cursor: 'pointer',
              boxShadow: filterType === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {t !== 'Tous' && TYPE_CONFIG[t] ? TYPE_CONFIG[t].icon + ' ' : ''}{t}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Aucun événement trouvé"
          description={filterType !== 'Tous' ? `Aucun élément de type "${filterType}".` : 'Créez votre premier événement ou camp.'}
          actionLabel="+ Créer un événement"
          onAction={() => openDrawer('evenement')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
          {filtered.map(item => (
            <EventCard
              key={item.id}
              item={item}
              kind={item._kind}
              athletes={athletes}
              onDelete={handleDelete}
              onEdit={openEdit}
              onViewParticipants={setSelectedCamp}
            />
          ))}
        </div>
      )}

      {/* Drawer Participants */}
      <Drawer
        isOpen={!!selectedCamp}
        onClose={() => setSelectedCamp(null)}
        title={selectedCamp ? `${selectedCamp.nom} — Participants` : ''}
        width="400px"
      >
        {selectedCamp && (
          <div>
            <div style={{ background: 'var(--bg-page)', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span>📍 {selectedCamp.lieu}</span>
                <span>📅 {dateFr(selectedCamp.dateDebut)} → {dateFr(selectedCamp.dateFin)}</span>
                {selectedCamp.categorie && <span>🏷️ Catégorie : {selectedCamp.categorie}</span>}
              </div>
            </div>

            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Athlètes de l'agence ({selectedCamp.participants?.length || 0})
            </div>

            {(!selectedCamp.participants || selectedCamp.participants.length === 0) ? (
              <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>Aucun athlète géré par l'agence n'est inscrit.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedCamp.participants.map(pId => {
                  const athlete = athletes.find(a => a.id === pId);
                  if (!athlete) return null;
                  return (
                    <div key={pId} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundImage: `url(${athlete.photo})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, background: athlete.photo ? undefined : 'var(--navy-mid)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-oswald)', fontWeight: 600, fontSize: '14px', color: 'var(--navy-deep)', textTransform: 'uppercase' }}>{athlete.nom}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-2)', marginTop: '2px' }}>{athlete.poste} · {athlete.club}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Drawer Création */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editTarget ? `Modifier ${drawerKind === 'evenement' ? "l'événement" : 'le camp'}` : drawerKind === 'evenement' ? 'Créer un événement' : 'Planifier un camp'}
        width="520px"
        footer={
          <>
            <button onClick={() => setIsDrawerOpen(false)} style={{ padding: '10px 18px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSave} style={{ padding: '10px 22px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              {editTarget ? 'Enregistrer les modifications' : drawerKind === 'evenement' ? "Créer l'événement" : 'Planifier le camp'}
            </button>
          </>
        }
      >
        <ValidationSummary errors={errors} />

        <FormSection title="Identité" subtitle={drawerKind === 'evenement' ? "Informations de l'événement" : "Informations du camp"}>
          <TextField
            label="Nom" value={fNom} onChange={setFNom} required
            placeholder={drawerKind === 'evenement' ? 'Ex. Tournoi International 2026' : 'Ex. Camp Élite U17'}
            error={errors.nom} maxLength={80}
          />

          {drawerKind === 'evenement' ? (
            <TypeCards label="Type d'événement" value={fType} onChange={setFType} options={[
              { value: 'Tournoi', label: 'Tournoi', icon: '🏆', color: '#F4A800', bg: 'rgba(244,168,0,0.1)' },
              { value: 'Gala', label: 'Gala', icon: '🎖️', color: '#254354', bg: 'rgba(37,67,84,0.1)' },
              { value: 'Détection', label: 'Détection', icon: '🔍', color: '#177E54', bg: 'rgba(23,126,84,0.1)' },
            ]} />
          ) : (
            <TypeCards label="Catégorie" value={fCategorie} onChange={setFCategorie} options={
              CAMP_CATEGORIES.map(c => ({ value: c, label: c, color: 'var(--cyan)', bg: 'rgba(30,159,216,0.08)' }))
            } />
          )}

          <TextField
            label="Lieu" value={fLieu} onChange={setFLieu} required
            placeholder="Ex. Stade des Martyrs, Kinshasa"
            error={errors.lieu}
          />
        </FormSection>

        <FormSection title="Dates" subtitle="Période de l'événement">
          <FormRow>
            <DateField label="Date de début" value={fDateDebut} onChange={setFDateDebut} required error={errors.dateDebut} />
            <DateField label="Date de fin" value={fDateFin} onChange={setFDateFin} hint="Laisser vide = événement d'une journée" />
          </FormRow>
          {fDateDebut && fDateFin && fDateFin > fDateDebut && (
            <div style={{ fontSize: '11.5px', color: 'var(--text-3)', padding: '6px 10px', background: 'var(--bg-page)', borderRadius: '5px' }}>
              Durée : {Math.round((new Date(fDateFin) - new Date(fDateDebut)) / (1000*60*60*24))} jours
            </div>
          )}
        </FormSection>

        <FormSection title="Capacité & Budget">
          <FormRow cols={drawerKind === 'evenement' ? '1fr 1fr' : '1fr'}>
            <TextField
              label={drawerKind === 'camp' ? 'Places disponibles' : 'Capacité'}
              value={fCapacite} onChange={setFCapacite} type="number"
              placeholder="0" hint="Nombre de participants max"
            />
            {drawerKind === 'evenement' && (
              <AmountField label="Budget prévisionnel" value={fBudget} onChange={setFBudget} hint="Budget total de l'événement" />
            )}
          </FormRow>
        </FormSection>

        <FormSection title="Statut & Organisation">
          <TypeCards label="Statut" value={fStatut} onChange={setFStatut} options={
            drawerKind === 'evenement'
              ? [
                  { value: 'Planification', label: 'Planification', icon: '📋', color: 'var(--text-2)', bg: 'var(--bg-page)' },
                  { value: 'Confirmé', label: 'Confirmé', icon: '✅', color: 'var(--success)', bg: 'rgba(23,126,84,0.08)' },
                  { value: 'En cours', label: 'En cours', icon: '▶️', color: 'var(--cyan)', bg: 'rgba(30,159,216,0.08)' },
                  { value: 'Terminé', label: 'Terminé', icon: '🏁', color: 'var(--navy-mid)', bg: 'rgba(37,67,84,0.08)' },
                ]
              : [
                  { value: 'Planifié', label: 'Planifié', icon: '📋', color: 'var(--text-2)', bg: 'var(--bg-page)' },
                  { value: 'En cours', label: 'En cours', icon: '▶️', color: 'var(--cyan)', bg: 'rgba(30,159,216,0.08)' },
                  { value: 'Terminé', label: 'Terminé', icon: '🏁', color: 'var(--navy-mid)', bg: 'rgba(37,67,84,0.08)' },
                ]
          } />
          {clients.length > 0 && (
            <EntitySelector
              label="Client associé (optionnel)" value={fClientId} onChange={setFClientId}
              options={clients} placeholder="— Aucun client associé —"
            />
          )}
        </FormSection>
      </Drawer>
    </div>
  );
}
