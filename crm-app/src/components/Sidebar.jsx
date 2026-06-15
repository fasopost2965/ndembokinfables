import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCRM } from '../contexts/CRMContext';
import { useAuth } from '../hooks/useAuth.js';

const ICONS = {
  dashboard: 'M3.5 3.5h7v7h-7zM13.5 3.5h7v7h-7zM13.5 13.5h7v7h-7zM3.5 13.5h7v7h-7z',
  devis: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  factures: 'M5 3h14v18l-2.4-1.6L14.2 21l-2.2-1.6L9.8 21l-2.4-1.6L5 21zM9 8h6M9 12h6M9 16h3.5',
  contrats: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  projets: 'M4 4h4.5v16H4zM9.75 4h4.5v10h-4.5zM15.5 4H20v7h-4.5z',
  evenements: 'M8 21h8M12 17v4M17 4H7v5a5 5 0 0 0 10 0zM17 4h4v2a3 3 0 0 1-3 3M7 4H3v2a3 3 0 0 0 3 3',
  clients: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  athletes: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  vip: 'M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z',
  parametres: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
};

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: { devis, factures, contrats, projets, clients, athletes } } = useCRM();
  const { logout, user } = useAuth();

  const sections = [
    { title: 'Pilotage', items: [
      { key: 'dashboard', label: 'Tableau de bord', path: '/dashboard' },
    ]},
    { title: 'Commercial', items: [
      { key: 'devis', label: 'Devis', path: '/devis', count: devis.filter(d => ['Brouillon','Envoyé'].includes(d.statut)).length || null },
      { key: 'factures', label: 'Factures', path: '/factures', count: factures.filter(f => f.statut !== 'Payée').length || null },
      { key: 'contrats', label: 'Contrats', path: '/contrats', count: contrats.filter(c => c.statut === 'Signé').length || null },
      { key: 'projets', label: 'Projets', path: '/projets', count: projets.filter(p => p.statut !== 'Terminé').length || null },
    ]},
    { title: 'Opérations', items: [
      { key: 'evenements', label: 'Événements', path: '/evenements' },
    ]},
    { title: 'Scouting', items: [
      { key: 'athletes', label: 'Athlètes', path: '/athletes', count: athletes.length || null },
    ]},
    { title: 'Relations', items: [
      { key: 'clients', label: 'Clients B2B', path: '/clients', count: clients.length || null },
      { key: 'vip', label: 'Membres VIP', path: '/vip' },
    ]},
    { title: 'Système', items: [
      { key: 'parametres', label: 'Paramètres', path: '/parametres' },
    ]},
  ];

  return (
    <aside 
      className={`sidebar-container ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      style={{ width: '248px', minHeight: '100vh', background: 'var(--sidebar)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', flexShrink: 0, zIndex: 50, transition: 'transform 0.3s ease' }}
    >
      {/* Brand / Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 18px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width: '42px', height: '42px', background: '#FFFFFF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          <img src="/logo.png" alt="Ndembo Kin Connect" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-oswald)', fontWeight: 600, fontSize: '17px', letterSpacing: '0.06em', color: '#FFFFFF', lineHeight: 1.1 }}>NDEMBO KIN</div>
          <div style={{ fontFamily: 'var(--font-open-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: '#7E97A8', textTransform: 'uppercase', marginTop: '3px' }}>Connect SARL</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {sections.map((sec, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontFamily: 'var(--font-open-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5F7A8C', padding: '0 12px 8px 12px' }}>
              {sec.title}
            </div>
            {sec.items.map(it => {
              const isActive = location.pathname.startsWith(it.path);
              const bg = isActive ? 'var(--red)' : 'transparent';
              const color = isActive ? 'var(--white)' : '#B9CBD8';
              const weight = isActive ? '700' : '400';
              const countBg = isActive ? 'rgba(255,255,255,0.22)' : 'rgba(30,159,216,0.18)';
              const countColor = isActive ? 'var(--white)' : '#6FC4EA';

              return (
                <Link
                  key={it.key}
                  to={it.path}
                  onClick={onClose}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '6px',
                    textDecoration: 'none', background: bg, color: color, fontFamily: 'var(--font-open-sans)',
                    fontSize: '13.5px', fontWeight: weight, transition: 'background 0.15s ease, color 0.15s ease'
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#FFFFFF'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#B9CBD8'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d={ICONS[it.key]}></path>
                  </svg>
                  <span style={{ flex: 1 }}>{it.label}</span>
                  {it.count && (
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10.5px', fontWeight: 700, background: countBg, color: countColor, borderRadius: '99px', padding: '2px 7px' }}>
                      {it.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer support */}
      <div style={{ padding: '14px 12px 18px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Link to="/parametres" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '6px', textDecoration: 'none', color: '#8FA6B5', fontFamily: 'var(--font-open-sans)', fontSize: '13px' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#8FA6B5'; }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17h.01M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"></path></svg>
          <span>Aide &amp; support</span>
        </Link>
        {/* User row + logout */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px 0 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontFamily: 'var(--font-open-sans)', fontSize: '11.5px', fontWeight: 600, color: '#B9CBD8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.nom || user?.email || 'Administrateur'}
            </span>
            <span style={{ fontFamily: 'var(--font-open-sans)', fontSize: '10px', color: '#5F7A8C' }}>CRM v1.0 · Kinshasa</span>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            title="Se déconnecter"
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '5px 7px', cursor: 'pointer', color: '#8FA6B5', display: 'flex', alignItems: 'center', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8FA6B5'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
