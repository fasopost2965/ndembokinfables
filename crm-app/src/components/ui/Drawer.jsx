import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, title, children, footer, width = '470px' }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(9, 29, 46, 0.42)',
          animation: 'fadeIn 0.2s ease-out'
        }} 
      />
      
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: width, maxWidth: '100%',
        background: 'var(--white)', zIndex: 100, boxShadow: '-12px 0 40px rgba(9, 29, 46, 0.2)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.22s ease-out'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '20px', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-3)' }}>
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div style={{ padding: '20px 32px', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {footer}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}} />
    </>
  );
}
