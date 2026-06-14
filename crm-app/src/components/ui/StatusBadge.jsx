import { STATUT_BADGE } from '../../crm-data';

export default function StatusBadge({ status }) {
  const style = STATUT_BADGE[status] || { bg: 'rgba(37,67,84,.10)', color: '#42474C' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '99px',
        background: style.bg,
        color: style.color,
        fontSize: '11.5px',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}
