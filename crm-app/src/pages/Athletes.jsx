import { useState, useMemo } from 'react';
import { useCRM } from '../contexts/CRMContext';
import { fmtUsd, dateFr } from '../crm-data';
import Drawer from '../components/ui/Drawer';
import { useToast } from '../contexts/ToastContext';
import EmptyState from '../components/ui/EmptyState';
import StatusBadge from '../components/ui/StatusBadge';

const POSTES = ['Attaquant', 'Milieu offensif', 'Milieu défensif', 'Ailier', 'Défenseur central', 'Latéral', 'Gardien'];

// ── Indicateur de niveau de valeur marchande ─────────────────────────────────
function ValeurBar({ valeur }) {
  const seuils = [0, 100000, 500000, 1000000, 5000000];
  const idx = seuils.findIndex(s => valeur < s) - 1;
  const level = Math.max(0, Math.min(idx < 0 ? 4 : idx, 4));
  const colors = ['#8896A0', '#C08A4D', '#1E9FD8', '#F4A800', '#BC000D'];
  const labels = ['Local', 'Régional', 'National', 'Continental', 'International'];
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{ width: '18px', height: '5px', borderRadius: '2px', background: i <= level ? colors[level] : 'var(--border)' }} />
      ))}
      <span style={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', color: colors[level], marginLeft: '4px', letterSpacing: '0.05em' }}>{labels[level]}</span>
    </div>
  );
}

