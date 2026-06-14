export default function ConfirmDialog({ isOpen, title, message, confirmText = 'Confirmer', cancelText = 'Annuler', onConfirm, onCancel, variant = 'primary' }) {
  if (!isOpen) return null;

  const btnColor = variant === 'danger' ? 'var(--red)' : 'var(--cyan)';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(9, 29, 46, 0.42)', padding: '20px'
    }}>
      <div style={{
        background: 'var(--white)', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '400px',
        boxShadow: '0 20px 56px rgba(9, 29, 46, 0.15)', display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        <h3 style={{ fontSize: '18px', margin: 0 }}>{title}</h3>
        <p style={{ margin: 0, color: 'var(--text-2)', lineHeight: 1.5 }}>{message}</p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button 
            onClick={onCancel}
            style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: 'var(--text-2)', fontWeight: 600, cursor: 'pointer', borderRadius: '6px' }}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            style={{ padding: '8px 16px', background: btnColor, color: 'var(--white)', border: 'none', fontWeight: 600, cursor: 'pointer', borderRadius: '6px' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
