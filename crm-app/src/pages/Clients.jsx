import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TYPE_QUALITE, fmtUsd, dateFr } from '../crm-data';
import { useCRM } from '../contexts/CRMContext';
import Drawer from '../components/ui/Drawer';
import { useToast } from '../contexts/ToastContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';

const TYPE_COLORS = {
  'Sponsor': { bg: 'rgba(23,126,84,0.12)', color: '#177E54' },
  'Académie': { bg: 'rgba(244,168,0,0.16)', color: '#9A6B00' },
  'Club': { bg: 'rgba(30,159,216,0.14)', color: '#1E78A8' },
  'Institution': { bg: 'rgba(37,67,84,0.10)', color: '#42474C' },
};

export default function Clients() {
  const { state: { clients, devis, factures, contrats, projets }, dispatch, confirmAction } = useCRM();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Tous');
  const [detailTab, setDetailTab] = useState('Aperçu');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const addToast = useToast();

  // Derive CA from paid invoices instead of hardcoded field
  const clientCA = (clientId) => factures.filter(f => f.clientId === clientId && f.statut === 'Payée').reduce((s, f) => s + f.montant, 0);

  // --- DRAWER STATE ---
  const [fNom, setFNom] = useState('');
  const [fType, setFType] = useState('Club');
  const [fEmail, setFEmail] = useState('');
  const [fTel, setFTel] = useState('');
  const [fVille, setFVille] = useState('');

  // Edit drawer state (mirrors create fields)
  const [eFNom, setEFNom] = useState('');
  const [eFType, setEFType] = useState('Club');
  const [eFEmail, setEFEmail] = useState('');
  const [eFTel, setEFTel] = useState('');
  const [eFVille, setEFVille] = useState('');

  const openNewClientDrawer = () => {
    setFNom(''); setFType('Club'); setFEmail(''); setFTel(''); setFVille('');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (client) => {
    setEFNom(client.nom); setEFType(client.type); setEFEmail(client.email); setEFTel(client.tel || ''); setEFVille(client.ville || '');
    setIsEditDrawerOpen(true);
  };

  const handleSaveEdit = (clientId) => {
    if (!eFNom.trim() || !eFEmail.trim()) { addToast('Champs obligatoires manquants', 'error'); return; }
    const existing = clients.find(c => c.id === clientId);
    dispatch({ type: 'UPDATE_CLIENT', payload: { ...existing, nom: eFNom, type: eFType, email: eFEmail, tel: eFTel, ville: eFVille } });
    setIsEditDrawerOpen(false);
    addToast('Profil client mis à jour !', 'success');
  };

  const handleSaveClient = () => {
    if (!fNom.trim() || !fEmail.trim()) {
      addToast('Veuillez remplir les champs obligatoires (Nom, Email)', 'error');
      return;
    }
    const newClient = {
      id: Date.now(),
      nom: fNom,
      type: fType,
      ville: fVille,
      email: fEmail,
      tel: fTel,
      adresse: '',
      ca: 0,
      docs: 0
    };
    dispatch({ type: 'ADD_CLIENT', payload: newClient });
    setIsDrawerOpen(false);
    addToast('Client créé avec succès !', 'success');
  };

  const handleDeleteClient = (e, client) => {
    e.stopPropagation();
    confirmAction(
      'Supprimer ce client ?',
      `Attention, la suppression de "${client.nom}" est définitive.`,
      () => {
        dispatch({ type: 'DELETE_CLIENT', payload: client.id });
        addToast(`Client ${client.nom} supprimé.`);
      }
    );
  };

  // --- FILTERING ---
  const filtered = useMemo(() => {
    return clients.filter(c => {
      const matchSearch = c.nom.toLowerCase().includes(search.toLowerCase()) || 
                          c.email.toLowerCase().includes(search.toLowerCase());
      const matchTab = activeTab === 'Tous' || 
                       (activeTab === 'Clubs/Académies' && (c.type === 'Club' || c.type === 'Académie')) ||
                       (activeTab === 'Sponsors' && c.type === 'Sponsor') ||
                       (activeTab === 'Institutions' && c.type === 'Institution');
      return matchSearch && matchTab;
    });
  }, [clients, search, activeTab]);

  const TABS = ['Tous', 'Clubs/Académies', 'Sponsors', 'Institutions'];

  // --- STATS KPI ---
  const kpis = useMemo(() => {
    const totalCa = clients.reduce((acc, c) => acc + clientCA(c.id), 0);
    const clubsCount = clients.filter(c => c.type === 'Club' || c.type === 'Académie').length;
    const sponsorsCount = clients.filter(c => c.type === 'Sponsor').length;
    return [
      { label: 'Comptes B2B', value: clients.length, accent: 'var(--cyan)' },
      { label: 'Clubs & Académies', value: clubsCount, accent: 'var(--gold)' },
      { label: 'Sponsors Actifs', value: sponsorsCount, accent: 'var(--success)' },
      { label: 'CA Encaissé', value: fmtUsd(totalCa), accent: 'var(--red)' }
    ];
  }, [clients, factures]);

  // Si un client est sélectionné -> Vue Détail (Fiche 360)
  if (selectedId) {
    const client = clients.find(c => c.id === selectedId);
    if (!client) {
      setSelectedId(null);
      return null;
    }
    
    const tStyle = TYPE_COLORS[client.type] || TYPE_COLORS['Institution'];
    const clientDevis = devis.filter(d => d.clientId === client.id);
    const clientFactures = factures.filter(f => f.clientId === client.id);
    const clientContrats = contrats.filter(c => c.clientId === client.id);
    const clientProjets = projets.filter(p => p.clientId === client.id);
    const caEncaisse = clientCA(client.id);

    return (
      <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
        <button
          onClick={() => { setSelectedId(null); setDetailTab('Aperçu'); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '34px', padding: '0 12px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', marginBottom: '20px' }}
        >
          &larr; Retour à la liste
        </button>

        {/* Hero card */}
        <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '8px', borderTop: '3px solid var(--navy-deep)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-oswald)', color: 'var(--navy-deep)', fontSize: '26px' }}>{client.nom}</h1>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '99px', background: tStyle.bg, color: tStyle.color }}>{client.type}</span>
              <span style={{ fontSize: '12.5px', color: 'var(--text-2)' }}>{client.email} • {client.ville}</span>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', fontWeight: 700, color: 'var(--success)' }}>CA encaissé : {fmtUsd(caEncaisse)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => openEditDrawer(client)} style={{ background: 'var(--white)', color: 'var(--navy-deep)', border: '1px solid var(--border-input)', padding: '10px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Éditer le profil</button>
            <button onClick={() => navigate(`/devis?clientId=${client.id}`)} style={{ background: 'var(--red)', color: 'var(--white)', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>+ Nouveau devis</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border)', marginTop: '24px', padding: '0 8px' }}>
          {['Aperçu', 'Factures', 'Contrats & Projets'].map(tab => (
            <button key={tab} onClick={() => setDetailTab(tab)}
              style={{ background: 'none', border: 'none', padding: '12px 0', fontSize: '14px', fontWeight: detailTab === tab ? 700 : 600, color: detailTab === tab ? 'var(--navy-deep)' : 'var(--text-3)', borderBottom: detailTab === tab ? '3px solid var(--red)' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s ease' }}
            >{tab}</button>
          ))}
        </div>

        <div style={{ marginTop: '24px' }}>
          {/* Aperçu */}
          {detailTab === 'Aperçu' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: '18px', letterSpacing: '0.1em' }}>Coordonnées</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[['Email', client.email], ['Téléphone', client.tel], ['Ville', client.ville]].map(([lbl, val]) => (
                    <div key={lbl}><div style={{ color: 'var(--text-3)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>{lbl}</div><div style={{ fontWeight: 600, fontSize: '13.5px', marginTop: '3px' }}>{val || '—'}</div></div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: '18px', letterSpacing: '0.1em' }}>Devis récents</h3>
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
              </div>
            </div>
          )}

          {/* Factures */}
          {detailTab === 'Factures' && (
            <div style={{ background: 'var(--white)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
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

          {/* Contrats & Projets */}
          {detailTab === 'Contrats & Projets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Contrats */}
              <div style={{ background: 'var(--white)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
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
              {/* Projets */}
              <div style={{ background: 'var(--white)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '13px', color: 'var(--navy-deep)' }}>Projets ({clientProjets.length})</div>
                {clientProjets.length === 0 ? (
                  <div style={{ padding: '32px' }}><EmptyState title="Aucun projet" description="Aucun projet lié à ce client." /></div>
                ) : clientProjets.map(p => (
                  <div key={p.ref} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ flex: 1, marginRight: '16px' }}>
                      <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)' }}>{p.ref}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '2px' }}>{p.nom}</div>
                      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '99px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p.avancement || 0}%`, background: 'var(--cyan)', borderRadius: '99px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <StatusBadge status={p.statut} />
                      <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: 'var(--text-3)' }}>{p.avancement || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit drawer */}
        <Drawer isOpen={isEditDrawerOpen} onClose={() => setIsEditDrawerOpen(false)} title={`Éditer — ${client.nom}`} width="460px"
          footer={
            <>
              <button onClick={() => setIsEditDrawerOpen(false)} style={{ padding: '10px 18px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => handleSaveEdit(client.id)} style={{ padding: '10px 22px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Enregistrer</button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Nom <span style={{ color: 'var(--red)' }}>*</span></span>
              <input type="text" value={eFNom} onChange={e => setEFNom(e.target.value)} style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Type</span>
                <select value={eFType} onChange={e => setEFType(e.target.value)} style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'var(--white)' }}>
                  {Object.keys(TYPE_QUALITE).filter(t => t !== 'Athlète').map(t => <option key={t} value={t}>{TYPE_QUALITE[t]}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Ville</span>
                <input type="text" value={eFVille} onChange={e => setEFVille(e.target.value)} style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Email <span style={{ color: 'var(--red)' }}>*</span></span>
                <input type="email" value={eFEmail} onChange={e => setEFEmail(e.target.value)} style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Téléphone</span>
                <input type="text" value={eFTel} onChange={e => setEFTel(e.target.value)} style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
              </label>
            </div>
          </div>
        </Drawer>
      </div>
    );
  }

  // --- VUE LISTE ---
  return (
    <div style={{ animation: 'fadeIn 0.18s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Relations</div>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Clients &amp; comptes</h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-2)' }}>Base centrale alimentant devis, factures et contrats.</p>
        </div>
        <button onClick={openNewClientDrawer} style={{ background: 'var(--red)', color: 'var(--white)', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
          + Nouveau client
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderLeft: `3px solid ${k.accent}`, borderRadius: '8px', padding: '16px 18px' }}>
             <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: '0.12em' }}>{k.label}</div>
             <div style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '22px', marginTop: '8px' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Table Container */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-page)', padding: '4px', borderRadius: '6px', overflowX: 'auto' }}>
            {TABS.map(tab => {
              const isActive = activeTab === tab;
              return (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  style={{ whiteSpace: 'nowrap', background: isActive ? 'var(--white)' : 'transparent', color: isActive ? 'var(--navy-deep)' : 'var(--text-2)', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: isActive ? 700 : 600, fontSize: '12.5px', cursor: 'pointer', boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
          <div>
            <input 
              type="text" 
              placeholder="Filtrer par nom…" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: '1px solid var(--border-input)', borderRadius: '6px', padding: '8px 12px', fontSize: '12.5px', outline: 'none' }} 
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="desktop-only" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.3fr 110px 120px 36px', padding: '10px 20px', background: 'var(--navy-deep)', color: 'var(--white)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <span>Client</span>
          <span>Type</span>
          <span>Contact</span>
          <span style={{ textAlign: 'right' }}>CA cumulé</span>
          <span style={{ textAlign: 'right' }}>Documents</span>
          <span></span>
        </div>

        {/* Table Body */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px 20px' }}>
              <EmptyState 
                title="Aucun client trouvé" 
                description="Modifiez vos filtres ou ajoutez un nouveau client B2B."
                actionLabel="+ Nouveau client"
                onAction={openNewClientDrawer}
              />
            </div>
          ) : (
            filtered.map((c, i) => {
              const tStyle = TYPE_COLORS[c.type] || TYPE_COLORS['Institution'];
              const initiales = c.nom.substring(0,2).toUpperCase();
              return (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedId(c.id)}
                  style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
                >
                  {/* Grid for desktop */}
                  <div className="desktop-only" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.3fr 110px 120px 36px', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                      <span style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--navy-deep)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px' }}>{initiales}</span>
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
                    <span style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-2)' }}>{devis.filter(d => d.clientId === c.id).length + factures.filter(f => f.clientId === c.id).length + contrats.filter(ct => ct.clientId === c.id).length}</span>
                    <span style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                      <button onClick={(e) => handleDeleteClient(e, c)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-3)' }} title="Supprimer" onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </span>
                  </div>
                  
                  {/* Flex for mobile */}
                  <div className="mobile-only" style={{ display: 'none', flexDirection: 'column', gap: '12px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                        <span style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--navy-deep)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px' }}>{initiales}</span>
                        <div>
                          <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)' }}>{c.nom}</span>
                          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '99px', background: tStyle.bg, color: tStyle.color, marginTop: '4px', display: 'inline-block' }}>{c.type}</span>
                        </div>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                       <span style={{ color: 'var(--text-2)' }}>{c.email}</span>
                       <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700 }}>{fmtUsd(clientCA(c.id))}</span>
                     </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Créer un compte client"
        width="460px"
        footer={
          <>
            <button onClick={() => setIsDrawerOpen(false)} style={{ padding: '10px 18px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSaveClient} style={{ padding: '10px 22px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Enregistrer le client</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Nom du client / entité <span style={{ color: 'var(--red)' }}>*</span></span>
            <input type="text" value={fNom} onChange={e=>setFNom(e.target.value)} placeholder="Ex. Mazembe Corp" style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
          </label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Type</span>
              <select value={fType} onChange={e=>setFType(e.target.value)} style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'var(--white)' }}>
                {Object.keys(TYPE_QUALITE).filter(t => t !== 'Athlète').map(t => <option key={t} value={t}>{TYPE_QUALITE[t]}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Ville</span>
              <input type="text" value={fVille} onChange={e=>setFVille(e.target.value)} placeholder="Kinshasa" style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Email <span style={{ color: 'var(--red)' }}>*</span></span>
              <input type="email" value={fEmail} onChange={e=>setFEmail(e.target.value)} placeholder="contact@exemple.cd" style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Téléphone</span>
              <input type="text" value={fTel} onChange={e=>setFTel(e.target.value)} placeholder="+243 ..." style={{ height: '40px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }} />
            </label>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
