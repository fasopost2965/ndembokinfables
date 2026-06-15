import { useState, useRef } from 'react';
import { useCRM } from '../contexts/CRMContext';
import { useToast } from '../contexts/ToastContext';

function stripTags(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/<[^>]*>/g, '');
}

function sanitizeImported(value) {
  if (typeof value === 'string') return stripTags(value);
  if (Array.isArray(value)) return value.map(sanitizeImported);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = sanitizeImported(value[k]);
    return out;
  }
  return value;
}

const NAV = [
  { id: 'identite',   label: 'Logo & Identité' },
  { id: 'legal',      label: 'Informations légales' },
  { id: 'devises',    label: 'Devises & Taxes' },
  { id: 'documents',  label: 'Modèles de documents' },
  { id: 'email',      label: 'E-mail & Envois' },
  { id: 'sauvegarde', label: 'Sauvegarde & Restauration' },
];

const BRAND_COLORS = [
  { name: 'Slate Blue',    hex: '#254354' },
  { name: 'Rouge action',  hex: '#BC0000' },
  { name: 'Or vif',        hex: '#F4A800' },
  { name: 'Cyan data',     hex: '#1E9FD8' },
];

function InputField({ label, value, onChange, mono, type = 'text', placeholder = '' }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)' }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ height: '38px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px', fontFamily: mono ? 'var(--font-jetbrains)' : 'var(--font-open-sans)', outline: 'none', background: 'var(--white)', color: 'var(--text-1)', width: '100%', boxSizing: 'border-box' }}
      />
    </label>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{ width: '44px', height: '24px', borderRadius: '99px', background: checked ? 'var(--cyan)' : 'var(--border-input)', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}
    >
      <div style={{ width: '20px', height: '20px', borderRadius: '99px', background: 'var(--white)', position: 'absolute', top: '2px', left: checked ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: 'var(--font-oswald)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--navy-deep)', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
      {children}
    </div>
  );
}

