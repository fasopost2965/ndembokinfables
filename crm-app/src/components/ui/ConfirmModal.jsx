import { useCRM } from '../../contexts/CRMContext';
import { useEffect } from 'react';

export default function ConfirmModal() {
  const { state: { confirmModal }, dispatch } = useCRM();
  const close = () => dispatch({ type: 'CLOSE_CONFIRM' });

  useEffect(() => {
    if (!confirmModal.isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') dispatch({ type: 'CLOSE_CONFIRM' }); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [confirmModal.isOpen, dispatch]);

  if (!confirmModal.isOpen) return null;

  return (
    <div
      onClick={close}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'cmFadeIn 0.18s ease-out' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--white)', padding: '32px', borderRadius: '14px', width: '420px', maxWidth: '90vw', boxShadow: '0 24px 56px rgba(0,0,0,0.22)', animation: 'cmPopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '18px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(188,0,13,0.1)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy-deep)', margin: '0 0 6px 0', fontFamily: 'var(--font-oswald)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {confirmModal.title}
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '13.5px', lineHeight: '1.55', margin: 0 }}>
              {confirmModal.message}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={close}
            style={{ padding: '10px 18px', borderRadius: '6px', background: 'var(--white)', border: '1px solid var(--border-input)', color: 'var(--text-1)', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-page)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--white)'}
          >
            Annuler
          </button>
          <button
            onClick={() => { if (confirmModal.onConfirm) confirmModal.onConfirm(); close(); }}
            style={{ padding: '10px 20px', borderRadius: '6px', background: 'var(--red)', color: 'var(--white)', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 14px rgba(188,0,13,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--red-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
          >
            Confirmer
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes cmFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cmPopIn { from { opacity: 0; transform: scale(0.94) translateY(8px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      `}} />
    </div>
  );
}