// ── Scouting Card ─────────────────────────────────────────────────────────────
function ScoutingCard({ athlete, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onSelect(athlete.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--white)', borderRadius: '14px',
        border: `1px solid ${hovered ? 'rgba(30,159,216,0.4)' : 'var(--border)'}`,
        overflow: 'hidden', cursor: 'pointer', position: 'relative',
        transition: 'all 0.22s ease',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 12px 32px rgba(37,67,84,0.14)' : '0 1px 4px rgba(37,67,84,0.06)',
      }}
    >
      {/* Banner gradient */}
      <div style={{
        height: '100px',
        background: 'linear-gradient(135deg, var(--navy-deep) 0%, #1a3a50 60%, #254354 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative jersey number */}
        <div style={{
          position: 'absolute', right: '-8px', bottom: '-16px',
          fontSize: '80px', fontFamily: 'var(--font-oswald)', fontWeight: 700,
          color: 'rgba(255,255,255,0.05)', lineHeight: 1, pointerEvents: 'none',
          userSelect: 'none'
        }}>{athlete.poste?.charAt(0) || '?'}</div>

        {/* Nationality flag area */}
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)'
          }}>{athlete.nationalite}</span>
        </div>

        {/* Value badge top right */}
        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(244,168,0,0.18)', border: '1px solid rgba(244,168,0,0.35)',
            borderRadius: '6px', padding: '3px 8px',
            fontFamily: 'var(--font-jetbrains)', fontSize: '11px', fontWeight: 700, color: '#F4A800'
          }}>{fmtUsd(athlete.valeur)}</div>
        </div>

        {/* Delete button — toujours présent, visible au hover/touch */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(e, athlete.id); }}
          style={{
            position: 'absolute', bottom: '8px', right: '8px',
            background: 'rgba(188,0,13,0.15)', border: '1px solid rgba(188,0,13,0.3)',
            borderRadius: '6px', width: '26px', height: '26px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#BC000D', zIndex: 10,
            opacity: hovered ? 1 : 0.35,
            transition: 'opacity 0.18s',
          }}
          title="Retirer cet athlète"
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Avatar + Info */}
      <div style={{ padding: '0 16px 18px 16px', position: 'relative' }}>
        {/* Avatar */}
        <div style={{
          width: '60px', height: '60px', borderRadius: '12px',
          background: 'var(--white)', padding: '3px',
          position: 'absolute', top: '-30px', left: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '2px solid var(--white)'
        }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: '8px',
            backgroundImage: `url(${athlete.photo})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            background: athlete.photo ? undefined : 'linear-gradient(135deg, var(--navy-mid), var(--navy-deep))'
          }}>
            {!athlete.photo && (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-oswald)', fontSize: '20px', color: 'rgba(255,255,255,0.6)', borderRadius: '8px' }}>
                {athlete.nom?.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Poste badge */}
        <div style={{ height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', padding: '3px 10px', borderRadius: '99px',
            background: 'rgba(30,159,216,0.1)', color: 'var(--cyan-text)',
            border: '1px solid rgba(30,159,216,0.2)'
          }}>{athlete.poste}</span>
        </div>

        {/* Nom */}
        <h3 style={{
          margin: '12px 0 2px 0', fontSize: '17px',
          fontFamily: 'var(--font-oswald)', textTransform: 'uppercase',
          color: 'var(--navy-deep)', letterSpacing: '0.02em', lineHeight: 1.1
        }}>{athlete.nom}</h3>

        {/* Age */}
        <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '12px' }}>
          {athlete.age} ans · {athlete.pied === 'Gauche' ? 'Gauche ✦' : 'Droit'}
        </div>

        {/* Valeur bar */}
        <ValeurBar valeur={athlete.valeur} />

        {/* Club */}
        <div style={{
          marginTop: '12px', padding: '8px 10px',
          background: 'var(--bg-page)', borderRadius: '8px',
          fontSize: '12px', display: 'flex', alignItems: 'center', gap: '7px',
          borderLeft: '2px solid var(--navy-deep)'
        }}>
          <span style={{ fontSize: '14px' }}>🛡️</span>
          <span style={{ fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{athlete.club}</span>
        </div>
      </div>
    </div>
  );
}

// ── KPI strip ─────────────────────────────────────────────────────────────────
function KpiStrip({ athletes }) {
  const totalValeur = athletes.reduce((s, a) => s + (a.valeur || 0), 0);
  const totalCommissions = athletes.reduce((s, a) => s + (a.commissions || []).reduce((cs, c) => cs + c.montant, 0), 0);
  const kpis = [
    { label: 'Athlètes suivis', value: athletes.length, accent: 'var(--navy-deep)' },
    { label: 'Valeur portfolio', value: fmtUsd(totalValeur), accent: 'var(--gold)' },
    { label: 'Commissions générées', value: fmtUsd(totalCommissions), accent: 'var(--success)' },
    { label: 'Contrats actifs', value: athletes.filter(a => a.contractRef).length, accent: 'var(--cyan)' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
      {kpis.map((k, i) => (
        <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderLeft: `3px solid ${k.accent}`, borderRadius: '8px', padding: '14px 16px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: '0.1em' }}>{k.label}</div>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '20px', marginTop: '6px' }}>{k.value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Onglets détail ────────────────────────────────────────────────────────────
const DETAIL_TABS = ['Profil', 'Contrats & Transferts', 'Commissions', 'Événements', 'Performances', 'Vidéos'];

export default function Athletes() {
  const { state: { athletes, contrats, camps }, dispatch, confirmAction } = useCRM();

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterPoste, setFilterPoste] = useState('Tous');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTab, setDetailTab] = useState('Profil');
  const addToast = useToast();

  const [fNom, setFNom] = useState('');
  const [fAge, setFAge] = useState('');
  const [fPoste, setFPoste] = useState('Attaquant');
  const [fClub, setFClub] = useState('');
  const [fNationalite, setFNationalite] = useState('RDC');
  const [fValeur, setFValeur] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fTel, setFTel] = useState('');
  const [fPied, setFPied] = useState('Droit');
  const [fCommission, setFCommission] = useState('');

  const openCreate = () => { setEditTarget(null); setFNom(''); setFAge(''); setFPoste('Attaquant'); setFClub(''); setFNationalite('RDC'); setFValeur(''); setFEmail(''); setFTel(''); setFPied('Droit'); setFCommission(''); setIsDrawerOpen(true); };
  const openEdit = (a) => { setEditTarget(a); setFNom(a.nom); setFAge(String(a.age)); setFPoste(a.poste); setFClub(a.club); setFNationalite(a.nationalite); setFValeur(String(a.valeur)); setFEmail(a.email || ''); setFTel(a.tel || ''); setFPied(a.pied || 'Droit'); setFCommission(a.commissionPct ? String(a.commissionPct) : ''); setIsDrawerOpen(true); };

  const filtered = useMemo(() => {
    return athletes.filter(a => {
      const matchSearch = a.nom.toLowerCase().includes(search.toLowerCase()) || a.club.toLowerCase().includes(search.toLowerCase());
      const matchPoste = filterPoste === 'Tous' || a.poste === filterPoste;
      return matchSearch && matchPoste;
    });
  }, [athletes, search, filterPoste]);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    const athlete = athletes.find(a => a.id === id);
    confirmAction(
      'Retirer cet athlète ?',
      `"${athlete?.nom}" sera retiré du portfolio. Les contrats et événements liés devront être mis à jour manuellement.`,
      () => {
        dispatch({ type: 'DELETE_ATHLETE', payload: id });
        if (selectedId === id) setSelectedId(null);
        addToast('Athlète retiré du portfolio.', 'success');
      }
    );
  };

  const handleSave = () => {
    if (!fNom.trim() || !fClub.trim()) {
      addToast('Nom et Club sont obligatoires', 'error');
      return;
    }
    if (editTarget) {
      dispatch({ type: 'UPDATE_ATHLETE', payload: { ...editTarget, nom: fNom, age: parseInt(fAge) || editTarget.age, poste: fPoste, club: fClub, nationalite: fNationalite, valeur: Number(fValeur) || 0, pied: fPied, email: fEmail, tel: fTel, commissionPct: fCommission ? Number(fCommission) : editTarget.commissionPct } });
      addToast('Fiche athlète mise à jour.');
    } else {
      const now = Date.now();
      dispatch({ type: 'ADD_ATHLETE', payload: { id: now, nom: fNom, age: parseInt(fAge) || 20, poste: fPoste, club: fClub, valeur: Number(fValeur) || 0, nationalite: fNationalite, pied: fPied, email: fEmail, tel: fTel, commissionPct: fCommission ? Number(fCommission) : undefined, photo: `https://i.pravatar.cc/150?u=${now}`, transferts: [], commissions: [] } });
      addToast('Athlète ajouté au portfolio !', 'success');
    }
    setIsDrawerOpen(false);
    setFNom(''); setFAge(''); setFClub(''); setFValeur(''); setFEmail(''); setFTel(''); setFCommission('');
  };

  // ── VUE DÉTAIL 360° ────────────────────────────────────────────────────────
  if (selectedId) {
    const athlete = athletes.find(a => a.id === selectedId);
    if (!athlete) { setSelectedId(null); return null; }

    const contratInfo = contrats.find(c => c.ref === athlete.contractRef);
    const athleteCamps = camps.filter(c => c.participants?.includes(athlete.id));

    return (
      <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
        {/* Retour + Edit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button
            onClick={() => { setSelectedId(null); setDetailTab('Profil'); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '34px', padding: '0 14px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', color: 'var(--text-2)' }}
          >
            ← Portfolio Athlètes
          </button>
          <button
            onClick={() => openEdit(athlete)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '34px', padding: '0 16px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Modifier la fiche
          </button>
        </div>

        {/* Hero banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--navy-deep) 0%, #1a3a50 100%)',
          borderRadius: '14px', padding: '28px 28px 20px 28px',
          marginBottom: '24px', position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative letter */}
          <div style={{
            position: 'absolute', right: '-20px', bottom: '-30px',
            fontSize: '160px', fontFamily: 'var(--font-oswald)', fontWeight: 700,
            color: 'rgba(255,255,255,0.04)', lineHeight: 1, pointerEvents: 'none'
          }}>{athlete.poste?.charAt(0)}</div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: '90px', height: '90px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.12)', padding: '3px', flexShrink: 0,
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '10px',
                backgroundImage: `url(${athlete.photo})`,
                backgroundSize: 'cover', backgroundPosition: 'center'
              }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em', marginBottom: '4px' }}>
                {athlete.nationalite} · {athlete.age} ans
              </div>
              <h1 style={{
                margin: '0 0 6px 0', fontSize: '28px',
                fontFamily: 'var(--font-oswald)', color: 'var(--white)',
                textTransform: 'uppercase', letterSpacing: '0.02em'
              }}>{athlete.nom}</h1>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{
                  background: 'rgba(30,159,216,0.2)', border: '1px solid rgba(30,159,216,0.4)',
                  borderRadius: '99px', padding: '4px 12px',
                  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#6DCEF7'
                }}>{athlete.poste}</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>🛡️ {athlete.club}</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Pied {athlete.pied}</span>
              </div>
            </div>

            {/* Valeur marchande */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(244,168,0,0.7)', letterSpacing: '0.1em' }}>Valeur marchande</div>
              <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '26px', fontWeight: 700, color: '#F4A800', marginTop: '2px' }}>{fmtUsd(athlete.valeur)}</div>
              {athlete.commissionPct && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Commission agence : {athlete.commissionPct}%</div>
              )}
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div style={{
          display: 'flex', gap: '0', borderBottom: '2px solid var(--border)',
          marginBottom: '24px', overflowX: 'auto'
        }}>
          {DETAIL_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setDetailTab(tab)}
              style={{
                background: 'none', border: 'none', padding: '10px 20px',
                fontSize: '13px', fontWeight: detailTab === tab ? 700 : 500,
                color: detailTab === tab ? 'var(--navy-deep)' : 'var(--text-3)',
                borderBottom: `3px solid ${detailTab === tab ? 'var(--gold)' : 'transparent'}`,
                cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                marginBottom: '-2px'
              }}
            >{tab}</button>
          ))}
        </div>

        {/* Contenu onglets */}
        <div>
          {/* ── PROFIL ── */}
          {detailTab === 'Profil' && (
            <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Infos personnelles */}
              <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}>Identité sportive</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: 'Poste', value: athlete.poste },
                    { label: 'Nationalité', value: athlete.nationalite },
                    { label: 'Âge', value: `${athlete.age} ans` },
                    { label: 'Pied fort', value: athlete.pied },
                    { label: 'Club actuel', value: athlete.club },
                    { label: 'Email', value: athlete.email || '—' },
                    { label: 'Téléphone', value: athlete.tel || '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: '3px' }}>{label}</div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-1)' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contrat actuel */}
              <div>
                <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Contrat de représentation</h3>
                  {contratInfo ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '14px', fontWeight: 700, color: 'var(--navy-deep)' }}>{athlete.contractRef}</span>
                        <StatusBadge status={contratInfo.statut} />
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span>Type : <strong>{contratInfo.type}</strong></span>
                        <span>Valeur : <strong style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--success)' }}>{fmtUsd(contratInfo.valeur)}</strong></span>
                        <span>Expire : <strong>{contratInfo.expire ? dateFr(contratInfo.expire) : '—'}</strong></span>
                        {athlete.commissionPct && <span>Commission agence : <strong>{athlete.commissionPct}%</strong></span>}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-3)', fontSize: '13px' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
                      Aucun contrat actif
                    </div>
                  )}
                </div>

                {/* Camps inscrits */}
                <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Camps & stages</h3>
                  {athleteCamps.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {athleteCamps.map(camp => (
                        <div key={camp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-page)', borderRadius: '8px' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{camp.nom}</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-3)' }}>{dateFr(camp.dateDebut)} · {camp.lieu}</div>
                          </div>
                          <StatusBadge status={camp.statut} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-3)', fontSize: '13px', textAlign: 'center' }}>Pas de camp enregistré.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── CONTRATS & TRANSFERTS ── */}
          {detailTab === 'Contrats & Transferts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Historique transferts */}
              <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}>Historique des transferts</h3>
                {athlete.transferts && athlete.transferts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {athlete.transferts.map((t, i) => (
                      <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: i < athlete.transferts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        {/* Timeline dot */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px', flexShrink: 0 }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.type === 'Transfert' ? 'var(--gold)' : 'var(--cyan)', border: '2px solid var(--white)', boxShadow: '0 0 0 2px ' + (t.type === 'Transfert' ? 'var(--gold)' : 'var(--cyan)') }} />
                          {i < athlete.transferts.length - 1 && <div style={{ width: '2px', flex: 1, background: 'var(--border)', marginTop: '4px' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy-deep)', marginBottom: '2px' }}>{t.vers}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>Depuis {t.de} · {t.date}</div>
                          <div style={{ display: 'flex', gap: '10px', marginTop: '8px', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '13px', color: 'var(--success)' }}>{fmtUsd(t.montant)}</span>
                            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '99px', background: t.type === 'Transfert' ? 'rgba(244,168,0,0.16)' : 'rgba(30,159,216,0.12)', color: t.type === 'Transfert' ? '#9A6B00' : '#1E78A8' }}>{t.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-3)', fontSize: '13px' }}>Aucun historique de transfert.</p>
                )}
              </div>
            </div>
          )}

          {/* ── COMMISSIONS ── */}
          {detailTab === 'Commissions' && (
            <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Commissions & Revenus</h3>
                {athlete.commissions?.length > 0 && (
                  <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '15px', fontWeight: 700, color: 'var(--success)' }}>
                    {fmtUsd(athlete.commissions.reduce((s, c) => s + c.montant, 0))}
                  </div>
                )}
              </div>
              {athlete.commissions && athlete.commissions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {athlete.commissions.map((com, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-page)', borderRadius: '10px', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-1)' }}>{com.libelle}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '3px', fontFamily: 'var(--font-jetbrains)' }}>{com.date}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '14px', color: com.statut === 'Payée' ? 'var(--success)' : 'var(--gold-dark)' }}>{fmtUsd(com.montant)}</span>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                          padding: '3px 10px', borderRadius: '99px',
                          background: com.statut === 'Payée' ? 'rgba(23,126,84,0.12)' : 'rgba(244,168,0,0.16)',
                          color: com.statut === 'Payée' ? '#177E54' : '#9A6B00'
                        }}>{com.statut}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
                  Aucune commission enregistrée.
                </div>
              )}
            </div>
          )}

          {/* ── PERFORMANCES ── */}
          {detailTab === 'Performances' && (
            <div style={{ background: 'var(--white)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
              <div style={{ fontFamily: 'var(--font-oswald)', fontSize: '16px', color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Statistiques à venir</div>
              <p style={{ color: 'var(--text-3)', fontSize: '13px', maxWidth: '320px', margin: '0 auto' }}>Les données de performance (buts, passes, minutes jouées) seront disponibles ici dès l'intégration avec les sources de données sportives.</p>
            </div>
          )}

          {/* ── VIDÉOS ── */}
          {detailTab === 'Vidéos' && (
            <div style={{ background: 'var(--white)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎬</div>
              <div style={{ fontFamily: 'var(--font-oswald)', fontSize: '16px', color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Highlights & clips</div>
              <p style={{ color: 'var(--text-3)', fontSize: '13px', maxWidth: '320px', margin: '0 auto' }}>Ajoutez ici les liens vers les highlights YouTube, les vidéos de matchs et les clips de scouting de cet athlète.</p>
            </div>
          )}

          {/* ── ÉVÉNEMENTS ── */}
          {detailTab === 'Événements' && (
            <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}>Camps & stages inscrits</h3>
              {athleteCamps.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {athleteCamps.map(camp => (
                    <div key={camp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-page)', borderRadius: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--navy-deep)' }}>{camp.nom}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '4px' }}>
                          📍 {camp.lieu} · {dateFr(camp.dateDebut)} → {dateFr(camp.dateFin)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>Catégorie : {camp.categorie}</div>
                      </div>
                      <StatusBadge status={camp.statut} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏕️</div>
                  Aucun camp enregistré pour cet athlète.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── VUE LISTE ─────────────────────────────────────────────────────────────
  return (
    <div style={{ animation: 'fadeIn 0.18s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>
            Scouting & Représentation
          </div>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Portfolio Athlètes</h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-2)', fontSize: '13.5px' }}>
            Gérez vos talents, analysez leur valeur marchande et suivez leurs contrats.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            background: 'var(--navy-deep)', color: 'var(--white)', border: 'none',
            padding: '11px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', gap: '8px', alignItems: 'center',
            boxShadow: '0 4px 14px rgba(37,67,84,0.2)', fontSize: '13px'
          }}
        >
          <span>＋</span> Ajouter un talent
        </button>
      </div>

      {/* KPIs */}
      <KpiStrip athletes={athletes} />

      {/* Filtres */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-page)', padding: '4px', borderRadius: '8px', overflowX: 'auto' }}>
          {['Tous', ...POSTES].map(p => (
            <button
              key={p}
              onClick={() => setFilterPoste(p)}
              style={{
                whiteSpace: 'nowrap',
                background: filterPoste === p ? 'var(--white)' : 'transparent',
                color: filterPoste === p ? 'var(--navy-deep)' : 'var(--text-3)',
                border: 'none', padding: '6px 12px', borderRadius: '5px',
                fontWeight: filterPoste === p ? 700 : 500, fontSize: '12px',
                cursor: 'pointer',
                boxShadow: filterPoste === p ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >{p}</button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Rechercher (nom, club)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            border: '1px solid var(--border-input)', borderRadius: '8px',
            padding: '9px 14px', fontSize: '13px', outline: 'none', minWidth: '200px'
          }}
        />
      </div>

      {/* Grille cartes */}
      {filtered.length === 0 ? (
        <EmptyState
          title={search || filterPoste !== 'Tous' ? 'Aucun athlète trouvé' : 'Portfolio vide'}
          description={search || filterPoste !== 'Tous'
            ? 'Modifiez vos filtres pour affiner la recherche.'
            : 'Ajoutez votre premier talent pour démarrer le portfolio.'}
          actionLabel="Ajouter un talent"
          onAction={openCreate}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px' }}>
          {filtered.map(a => (
            <ScoutingCard
              key={a.id}
              athlete={a}
              onSelect={setSelectedId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Drawer création / édition */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editTarget ? 'Modifier la fiche athlète' : 'Ajouter un talent'}
        width="440px"
        footer={
          <>
            <button onClick={() => setIsDrawerOpen(false)} style={{ padding: '10px 18px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSave} style={{ padding: '10px 22px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>{editTarget ? 'Enregistrer' : 'Créer la fiche'}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Nom complet <span style={{ color: 'var(--red)' }}>*</span></span>
            <input type="text" value={fNom} onChange={e => setFNom(e.target.value)} placeholder="Ex. Yaya Diallo" style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Poste</span>
              <select value={fPoste} onChange={e => setFPoste(e.target.value)} style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'var(--white)' }}>
                {POSTES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Âge</span>
              <input type="number" value={fAge} onChange={e => setFAge(e.target.value)} placeholder="20" style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Club actuel <span style={{ color: 'var(--red)' }}>*</span></span>
            <input type="text" value={fClub} onChange={e => setFClub(e.target.value)} placeholder="Ex. AS V.Club (Kinshasa)" style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Nationalité</span>
              <input type="text" value={fNationalite} onChange={e => setFNationalite(e.target.value)} placeholder="RDC" style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Valeur marchande ($)</span>
              <input type="number" value={fValeur} onChange={e => setFValeur(e.target.value)} placeholder="0" style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px', fontFamily: 'var(--font-jetbrains)' }} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Pied fort</span>
              <select value={fPied} onChange={e => setFPied(e.target.value)} style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'var(--white)' }}>
                <option value="Droit">Droit</option>
                <option value="Gauche">Gauche</option>
                <option value="Ambidextre">Ambidextre</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Commission agence (%)</span>
              <input type="number" value={fCommission} onChange={e => setFCommission(e.target.value)} placeholder="Ex. 5" style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Email</span>
              <input type="email" value={fEmail} onChange={e => setFEmail(e.target.value)} placeholder="athlete@exemple.com" style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Téléphone</span>
              <input type="text" value={fTel} onChange={e => setFTel(e.target.value)} placeholder="+243 ..." style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
            </label>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
