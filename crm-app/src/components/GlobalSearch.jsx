import { useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../contexts/CRMContext';
import { dateFr, fmtUsd } from '../crm-data';

const SECTIONS = [
  {
    key: 'clients',
    label: 'Clients',
    color: 'var(--cyan)',
    search: (items, q) =>
      items.filter(c => c.nom?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.ville?.toLowerCase().includes(q)),
    label2: c => c.type || '—',
    to: () => '/clients',
  },
  {
    key: 'athletes',
    label: 'Athlètes',
    color: 'var(--gold)',
    search: (items, q) =>
      items.filter(a => a.nom?.toLowerCase().includes(q) || a.sport?.toLowerCase().includes(q) || a.poste?.toLowerCase().includes(q)),
    label2: a => a.sport || '—',
    to: () => '/athletes',
  },
  {
    key: 'devis',
    label: 'Devis',
    color: 'var(--navy-deep)',
    search: (items, q) =>
      items.filter(d => d.ref?.toLowerCase().includes(q) || d.objet?.toLowerCase().includes(q)),
    label2: d => `${fmtUsd(d.montant)} · ${d.statut}`,
    to: () => '/devis',
  },
  {
    key: 'factures',
    label: 'Factures',
    color: 'var(--red)',
    search: (items, q) =>
      items.filter(f => f.ref?.toLowerCase().includes(q) || f.objet?.toLowerCase().includes(q)),
    label2: f => `${fmtUsd(f.montant)} · ${f.statut}`,
    to: () => '/factures',
  },
  {
    key: 'contrats',
    label: 'Contrats',
    color: 'var(--success)',
    search: (items, q) =>
      items.filter(c => c.ref?.toLowerCase().includes(q) || c.objet?.toLowerCase().includes(q) || c.type?.toLowerCase().includes(q)),
    label2: c => `${c.type || '—'} · ${dateFr(c.dateDebut)}`,
    to: () => '/contrats',
  },
  {
    key: 'projets',
    label: 'Projets',
    color: '#7C3AED',
    search: (items, q) =>
      items.filter(p => p.nom?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)),
    label2: p => p.statut || '—',
    to: () => '/projets',
  },
];

const MAX_PER_SECTION = 4;

export default function GlobalSearch({ query, onClose }) {
  const { state } = useCRM();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const q = query.toLowerCase().trim();

  const results = useMemo(() => {
    if (!q) return [];
    return SECTIONS.map(s => ({
      ...s,
      hits: s.search(state[s.key] || [], q).slice(0, MAX_PER_SECTION),
    })).filter(s => s.hits.length > 0);
  }, [q, state]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!q || results.length === 0) {
    if (!q) return null;
    return (
      <div ref={panelRef} style={panelStyle}>
        <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
          Aucun résultat pour <strong style={{ color: 'var(--text-1)' }}>« {query} »</strong>
        </div>
      </div>
    );
  }

  const totalHits = results.reduce((s, r) => s + r.hits.length, 0);

  return (
    <div ref={panelRef} style={panelStyle}>
      <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 600 }}>{totalHits} résultat{totalHits > 1 ? 's' : ''} pour « {query} »</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '16px', lineHeight: 1, padding: '0 4px' }}>×</button>
      </div>

      {results.map(section => (
        <div key={section.key}>
          <div style={{ padding: '8px 14px 4px', fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '99px', background: section.color, flexShrink: 0 }}></span>
            {section.label}
          </div>
          {section.hits.map((item, i) => (
            <button
              key={i}
              onClick={() => { navigate(section.to(item)); onClose(); }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '8px 14px 8px 26px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '8px' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-page)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nom || item.ref || item.objet || '—'}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-3)', whiteSpace: 'nowrap', flexShrink: 0 }}>{section.label2(item)}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

const panelStyle = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  right: 0,
  background: 'var(--white)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  boxShadow: '0 8px 32px rgba(9,29,46,0.14)',
  zIndex: 200,
  maxHeight: '420px',
  overflowY: 'auto',
};
