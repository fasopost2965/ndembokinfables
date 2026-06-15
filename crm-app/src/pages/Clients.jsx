import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TYPE_QUALITE, fmtUsd } from '../crm-data';
import { useCRM } from '../contexts/CRMContext';
import Drawer from '../components/ui/Drawer';
import { useToast } from '../contexts/ToastContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { FormSection, FormRow, TextField, SelectField, TextareaField, ValidationSummary } from '../components/ui/FormControls';
import ActivityTimeline from '../components/activities/ActivityTimeline';

const TYPE_COLORS = {
  'Sponsor':     { bg: 'rgba(23,126,84,0.12)',  color: '#177E54' },
  'Académie':    { bg: 'rgba(244,168,0,0.16)',  color: '#9A6B00' },
  'Club':        { bg: 'rgba(30,159,216,0.14)', color: '#1E78A8' },
  'Institution': { bg: 'rgba(37,67,84,0.10)',   color: '#42474C' },
};

const EMPTY_FORM = {
  nom: '', type: 'Club', email: '', tel: '',
  ville: '', pays: 'RDC', adresse: '',
  siteWeb: '', contactPrincipal: '', notes: '',
  avatar: '',
};

const DETAIL_TABS = ['Aperçu', 'Devis', 'Factures', 'Contrats', 'Activités'];

