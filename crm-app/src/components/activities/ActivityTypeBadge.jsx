import { ACTIVITE_TYPE_CONFIG } from './activite-config';

export default function ActivityTypeBadge({ type, showIcon = true }) {
  const cfg = ACTIVITE_TYPE_CONFIG[type] || ACTIVITE_TYPE_CONFIG.note;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em', padding: '3px 9px', borderRadius: '99px',
      background: cfg.bg, color: cfg.color,
    }}>
      {showIcon && <span style={{ fontSize: '11px' }}>{cfg.icon}</span>}
      {cfg.label}
    </span>
  );
}