export default function Parametres() {
  const { state, dispatch } = useCRM();
  const { company } = state;
  const addToast = useToast();
  const [activeSection, setActiveSection] = useState('identite');
  const [dirty, setDirty] = useState(false);
  const [restoreError, setRestoreError] = useState('');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ ...company });
  // When not dirty, read company from context directly so RESTORE_STATE is reflected immediately.
  const activeForm = dirty ? form : company;

  const set = (key) => (val) => {
    setForm(f => ({ ...(dirty ? f : company), [key]: val }));
    setDirty(true);
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_COMPANY', payload: activeForm });
    setDirty(false);
    addToast('Paramètres enregistrés avec succès !', 'success');
  };

  const handleCancel = () => {
    setDirty(false);
    addToast('Modifications annulées.');
  };

  const handleExport = () => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ndembo-crm-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Sauvegarde téléchargée avec succès !', 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        const required = ['clients', 'devis', 'factures', 'contrats'];
        const missing = required.filter(k => !Array.isArray(parsed[k]));
        if (missing.length > 0) {
          setRestoreError(`Fichier invalide — champs manquants : ${missing.join(', ')}`);
          addToast('Fichier de sauvegarde invalide.', 'error');
          return;
        }
        dispatch({ type: 'RESTORE_STATE', payload: sanitizeImported(parsed) });
        setRestoreError('');
        addToast('Données restaurées avec succès !', 'success');
      } catch {
        setRestoreError('Impossible de lire le fichier JSON.');
        addToast('Erreur de lecture du fichier.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{ animation: 'fadeIn 0.18s ease-out', paddingBottom: dirty ? '80px' : '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Système</div>
        <h1 style={{ fontSize: '30px', margin: 0 }}>Paramètres</h1>
        <p style={{ margin: '6px 0 0 0', color: 'var(--text-2)' }}>Identité, informations légales, devises et modèles de documents — appliqués à tous les devis, factures et contrats.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left nav */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', position: 'sticky', top: '80px' }}>
          {NAV.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '6px', background: activeSection === s.id ? 'var(--bg-page)' : 'transparent', border: 'none', fontWeight: activeSection === s.id ? 700 : 500, color: activeSection === s.id ? 'var(--navy-deep)' : 'var(--text-2)', cursor: 'pointer', fontSize: '13px', marginBottom: '2px', borderLeft: activeSection === s.id ? '3px solid var(--red)' : '3px solid transparent', transition: 'all 0.15s' }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── LOGO & IDENTITÉ ── */}
          {activeSection === 'identite' && (
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px' }}>
              <SectionTitle>Logo & Identité visuelle</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
                {/* Logo upload */}
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: '8px' }}>Logo officiel</div>
                  {activeForm.logoUrl ? (
                    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <img src={activeForm.logoUrl} alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '6px', border: '1px solid var(--border)' }} onError={e => e.target.style.display = 'none'} />
                      <div style={{ flex: 1, fontSize: '12px', color: 'var(--text-3)', wordBreak: 'break-all' }}>{activeForm.logoUrl.slice(0, 60)}{activeForm.logoUrl.length > 60 ? '…' : ''}</div>
                      <button onClick={() => { set('logoUrl')(''); setDirty(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontWeight: 700, fontSize: '12px' }}>Supprimer</button>
                    </div>
                  ) : null}
                  <InputField label="URL du logo (lien https:// ou base64)" value={activeForm.logoUrl || ''} onChange={v => { set('logoUrl')(v); setDirty(true); }} placeholder="https://votre-domaine.com/logo.png" />
                  <p style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '8px', lineHeight: 1.5 }}>Coller l'URL externe ou une data URI base64. Apparaît dans l'en-tête des contrats générés.</p>
                </div>

                {/* Brand colors */}
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: '12px' }}>Couleurs de la marque</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {BRAND_COLORS.map(c => (
                      <div key={c.hex} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: c.hex, flexShrink: 0 }}></div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '12.5px' }}>{c.name}</div>
                          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: 'var(--text-3)' }}>{c.hex}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '10px', lineHeight: 1.5 }}>Typographies : <strong>Oswald</strong> (titres), <strong>Open Sans</strong> (texte), <strong>JetBrains Mono</strong> (montants)</p>
                </div>
              </div>
            </div>
          )}

          {/* ── INFORMATIONS LÉGALES ── */}
          {activeSection === 'legal' && (
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px' }}>
              <SectionTitle>Informations légales</SectionTitle>
              <p style={{ fontSize: '12.5px', color: 'var(--text-2)', marginBottom: '24px', marginTop: '-10px' }}>Identification officielle utilisée pour la génération des contrats et la conformité fiscale (RDC).</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <InputField label="Dénomination sociale" value={activeForm.nom} onChange={set('nom')} placeholder="NDEMBO KIN CONNECT SARL" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <InputField label="RCCM" value={activeForm.rccm} onChange={set('rccm')} mono placeholder="CD/KIN/RCCM/23-B-0158" />
                  <InputField label="ID National" value={activeForm.idNat} onChange={set('idNat')} mono placeholder="01-83-N12345K" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <InputField label="NIF" value={activeForm.nif} onChange={set('nif')} mono placeholder="A1234567B" />
                  <InputField label="Téléphone & WhatsApp" value={activeForm.tel} onChange={set('tel')} mono placeholder="+243 810 188 880" />
                </div>
                <InputField label="Adresse du siège" value={activeForm.adresse} onChange={set('adresse')} placeholder="Av. Citroniers, Q/ Golf…" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <InputField label="Ville" value={activeForm.ville || ''} onChange={set('ville')} placeholder="Kinshasa" />
                  <InputField label="Pays" value={activeForm.pays || ''} onChange={set('pays')} placeholder="RDC" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <InputField label="Email de facturation" value={activeForm.email} onChange={set('email')} type="email" placeholder="contact@ndembokin.com" />
                  <InputField label="Site web" value={activeForm.siteWeb || ''} onChange={set('siteWeb')} placeholder="https://ndembokin.com" />
                </div>
              </div>
            </div>
          )}

          {/* ── DEVISES & TAXES ── */}
          {activeSection === 'devises' && (
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px' }}>
              <SectionTitle>Devises & Taxes</SectionTitle>
              <p style={{ fontSize: '12.5px', color: 'var(--text-2)', marginBottom: '24px', marginTop: '-10px' }}>Devise de référence et taux de conversion utilisés dans les documents générés.</p>

              {/* Currency selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {[
                  { code: 'USD', label: 'Dollar américain', symbol: '$' },
                  { code: 'CDF', label: 'Franc congolais', symbol: 'FC' },
                ].map(cur => (
                  <div key={cur.code} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', border: `2px solid ${cur.code === 'USD' ? 'var(--cyan)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', background: cur.code === 'USD' ? 'rgba(30,159,216,0.06)' : 'var(--white)' }}>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '12px', background: cur.code === 'USD' ? 'var(--cyan)' : 'var(--border)', color: cur.code === 'USD' ? 'var(--white)' : 'var(--text-2)', padding: '3px 7px', borderRadius: '4px' }}>{cur.code}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{cur.label}</span>
                    {cur.code === 'USD' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                ))}
              </div>

              {/* Taux */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <InputField label="1 USD = ? CDF" value={String(form.tauxUSD)} onChange={v => set('tauxUSD')(Number(v))} mono type="number" placeholder="2850" />
                <InputField label="Taux CDF/USD" value={String(form.tauxCDF)} onChange={v => set('tauxCDF')(Number(v))} mono type="number" placeholder="2850" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <InputField label="TVA applicable (%)" value={String(form.tva ?? 0)} onChange={v => set('tva')(Number(v))} mono type="number" placeholder="0" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)' }}>Aperçu</span>
                  <div style={{ height: '38px', display: 'flex', alignItems: 'center', fontSize: '13px', color: 'var(--text-2)', paddingLeft: '4px' }}>
                    {activeForm.tva > 0 ? `TVA ${activeForm.tva}% appliquée sur les documents` : 'Aucune TVA — montants HT uniquement'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-3)' }}>
                <span>Dernière mise à jour des taux : aujourd'hui, {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                <button onClick={() => addToast('Taux actualisés !')} style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.5 9A9 9 0 0 0 5.2 5.2L1 10M23 14l-4.2 4.8A9 9 0 0 1 3.5 15"/></svg>
                  Actualiser les taux
                </button>
              </div>
            </div>
          )}

          {/* ── MODÈLES DE DOCUMENTS ── */}
          {activeSection === 'documents' && (
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px' }}>
              <SectionTitle>Modèles de documents</SectionTitle>
              <p style={{ fontSize: '12.5px', color: 'var(--text-2)', marginBottom: '24px', marginTop: '-10px' }}>Numérotation automatique, conditions par défaut et modèles de contrat actifs.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <InputField label="Préfixe Devis" value={activeForm.prefixeDevis} onChange={set('prefixeDevis')} mono placeholder="DEV-2026-" />
                <InputField label="Préfixe Factures" value={activeForm.prefixeFactures} onChange={set('prefixeFactures')} mono placeholder="FAC-2026-" />
                <InputField label="Préfixe Contrats" value={activeForm.prefixeContrats} onChange={set('prefixeContrats')} mono placeholder="CTR-2026-" />
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)' }}>Conditions par défaut (Devis & Factures)</span>
                <textarea
                  value={activeForm.conditionsDefaut}
                  onChange={e => set('conditionsDefaut')(e.target.value)}
                  rows={3}
                  style={{ border: '1px solid var(--border-input)', borderRadius: '6px', padding: '10px 12px', fontSize: '13px', resize: 'vertical', outline: 'none', fontFamily: 'var(--font-open-sans)', lineHeight: 1.5 }}
                />
              </label>

              <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: '12px' }}>Modèles de contrat actifs</div>
              {[
                { key: 'tmplRepresentation', label: 'Représentation d\'athlète', detail: 'Mandat exclusif, commission, clause de sortie' },
                { key: 'tmplPrestation',     label: 'Prestation événementielle', detail: 'Tournois, camps d\'entraînement et stages' },
              ].map((t, i) => (
                <div key={t.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i === 0 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--navy-deep)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-oswald)', fontWeight: 700, fontSize: '13px' }}>{String.fromCharCode(65 + i)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{t.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>{t.detail}</div>
                    </div>
                  </div>
                  <Toggle checked={true} onChange={() => addToast('Modèles de contrat — disponible avec le backend')} />
                </div>
              ))}
            </div>
          )}

          {/* ── EMAIL & ENVOIS ── */}
          {activeSection === 'email' && (
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px' }}>
              <SectionTitle>E-mail & Envois</SectionTitle>
              <p style={{ fontSize: '12.5px', color: 'var(--text-2)', marginBottom: '24px', marginTop: '-10px' }}>Expéditeur, objet et signature appliqués à tout devis, facture ou contrat envoyé par email.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <InputField label="Nom d'expéditeur" value={activeForm.nomExpediteur} onChange={set('nomExpediteur')} placeholder="Ndembo Kin Connect SARL" />
                  <InputField label="Email d'expéditeur" value={activeForm.emailExpediteur} onChange={set('emailExpediteur')} type="email" placeholder="contact@ndembokin.com" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <InputField label="Copie (CC) automatique" value={activeForm.emailCC} onChange={set('emailCC')} type="email" placeholder="direction@ndembokin.com" />
                  <InputField label="Objet par défaut" value={activeForm.objetDefaut} onChange={set('objetDefaut')} placeholder="Votre document [REF] — Ndembo Kin Connect" />
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)' }}>Signature d'email</span>
                  <textarea
                    value={activeForm.signatureEmail}
                    onChange={e => set('signatureEmail')(e.target.value)}
                    rows={4}
                    style={{ border: '1px solid var(--border-input)', borderRadius: '6px', padding: '10px 12px', fontSize: '13px', resize: 'vertical', outline: 'none', fontFamily: 'var(--font-open-sans)', lineHeight: 1.5 }}
                  />
                </label>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>Joindre le PDF imprimable</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>Le document est joint automatiquement à chaque envoi.</div>
                  </div>
                  <Toggle checked={activeForm.joindrePDF} onChange={v => { set('joindrePDF')(v); setDirty(true); }} />
                </div>
              </div>
            </div>
          )}

          {/* ── SAUVEGARDE & RESTAURATION ── */}
          {activeSection === 'sauvegarde' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px' }}>
                <SectionTitle>Exporter les données</SectionTitle>
                <p style={{ fontSize: '12.5px', color: 'var(--text-2)', marginBottom: '20px', marginTop: '-10px', lineHeight: 1.6 }}>
                  Télécharge l'intégralité des données CRM au format JSON. Conservez ce fichier comme sauvegarde ou pour migrer vers un autre environnement.
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '16px', background: 'var(--bg-page)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(30,159,216,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '13.5px' }}>Sauvegarde complète JSON</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>
                      {Object.keys(state).filter(k => Array.isArray(state[k])).map(k => `${k} (${state[k].length})`).join(' · ')}
                    </div>
                  </div>
                  <button onClick={handleExport} style={{ padding: '9px 18px', background: 'var(--cyan)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', flexShrink: 0 }}>
                    ↓ Télécharger
                  </button>
                </div>
              </div>

              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px' }}>
                <SectionTitle>Restaurer une sauvegarde</SectionTitle>
                <p style={{ fontSize: '12.5px', color: 'var(--text-2)', marginBottom: '20px', marginTop: '-10px', lineHeight: 1.6 }}>
                  Sélectionnez un fichier JSON exporté depuis ce CRM. <strong style={{ color: 'var(--red)' }}>Attention :</strong> cette opération remplace toutes les données actuelles de manière irréversible.
                </p>
                <div style={{ padding: '20px', background: 'rgba(188,0,13,0.04)', border: '1px dashed var(--red)', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>📂</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Sélectionner un fichier .json</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '16px' }}>Le fichier doit contenir les clés : clients, devis, factures, contrats</div>
                  <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleImport} style={{ display: 'none' }} id="restore-file-input" />
                  <label htmlFor="restore-file-input" style={{ display: 'inline-block', padding: '9px 20px', background: 'var(--red)', color: 'var(--white)', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                    Choisir un fichier
                  </label>
                  {restoreError && <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--red)', fontWeight: 600 }}>{restoreError}</div>}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Sticky save bar */}
      {dirty && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--white)', borderTop: '1px solid var(--border)', padding: '14px 32px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', zIndex: 100, boxShadow: '0 -4px 16px rgba(9,29,46,0.08)' }}>
          <span style={{ marginRight: 'auto', fontSize: '12.5px', color: 'var(--text-2)' }}>Modifications non enregistrées</span>
          <button onClick={handleCancel} style={{ padding: '9px 20px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer', fontSize: '13px' }}>Annuler</button>
          <button onClick={handleSave} style={{ padding: '9px 24px', background: 'var(--red)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Enregistrer les modifications</button>
        </div>
      )}
    </div>
  );
}