function KpiStrip({ clients, factures }) {
  const totalCa = useMemo(() =>
    clients.reduce((acc, c) => acc + factures.filter(f => f.clientId === c.id && f.statut === 'Payée').reduce((s, f) => s + f.montant, 0), 0),
    [clients, factures]
  );
  const kpis = [
    { label: 'Comptes B2B',       value: clients.length,                                                          accent: 'var(--cyan)' },
    { label: 'Clubs & Académies', value: clients.filter(c => c.type === 'Club' || c.type === 'Académie').length,  accent: 'var(--gold)' },
    { label: 'Sponsors actifs',   value: clients.filter(c => c.type === 'Sponsor').length,                        accent: 'var(--success)' },
    { label: 'CA encaissé',       value: fmtUsd(totalCa),                                                         accent: 'var(--red)' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '24px' }}>
      {kpis.map((k, i) => (
        <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderLeft: `3px solid ${k.accent}`, borderRadius: '8px', padding: '14px 16px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: '0.1em' }}>{k.label}</div>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '20px', marginTop: '6px' }}>{k.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function Clients() {
  const { state: { clients, devis, factures, contrats, projets }, dispatch, confirmAction } = useCRM();
  const navigate = useNavigate();
  const addToast = useToast();

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Tous');
  const [detailTab, setDetailTab] = useState('Aperçu');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);
  const logoInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, avatar: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const clientCA = (clientId) =>
    factures.filter(f => f.clientId === clientId && f.statut === 'Payée').reduce((s, f) => s + f.montant, 0);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setIsDrawerOpen(true);
  };

  const openEdit = (client) => {
    setEditTarget(client);
    setForm({
      nom:             client.nom || '',
      type:            client.type || 'Club',
      email:           client.email || '',
      tel:             client.tel || '',
      ville:           client.ville || '',
      pays:            client.pays || 'RDC',
      adresse:         client.adresse || '',
      siteWeb:         client.siteWeb || '',
      contactPrincipal: client.contactPrincipal || '',
      notes:           client.notes || '',
      avatar:          client.avatar || '',
    });
    setErrors({});
    setIsDrawerOpen(true);
  };

  const handleSave = () => {
    const errs = {};
    if (!form.nom.trim())   errs.nom   = 'Le nom est requis';
    if (!form.email.trim()) errs.email = "L'email est requis";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (editTarget) {
      dispatch({ type: 'UPDATE_CLIENT', payload: { ...editTarget, ...form } });
      addToast('Profil client mis à jour !');
    } else {
      dispatch({
        type: 'ADD_CLIENT',
        payload: { id: Date.now(), ...form, ca: 0, docs: 0 },
      });
      addToast('Client créé avec succès !');
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = (e, client) => {
    e.stopPropagation();
    confirmAction(
      'Supprimer ce client ?',
      `Attention, la suppression de "${client.nom}" est définitive.`,
      () => {
        dispatch({ type: 'DELETE_CLIENT', payload: client.id });
        if (selectedId === client.id) setSelectedId(null);
        addToast(`Client ${client.nom} supprimé.`);
      }
    );
  };

  const FILTER_TABS = ['Tous', 'Clubs/Académies', 'Sponsors', 'Institutions'];

  const filtered = useMemo(() =>
    clients.filter(c => {
      const matchSearch = c.nom.toLowerCase().includes(search.toLowerCase()) ||
                          (c.email || '').toLowerCase().includes(search.toLowerCase());
      const matchTab = activeTab === 'Tous' ||
        (activeTab === 'Clubs/Académies' && (c.type === 'Club' || c.type === 'Académie')) ||
        (activeTab === 'Sponsors'        && c.type === 'Sponsor') ||
        (activeTab === 'Institutions'    && c.type === 'Institution');
      return matchSearch && matchTab;
    }),
    [clients, search, activeTab]
  );

  function renderForm() {
    return (
      <>
        <ValidationSummary errors={errors} />
        {/* Logo upload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0 4px' }}>
          <div
            onClick={() => logoInputRef.current?.click()}
            style={{ width: '64px', height: '64px', borderRadius: '10px', background: form.avatar ? 'transparent' : 'rgba(37,67,84,0.08)', border: '2px dashed var(--border-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-input)'}
          >
            {form.avatar
              ? <img src={form.avatar} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.6" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            }
          </div>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '4px' }}>Logo du client</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginBottom: '8px' }}>PNG, JPG, SVG — max 2 Mo</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => logoInputRef.current?.click()} style={{ height: '28px', padding: '0 12px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '5px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-2)' }}>
                {form.avatar ? 'Changer' : 'Choisir un fichier'}
              </button>
              {form.avatar && (
                <button type="button" onClick={() => setForm(f => ({ ...f, avatar: '' }))} style={{ height: '28px', padding: '0 12px', background: 'none', border: '1px solid rgba(188,0,13,0.3)', borderRadius: '5px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', color: 'var(--red)' }}>
                  Supprimer
                </button>
              )}
            </div>
          </div>
          <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
        </div>
        <FormSection title="Identification" subtitle="Raison sociale, type et localisation">
          <TextField label="Nom du client / entité" value={form.nom} onChange={v => setForm(f => ({ ...f, nom: v }))} required placeholder="Ex. Mazembe Corp" maxLength={80} error={errors.nom} />
          <FormRow>
            <SelectField
              label="Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))}
              options={Object.keys(TYPE_QUALITE).filter(t => t !== 'Athlète').map(t => ({ value: t, label: TYPE_QUALITE[t] }))}
            />
            <TextField label="Ville" value={form.ville} onChange={v => setForm(f => ({ ...f, ville: v }))} placeholder="Ex. Kinshasa" />
          </FormRow>
          <FormRow>
            <TextField label="Pays" value={form.pays} onChange={v => setForm(f => ({ ...f, pays: v }))} placeholder="RDC" />
            <TextField label="Site web" value={form.siteWeb} onChange={v => setForm(f => ({ ...f, siteWeb: v }))} placeholder="https://…" />
          </FormRow>
          <TextField label="Adresse complète" value={form.adresse} onChange={v => setForm(f => ({ ...f, adresse: v }))} placeholder="Avenue, quartier, commune" />
        </FormSection>
        <FormSection title="Contact" subtitle="Coordonnées du compte">
          <TextField label="Contact principal" value={form.contactPrincipal} onChange={v => setForm(f => ({ ...f, contactPrincipal: v }))} placeholder="Prénom Nom — directeur commercial…" />
          <FormRow>
            <TextField label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} required type="email" placeholder="contact@exemple.cd" error={errors.email} />
            <TextField label="Téléphone" value={form.tel} onChange={v => setForm(f => ({ ...f, tel: v }))} placeholder="+243 ..." />
          </FormRow>
        </FormSection>
        <FormSection title="Notes internes" subtitle="Informations complémentaires non publiées">
          <TextareaField label="Notes" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Contexte, remarques, préférences…" rows={3} maxLength={600} />
        </FormSection>
      </>
    );
  }

  // ── VUE DÉTAIL ────────────────────────────────────────────────────────────
  if (selectedId) {
    const client = clients.find(c => c.id === selectedId);
    if (!client) { setSelectedId(null); return null; }

    const tStyle      = TYPE_COLORS[client.type] || TYPE_COLORS['Institution'];
    const clientDevis     = devis.filter(d => d.clientId === client.id);
    const clientFactures  = factures.filter(f => f.clientId === client.id);
    const clientContrats  = contrats.filter(c => c.clientId === client.id);
    const clientProjets   = projets.filter(p => p.clientId === client.id);
    const caEncaisse      = clientCA(client.id);

    return (
      <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={() => { setSelectedId(null); setDetailTab('Aperçu'); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '34px', padding: '0 14px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', color: 'var(--text-2)' }}
          >
            ← Clients &amp; comptes
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => openEdit(client)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '34px', padding: '0 16px', background: 'var(--white)', color: 'var(--navy-deep)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Éditer
            </button>
            <button onClick={() => navigate(`/devis?clientId=${client.id}`)} style={{ height: '34px', padding: '0 16px', background: 'var(--red)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
              + Nouveau devis
            </button>
          </div>
        </div>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, var(--navy-deep) 0%, #1a3a50 100%)', borderRadius: '14px', padding: '28px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-16px', bottom: '-24px', fontSize: '120px', fontFamily: 'var(--font-oswald)', fontWeight: 700, color: 'rgba(255,255,255,0.04)', lineHeight: 1, pointerEvents: 'none' }}>
            {client.nom.charAt(0)}
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: '68px', height: '68px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
              {client.avatar
                ? <img src={client.avatar} alt={client.nom} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <span style={{ fontFamily: 'var(--font-oswald)', fontSize: '28px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{client.nom.substring(0, 2)}</span>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em', marginBottom: '4px' }}>{client.type} · {client.ville || client.pays}</div>
              <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontFamily: 'var(--font-oswald)', color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{client.nom}</h1>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ background: tStyle.bg, border: `1px solid ${tStyle.color}33`, borderRadius: '99px', padding: '3px 10px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: tStyle.color }}>{client.type}</span>
                {client.email && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{client.email}</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(23,198,126,0.8)', letterSpacing: '0.1em' }}>CA encaissé</div>
              <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '22px', fontWeight: 700, color: '#4AE8A0', marginTop: '2px' }}>{fmtUsd(caEncaisse)}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{clientDevis.length} devis · {clientFactures.length} factures</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--border)', marginBottom: '24px', overflowX: 'auto' }}>
          {DETAIL_TABS.map(tab => (
            <button key={tab} onClick={() => setDetailTab(tab)} style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: '13px', fontWeight: detailTab === tab ? 700 : 500, color: detailTab === tab ? 'var(--navy-deep)' : 'var(--text-3)', borderBottom: `3px solid ${detailTab === tab ? 'var(--red)' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap', marginBottom: '-2px' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Aperçu */}
        {detailTab === 'Aperçu' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}>Coordonnées</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  ['Contact',    client.contactPrincipal],
                  ['Email',      client.email],
                  ['Téléphone',  client.tel],
                  ['Adresse',    client.adresse],
                  ['Ville',      client.ville],
                  ['Pays',       client.pays],
                  ['Site web',   client.siteWeb],
                ].map(([lbl, val]) => val ? (
                  <div key={lbl}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: '3px' }}>{lbl}</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-1)' }}>{val}</div>
                  </div>
                ) : null)}
              </div>
              {client.notes && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: '6px' }}>Notes internes</div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{client.notes}</p>
                </div>
              )}
            </div>
            <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Devis récents</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {clientDevis.slice(0, 4).map(d => (
                  <div key={d.ref} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11.5px', fontWeight: 700, color: 'var(--navy-deep)' }}>{d.ref}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>{d.objet}</div>
                    </div>
                    <StatusBadge status={d.statut} />
                  </div>
                ))}
                {clientDevis.length === 0 && <span style={{ color: 'var(--text-3)', fontSize: '13px' }}>Aucun devis.</span>}
              </div>
              {clientProjets.length > 0 && (
                <>
                  <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '20px 0 16px' }}>Projets</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {clientProjets.map(p => (
                      <div key={p.ref} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11.5px', fontWeight: 700, color: 'var(--navy-deep)' }}>{p.ref}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>{p.nom}</div>
                        </div>
                        <StatusBadge status={p.statut} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Devis */}
        {detailTab === 'Devis' && (
          <div style={{ background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {clientDevis.length === 0 ? (
              <div style={{ padding: '40px' }}>
                <EmptyState title="Aucun devis" description="Ce client n'a pas encore de devis."
                  actionLabel="+ Nouveau devis" onAction={() => navigate(`/devis?clientId=${client.id}`)} />
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 130px', padding: '10px 20px', background: 'var(--navy-deep)', color: 'var(--white)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <span>Référence</span><span>Objet</span><span style={{ textAlign: 'right' }}>Montant</span><span style={{ textAlign: 'right' }}>Statut</span>
                </div>
                {clientDevis.map(d => (
                  <div key={d.ref} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 130px', alignItems: 'center', padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)' }}>{d.ref}</span>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{d.objet}</span>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12.5px', fontWeight: 700, textAlign: 'right' }}>{fmtUsd(d.montant)}</span>
                    <span style={{ textAlign: 'right' }}><StatusBadge status={d.statut} /></span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Factures */}
        {detailTab === 'Factures' && (
          <div style={{ background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {clientFactures.length === 0 ? (
              <div style={{ padding: '40px' }}><EmptyState title="Aucune facture" description="Ce client n'a pas encore de facture." /></div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 120px', padding: '10px 20px', background: 'var(--navy-deep)', color: 'var(--white)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <span>Référence</span><span>Objet</span><span style={{ textAlign: 'right' }}>Montant</span><span style={{ textAlign: 'right' }}>Statut</span>
                </div>
                {clientFactures.map(f => (
                  <div key={f.ref} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 120px', alignItems: 'center', padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)' }}>{f.ref}</span>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-2)' }}>{f.objet}</span>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12.5px', fontWeight: 700, textAlign: 'right' }}>{fmtUsd(f.montant)}</span>
                    <span style={{ textAlign: 'right' }}><StatusBadge status={f.statut} /></span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Contrats */}
        {detailTab === 'Contrats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '13px', color: 'var(--navy-deep)' }}>Contrats ({clientContrats.length})</div>
              {clientContrats.length === 0 ? (
                <div style={{ padding: '32px' }}><EmptyState title="Aucun contrat" description="Aucun contrat lié à ce client." /></div>
              ) : clientContrats.map(c => (
                <div key={c.ref} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)' }}>{c.ref}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '2px' }}>{c.type} — {fmtUsd(c.valeur)}</div>
                  </div>
                  <StatusBadge status={c.statut} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activités */}
        {detailTab === 'Activités' && (
          <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <ActivityTimeline entityType="client" entityId={client.id} />
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editTarget ? `Éditer — ${client.nom}` : 'Créer un compte client'} width="500px"
          footer={
            <>
              <button onClick={() => setIsDrawerOpen(false)} style={{ padding: '10px 18px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleSave} style={{ padding: '10px 22px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>{editTarget ? 'Enregistrer les modifications' : 'Créer le client'}</button>
            </>
          }
        >
          {renderForm()}
        </Drawer>
      </div>
    );
  }

  // ── VUE LISTE ─────────────────────────────────────────────────────────────
  return (
    <div style={{ animation: 'fadeIn 0.18s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Relations</div>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Clients &amp; comptes</h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-2)', fontSize: '13.5px' }}>Base centrale alimentant devis, factures et contrats.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => {
              const headers = ['Nom', 'Type', 'Email', 'Téléphone', 'Ville', 'Pays', 'Contact principal', 'Site web'];
              const rows = clients.map(c => [c.nom, c.type, c.email || '', c.tel || '', c.ville || '', c.pays || '', c.contactPrincipal || '', c.siteWeb || '']);
              const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
              const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'clients-ndembo.csv'; a.click();
              URL.revokeObjectURL(url);
            }}
            style={{ background: 'var(--white)', border: '1px solid var(--border-input)', padding: '8px 14px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-2)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <button onClick={openCreate} style={{ background: 'var(--red)', color: 'var(--white)', border: 'none', padding: '11px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 4px 14px rgba(188,0,13,0.2)', fontSize: '13px' }}>
            <span>＋</span> Nouveau client
          </button>
        </div>
      </div>

      <KpiStrip clients={clients} factures={factures} />

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-page)', padding: '4px', borderRadius: '6px', overflowX: 'auto' }}>
            {FILTER_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ whiteSpace: 'nowrap', background: activeTab === tab ? 'var(--white)' : 'transparent', color: activeTab === tab ? 'var(--navy-deep)' : 'var(--text-2)', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: activeTab === tab ? 700 : 600, fontSize: '12.5px', cursor: 'pointer', boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                {tab}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Filtrer par nom…" value={search} onChange={e => setSearch(e.target.value)} style={{ border: '1px solid var(--border-input)', borderRadius: '6px', padding: '8px 12px', fontSize: '12.5px', outline: 'none' }} />
        </div>

        <div className="desktop-only" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.3fr 110px 120px 36px', padding: '10px 20px', background: 'var(--navy-deep)', color: 'var(--white)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <span>Client</span><span>Type</span><span>Contact</span>
          <span style={{ textAlign: 'right' }}>CA cumulé</span>
          <span style={{ textAlign: 'right' }}>Documents</span>
          <span></span>
        </div>

        <div>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px 20px' }}>
              <EmptyState title="Aucun client trouvé" description="Modifiez vos filtres ou ajoutez un nouveau client B2B." actionLabel="+ Nouveau client" onAction={openCreate} />
            </div>
          ) : filtered.map((c, i) => {
            const tStyle = TYPE_COLORS[c.type] || TYPE_COLORS['Institution'];
            const initiales = c.nom.substring(0, 2).toUpperCase();
            const docCount = devis.filter(d => d.clientId === c.id).length + factures.filter(f => f.clientId === c.id).length + contrats.filter(ct => ct.clientId === c.id).length;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.15s ease' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-page)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--white)'}
              >
                {/* Desktop grid */}
                <div className="desktop-only" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.3fr 110px 120px 36px', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                    <span style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--navy-deep)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px', flexShrink: 0, overflow: 'hidden' }}>
                      {c.avatar ? <img src={c.avatar} alt={c.nom} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : initiales}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>{c.nom}</span>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)' }}>{c.ville}</span>
                    </span>
                  </span>
                  <span>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 9px', borderRadius: '99px', background: tStyle.bg, color: tStyle.color }}>{c.type}</span>
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-2)' }}>{c.email}</span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: 'var(--text-3)' }}>{c.tel}</span>
                  </span>
                  <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12.5px', fontWeight: 700, textAlign: 'right' }}>{fmtUsd(clientCA(c.id))}</span>
                  <span style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-2)' }}>{docCount}</span>
                  <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={e => handleDelete(e, c)}
                      title="Supprimer"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-3)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </span>
                </div>
                {/* Mobile */}
                <div className="mobile-only" style={{ display: 'none', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '11px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                      <span style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--navy-deep)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px', flexShrink: 0, overflow: 'hidden' }}>
                        {c.avatar ? <img src={c.avatar} alt={c.nom} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : initiales}
                      </span>
                      <div>
                        <span style={{ display: 'block', fontSize: '14px', fontWeight: 700 }}>{c.nom}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '99px', background: tStyle.bg, color: tStyle.color, display: 'inline-block', marginTop: '3px' }}>{c.type}</span>
                      </div>
                    </div>
                    <button onClick={e => handleDelete(e, c)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-3)' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <span style={{ color: 'var(--text-2)' }}>{c.email}</span>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700 }}>{fmtUsd(clientCA(c.id))}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Créer un compte client" width="500px"
        footer={
          <>
            <button onClick={() => setIsDrawerOpen(false)} style={{ padding: '10px 18px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSave} style={{ padding: '10px 22px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Enregistrer le client</button>
          </>
        }
      >
        {renderForm()}
      </Drawer>
    </div>
  );
}
