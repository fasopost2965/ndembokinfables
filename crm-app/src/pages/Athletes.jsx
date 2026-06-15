import { useState, useMemo, useRef } from 'react';
import { useCRM } from '../contexts/CRMContext';
import { fmtUsd, dateFr } from '../crm-data';
import Drawer from '../components/ui/Drawer';
import { useToast } from '../contexts/ToastContext';
import EmptyState from '../components/ui/EmptyState';
import StatusBadge from '../components/ui/StatusBadge';
import { FormSection, FormRow, TextField, TextareaField, AmountField, TypeCards, ValidationSummary } from '../components/ui/FormControls';
import ActivityTimeline from '../components/activities/ActivityTimeline';

const POSTES = ['Attaquant', 'Milieu offensif', 'Milieu défensif', 'Ailier', 'Défenseur central', 'Latéral', 'Gardien'];
const EMPTY_FORM = { nom: '', age: '', poste: 'Attaquant', club: '', nationalite: 'RDC', valeur: '', email: '', tel: '', adresse: '', pied: 'Droit', commissionPct: '', photo: '', bio: '', videos: '' };

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
      <div style={{ height: '100px', background: 'linear-gradient(135deg, var(--navy-deep) 0%, #1a3a50 60%, #254354 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-8px', bottom: '-16px', fontSize: '80px', fontFamily: 'var(--font-oswald)', fontWeight: 700, color: 'rgba(255,255,255,0.05)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>{athlete.poste?.charAt(0) || '?'}</div>
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)' }}>{athlete.nationalite}</span>
        </div>
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <div style={{ background: 'rgba(244,168,0,0.18)', border: '1px solid rgba(244,168,0,0.35)', borderRadius: '6px', padding: '3px 8px', fontFamily: 'var(--font-jetbrains)', fontSize: '11px', fontWeight: 700, color: '#F4A800' }}>{fmtUsd(athlete.valeur)}</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(e, athlete.id); }}
          style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(188,0,13,0.18)', border: '1px solid rgba(188,0,13,0.35)', borderRadius: '6px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#BC000D', zIndex: 10, opacity: hovered ? 1 : 0.6, transition: 'opacity 0.18s' }}
          title="Retirer cet athlète"
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div style={{ padding: '0 16px 18px 16px', position: 'relative' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--white)', padding: '3px', position: 'absolute', top: '-30px', left: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '2px solid var(--white)' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '8px', backgroundImage: athlete.photo ? `url(${athlete.photo})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', background: athlete.photo ? undefined : 'linear-gradient(135deg, var(--navy-mid), var(--navy-deep))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!athlete.photo && <span style={{ fontFamily: 'var(--font-oswald)', fontSize: '20px', color: 'rgba(255,255,255,0.6)' }}>{athlete.nom?.charAt(0)}</span>}
          </div>
        </div>

        <div style={{ height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 10px', borderRadius: '99px', background: 'rgba(30,159,216,0.1)', color: 'var(--cyan-text)', border: '1px solid rgba(30,159,216,0.2)' }}>{athlete.poste}</span>
        </div>

        <h3 style={{ margin: '12px 0 2px 0', fontSize: '17px', fontFamily: 'var(--font-oswald)', textTransform: 'uppercase', color: 'var(--navy-deep)', letterSpacing: '0.02em', lineHeight: 1.1 }}>{athlete.nom}</h3>
        <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '12px' }}>{athlete.age} ans · {athlete.pied === 'Gauche' ? 'Gauche ✦' : 'Droit'}</div>
        <ValeurBar valeur={athlete.valeur} />
        <div style={{ marginTop: '12px', padding: '8px 10px', background: 'var(--bg-page)', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '7px', borderLeft: '2px solid var(--navy-deep)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--navy-deep)" strokeWidth="2" strokeLinecap="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
          <span style={{ fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{athlete.club}</span>
        </div>
      </div>
    </div>
  );
}

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

const DETAIL_TABS = ['Profil', 'Contrats & Transferts', 'Commissions', 'Performances', 'Vidéos', 'Activités'];

export default function Athletes() {
  const { state: { athletes, contrats, camps }, dispatch, confirmAction } = useCRM();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterPoste, setFilterPoste] = useState('Tous');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTab, setDetailTab] = useState('Profil');
  const [errors, setErrors] = useState({});
  const addToast = useToast();
  const photoInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const [form, setForm] = useState(EMPTY_FORM);

  const [addingTransfert, setAddingTransfert] = useState(false);
  const [newTransfert, setNewTransfert] = useState({ date: '', de: '', vers: '', montant: '', type: 'Transfert' });
  const [addingCommission, setAddingCommission] = useState(false);
  const [newCommission, setNewCommission] = useState({ date: '', libelle: '', montant: '', statut: 'En attente' });

  const openCreate = () => {
    setEditTarget(null); setForm(EMPTY_FORM); setErrors({}); setIsDrawerOpen(true);
  };
  const openEdit = (a) => {
    setEditTarget(a);
    setForm({
      nom: a.nom, age: String(a.age || ''), poste: a.poste || 'Attaquant',
      club: a.club || '', nationalite: a.nationalite || 'RDC', valeur: String(a.valeur || ''),
      email: a.email || '', tel: a.tel || '', adresse: a.adresse || '',
      pied: a.pied || 'Droit', commissionPct: a.commissionPct ? String(a.commissionPct) : '',
      photo: a.photo || '', bio: a.bio || '', videos: a.videos || '',
    });
    setErrors({}); setIsDrawerOpen(true);
  };

  const filtered = useMemo(() => athletes.filter(a => {
    const matchSearch = a.nom.toLowerCase().includes(search.toLowerCase()) || a.club.toLowerCase().includes(search.toLowerCase());
    const matchPoste = filterPoste === 'Tous' || a.poste === filterPoste;
    return matchSearch && matchPoste;
  }), [athletes, search, filterPoste]);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    const athlete = athletes.find(a => a.id === id);
    confirmAction('Retirer cet athlète ?', `"${athlete?.nom}" sera retiré du portfolio. Les contrats et événements liés devront être mis à jour manuellement.`, () => {
      dispatch({ type: 'DELETE_ATHLETE', payload: id });
      if (selectedId === id) setSelectedId(null);
      addToast('Athlète retiré du portfolio.');
    });
  };

  const handleSave = () => {
    const errs = {};
    if (!form.nom.trim()) errs.nom = 'Le nom est requis';
    if (!form.club.trim()) errs.club = 'Le club est requis';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (editTarget) {
      dispatch({ type: 'UPDATE_ATHLETE', payload: { ...editTarget, nom: form.nom, age: parseInt(form.age) || editTarget.age, poste: form.poste, club: form.club, nationalite: form.nationalite, valeur: Number(form.valeur) || 0, pied: form.pied, email: form.email, tel: form.tel, adresse: form.adresse, commissionPct: form.commissionPct ? Number(form.commissionPct) : editTarget.commissionPct, photo: form.photo || editTarget.photo, bio: form.bio, videos: form.videos } });
      addToast('Fiche athlète mise à jour.');
    } else {
      const now = Date.now();
      dispatch({ type: 'ADD_ATHLETE', payload: { id: now, nom: form.nom, age: parseInt(form.age) || 20, poste: form.poste, club: form.club, valeur: Number(form.valeur) || 0, nationalite: form.nationalite, pied: form.pied, email: form.email, tel: form.tel, adresse: form.adresse, commissionPct: form.commissionPct ? Number(form.commissionPct) : undefined, photo: form.photo || `https://i.pravatar.cc/150?u=${now}`, bio: form.bio, videos: form.videos, transferts: [], commissions: [] } });
      addToast('Athlète ajouté au portfolio !');
    }
    setIsDrawerOpen(false);
  };

  const handleAddTransfert = (athlete) => {
    if (!newTransfert.vers.trim()) return;
    dispatch({ type: 'UPDATE_ATHLETE', payload: { ...athlete, transferts: [...(athlete.transferts || []), { ...newTransfert, montant: Number(newTransfert.montant) || 0 }] } });
    setNewTransfert({ date: '', de: '', vers: '', montant: '', type: 'Transfert' });
    setAddingTransfert(false);
    addToast('Transfert ajouté.');
  };

  const handleAddCommission = (athlete) => {
    if (!newCommission.libelle.trim() || !newCommission.montant) return;
    dispatch({ type: 'UPDATE_ATHLETE', payload: { ...athlete, commissions: [...(athlete.commissions || []), { ...newCommission, montant: Number(newCommission.montant) }] } });
    setNewCommission({ date: '', libelle: '', montant: '', statut: 'En attente' });
    setAddingCommission(false);
    addToast('Commission enregistrée.');
  };

  // ── VUE DÉTAIL ────────────────────────────────────────────────────────────
  if (selectedId) {
    const athlete = athletes.find(a => a.id === selectedId);
    if (!athlete) { setSelectedId(null); return null; }
    const contratInfo = contrats.find(c => c.ref === athlete.contractRef);
    const athleteCamps = camps ? camps.filter(c => c.participants?.includes(athlete.id)) : [];

    return (
      <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <button onClick={() => { setSelectedId(null); setDetailTab('Profil'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '34px', padding: '0 14px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', color: 'var(--text-2)' }}>
            ← Portfolio Athlètes
          </button>
          <button
            onClick={() => {
              const w = window.open('', '_blank', 'width=860,height=700');
              if (!w) return;
              w.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>Fiche — ${athlete.nom}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;padding:28px;max-width:720px;margin:0 auto}.btn{display:block;text-align:center;padding:14px;background:#f0f4f7;border-radius:8px;margin-bottom:24px}.btn button{padding:9px 24px;background:#254354;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer}h1{font-size:24px;color:#254354;text-transform:uppercase;letter-spacing:.02em;margin-bottom:4px}.kv{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e8eb;font-size:13px}.kv span:first-child{color:#5b6b77}.kv span:last-child{font-weight:600}@media print{.btn{display:none!important}body{padding:0}@page{margin:12mm 10mm;size:A4}}</style>
</head><body>
<div class="btn"><button onclick="window.print()">Imprimer / Enregistrer en PDF</button></div>
<div style="background:#254354;color:#fff;border-radius:10px;padding:22px;margin-bottom:24px">
  <div style="font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:rgba(255,255,255,.45);margin-bottom:6px">FICHE ATHLÈTE — NDEMBO KIN CONNECT</div>
  <h1>${athlete.nom}</h1>
  <div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,.6)">${athlete.poste} · ${athlete.club} · ${athlete.nationalite}</div>
</div>
<h2 style="font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#9aabb6;margin-bottom:12px">Identité sportive</h2>
<div class="kv"><span>Poste</span><span>${athlete.poste || '—'}</span></div>
<div class="kv"><span>Nationalité</span><span>${athlete.nationalite || '—'}</span></div>
<div class="kv"><span>Âge</span><span>${athlete.age} ans</span></div>
<div class="kv"><span>Pied fort</span><span>${athlete.pied || '—'}</span></div>
<div class="kv"><span>Club actuel</span><span>${athlete.club || '—'}</span></div>
<div class="kv"><span>Valeur marchande</span><span style="font-weight:700;color:#254354">${fmtUsd(athlete.valeur)}</span></div>
${athlete.commissionPct ? `<div class="kv"><span>Commission agence</span><span>${athlete.commissionPct}%</span></div>` : ''}
${athlete.contractRef ? `<div class="kv"><span>Contrat actif</span><span style="font-family:monospace">${athlete.contractRef}</span></div>` : ''}
<h2 style="font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#9aabb6;margin:20px 0 12px">Contact</h2>
<div class="kv"><span>Email</span><span>${athlete.email || '—'}</span></div>
<div class="kv"><span>Téléphone</span><span>${athlete.tel || '—'}</span></div>
<div class="kv"><span>Adresse</span><span>${athlete.adresse || '—'}</span></div>
${athlete.bio ? `<div style="margin-top:20px;padding:14px;background:#f0f4f7;border-radius:8px;font-size:12.5px;color:#5b6b77;line-height:1.6"><strong>Biographie :</strong> ${athlete.bio}</div>` : ''}
<div style="margin-top:32px;padding-top:12px;border-top:1px solid #e5e8eb;font-size:11px;color:#9aabb6;text-align:right">Généré le ${new Date().toLocaleDateString('fr-FR')} — Ndembo Kin Connect</div>
</body></html>`);
              w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '34px', padding: '0 14px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', color: 'var(--text-2)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Fiche PDF
          </button>
          <button onClick={() => openEdit(athlete)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '34px', padding: '0 16px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Modifier la fiche
          </button>
        </div>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, var(--navy-deep) 0%, #1a3a50 100%)', borderRadius: '14px', padding: '28px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-30px', fontSize: '160px', fontFamily: 'var(--font-oswald)', fontWeight: 700, color: 'rgba(255,255,255,0.04)', lineHeight: 1, pointerEvents: 'none' }}>{athlete.poste?.charAt(0)}</div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '14px', background: 'rgba(255,255,255,0.12)', padding: '3px', flexShrink: 0, boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '10px', backgroundImage: athlete.photo ? `url(${athlete.photo})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', background: athlete.photo ? undefined : 'linear-gradient(135deg,var(--navy-mid),var(--navy-deep))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!athlete.photo && <span style={{ fontFamily: 'var(--font-oswald)', fontSize: '32px', color: 'rgba(255,255,255,0.4)' }}>{athlete.nom?.charAt(0)}</span>}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em', marginBottom: '4px' }}>{athlete.nationalite} · {athlete.age} ans</div>
              <h1 style={{ margin: '0 0 6px 0', fontSize: '28px', fontFamily: 'var(--font-oswald)', color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{athlete.nom}</h1>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ background: 'rgba(30,159,216,0.2)', border: '1px solid rgba(30,159,216,0.4)', borderRadius: '99px', padding: '4px 12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#6DCEF7' }}>{athlete.poste}</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{athlete.club}</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Pied {athlete.pied}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(244,168,0,0.7)', letterSpacing: '0.1em' }}>Valeur marchande</div>
              <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '26px', fontWeight: 700, color: '#F4A800', marginTop: '2px' }}>{fmtUsd(athlete.valeur)}</div>
              {athlete.commissionPct && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Commission agence : {athlete.commissionPct}%</div>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--border)', marginBottom: '24px', overflowX: 'auto' }}>
          {DETAIL_TABS.map(tab => (
            <button key={tab} onClick={() => setDetailTab(tab)} style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: '13px', fontWeight: detailTab === tab ? 700 : 500, color: detailTab === tab ? 'var(--navy-deep)' : 'var(--text-3)', borderBottom: `3px solid ${detailTab === tab ? 'var(--gold)' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap', marginBottom: '-2px' }}>{tab}</button>
          ))}
        </div>

        {/* Profil */}
        {detailTab === 'Profil' && (
          <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}>Identité sportive</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Poste', value: athlete.poste },
                  { label: 'Nationalité', value: athlete.nationalite },
                  { label: 'Âge', value: `${athlete.age} ans` },
                  { label: 'Pied fort', value: athlete.pied },
                  { label: 'Club actuel', value: athlete.club },
                  { label: 'Email', value: athlete.email || '—' },
                  { label: 'Téléphone', value: athlete.tel || '—' },
                  { label: 'Adresse', value: athlete.adresse || '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: '3px' }}>{label}</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-1)' }}>{value}</div>
                  </div>
                ))}
                {athlete.bio && (
                  <div>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: '3px' }}>Notes & Performances</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{athlete.bio}</div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
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
                      {athlete.commissionPct && <span>Commission : <strong>{athlete.commissionPct}%</strong></span>}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-3)', fontSize: '13px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>Aucun contrat actif
                  </div>
                )}
              </div>
              {athleteCamps.length > 0 && (
                <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Camps & stages</h3>
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contrats & Transferts */}
        {detailTab === 'Contrats & Transferts' && (
          <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Historique des transferts</h3>
              <button onClick={() => setAddingTransfert(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                + Ajouter
              </button>
            </div>

            {addingTransfert && (
              <div style={{ background: 'var(--bg-page)', borderRadius: '10px', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Année</span>
                    <input value={newTransfert.date} onChange={e => setNewTransfert(t => ({ ...t, date: e.target.value }))} placeholder="2026" style={{ height: '36px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Type</span>
                    <select value={newTransfert.type} onChange={e => setNewTransfert(t => ({ ...t, type: e.target.value }))} style={{ height: '36px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'var(--white)' }}>
                      <option>Transfert</option><option>Formation</option><option>Prêt</option>
                    </select>
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Club de départ</span>
                    <input value={newTransfert.de} onChange={e => setNewTransfert(t => ({ ...t, de: e.target.value }))} placeholder="Club A" style={{ height: '36px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Club d'arrivée *</span>
                    <input value={newTransfert.vers} onChange={e => setNewTransfert(t => ({ ...t, vers: e.target.value }))} placeholder="Club B" style={{ height: '36px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px' }} />
                  </label>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Montant ($)</span>
                  <input type="number" value={newTransfert.montant} onChange={e => setNewTransfert(t => ({ ...t, montant: e.target.value }))} placeholder="0" style={{ height: '36px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px', fontFamily: 'var(--font-jetbrains)' }} />
                </label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setAddingTransfert(false)} style={{ padding: '7px 14px', border: '1px solid var(--border-input)', borderRadius: '6px', background: 'var(--white)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Annuler</button>
                  <button onClick={() => handleAddTransfert(athlete)} style={{ padding: '7px 14px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Enregistrer</button>
                </div>
              </div>
            )}

            {athlete.transferts && athlete.transferts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {athlete.transferts.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: i < athlete.transferts.length - 1 ? '1px solid var(--border)' : 'none' }}>
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
              <p style={{ color: 'var(--text-3)', fontSize: '13px' }}>Aucun historique de transfert. Cliquez sur "+ Ajouter" pour en créer un.</p>
            )}
          </div>
        )}

        {/* Commissions */}
        {detailTab === 'Commissions' && (
          <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Commissions & Revenus</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {athlete.commissions?.length > 0 && <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '15px', fontWeight: 700, color: 'var(--success)' }}>{fmtUsd(athlete.commissions.reduce((s, c) => s + c.montant, 0))}</div>}
                <button onClick={() => setAddingCommission(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--success)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  + Ajouter
                </button>
              </div>
            </div>

            {addingCommission && (
              <div style={{ background: 'var(--bg-page)', borderRadius: '10px', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Date</span>
                    <input type="date" value={newCommission.date} onChange={e => setNewCommission(c => ({ ...c, date: e.target.value }))} style={{ height: '36px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Montant ($)</span>
                    <input type="number" value={newCommission.montant} onChange={e => setNewCommission(c => ({ ...c, montant: e.target.value }))} placeholder="0" style={{ height: '36px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px', fontFamily: 'var(--font-jetbrains)' }} />
                  </label>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Libellé *</span>
                  <input value={newCommission.libelle} onChange={e => setNewCommission(c => ({ ...c, libelle: e.target.value }))} placeholder="Commission transfert, prime performance…" style={{ height: '36px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Statut</span>
                  <select value={newCommission.statut} onChange={e => setNewCommission(c => ({ ...c, statut: e.target.value }))} style={{ height: '36px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'var(--white)' }}>
                    <option>En attente</option><option>Payée</option>
                  </select>
                </label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setAddingCommission(false)} style={{ padding: '7px 14px', border: '1px solid var(--border-input)', borderRadius: '6px', background: 'var(--white)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Annuler</button>
                  <button onClick={() => handleAddCommission(athlete)} style={{ padding: '7px 14px', background: 'var(--success)', color: 'var(--white)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Enregistrer</button>
                </div>
              </div>
            )}

            {athlete.commissions && athlete.commissions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {athlete.commissions.map((com, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-page)', borderRadius: '10px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-1)' }}>{com.libelle}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '3px', fontFamily: 'var(--font-jetbrains)' }}>{com.date}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '14px', color: com.statut === 'Payée' ? 'var(--success)' : 'var(--gold-dark, #9A6B00)' }}>{fmtUsd(com.montant)}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '99px', background: com.statut === 'Payée' ? 'rgba(23,126,84,0.12)' : 'rgba(244,168,0,0.16)', color: com.statut === 'Payée' ? '#177E54' : '#9A6B00' }}>{com.statut}</span>
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

        {/* Performances */}
        {detailTab === 'Performances' && (
          <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Statistiques & Performances</h3>
              <button onClick={() => openEdit(athlete)} style={{ padding: '6px 12px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-2)' }}>
                Modifier
              </button>
            </div>
            {athlete.bio ? (
              <div style={{ fontSize: '13.5px', color: 'var(--text-1)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{athlete.bio}</div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, marginBottom: '12px', display: 'block', margin: '0 auto 12px' }}><path strokeLinecap="round" d="M4 4h4.5v16H4zM9.75 4h4.5v10h-4.5zM15.5 4H20v7h-4.5z"/></svg>
                <div style={{ fontFamily: 'var(--font-oswald)', fontSize: '14px', color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Statistiques non renseignées</div>
                <p style={{ fontSize: '12.5px', margin: '0 auto 14px', maxWidth: '280px' }}>Ajoutez des notes de performance dans la fiche de l'athlète.</p>
                <button onClick={() => openEdit(athlete)} style={{ padding: '8px 16px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Renseigner les performances</button>
              </div>
            )}
          </div>
        )}

        {/* Vidéos */}
        {detailTab === 'Vidéos' && (
          <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Highlights & Clips</h3>
              <button onClick={() => openEdit(athlete)} style={{ padding: '6px 12px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-2)' }}>Modifier</button>
            </div>
            {athlete.videos ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {athlete.videos.split('\n').filter(Boolean).map((url, i) => (
                  <a key={i} href={url.trim()} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'var(--bg-page)', borderRadius: '8px', textDecoration: 'none', border: '1px solid var(--border)', color: 'var(--navy-deep)', fontSize: '13px', fontWeight: 600 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url.trim()}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, marginBottom: '12px', display: 'block', margin: '0 auto 12px' }}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                <div style={{ fontFamily: 'var(--font-oswald)', fontSize: '14px', color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Aucun clip ajouté</div>
                <button onClick={() => openEdit(athlete)} style={{ marginTop: '14px', padding: '8px 16px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Ajouter des liens vidéo</button>
              </div>
            )}
          </div>
        )}

        {/* Activités */}
        {detailTab === 'Activités' && (
          <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <ActivityTimeline entityType="athlete" entityId={athlete.id} />
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Modifier la fiche athlète" width="540px"
          footer={
            <>
              <button onClick={() => setIsDrawerOpen(false)} style={{ padding: '10px 18px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleSave} style={{ padding: '10px 22px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Enregistrer les modifications</button>
            </>
          }
        >
          {renderForm()}
        </Drawer>
      </div>
    );
  }

  function renderForm() {
    return (
      <>
        <ValidationSummary errors={errors} />

        <FormSection title="Identité" subtitle="Nom, nationalité et informations de base">
          <TextField label="Nom complet" value={form.nom} onChange={v => setForm(f => ({ ...f, nom: v }))} required placeholder="Ex. Yaya Diallo" error={errors.nom} maxLength={80} />
          <FormRow>
            <TextField label="Nationalité" value={form.nationalite} onChange={v => setForm(f => ({ ...f, nationalite: v }))} placeholder="RDC" />
            <TextField label="Âge" value={form.age} onChange={v => setForm(f => ({ ...f, age: v }))} type="number" placeholder="20" />
          </FormRow>
          <TypeCards label="Pied fort" value={form.pied} onChange={v => setForm(f => ({ ...f, pied: v }))} options={[
            { value: 'Droit', label: 'Droit', color: 'var(--navy-deep)', bg: 'rgba(37,67,84,0.08)' },
            { value: 'Gauche', label: 'Gauche', color: 'var(--cyan)', bg: 'rgba(30,159,216,0.08)' },
            { value: 'Ambidextre', label: 'Ambi.', color: 'var(--success)', bg: 'rgba(23,126,84,0.08)' },
          ]} />
        </FormSection>

        <FormSection title="Club & Poste" subtitle="Situation sportive actuelle">
          <TypeCards label="Poste" value={form.poste} onChange={v => setForm(f => ({ ...f, poste: v }))} options={POSTES.map(p => ({ value: p, label: p, color: 'var(--navy-mid)', bg: 'rgba(37,67,84,0.07)' }))} />
          <TextField label="Club actuel" value={form.club} onChange={v => setForm(f => ({ ...f, club: v }))} required placeholder="Ex. AS V.Club (Kinshasa)" error={errors.club} />
        </FormSection>

        <FormSection title="Valeur & Représentation" subtitle="Estimation marchande et commission agence">
          <AmountField label="Valeur marchande" value={form.valeur} onChange={v => setForm(f => ({ ...f, valeur: v }))} placeholder="850000" hint="Estimation en USD" />
          <TextField label="Commission agence (%)" value={form.commissionPct} onChange={v => setForm(f => ({ ...f, commissionPct: v }))} type="number" placeholder="Ex. 15" hint="Pourcentage sur transferts et revenus" />
        </FormSection>

        <FormSection title="Contact & Adresse" subtitle="Coordonnées personnelles">
          <FormRow>
            <TextField label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" placeholder="athlete@exemple.com" />
            <TextField label="Téléphone" value={form.tel} onChange={v => setForm(f => ({ ...f, tel: v }))} placeholder="+243 ..." />
          </FormRow>
          <TextField label="Adresse" value={form.adresse} onChange={v => setForm(f => ({ ...f, adresse: v }))} placeholder="Ville, quartier, pays" />
        </FormSection>

        <FormSection title="Médias" subtitle="Photo et liens vidéo">
          {/* Photo upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div
              onClick={() => photoInputRef.current?.click()}
              style={{ width: '72px', height: '72px', borderRadius: '10px', border: '2px dashed var(--border-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, transition: 'border-color 0.15s', backgroundImage: form.photo ? `url(${form.photo})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', background: form.photo ? undefined : 'rgba(37,67,84,0.06)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-input)'}
            >
              {!form.photo && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
            </div>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '4px' }}>Photo de l'athlète</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginBottom: '8px' }}>JPG, PNG, WEBP — ou URL externe</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => photoInputRef.current?.click()} style={{ height: '28px', padding: '0 12px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '5px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-2)' }}>
                  {form.photo ? 'Changer' : 'Choisir un fichier'}
                </button>
                {form.photo && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, photo: '' }))} style={{ height: '28px', padding: '0 12px', background: 'none', border: '1px solid rgba(188,0,13,0.3)', borderRadius: '5px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', color: 'var(--red)' }}>
                    Supprimer
                  </button>
                )}
              </div>
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </div>
          <TextField label="URL externe (si pas de fichier)" value={form.photo?.startsWith('data:') ? '' : (form.photo || '')} onChange={v => setForm(f => ({ ...f, photo: v }))} placeholder="https://… (optionnel)" hint="Laissez vide pour photo auto-générée" />
          <TextareaField label="Liens vidéo (un par ligne)" value={form.videos} onChange={v => setForm(f => ({ ...f, videos: v }))} placeholder={"https://youtube.com/watch?v=…\nhttps://…"} rows={3} hint="Highlights, clips de match, scouting" />
        </FormSection>

        <FormSection title="Notes & Performances" subtitle="Statistiques libres, bilan de saison">
          <TextareaField label="Notes de performance" value={form.bio} onChange={v => setForm(f => ({ ...f, bio: v }))} placeholder="Buts, passes, minutes jouées, bilan de saison, qualités techniques…" rows={4} maxLength={800} />
        </FormSection>
      </>
    );
  }

  // ── VUE LISTE ─────────────────────────────────────────────────────────────
  return (
    <div style={{ animation: 'fadeIn 0.18s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Scouting & Représentation</div>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Portfolio Athlètes</h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-2)', fontSize: '13.5px' }}>Gérez vos talents, analysez leur valeur marchande et suivez leurs contrats.</p>
        </div>
        <button onClick={openCreate} style={{ background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', padding: '11px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 4px 14px rgba(37,67,84,0.2)', fontSize: '13px' }}>
          <span>＋</span> Ajouter un talent
        </button>
      </div>

      <KpiStrip athletes={athletes} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-page)', padding: '4px', borderRadius: '8px', overflowX: 'auto' }}>
          {['Tous', ...POSTES].map(p => (
            <button key={p} onClick={() => setFilterPoste(p)} style={{ whiteSpace: 'nowrap', background: filterPoste === p ? 'var(--white)' : 'transparent', color: filterPoste === p ? 'var(--navy-deep)' : 'var(--text-3)', border: 'none', padding: '6px 12px', borderRadius: '5px', fontWeight: filterPoste === p ? 700 : 500, fontSize: '12px', cursor: 'pointer', boxShadow: filterPoste === p ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>{p}</button>
          ))}
        </div>
        <input type="text" placeholder="Rechercher (nom, club)..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: '1px solid var(--border-input)', borderRadius: '8px', padding: '9px 14px', fontSize: '13px', outline: 'none', minWidth: '200px' }} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={search || filterPoste !== 'Tous' ? 'Aucun athlète trouvé' : 'Portfolio vide'}
          description={search || filterPoste !== 'Tous' ? 'Modifiez vos filtres.' : 'Ajoutez votre premier talent pour démarrer le portfolio.'}
          actionLabel="Ajouter un talent" onAction={openCreate}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px' }}>
          {filtered.map(a => <ScoutingCard key={a.id} athlete={a} onSelect={setSelectedId} onDelete={handleDelete} />)}
        </div>
      )}

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editTarget ? 'Modifier la fiche athlète' : 'Ajouter un talent'} width="540px"
        footer={
          <>
            <button onClick={() => setIsDrawerOpen(false)} style={{ padding: '10px 18px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSave} style={{ padding: '10px 22px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>{editTarget ? 'Enregistrer les modifications' : 'Créer la fiche'}</button>
          </>
        }
      >
        {renderForm()}
      </Drawer>
    </div>
  );
}
