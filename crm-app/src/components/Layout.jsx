import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useState, useRef, useEffect } from 'react';
import GlobalSearch from './GlobalSearch';
import NotificationsPanel from './NotificationsPanel';
import { useNotifications } from './useNotifications';

function Topbar({ onOpenSidebar }) {
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setSearch('');
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
  const { nonLues } = useNotifications();

  const QUICK_CREATE = [
    { label: 'Nouveau devis',         to: '/devis',       color: 'var(--cyan)' },
    { label: 'Nouvelle facture',      to: '/factures',    color: 'var(--red)' },
    { label: 'Nouveau contrat',       to: '/contrats',    color: 'var(--navy-mid)' },
    { label: 'Nouveau projet',        to: '/projets',     color: 'var(--gold)' },
    { label: 'Nouvel événement',      to: '/evenements',  color: 'var(--success)' },
    { label: 'Nouveau client',        to: '/clients',     color: 'var(--cyan)' },
    { label: 'Ajouter un membre VIP', to: '/vip',         color: '#C9A227' },
  ];
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header style={{
      height: '64px',
      background: 'var(--white)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 60,
      justifyContent: 'space-between',
      gap: '16px',
    }}>
      {/* Search & Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '0 1 320px' }}>
        <button className="mobile-only" onClick={onOpenSidebar} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-1)', display: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
        <div style={{ position: 'relative', width: '100%' }} className="desktop-only">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
            <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3"/>
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Rechercher… (Ctrl+K)"
            value={search}
            onChange={e => { setSearch(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            style={{ width: '100%', height: '36px', border: '1px solid var(--border-input)', borderRadius: '6px', background: 'var(--bg-page)', padding: '0 12px 0 32px', fontSize: '12.5px', outline: 'none', color: 'var(--text-1)' }}
          />
          {searchOpen && search.length > 0 && (
            <>
              <div onClick={() => { setSearchOpen(false); setSearch(''); }} style={{ position: 'fixed', inset: 0, zIndex: 190 }} />
              <GlobalSearch query={search} onClose={() => { setSearchOpen(false); setSearch(''); }} />
            </>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: 'var(--text-2)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {nonLues.length > 0 && (
              <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', borderRadius: '99px', background: 'var(--red)', border: '1.5px solid var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {nonLues.length > 9 ? null : <span style={{ fontSize: '6px', color: 'var(--white)', fontWeight: 800, lineHeight: 1 }}>{nonLues.length}</span>}
              </span>
            )}
          </button>
          {notifOpen && (
            <>
              <div onClick={() => setNotifOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 190 }} />
              <NotificationsPanel onClose={() => setNotifOpen(false)} />
            </>
          )}
        </div>

        {/* Create button */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu(!showMenu)} style={{ height: '36px', padding: '0 16px', background: 'var(--red)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Créer
          </button>
          {showMenu && (
            <>
              <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 70 }}></div>
              <div style={{ position: 'absolute', top: '42px', right: 0, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(9,29,46,0.14)', zIndex: 80, minWidth: '210px', padding: '6px' }}>
                {QUICK_CREATE.map(item => (
                  <Link key={item.to} to={item.to} onClick={() => setShowMenu(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', textDecoration: 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-page)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ width: '7px', height: '7px', borderRadius: '99px', background: item.color, flexShrink: 0 }}></span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--navy-deep)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-oswald)', fontWeight: 600, fontSize: '14px' }}>AN</div>
          <div className="desktop-only" style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-1)' }} data-profile-meta="true">A. Ndembo</div>
        </div>
      </div>
    </header>
  );
}

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main data-main-pad="true" style={{ flex: 1, padding: '28px 32px 48px 32px', maxWidth: '1380px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      {isSidebarOpen && (
        <div 
          className="mobile-only"
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(9, 29, 46, 0.4)', zIndex: 40 }}
        />
      )}
    </div>
  );
}
