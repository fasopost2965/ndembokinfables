import { useNavigate } from 'react-router-dom';
import { useCRM } from '../contexts/CRMContext';
import { useNotifications } from './useNotifications';

const TYPE_COLOR = { danger: 'var(--red)', warning: 'var(--gold)', info: 'var(--cyan)' };

export default function NotificationsPanel({ onClose }) {
  const { state, dispatch } = useCRM();
  const navigate = useNavigate();
  const { all } = useNotifications();

  const markAll = () => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_LUES', payload: all.map(n => n.id) });

  const handleClick = (n) => {
    dispatch({ type: 'MARK_NOTIFICATION_LUE', payload: n.id });
    navigate(n.to);
    onClose();
  };

  const unreadCount = all.filter(n => !state.notificationsLues.includes(n.id)).length;

  return (
    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '340px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '10px', boxShadow: '0 8px 32px rgba(9,29,46,0.14)', zIndex: 200, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-1)' }}>Notifications</span>
          {unreadCount > 0 && <span style={{ marginLeft: '8px', background: 'var(--red)', color: 'var(--white)', borderRadius: '99px', fontSize: '10px', fontWeight: 700, padding: '1px 6px' }}>{unreadCount}</span>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11.5px', color: 'var(--cyan)', fontWeight: 700 }}>Tout marquer lu</button>
        )}
      </div>

      {all.length === 0 ? (
        <div style={{ padding: '28px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎉</div>
          <div style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 600 }}>Tout est à jour !</div>
          <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px' }}>Aucune action requise pour le moment.</div>
        </div>
      ) : (
        <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
          {all.map(n => {
            const isLue = state.notificationsLues.includes(n.id);
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%', padding: '12px 16px', background: isLue ? 'transparent' : 'rgba(188,0,13,0.03)', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-page)'}
                onMouseLeave={e => e.currentTarget.style.background = isLue ? 'transparent' : 'rgba(188,0,13,0.03)'}
              >
                <span style={{ fontSize: '18px', lineHeight: 1, marginTop: '1px', flexShrink: 0 }}>{n.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {!isLue && <span style={{ width: '6px', height: '6px', borderRadius: '99px', background: TYPE_COLOR[n.type], flexShrink: 0 }}></span>}
                    <span style={{ fontWeight: isLue ? 500 : 700, fontSize: '12.5px', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
