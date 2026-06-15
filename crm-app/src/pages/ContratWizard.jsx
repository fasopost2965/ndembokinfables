import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../contexts/CRMContext';
import { useToast } from '../contexts/ToastContext';
import { nextNumero, fmtUsd, escHtml } from '../crm-data';
import { FormSection, TextField, TextareaField, AmountField, DateField, TypeCards, EntitySelector, SliderField } from '../components/ui/FormControls';

/* ─── helpers ──────────────────────────────────────────────────────────── */
const today = () => new Date().toISOString().slice(0, 10);
const addMonths = (n) => {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
};
const dateFr = (iso) => {
  if (!iso) return '___________';
  const [y, m, d] = iso.split('-');
  const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  return `${parseInt(d)} ${MOIS[parseInt(m) - 1]} ${y}`;
};

const nl2br = (s) => escHtml(s).split('\n').join('<br/>');

const STEPS = [
  { id: 1, label: 'Parties', icon: '👥' },
  { id: 2, label: 'Conditions', icon: '💰' },
  { id: 3, label: 'Clauses', icon: '📋' },
  { id: 4, label: 'Finaliser', icon: '✍️' },
];

/* ─── Générateur de document contractuel ───────────────────────────────── */
function buildContractHTML(form, partyName, company) {
  const agencyName = company?.nom || 'NDÉMBO KIN SPORTS MANAGEMENT';
  const agencyAddress = company?.adresse || 'Av. de la Justice, Gombe, Kinshasa, RDC';

  const CHIFFRES_ROMAINS = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
  const articlesSuppl = (form.articlesAdditionnels || []).filter(a => a.titre || a.contenu);
  const articleSupplHTML = articlesSuppl.map((art, i) => `
<h2 style="font-size:12px;font-weight:700;color:#254354;text-transform:uppercase;border-left:3px solid #F4A800;padding-left:10px;margin:20px 0 8px">
  Disposition ${CHIFFRES_ROMAINS[i] || (i+1)} — ${escHtml(art.titre || 'Disposition additionnelle')}
</h2>
<p style="font-size:11px;color:#42474c;line-height:1.7;">${nl2br(art.contenu || '')}</p>
`).join('');

  if (form.type === 'Représentation') {
    return `
<h1 style="text-align:center;font-family:Oswald,sans-serif;font-size:18px;letter-spacing:0.05em;color:#254354;text-transform:uppercase;border-bottom:2px solid #bc000d;padding-bottom:10px;margin-bottom:20px">
  Contrat de Représentation Sportive
</h1>
<p style="font-size:11px;color:#42474c;line-height:1.7;">
  Entre les soussignés :<br/><br/>
  <strong style="color:#254354">${escHtml(agencyName)}</strong>, agence de management sportif, dont le siège est établi à ${escHtml(agencyAddress)}, ci-après dénommée <em>« l'Agence »</em>
  <br/><br/>
  et <strong style="color:#254354">${escHtml(partyName) || '___________'}</strong>, ci-après dénommé(e) <em>« l'Athlète »</em>.
</p>

<div style="background:#f0f4f8;border-left:4px solid #254354;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
    <div><p style="font-size:9px;font-weight:700;text-transform:uppercase;color:#72787c;letter-spacing:0.1em;margin:0 0 3px">Date d'effet</p><p style="font-size:12px;font-weight:700;color:#254354;margin:0">${dateFr(form.dateDebut)}</p></div>
    <div><p style="font-size:9px;font-weight:700;text-transform:uppercase;color:#72787c;letter-spacing:0.1em;margin:0 0 3px">Durée</p><p style="font-size:12px;font-weight:700;color:#254354;margin:0">${form.duree || '12'} mois — jusqu'au ${dateFr(form.dateFin)}</p></div>
  </div>
</div>

<h2 style="font-size:12px;font-weight:700;color:#254354;text-transform:uppercase;border-left:3px solid #1E9FD8;padding-left:10px;margin:20px 0 8px">Article 1 — Objet</h2>
<p style="font-size:11px;color:#42474c;line-height:1.7;">L'Athlète confie à l'Agence, qui accepte, le mandat exclusif de représentation, de négociation et de placement dans le cadre de sa carrière sportive professionnelle, notamment pour toute négociation de transfert, renouvellement de contrat ou contrat d'image.</p>

<h2 style="font-size:12px;font-weight:700;color:#254354;text-transform:uppercase;border-left:3px solid #1E9FD8;padding-left:10px;margin:20px 0 8px">Article 2 — Commission d'agence</h2>
<p style="font-size:11px;color:#42474c;line-height:1.7;">En contrepartie de ses services, l'Agence percevra une commission de <strong style="background:#ffeaa0;padding:1px 4px;border-radius:2px">${form.commissionAgence || '15'}%</strong> sur la totalité des revenus bruts générés par les contrats négociés pendant la durée du présent accord.</p>

<h2 style="font-size:12px;font-weight:700;color:#254354;text-transform:uppercase;border-left:3px solid #1E9FD8;padding-left:10px;margin:20px 0 8px">Article 3 — Valeur & Clause de résiliation</h2>
<p style="font-size:11px;color:#42474c;line-height:1.7;">
  La valeur contractuelle de référence est estimée à <strong style="color:#254354;font-family:monospace">${fmtUsd(Number(form.valeur) || 0)}</strong>.
  ${form.clauseType === 'fixe'
    ? `En cas de résiliation anticipée, une indemnité fixe de <strong style="background:#ffdad5;padding:1px 4px;border-radius:2px;font-family:monospace">${fmtUsd(Number(form.clauseValeur) || 0)}</strong> est due à l'Agence.`
    : `En cas de transfert ou résiliation, une indemnité correspondant à <strong style="background:#ffdad5;padding:1px 4px;border-radius:2px">${escHtml(form.clauseValeur || '__')}%</strong> de la valeur du transfert est due à l'Agence.`
  }
</p>

${form.bonusPerformance ? `<h2 style="font-size:12px;font-weight:700;color:#254354;text-transform:uppercase;border-left:3px solid #1E9FD8;padding-left:10px;margin:20px 0 8px">Article 4 — Bonus de performance</h2>
<p style="font-size:11px;color:#42474c;line-height:1.7;">${nl2br(form.bonusPerformance)}</p>` : ''}

${form.clausesSpeciales ? `<h2 style="font-size:12px;font-weight:700;color:#254354;text-transform:uppercase;border-left:3px solid #1E9FD8;padding-left:10px;margin:20px 0 8px">Article — Clauses particulières</h2>
<p style="font-size:11px;color:#42474c;line-height:1.7;">${nl2br(form.clausesSpeciales)}</p>` : ''}

${articleSupplHTML}
    `;
  }

  if (form.type === 'Sponsoring') {
    return `
<h1 style="text-align:center;font-family:Oswald,sans-serif;font-size:18px;letter-spacing:0.05em;color:#254354;text-transform:uppercase;border-bottom:2px solid #bc000d;padding-bottom:10px;margin-bottom:20px">
  Accord de Partenariat & Sponsoring
</h1>
<p style="font-size:11px;color:#42474c;line-height:1.7;">
  Entre les soussignés :<br/><br/>
  <strong style="color:#254354">${escHtml(agencyName)}</strong>, représentant ses athlètes, ci-après <em>« l'Agence »</em>
  <br/><br/>
  et <strong style="color:#254354">${escHtml(partyName) || '___________'}</strong>, ci-après dénommé(e) <em>« le Partenaire »</em>.
</p>

<div style="background:#f0f4f8;border-left:4px solid #F4A800;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
    <div><p style="font-size:9px;font-weight:700;text-transform:uppercase;color:#72787c;letter-spacing:0.1em;margin:0 0 3px">Début du partenariat</p><p style="font-size:12px;font-weight:700;color:#254354;margin:0">${dateFr(form.dateDebut)}</p></div>
    <div><p style="font-size:9px;font-weight:700;text-transform:uppercase;color:#72787c;letter-spacing:0.1em;margin:0 0 3px">Budget alloué</p><p style="font-size:12px;font-weight:700;color:#254354;font-family:monospace;margin:0">${fmtUsd(Number(form.valeur) || 0)}</p></div>
  </div>
</div>

<h2 style="font-size:12px;font-weight:700;color:#254354;text-transform:uppercase;border-left:3px solid #1E9FD8;padding-left:10px;margin:20px 0 8px">Article 1 — Objet du partenariat</h2>
<p style="font-size:11px;color:#42474c;line-height:1.7;">Le Partenaire s'engage à financer et soutenir les activités sportives portées par l'Agence dans le cadre d'un accord de ${form.exclusivite ? '<strong>partenariat EXCLUSIF</strong>' : 'partenariat non-exclusif'} d'une durée de <strong>${form.duree || '12'} mois</strong>.</p>

<h2 style="font-size:12px;font-weight:700;color:#254354;text-transform:uppercase;border-left:3px solid #1E9FD8;padding-left:10px;margin:20px 0 8px">Article 2 — Contreparties & Activations</h2>
<p style="font-size:11px;color:#42474c;line-height:1.7;">${nl2br(form.typeActivation) || 'Les contreparties comprennent la visibilité logo sur les tenues officielles, la présence digitale sur les réseaux et la présence physique lors des événements organisés.'}</p>

${form.clausesSpeciales ? `<h2 style="font-size:12px;font-weight:700;color:#254354;text-transform:uppercase;border-left:3px solid #1E9FD8;padding-left:10px;margin:20px 0 8px">Article — Clauses particulières</h2>
<p style="font-size:11px;color:#42474c;line-height:1.7;">${nl2br(form.clausesSpeciales)}</p>` : ''}

${articleSupplHTML}
    `;
  }

  // Prestation
  return `
<h1 style="text-align:center;font-family:Oswald,sans-serif;font-size:18px;letter-spacing:0.05em;color:#254354;text-transform:uppercase;border-bottom:2px solid #bc000d;padding-bottom:10px;margin-bottom:20px">
  Contrat de Prestation de Services
</h1>
<p style="font-size:11px;color:#42474c;line-height:1.7;">
  Entre les soussignés :<br/><br/>
  <strong style="color:#254354">${escHtml(agencyName)}</strong>, prestataire de services sportifs, ci-après <em>« le Prestataire »</em>
  <br/><br/>
  et <strong style="color:#254354">${escHtml(partyName) || '___________'}</strong>, ci-après dénommé(e) <em>« le Client »</em>.
</p>

<div style="background:#f0f4f8;border-left:4px solid #254354;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
    <div><p style="font-size:9px;font-weight:700;text-transform:uppercase;color:#72787c;letter-spacing:0.1em;margin:0 0 3px">Date de début</p><p style="font-size:12px;font-weight:700;color:#254354;margin:0">${dateFr(form.dateDebut)}</p></div>
    <div><p style="font-size:9px;font-weight:700;text-transform:uppercase;color:#72787c;letter-spacing:0.1em;margin:0 0 3px">Honoraires</p><p style="font-size:12px;font-weight:700;color:#254354;font-family:monospace;margin:0">${fmtUsd(Number(form.valeur) || 0)}</p></div>
  </div>
</div>

<h2 style="font-size:12px;font-weight:700;color:#254354;text-transform:uppercase;border-left:3px solid #1E9FD8;padding-left:10px;margin:20px 0 8px">Article 1 — Objet</h2>
<p style="font-size:11px;color:#42474c;line-height:1.7;">${nl2br(form.objetPrestation) || "Le Prestataire s'engage à fournir les services définis ci-après dans les conditions et modalités prévues au présent contrat."}</p>

<h2 style="font-size:12px;font-weight:700;color:#254354;text-transform:uppercase;border-left:3px solid #1E9FD8;padding-left:10px;margin:20px 0 8px">Article 2 — Honoraires & Paiement</h2>
<p style="font-size:11px;color:#42474c;line-height:1.7;">Les honoraires convenus s'élèvent à <strong style="font-family:monospace;background:#ffeaa0;padding:1px 4px">${fmtUsd(Number(form.valeur) || 0)}</strong> pour l'ensemble de la prestation, payables selon les modalités convenues entre les parties.</p>

${form.clausesSpeciales ? `<h2 style="font-size:12px;font-weight:700;color:#254354;text-transform:uppercase;border-left:3px solid #1E9FD8;padding-left:10px;margin:20px 0 8px">Article — Clauses particulières</h2>
<p style="font-size:11px;color:#42474c;line-height:1.7;">${nl2br(form.clausesSpeciales)}</p>` : ''}

${articleSupplHTML}
  `;
}

/* ─── Step indicator ───────────────────────────────────────────────────── */
function StepBar({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '28px' }}>
      {STEPS.map((s, i) => {
        const done = s.id < current;
        const active = s.id === current;
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: done ? 'var(--success)' : active ? 'var(--navy-deep)' : 'var(--bg-page)', border: `2px solid ${done ? 'var(--success)' : active ? 'var(--navy-deep)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: done ? '14px' : '15px', color: done || active ? 'var(--white)' : 'var(--text-3)', fontWeight: 700, transition: 'all 0.2s', flexShrink: 0 }}>
                {done ? '✓' : s.icon}
              </div>
              <span style={{ fontSize: '10px', fontWeight: active ? 700 : 500, color: active ? 'var(--navy-deep)' : done ? 'var(--success)' : 'var(--text-3)', whiteSpace: 'nowrap' }}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: done ? 'var(--success)' : 'var(--border)', margin: '0 6px', marginBottom: '18px', transition: 'background 0.2s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Contract Preview ─────────────────────────────────────────────────── */
function ContractPreview({ form, partyName, company }) {
  const body = buildContractHTML(form, partyName, company);
  const ref = form.ref || 'NK-' + new Date().getFullYear() + '-DRAFT';
  const agencyName = company?.nom || 'NDÉMBO KIN SPORTS MANAGEMENT';
  const agencyAddress = company?.adresse || 'Av. de la Justice, Gombe, Kinshasa, RDC';

  return (
    <div id="contract-print-area" style={{ background: 'var(--white)', minHeight: '900px', padding: '48px 52px', fontFamily: "'Open Sans', sans-serif", boxShadow: '0 10px 40px rgba(37,67,84,0.12)', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #bc000d', paddingBottom: '20px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {company?.logoUrl
            ? <img src={company.logoUrl} alt={agencyName} style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e8e8e8' }} />
            : <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: '#254354', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '18px', color: 'white' }}>NK</span>
              </div>
          }
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '18px', color: '#254354', letterSpacing: '0.04em' }}>{agencyName}</div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#72787c', textTransform: 'uppercase', letterSpacing: '0.18em', marginTop: '2px' }}>Sports Management Agency</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '11px', color: '#254354' }}>{ref}</div>
          <div style={{ fontSize: '10px', color: '#72787c', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{dateFr(form.dateDebut || today())}</div>
          <div style={{ display: 'inline-block', marginTop: '6px', padding: '2px 8px', borderRadius: '3px', fontSize: '9px', fontWeight: 700, background: form.statut === 'Signé' ? 'rgba(23,126,84,0.12)' : 'rgba(188,0,13,0.08)', color: form.statut === 'Signé' ? '#177E54' : '#bc000d', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {form.statut || 'Brouillon'}
          </div>
        </div>
      </div>

      {/* Body */}
      <div dangerouslySetInnerHTML={{ __html: body }} />

      {/* Signature block */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginTop: '60px', paddingTop: '28px', borderTop: '1px solid #c2c7cc' }}>
        {[
          { role: "Représentant de l'Agence", name: agencyName, status: 'Signé électroniquement' },
          { role: partyName ? (form.partyType === 'athlete' ? "L'Athlète" : "Le Client") : 'Co-contractant', name: partyName || '___________', status: 'En attente de signature' },
        ].map((sig, i) => (
          <div key={i}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#72787c', textAlign: 'center', marginBottom: '20px' }}>{sig.role}</div>
            <div style={{ borderBottom: '1px dashed #c2c7cc', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#c2c7cc', fontStyle: 'italic' }}>{sig.status}</span>
            </div>
            <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#254354' }}>{sig.name}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '40px', paddingTop: '14px', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', opacity: 0.5 }}>
        <span style={{ fontSize: '9px', color: '#72787c' }}>{agencyAddress}</span>
        <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#72787c' }}>Page 1 / 1</span>
      </div>
    </div>
  );
}

/* ─── Main wizard ──────────────────────────────────────────────────────── */
const EMPTY = {
  type: 'Représentation',
  partyType: 'athlete',
  partyId: '',
  valeur: '',
  commissionAgence: '15',
  duree: '12',
  dateDebut: today(),
  dateFin: addMonths(12),
  clauseType: 'fixe',
  clauseValeur: '',
  bonusPerformance: '',
  exclusivite: false,
  typeActivation: '',
  objetPrestation: '',
  clausesSpeciales: '',
  articlesAdditionnels: [],
  statut: 'Brouillon',
  ref: '',
};

export default function ContratWizard() {
  const navigate = useNavigate();
  const { state: { contrats, clients, athletes, company }, dispatch } = useCRM();
  const addToast = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const partyOptions = useMemo(() => {
    if (form.partyType === 'athlete') return athletes.map(a => ({ id: a.id, nom: a.nom, type: a.poste || 'Athlète', ville: a.club || '' }));
    return clients.map(c => ({ id: c.id, nom: c.nom, type: c.type || 'B2B', ville: c.ville || '' }));
  }, [form.partyType, athletes, clients]);

  const partyName = useMemo(() => {
    if (!form.partyId) return '';
    const all = [...athletes, ...clients];
    const found = all.find(e => String(e.id) === String(form.partyId));
    return found ? found.nom : '';
  }, [form.partyId, athletes, clients]);

  const canNext = () => {
    if (step === 1) return !!form.partyId;
    if (step === 2) return !!form.valeur && Number(form.valeur) > 0 && !!form.dateDebut;
    return true;
  };

  const handleDurationChange = (mois) => {
    const d = new Date(form.dateDebut || today());
    d.setMonth(d.getMonth() + Number(mois));
    set('duree', mois);
    set('dateFin', d.toISOString().slice(0, 10));
  };

  const handleDateDebutChange = (v) => {
    const d = new Date(v);
    d.setMonth(d.getMonth() + Number(form.duree || 12));
    set('dateDebut', v);
    set('dateFin', d.toISOString().slice(0, 10));
  };

  const handleSave = () => {
    const nextRef = nextNumero('CTR-', new Date().getFullYear(), contrats.map(c => c.ref));
    dispatch({
      type: 'ADD_CONTRAT',
      payload: {
        ref: nextRef,
        clientId: Number(form.partyId),
        type: form.type,
        valeur: Number(form.valeur),
        statut: form.statut,
        dateDebut: form.dateDebut,
        expire: form.dateFin,
        commissionAgence: form.commissionAgence,
        clauseType: form.clauseType,
        clauseValeur: form.clauseValeur,
        bonusPerformance: form.bonusPerformance,
        clausesSpeciales: form.clausesSpeciales,
      },
    });
    if (form.partyType === 'athlete' && form.type === 'Représentation') {
      const a = athletes.find(a => a.id === Number(form.partyId));
      if (a) dispatch({ type: 'UPDATE_ATHLETE', payload: { ...a, contractRef: nextRef } });
    }
    addToast(`Contrat ${nextRef} créé avec succès !`);
    navigate('/contrats');
  };

  const handlePrint = () => {
    const el = document.getElementById('contract-print-area');
    if (!el) return;
    const docRef = form.ref || ('CTR-' + new Date().getFullYear() + '-DRAFT');
    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(`<!DOCTYPE html><html lang="fr"><head>
      <meta charset="UTF-8"/>
      <title>${docRef} — Ndembo Kin Connect</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet"/>
      <style>
        *{box-sizing:border-box;margin:0;padding:0;}
        body{margin:0;padding:28px 36px;background:#fff;font-family:'Open Sans',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
        @media print{body{padding:0;}@page{margin:14mm 16mm;size:A4;}}
      </style>
    </head><body>${el.outerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/contrats')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, padding: '6px 10px', borderRadius: '6px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-page)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Retour
          </button>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy-deep)' }}>Générateur de contrat</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-3)' }}>Wizard guidé — étape {step}/{STEPS.length}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {step === 4 && (
            <button onClick={handlePrint} style={{ padding: '8px 14px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-2)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
              Imprimer / PDF
            </button>
          )}
          {step < 4 ? (
            <button onClick={() => canNext() && setStep(s => s + 1)} disabled={!canNext()}
              style={{ padding: '8px 20px', background: canNext() ? 'var(--navy-deep)' : 'var(--border)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: canNext() ? 'pointer' : 'not-allowed', fontSize: '13px' }}>
              Suivant →
            </button>
          ) : (
            <button onClick={handleSave} style={{ padding: '8px 20px', background: 'var(--success)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
              Enregistrer le contrat
            </button>
          )}
        </div>
      </div>

      {/* Body: 2 cols */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '0', minHeight: 'calc(100vh - 61px)' }}>

        {/* ─ LEFT: Wizard form ─ */}
        <div style={{ background: 'var(--white)', borderRight: '1px solid var(--border)', padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0' }}>
          <StepBar current={step} />

          {/* ── Step 1: Parties ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.2s ease-out' }}>
              <FormSection title="Type de contrat" subtitle="Quel type d'accord souhaitez-vous formaliser ?">
                <TypeCards label="" value={form.type} onChange={v => set('type', v)} options={[
                  { value: 'Représentation', label: 'Représentation', icon: '🤝', color: 'var(--cyan)', bg: 'rgba(30,159,216,0.08)' },
                  { value: 'Sponsoring', label: 'Sponsoring', icon: '💼', color: '#F4A800', bg: 'rgba(244,168,0,0.1)' },
                  { value: 'Prestation', label: 'Prestation', icon: '🎯', color: 'var(--navy-mid)', bg: 'rgba(37,67,84,0.08)' },
                ]} />
              </FormSection>
              <FormSection title="Partie contractante" subtitle="Avec qui ce contrat est-il conclu ?">
                <TypeCards label="Type de partie" value={form.partyType} onChange={v => { set('partyType', v); set('partyId', ''); }} options={[
                  { value: 'athlete', label: 'Athlète', icon: '⚽', color: 'var(--cyan)', bg: 'rgba(30,159,216,0.08)' },
                  { value: 'client', label: 'Client B2B', icon: '🏢', color: 'var(--navy-mid)', bg: 'rgba(37,67,84,0.08)' },
                ]} />
                <EntitySelector
                  label={form.partyType === 'athlete' ? 'Sélectionner un athlète' : 'Sélectionner un client'}
                  value={form.partyId} onChange={v => set('partyId', v)}
                  options={partyOptions} required
                  placeholder={`Rechercher ${form.partyType === 'athlete' ? 'un athlète' : 'un client'}…`}
                />
              </FormSection>

              {!form.partyId && (
                <div style={{ padding: '14px', background: 'rgba(30,159,216,0.06)', borderRadius: '8px', border: '1px solid rgba(30,159,216,0.2)', fontSize: '12.5px', color: 'var(--cyan)' }}>
                  Sélectionnez une partie contractante pour continuer.
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Conditions financières ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.2s ease-out' }}>
              <FormSection title="Valeur contractuelle" subtitle="Montant et commission de l'agence">
                <AmountField label="Valeur totale du contrat" value={form.valeur} onChange={v => set('valeur', v)} required hint="Valeur de référence en USD" />
                {form.type === 'Représentation' && (
                  <div>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: '8px' }}>Commission agence ({form.commissionAgence}%)</div>
                    <SliderField label="" value={Number(form.commissionAgence)} onChange={v => set('commissionAgence', String(v))} min={5} max={30} step={1} hint={`Soit ${fmtUsd(Number(form.valeur) * Number(form.commissionAgence) / 100)} sur ce contrat`} />
                  </div>
                )}
              </FormSection>

              <FormSection title="Durée" subtitle="Période d'engagement">
                <DateField label="Date de prise d'effet" value={form.dateDebut} onChange={handleDateDebutChange} required />
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: '8px' }}>Durée du contrat</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['3', '6', '12', '18', '24', '36'].map(m => (
                      <button key={m} type="button" onClick={() => handleDurationChange(m)}
                        style={{ padding: '6px 14px', borderRadius: '6px', border: `2px solid ${form.duree === m ? 'var(--navy-deep)' : 'var(--border)'}`, background: form.duree === m ? 'var(--navy-deep)' : 'var(--white)', color: form.duree === m ? 'var(--white)' : 'var(--text-2)', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                        {m} mois
                      </button>
                    ))}
                  </div>
                </div>
                {form.dateFin && (
                  <div style={{ fontSize: '11.5px', color: 'var(--text-3)', padding: '8px 12px', background: 'var(--bg-page)', borderRadius: '5px' }}>
                    Expiration : <strong>{dateFr(form.dateFin)}</strong>
                  </div>
                )}
              </FormSection>
            </div>
          )}

          {/* ── Step 3: Clauses spécifiques ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.2s ease-out' }}>
              {form.type === 'Représentation' && (
                <>
                  <FormSection title="Clause de résiliation" subtitle="Type d'indemnité en cas de rupture anticipée">
                    <div style={{ padding: '12px 14px', background: 'var(--bg-page)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12.5px', color: 'var(--text-2)', fontStyle: 'italic', marginBottom: '4px' }}>
                      "Ce contrat comprend-il une clause de rachat fixe ou proportionnelle au transfert ?"
                    </div>
                    <TypeCards label="" value={form.clauseType} onChange={v => set('clauseType', v)} options={[
                      { value: 'fixe', label: 'Indemnité fixe (USD)', icon: '💰', color: 'var(--navy-deep)', bg: 'rgba(37,67,84,0.08)' },
                      { value: 'pourcentage', label: 'Pourcentage transfert', icon: '📊', color: 'var(--gold)', bg: 'rgba(244,168,0,0.08)' },
                    ]} />
                    {form.clauseType === 'fixe'
                      ? <AmountField label="Montant de l'indemnité fixe" value={form.clauseValeur} onChange={v => set('clauseValeur', v)} />
                      : <TextField label="Pourcentage (%)" value={form.clauseValeur} onChange={v => set('clauseValeur', v)} type="number" placeholder="Ex. 20" hint="% de la valeur du transfert brut" />
                    }
                  </FormSection>
                  <FormSection title="Bonus de performance (optionnel)">
                    <TextareaField label="Conditions des bonus" value={form.bonusPerformance} onChange={v => set('bonusPerformance', v)} placeholder="Ex. Bonus de 5 000 $ par but marqué en compétition officielle, plafond 50 000 $ / saison." rows={3} maxLength={400} />
                  </FormSection>
                </>
              )}

              {form.type === 'Sponsoring' && (
                <>
                  <FormSection title="Exclusivité" subtitle="Ce partenariat est-il exclusif ?">
                    <TypeCards label="" value={form.exclusivite ? 'oui' : 'non'} onChange={v => set('exclusivite', v === 'oui')} options={[
                      { value: 'non', label: 'Non-exclusif', icon: '🔓', color: 'var(--text-2)', bg: 'var(--bg-page)' },
                      { value: 'oui', label: 'Exclusif', icon: '🔒', color: 'var(--red)', bg: 'rgba(188,0,13,0.06)' },
                    ]} />
                  </FormSection>
                  <FormSection title="Contreparties & activations">
                    <TextareaField label="Détail des activations" value={form.typeActivation} onChange={v => set('typeActivation', v)} placeholder="Ex. Logo sur tenues, présence digitale, naming d'un tournoi, hospitalité VIP lors des matchs…" rows={4} maxLength={500} />
                  </FormSection>
                </>
              )}

              {form.type === 'Prestation' && (
                <FormSection title="Objet de la prestation" subtitle="Décrivez précisément les services fournis">
                  <TextareaField label="Description des prestations" value={form.objetPrestation} onChange={v => set('objetPrestation', v)} placeholder="Ex. Organisation et gestion complète du tournoi, incluant la logistique, l'arbitrage, la communication…" rows={5} maxLength={600} required />
                </FormSection>
              )}

              <FormSection title="Clauses particulières (optionnel)">
                <TextareaField label="Dispositions additionnelles" value={form.clausesSpeciales} onChange={v => set('clausesSpeciales', v)} placeholder="Toute clause spéciale non couverte par les articles précédents…" rows={3} maxLength={600} />
              </FormSection>

              <FormSection title="Articles supplémentaires" subtitle="Dispositions personnalisées ajoutées au document">
                {(form.articlesAdditionnels || []).map((art, i) => (
                  <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 16px', marginBottom: '10px', position: 'relative' }}>
                    <button
                      onClick={() => set('articlesAdditionnels', form.articlesAdditionnels.filter((_, j) => j !== i))}
                      style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '18px', lineHeight: 1, padding: '2px 6px' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                      title="Supprimer cet article">×</button>
                    <TextField
                      label={`Disposition ${{0:'I',1:'II',2:'III',3:'IV',4:'V',5:'VI',6:'VII'}[i] || i+1} — Titre`}
                      value={art.titre}
                      onChange={v => set('articlesAdditionnels', form.articlesAdditionnels.map((a, j) => j === i ? { ...a, titre: v } : a))}
                      placeholder="Ex. Clause de confidentialité, Arbitrage, Droit applicable…"
                      maxLength={100}
                    />
                    <TextareaField
                      label="Contenu"
                      value={art.contenu}
                      onChange={v => set('articlesAdditionnels', form.articlesAdditionnels.map((a, j) => j === i ? { ...a, contenu: v } : a))}
                      placeholder="Rédigez le texte de cette disposition. Appuyez sur Entrée pour aller à la ligne."
                      rows={4}
                      maxLength={1000}
                    />
                  </div>
                ))}
                <button
                  onClick={() => set('articlesAdditionnels', [...(form.articlesAdditionnels || []), { titre: '', contenu: '' }])}
                  style={{ width: '100%', padding: '10px', border: '1px dashed var(--border-input)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', color: 'var(--cyan)', fontWeight: 700, fontSize: '12px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,159,216,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  + Ajouter une disposition
                </button>
              </FormSection>
            </div>
          )}

          {/* ── Step 4: Finaliser ── */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.2s ease-out' }}>
              <FormSection title="Statut du contrat" subtitle="Définir l'état actuel du document">
                <TypeCards label="" value={form.statut} onChange={v => set('statut', v)} options={[
                  { value: 'Brouillon', label: 'Brouillon', icon: '✏️', color: 'var(--text-2)', bg: 'var(--bg-page)' },
                  { value: 'Signé', label: 'Signé', icon: '✅', color: 'var(--success)', bg: 'rgba(23,126,84,0.08)' },
                ]} />
              </FormSection>

              {/* Summary card */}
              <div style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: '4px' }}>Récapitulatif complet</div>
                {[
                  { label: 'Type', value: form.type },
                  { label: form.partyType === 'athlete' ? 'Athlète' : 'Client', value: partyName || '—' },
                  { label: 'Valeur', value: fmtUsd(Number(form.valeur) || 0), mono: true },
                  form.type === 'Représentation' && { label: 'Commission agence', value: form.commissionAgence + '%' },
                  { label: 'Durée', value: form.duree + ' mois' },
                  { label: 'Expiration', value: dateFr(form.dateFin) },
                  { label: 'Statut', value: form.statut },
                ].filter(Boolean).map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-3)' }}>{r.label}</span>
                    <span style={{ fontWeight: 700, fontFamily: r.mono ? 'var(--font-jetbrains)' : 'inherit', color: 'var(--navy-deep)' }}>{r.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(23,126,84,0.06)', border: '1px solid rgba(23,126,84,0.2)', borderRadius: '8px', padding: '14px', fontSize: '12.5px', color: 'var(--success)' }}>
                ✓ Le contrat sera enregistré dans le module Contrats et lié à la partie sélectionnée.
              </div>
            </div>
          )}

          {/* Navigation footer */}
          <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', gap: '10px' }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-input)', borderRadius: '6px', background: 'var(--white)', fontWeight: 700, cursor: 'pointer', color: 'var(--text-2)' }}>
                ← Précédent
              </button>
            )}
            {step < 4 && (
              <button onClick={() => canNext() && setStep(s => s + 1)} disabled={!canNext()}
                style={{ flex: 2, padding: '10px', background: canNext() ? 'var(--navy-deep)' : 'var(--border)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: canNext() ? 'pointer' : 'not-allowed' }}>
                Étape suivante →
              </button>
            )}
            {step === 4 && (
              <button onClick={handleSave} style={{ flex: 2, padding: '10px', background: 'var(--success)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                ✓ Enregistrer le contrat
              </button>
            )}
          </div>
        </div>

        {/* ─ RIGHT: Live preview ─ */}
        <div style={{ background: '#e8edf2', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Preview toolbar */}
          <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)' }}>
              Aperçu du document
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handlePrint} style={{ padding: '5px 12px', border: '1px solid var(--border-input)', borderRadius: '5px', background: 'var(--white)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
                PDF
              </button>
            </div>
          </div>

          {/* Document area */}
          <div style={{ flex: 1, padding: '28px 32px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '700px' }}>
              <ContractPreview form={form} partyName={partyName} company={company} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
