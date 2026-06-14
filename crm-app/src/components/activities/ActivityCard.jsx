import { useState } from 'react';
import ActivityTypeBadge from './ActivityTypeBadge';
import { dateFr } from '../../crm-data';

export default function ActivityCard({ activite, onDelete, onEdit }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--white)', borderRadius: '10px',
        border: '1px solid var(--border)', padding: '14px 16px',
        transition: 'box-shadow 0.18s',
        boxShadow: hovered ? '0 4px 14px rgba(37,67,84,0.10)' : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <ActivityTypeBadge type={activite.type} />
            <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-jetbrains)' }}>
              {activite.date ? dateFr(activite.date) : '—'}
            </span>
            {activite.auteur && (
              <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>· {activite.auteur}</span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-1)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
            {activite.contenu}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0, opacity: hovered ? 1 : 0, transition: 'opacity 0.18s' }}>
          {onEdit && (
            <button
              onClick={() => onEdit(activite)}
              title="Modifier"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '5px', color: 'var(--text-3)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(activite.id)}
              title="Supprimer"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '5px', color: 'var(--text-3)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
