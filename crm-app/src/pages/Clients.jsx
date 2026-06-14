import { useState, useMemo } from 'react';
import { TYPE_QUALITE, fmtUsd } from '../crm-data';
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
  const { state: { clients, devis, factures }, dispatch, confirmAction } = useCRM();
  
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Tous');
  const [detailTab, setDetailTab] = useState('Aperçu');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const addToast = useToast();

  // --- DRAWER STATE ---
  const [fNom, setFNom] = useState('');
  const [fType, setFType] = useState('Club');
  const [fEmail, setFEmail] = useState('');
  const [fTel, setFTel] = useState('');
  const [fVille, setFVille] = useState('');

  const openNewClientDrawer = () => {
    setFNom('');
    setFType('Club');
    setFEmail('');
    setFTel('');
    setFVille('');
    setIsDrawerOpen(true);
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
    const totalCa = clients.reduce((acc, c) => acc + c.ca, 0);
    const clubsCount = clients.filter(c => c.type === 'Club' || c.type === 'Académie').length;
    const sponsorsCount = clients.filter(c => c.type === 'Sponsor').length;
    
    return [
      { label: 'Comptes B2B', value: clients.length, accent: 'var(--cyan)' },
      { label: 'Clubs & Académies', value: clubsCount, accent: 'var(--gold)' },
      { label: 'Sponsors Actifs', value: sponsorsCount, accent: 'var(--success)' },
      { label: 'CA Global Cumulé', value: fmtUsd(totalCa), accent: 'var(--red)' }
    ];
  }, [clients]);

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

    return (
      <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
        <button 
          onClick={() => { setSelectedId(null); setDetailTab('Aperçu'); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '34px', padding: '0 12px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', marginBottom: '20px' }}
        >
          &larr; Retour à la liste
        </button>

        <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '8px', borderTop: '3px solid var(--navy-deep)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-oswald)', color: 'var(--navy-deep)', fontSize: '26px' }}>{client.nom}</h1>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '99px', background: tStyle.bg, color: tStyle.color }}>{client.type}</span>
              <span style={{ fontSize: '12.5px', color: 'var(--text-2)' }}>{client.email} • {client.ville}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <button style={{ background: 'var(--white)', color: 'var(--navy-deep)', border: '1px solid var(--border-input)', padding: '10px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Éditer le profil</button>
             <button style={{ background: 'var(--red)', color: 'var(--white)', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>+ Nouveau devis</button>
          </div>
        </div>
        
        {/* Onglets */}
        <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border)', marginTop: '24px', padding: '0 8px' }}>
          {['Aperçu', 'Documents', 'Contrats & Projets'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setDetailTab(tab)}
              style={{ background: 'none', border: 'none', padding: '12px 0', fontSize: '14px', fontWeight: detailTab === tab ? 700 : 600, color: detailTab === tab ? 'var(--navy-deep)' : 'var(--text-3)', borderBottom: detailTab === tab ? '3px solid var(--red)' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s ease' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        <div style={{ marginTop: '24px' }}>
          {detailTab === 'Aperçu' && (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                   <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.1em' }}>Coordonnées & Infos</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div><span style={{ color: 'var(--text-3)', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 700 }}>Email</span><br/><span style={{ fontWeight: 600, fontSize: '14px' }}>{client.email}</span></div>
                      <div><span style={{ color: 'var(--text-3)', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 700 }}>Téléphone</span><br/><span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '14px' }}>{client.tel}</span></div>
                      <div><span style={{ color: 'var(--text-3)', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 700 }}>Ville</span><br/><span style={{ fontSize: '14px' }}>{client.ville}</span></div>
                   </div>
                </div>
                
                <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                   <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.1em' }}>Activité Commerciale (Top 3)</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                     {clientDevis.slice(0, 3).map(d => (
                       <div key={d.ref} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', flexDirection: 'column' }}>
                           <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)' }}>{d.ref}</span>
                           <span style={{ fontSize: '12.5px', color: 'var(--text-2)' }}>{d.objet}</span>
                         </div>
                         <StatusBadge status={d.statut} />
                       </div>
                     ))}
                     {clientDevis.length === 0 && <span style={{ color: 'var(--text-3)', fontSize: '13px' }}>Aucun devis en cours.</span>}
                   </div>
                </div>
             </div>
          )}

          {detailTab !== 'Aperçu' && (
             <div style={{ background: 'var(--white)', padding: '40px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-2)', fontSize: '13.5px' }}>Les données de cet onglet seront intégrées prochainement.</p>
             </div>
          )}
        </div>
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
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12.5px', fontWeight: 700, textAlign: 'right' }}>{fmtUsd(c.ca)}</span>
                    <span style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-2)' }}>{c.docs}</span>
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
                       <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700 }}>{fmtUsd(c.ca)}</span>
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
