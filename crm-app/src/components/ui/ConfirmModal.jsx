import { useCRM } from '../../contexts/CRMContext';
import { useEffect } from 'react';

export default function ConfirmModal() {
  const { state: { confirmModal }, dispatch } = useCRM();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && confirmModal.isOpen) {
        dispatch({ type: 'CLOSE_CONFIRM' });
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [confirmModal.isOpen, dispatch]);

  if (!confirmModal.isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--white)', padding: '32px', borderRadius: '12px', width: '400px', maxWidth: '90vw', boxShadow: '0 24px 48px rgba(0,0,0,0.3)', animation: 'slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(188,0,13,0.1)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy-deep)', margin: 0, fontFamily: 'var(--font-oswald)', textTransform: 'uppercase' }}>
            {confirmModal.title}
          </h2>
        </div>
        <p style={{ color: 'var(--text-2)', fontSize: '14px', lineHeight: '1.5', margin: '0 0 24px 0' }}>
          {confirmModal.message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={() => dispatch({ type: 'CLOSE_CONFIRM' })} 
            style={{ padding: '10px 16px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-1)', fontWeight: 600, cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button 
            onClick={() => {
              if (confirmModal.onConfirm) confirmModal.onConfirm();
              dispatch({ type: 'CLOSE_CONFIRM' });
            }} 
            style={{ padding: '10px 16px', borderRadius: '6px', background: 'var(--red)', color: 'var(--white)', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(188,0,13,0.2)' }}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
