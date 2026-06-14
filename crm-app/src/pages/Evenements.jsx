import { useState } from 'react';
import { dateFr } from '../crm-data';
import { useCRM } from '../contexts/CRMContext';
import Drawer from '../components/ui/Drawer';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../contexts/ToastContext';
import StatusBadge from '../components/ui/StatusBadge';

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

function EventCard({ item, kind, athletes, onDelete, onViewParticipants }) {
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
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(e, item, kind); }}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '4px', color: 'var(--text-3)', marginLeft: 'auto',
            opacity: hovered ? 1 : 0, transition: 'opacity 0.15s',
          }}
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
  );
}

const ALL_TYPES = ['Tous', 'Tournoi', 'Gala', 'Détection', 'Camp', 'Stage'];
const EVT_TYPES = ['Tournoi', 'Gala', 'Détection'];
const CAMP_CATEGORIES = ['U15', 'U17', 'U20', 'Senior', 'Spécifique'];

export default function Evenements() {
  const { state: { evenements, camps, clients, athletes }, dispatch, confirmAction } = useCRM();
  const [filterType, setFilterType] = useState('Tous');
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerKind, setDrawerKind] = useState('evenement');
  const addToast = useToast();

  const [fNom, setFNom] = useState('');
  const [fType, setFType] = useState('Tournoi');
  const [fLieu, setFLieu] = useState('');
  const [fDateDebut, setFDateDebut] = useState('');
  const [fDateFin, setFDateFin] = useState('');
  const [fCapacite, setFCapacite] = useState('');
  const [fBudget, setFBudget] = useState('');
  const [fCategorie, setFCategorie] = useState('U17');

  const clientNom = (id) => { if (!id) return '—'; const c = clients.find(c => c.id === id); return c ? c.nom : '—'; };

  const allItems = [
    ...evenements.map(e => ({ ...e, _kind: 'evenement' })),
    ...camps.map(c => ({ ...c, _kind: 'camp', type: 'Camp' })),
  ].sort((a, b) => (a.dateDebut || '').localeCompare(b.dateDebut || ''));

  const filtered = filterType === 'Tous'
    ? allItems
    : allItems.filter(item => {
        if (filterType === 'Camp') return item._kind === 'camp';
        return item._kind === 'evenement' && item.type === filterType;
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

  const openDrawer = (kind) => {
    setDrawerKind(kind);
    setFNom(''); setFType('Tournoi'); setFLieu('');
    setFDateDebut(''); setFDateFin(''); setFCapacite(''); setFBudget('');
    setFCategorie('U17');
    setIsDrawerOpen(true);
  };

  const handleSave = () => {
    if (!fNom.trim() || !fLieu.trim() || !fDateDebut) {
      addToast('Nom, lieu et date de début sont obligatoires', 'error');
      return;
    }
    if (drawerKind === 'evenement') {
      const nextId = 'EVT-' + String(evenements.length + 5).padStart(2, '0');
      dispatch({
        type: 'ADD_EVENEMENT',
        payload: {
          id: nextId, nom: fNom, type: fType, lieu: fLieu,
          dateDebut: fDateDebut, dateFin: fDateFin || fDateDebut,
          budget: Number(fBudget) || 0, statut: 'Planification',
          inscrits: 0, capacite: Number(fCapacite) || 0, clientId: null
        }
      });
      addToast(`Événement "${fNom}" créé !`);
    } else {
      const nextId = 'CMP-' + String(camps.length + 4).padStart(2, '0');
      dispatch({
        type: 'ADD_CAMP',
        payload: {
          id: nextId, nom: fNom, lieu: fLieu,
          dateDebut: fDateDebut, dateFin: fDateFin || fDateDebut,
          categorie: fCategorie, places: Number(fCapacite) || 0,
          inscrits: 0, statut: 'Planifié', clientId: null, participants: []
        }
      });
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

      {/* Type filter */}
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
        title={drawerKind === 'evenement' ? 'Créer un événement' : 'Planifier un camp'}
        width="460px"
        footer={
          <>
            <button onClick={() => setIsDrawerOpen(false)} style={{ padding: '10px 18px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSave} style={{ padding: '10px 22px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              {drawerKind === 'evenement' ? 'Créer l\'événement' : 'Planifier le camp'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Nom <span style={{ color: 'var(--red)' }}>*</span></span>
            <input type="text" value={fNom} onChange={e => setFNom(e.target.value)}
              placeholder={drawerKind === 'evenement' ? 'Ex. Tournoi International 2026' : 'Ex. Camp Élite U17'}
              style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
          </label>

          {drawerKind === 'evenement' ? (
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Type</span>
              <select value={fType} onChange={e => setFType(e.target.value)} style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'var(--white)' }}>
                {EVT_TYPES.map(t => <option key={t} value={t}>{TYPE_CONFIG[t].icon} {t}</option>)}
              </select>
            </label>
          ) : (
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Catégorie</span>
              <select value={fCategorie} onChange={e => setFCategorie(e.target.value)} style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'var(--white)' }}>
                {CAMP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          )}

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Lieu <span style={{ color: 'var(--red)' }}>*</span></span>
            <input type="text" value={fLieu} onChange={e => setFLieu(e.target.value)}
              placeholder="Ex. Stade des Martyrs, Kinshasa"
              style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Date début <span style={{ color: 'var(--red)' }}>*</span></span>
              <input type="date" value={fDateDebut} onChange={e => setFDateDebut(e.target.value)}
                style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Date fin</span>
              <input type="date" value={fDateFin} onChange={e => setFDateFin(e.target.value)}
                style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Capacité</span>
              <input type="number" value={fCapacite} onChange={e => setFCapacite(e.target.value)}
                placeholder="0"
                style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
            </label>
            {drawerKind === 'evenement' && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Budget ($)</span>
                <input type="number" value={fBudget} onChange={e => setFBudget(e.target.value)}
                  placeholder="0"
                  style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px', fontFamily: 'var(--font-jetbrains)' }} />
              </label>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
