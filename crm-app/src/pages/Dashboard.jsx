import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fmtUsd, dateFr, STATUT_BADGE } from '../crm-data';
import { useCRM } from '../contexts/CRMContext';

const badge = (st) => STATUT_BADGE[st] || { bg: 'rgba(37,67,84,.10)', color: '#42474C' };

// ── Helpers ────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);
const shiftDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

// ── Revenue Bar Chart ──────────────────────────────────────────────────────
function RevenueChart({ factures }) {
  const MONTH_NAMES = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
  const MONTHS = (() => {
    const result = []; const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return result;
  })();
  const LABELS = MONTHS.map(m => MONTH_NAMES[parseInt(m.split('-')[1]) - 1]);
  const cur = MONTHS[MONTHS.length - 1];

  const totals = MONTHS.map(m => {
    const paid = factures.filter(f => f.statut === 'Payée' && (f.echeance||'').slice(0,7) === m).reduce((s,f) => s+f.montant, 0);
    const pend = m === cur ? factures.filter(f => ['En attente','En retard'].includes(f.statut) && (f.echeance||'').slice(0,7) === m).reduce((s,f) => s+f.montant, 0) : 0;
    return { val: paid + pend, isCurrent: m === cur };
  });

  const maxVal = Math.max(...totals.map(t => t.val), 1000);
  const objVal = maxVal * 1.25;
  const objY = Math.round(160 - (maxVal / objVal) * 140);

  // Line path for trend
  const points = totals.map((t, i) => {
    const cx = 20 + i * 87 + 22;
    const cy = t.val > 0 ? Math.round(160 - (t.val / objVal) * 140) : 160;
    return `${cx},${cy}`;
  });

  const bars = totals.map((t, i) => {
    const x = 20 + i * 87; const cx = x + 22;
    const h = Math.round((t.val / objVal) * 140);
    const y = 160 - h;
    const fill = t.isCurrent ? '#BC000D' : '#3D5A6C';
    const short = t.val > 0 ? (t.val >= 1000 ? '$' + (t.val/1000).toFixed(1) + 'k' : '$' + t.val) : '';
    return { x, cx, y: h > 0 ? y : 160, h: Math.max(h, 0), fill, short, month: LABELS[i], isCurrent: t.isCurrent };
  });

  return (
    <svg viewBox="0 0 560 200" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E9FD8" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#1E9FD8" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <line x1="0" y1="160" x2="560" y2="160" stroke="rgba(37,67,84,0.15)" strokeWidth="1"/>
      <line x1="0" y1="110" x2="560" y2="110" stroke="rgba(37,67,84,0.07)" strokeWidth="1"/>
      <line x1="0" y1="60" x2="560" y2="60" stroke="rgba(37,67,84,0.07)" strokeWidth="1"/>
      <line x1="14" y1={objY} x2="546" y2={objY} stroke="#F4A800" strokeWidth="2.5" strokeDasharray="7 5"/>
      <polyline fill="none" stroke="#1E9FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" opacity="0.5" points={points.join(' ')} />
      {bars.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width="44" height={b.h} rx="3" fill={b.fill} opacity="0.85"/>
          {b.short && <text x={b.cx} y={Math.max(b.y - 5, 14)} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" fill={b.fill}>{b.short}</text>}
          <text x={b.cx} y="178" textAnchor="middle" fontFamily="Open Sans" fontSize="11" fill={b.isCurrent ? '#091D2E' : '#5B6B77'} fontWeight={b.isCurrent ? '700' : '400'}>{b.month}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Conversion Funnel ─────────────────────────────────────────────────────
function ConversionFunnel({ devis, factures }) {
  const total = devis.length || 1;
  const envoyes = devis.filter(d => ['Envoyé','Accepté','Converti'].includes(d.statut)).length;
  const acceptes = devis.filter(d => ['Accepté','Converti'].includes(d.statut)).length;
  const convertis = devis.filter(d => d.statut === 'Converti').length;
  const payes = factures.filter(f => f.statut === 'Payée').length;

  const steps = [
    { label: 'Devis créés', value: total, pct: 100, color: '#254354', bg: 'rgba(37,67,84,0.1)' },
    { label: 'Envoyés', value: envoyes, pct: Math.round(envoyes / total * 100), color: '#1E9FD8', bg: 'rgba(30,159,216,0.12)' },
    { label: 'Acceptés', value: acceptes, pct: Math.round(acceptes / total * 100), color: '#F4A800', bg: 'rgba(244,168,0,0.14)' },
    { label: 'Convertis', value: convertis, pct: Math.round(convertis / total * 100), color: '#177E54', bg: 'rgba(23,126,84,0.12)' },
    { label: 'Factures payées', value: payes, pct: payes > 0 ? Math.round(payes / Math.max(convertis, 1) * 100) : 0, color: '#BC000D', bg: 'rgba(188,0,13,0.10)' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: '0' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          {i < steps.length - 1 && (
            <div style={{ position: 'absolute', right: '-1px', top: '50%', transform: 'translateY(-50%)', width: '0', height: '0', borderTop: '18px solid transparent', borderBottom: '18px solid transparent', borderLeft: `10px solid ${s.color}`, opacity: 0.35, zIndex: 2 }} />
          )}
          <div style={{ width: '100%', background: s.bg, border: `1px solid ${s.color}22`, borderRadius: i === 0 ? '8px 0 0 8px' : i === steps.length - 1 ? '0 8px 8px 0' : '0', padding: '14px 10px', textAlign: 'center', borderRight: i < steps.length - 1 ? 'none' : undefined }}>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '22px', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: s.color, marginTop: '4px', opacity: 0.8 }}>{s.label}</div>
            <div style={{ marginTop: '6px', height: '4px', background: `rgba(0,0,0,0.08)`, borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: s.color, marginTop: '4px', opacity: 0.7 }}>{s.pct}%</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Alert Banner ───────────────────────────────────────────────────────────
function AlertsBanner({ factures, contrats, devis, clientNom, navigate }) {
  const [dismissed, setDismissed] = useState(new Set());

  const today = todayStr();
  const in30 = shiftDays(30);
  const ago15 = shiftDays(-15);

  const facturesLate = factures.filter(f =>
    f.statut === 'En retard' || (f.statut === 'En attente' && f.echeance && f.echeance < today)
  );
  const contratsExpiring = contrats.filter(c =>
    c.expire && !['Résilié','Expiré'].includes(c.statut) && c.expire > today && c.expire <= in30
  );
  const devisSansReponse = devis.filter(d =>
    d.statut === 'Envoyé' && d.date && d.date <= ago15
  );

  const alerts = [
    facturesLate.length > 0 && {
      id: 'factures-late',
      level: 'error',
      icon: 'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
      title: `${facturesLate.length} facture${facturesLate.length > 1 ? 's' : ''} en retard`,
      detail: `${fmtUsd(facturesLate.reduce((s,f) => s+f.montant, 0))} à encaisser — ${facturesLate.map(f => clientNom(f.clientId)).slice(0,2).join(', ')}${facturesLate.length > 2 ? '…' : ''}`,
      cta: 'Voir les factures',
      path: '/factures',
      bg: 'rgba(188,0,13,0.07)', border: '#BC000D', accent: '#BC000D', ctaBg: '#BC000D',
    },
    contratsExpiring.length > 0 && {
      id: 'contrats-expiring',
      level: 'warning',
      icon: 'M8 21h8M12 17v4M17 4H7v5a5 5 0 0 0 10 0zM17 4h4v2a3 3 0 0 1-3 3M7 4H3v2a3 3 0 0 0 3 3',
      title: `${contratsExpiring.length} contrat${contratsExpiring.length > 1 ? 's expirent' : ' expire'} bientôt`,
      detail: `Échéance dans moins de 30 jours — à renouveler en priorité`,
      cta: 'Voir les contrats',
      path: '/contrats',
      bg: 'rgba(244,168,0,0.07)', border: '#F4A800', accent: '#9A6B00', ctaBg: '#F4A800',
    },
    devisSansReponse.length > 0 && {
      id: 'devis-no-response',
      level: 'info',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8',
      title: `${devisSansReponse.length} devis sans réponse depuis 15j+`,
      detail: `${devisSansReponse.map(d => clientNom(d.clientId)).slice(0,3).join(', ')}${devisSansReponse.length > 3 ? '…' : ''} — pensez à relancer`,
      cta: 'Voir les devis',
      path: '/devis',
      bg: 'rgba(30,159,216,0.07)', border: '#1E9FD8', accent: '#1E78A8', ctaBg: '#1E9FD8',
    },
  ].filter(Boolean).filter(a => !dismissed.has(a.id));

  if (alerts.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
      {alerts.map(a => (
        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: a.bg, border: `1px solid ${a.border}44`, borderLeft: `4px solid ${a.border}`, borderRadius: '8px', flexWrap: 'wrap' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d={a.icon}/></svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: a.accent }}>{a.title}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.detail}</div>
          </div>
          <button onClick={() => navigate(a.path)} style={{ padding: '6px 12px', background: a.ctaBg, color: a.level === 'warning' ? '#254354' : '#fff', border: 'none', borderRadius: '5px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>{a.cta}</button>
          <button onClick={() => setDismissed(prev => new Set([...prev, a.id]))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: a.accent, padding: '4px', opacity: 0.6, display: 'flex', alignItems: 'center', flexShrink: 0 }} title="Ignorer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Health Score ───────────────────────────────────────────────────────────
function HealthScore({ factures, devis, contrats, projets }) {
  const today = todayStr();
  const in30 = shiftDays(30);

  const lateCount = factures.filter(f => f.statut === 'En retard' || (f.statut === 'En attente' && f.echeance && f.echeance < today)).length;
  const expiringCount = contrats.filter(c => c.expire && c.expire > today && c.expire <= in30).length;
  const convRate = devis.length ? devis.filter(d => ['Accepté','Converti'].includes(d.statut)).length / devis.length : 0;
  const payRate = factures.length ? factures.filter(f => f.statut === 'Payée').length / factures.length : 1;
  const overdueProjects = projets.filter(p => p.statut === 'En cours' && p.avancement < 30).length;

  let score = 100;
  score -= lateCount * 12;
  score -= expiringCount * 8;
  score += convRate * 10;
  score += payRate * 10;
  score -= overdueProjects * 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const level = score >= 80 ? { label: 'Excellent', color: '#177E54', bg: 'rgba(23,126,84,0.12)' }
    : score >= 60 ? { label: 'Bon', color: '#1E9FD8', bg: 'rgba(30,159,216,0.12)' }
    : score >= 40 ? { label: 'Attention', color: '#F4A800', bg: 'rgba(244,168,0,0.14)' }
    : { label: 'Critique', color: '#BC000D', bg: 'rgba(188,0,13,0.10)' };

  const circumference = 2 * Math.PI * 28;
  const dash = (score / 100) * circumference;

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0 }}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(37,67,84,0.1)" strokeWidth="7"/>
          <circle cx="36" cy="36" r="28" fill="none" stroke={level.color} strokeWidth="7" strokeDasharray={`${dash} ${circumference - dash}`} strokeLinecap="round" transform="rotate(-90 36 36)" style={{ transition: 'stroke-dasharray 0.8s ease' }}/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '17px', color: level.color }}>{score}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-2)', marginBottom: '4px' }}>Santé commerciale</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '99px', background: level.bg, marginBottom: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: level.color }} />
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: level.color }}>{level.label}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'Taux conversion', value: Math.round(convRate * 100) + '%', good: convRate > 0.4 },
            { label: 'Factures payées', value: Math.round(payRate * 100) + '%', good: payRate > 0.6 },
            { label: 'Retards', value: lateCount, good: lateCount === 0 },
          ].map((m, i) => (
            <div key={i} style={{ fontSize: '11.5px', color: 'var(--text-2)' }}>
              {m.label} : <strong style={{ color: m.good ? 'var(--success)' : '#BC000D' }}>{m.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const { state: { clients, devis, factures, contrats, projets, vipMembers, evenements } } = useCRM();
  const navigate = useNavigate();
  const clientNom = (id) => { const c = clients.find(c => c.id === id); return c ? c.nom : '—'; };

  const encaisse = factures.filter(f => f.statut === 'Payée').reduce((s,f) => s+f.montant, 0);
  const devisEnCours = devis.filter(d => ['Brouillon','Envoyé'].includes(d.statut));
  const projetsActifs = projets.filter(p => ['En cours','Planifié'].includes(p.statut)).length;
  const vipActifs = vipMembers.filter(v => v.statut === 'Actif').length;

  const kpis = [
    { label: 'Revenus encaissés', value: fmtUsd(encaisse), delta: factures.filter(f=>f.statut==='Payée').length + ' factures', deltaNote: 'payées', accent: '#1E9FD8', iconBg: 'rgba(30,159,216,0.12)', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { label: 'Pipeline en attente', value: fmtUsd(devisEnCours.reduce((s,d)=>s+d.montant,0)), delta: String(devisEnCours.length), deltaNote: 'devis actifs', accent: '#F4A800', iconBg: 'rgba(244,168,0,0.14)', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8' },
    { label: 'Projets actifs', value: String(projetsActifs), delta: String(projets.filter(p=>p.statut==='Terminé').length), deltaNote: 'terminés', accent: '#BC000D', iconBg: 'rgba(188,0,13,0.10)', icon: 'M4 4h4.5v16H4zM9.75 4h4.5v10h-4.5zM15.5 4H20v7h-4.5z' },
    { label: 'Membres VIP actifs', value: String(vipActifs), delta: String(vipMembers.length), deltaNote: 'cartes NFC total', accent: '#254354', iconBg: 'rgba(37,67,84,0.10)', icon: 'M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z' },
  ];

  const allDocs = [
    ...devis.map(d => ({ ref: d.ref, client: clientNom(d.clientId), objet: d.objet, montant: fmtUsd(d.montant), statut: d.statut, href: '/devis', date: d.date })),
    ...factures.map(f => ({ ref: f.ref, client: clientNom(f.clientId), objet: f.objet, montant: fmtUsd(f.montant), statut: f.statut, href: '/factures', date: f.echeance })),
  ].sort((a,b) => (b.date||'').localeCompare(a.date||'')).slice(0,5);

  const deadlines = [
    ...factures.filter(f => ['En retard','En attente'].includes(f.statut)).map(f => ({
      titre: f.ref + (f.statut === 'En retard' ? ' — en retard' : ' — échéance'),
      detail: clientNom(f.clientId) + ' · ' + fmtUsd(f.montant),
      date: dateFr(f.echeance).toUpperCase(), dot: f.statut === 'En retard' ? '#BC000D' : '#F4A800', dateColor: f.statut === 'En retard' ? '#BC000D' : '#9A6B00',
    })),
    ...contrats.filter(c => c.statut === 'Expire bientôt' && c.expire).map(c => ({
      titre: c.ref + ' — expiration', detail: clientNom(c.clientId) + ' · ' + c.type,
      date: dateFr(c.expire).toUpperCase(), dot: '#F4A800', dateColor: '#9A6B00',
    })),
    ...evenements.filter(e => e.statut !== 'Terminé').slice(0,2).map(e => ({
      titre: e.nom.length > 42 ? e.nom.slice(0,39) + '…' : e.nom,
      detail: e.lieu + ' · ' + e.type, date: dateFr(e.dateDebut).toUpperCase(), dot: '#1E9FD8', dateColor: '#1E78A8',
    })),
  ].slice(0,5);

  const quickActions = [
    { label: 'Créer un devis', path: '/devis?action=new', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8', iconBg: 'rgba(30,159,216,0.14)', iconColor: '#1E9FD8' },
    { label: 'Nouvelle facture', path: '/factures?action=new', icon: 'M5 3h14v18l-2.4-1.6L14.2 21l-2.2-1.6L9.8 21l-2.4-1.6L5 21zM9 8h6M9 12h6M9 16h3.5', iconBg: 'rgba(188,0,13,0.10)', iconColor: '#BC000D' },
    { label: 'Générer un contrat', path: '/contrats/nouveau', icon: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', iconBg: 'rgba(37,67,84,0.10)', iconColor: '#254354' },
    { label: 'Affilier un membre VIP', path: '/vip?action=new', icon: 'M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z', iconBg: 'rgba(244,168,0,0.16)', iconColor: '#B07800' },
  ];

  const handleExport = () => {
    const rows = [
      ['Référence', 'Client', 'Objet', 'Montant', 'Statut', 'Date'],
      ...devis.map(d => [d.ref, clientNom(d.clientId), d.objet, d.montant, d.statut, d.date || '']),
      ...factures.map(f => [f.ref, clientNom(f.clientId), f.objet, f.montant, f.statut, f.echeance || '']),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'ndembokin-export.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const C = { card: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px' } };

  return (
    <div>
      {/* Alertes proactives */}
      <AlertsBanner
        factures={factures} contrats={contrats} devis={devis}
        clientNom={clientNom} navigate={navigate}
      />

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '6px' }}>Pilotage</div>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Tableau de bord</h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '13.5px', color: 'var(--text-2)' }}>Vue d'ensemble de l'activité — Ndembo Kin Connect SARL, Kinshasa.</p>
        </div>
        <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px', padding: '0 16px', background: 'var(--navy-deep)', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--white)', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-mid)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--navy-deep)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Exporter CSV
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ ...C.card, borderTop: `3px solid ${k.accent}`, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-2)' }}>{k.label}</span>
              <span style={{ width: '30px', height: '30px', borderRadius: '6px', background: k.iconBg, color: k.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={k.icon}/></svg>
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '27px', letterSpacing: '-0.04em', color: 'var(--text-1)', lineHeight: 1 }}>{k.value}</div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-2)' }}>
              <span style={{ fontWeight: 700 }}>{k.delta}</span> {k.deltaNote}
            </div>
          </div>
        ))}
      </div>

      {/* Santé + Funnel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px', alignItems: 'stretch' }}>
        <HealthScore factures={factures} devis={devis} contrats={contrats} projets={projets} />
        <div style={{ ...C.card, padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-oswald)', fontWeight: 600, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--navy-deep)' }}>Entonnoir de conversion</div>
              <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>Du devis jusqu'à l'encaissement</div>
            </div>
            <Link to="/devis" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cyan)', textDecoration: 'none' }}>Pipeline →</Link>
          </div>
          <ConversionFunnel devis={devis} factures={factures} />
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: '16px', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          {/* Revenue Chart */}
          <div style={{ ...C.card, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-oswald)', fontWeight: 600, fontSize: '17px', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--navy-deep)' }}>Revenus — 6 derniers mois</div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>Encaissements USD · ligne de tendance en pointillés · objectif en or</div>
              </div>
              <div style={{ display: 'flex', gap: '14px', fontSize: '11.5px', color: 'var(--text-2)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#3D5A6C', display: 'inline-block' }}></span>Encaissé</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#BC000D', display: 'inline-block' }}></span>Ce mois</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '14px', height: '2px', background: '#1E9FD8', display: 'inline-block', opacity: 0.5 }}></span>Tendance</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '14px', height: '2px', background: '#F4A800', display: 'inline-block' }}></span>Objectif</span>
              </div>
            </div>
            <RevenueChart factures={factures} />
          </div>

          {/* Recent Docs */}
          <div style={{ ...C.card, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-oswald)', fontWeight: 600, fontSize: '17px', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--navy-deep)' }}>Documents récents</div>
              <Link to="/devis" style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--cyan)', textDecoration: 'none' }}>Tout voir →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 110px 100px', padding: '10px 22px', background: 'var(--bg-subtle)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-2)' }}>
              <span>Référence</span><span>Client</span><span>Objet</span><span style={{ textAlign: 'right' }}>Montant</span><span style={{ textAlign: 'right' }}>Statut</span>
            </div>
            {allDocs.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>Aucun document récent.</div>
            ) : allDocs.map((d, i) => {
              const b = badge(d.statut);
              return (
                <Link key={i} to={d.href} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 110px 100px', alignItems: 'center', padding: '13px 22px', borderTop: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
                >
                  <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)' }}>{d.ref}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{d.client}</span>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-2)' }}>{d.objet}</span>
                  <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12.5px', fontWeight: 700, textAlign: 'right' }}>{d.montant}</span>
                  <span style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: '99px', background: b.bg, color: b.color }}>{d.statut}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          {/* Quick Actions */}
          <div style={{ ...C.card, padding: '18px 20px' }}>
            <div style={{ fontFamily: 'var(--font-oswald)', fontWeight: 600, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--navy-deep)', marginBottom: '14px' }}>Actions rapides</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {quickActions.map((qa, i) => (
                <button key={i} onClick={() => navigate(qa.path)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--white)', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'border-color 0.15s ease, background 0.15s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.background = '#F5FAFE'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--white)'; }}
                >
                  <span style={{ width: '30px', height: '30px', borderRadius: '6px', background: qa.iconBg, color: qa.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={qa.icon}/></svg>
                  </span>
                  <span style={{ flex: 1, fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>{qa.label}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8896A0" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              ))}
            </div>
          </div>

          {/* Deadlines */}
          <div style={{ ...C.card, padding: '18px 20px' }}>
            <div style={{ fontFamily: 'var(--font-oswald)', fontWeight: 600, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--navy-deep)', marginBottom: '14px' }}>Échéances à venir</div>
            {deadlines.length === 0 ? (
              <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--success)', fontSize: '13px', fontWeight: 600 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ display: 'block', margin: '0 auto 6px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Aucune échéance urgente
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {deadlines.map((dl, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', padding: '11px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '99px', background: dl.dot, marginTop: '5px', flexShrink: 0 }}></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.35 }}>{dl.titre}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '2px' }}>{dl.detail}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', fontWeight: 700, color: dl.dateColor, whiteSpace: 'nowrap' }}>{dl.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* VIP Banner */}
          <div style={{ background: 'linear-gradient(140deg, #203243 0%, #254354 60%, #2D4A5C 100%)', borderRadius: '8px', padding: '20px', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #F4A800, #BC000D)' }}></div>
            <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#F4A800', marginBottom: '8px' }}>Programme VIP</div>
            <div style={{ fontFamily: 'var(--font-oswald)', fontWeight: 600, fontSize: '19px', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.25 }}>
              {(() => { const n = vipMembers.filter(v => v.statut === 'Expire bientôt').length; return n > 0 ? `${n} adhésion${n > 1 ? 's' : ''} à renouveler` : 'Tous les membres VIP sont à jour'; })()}
            </div>
            <p style={{ margin: '8px 0 14px 0', fontSize: '12.5px', color: '#B9CBD8', lineHeight: 1.5 }}>
              {vipActifs} membre{vipActifs > 1 ? 's' : ''} actif{vipActifs > 1 ? 's' : ''} · {vipMembers.length} cartes NFC émises.
            </p>
            <Link to="/vip" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '34px', padding: '0 14px', background: '#F4A800', color: '#254354', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}>Gérer les membres</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
