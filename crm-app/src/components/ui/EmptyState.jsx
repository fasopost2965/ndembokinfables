export default function EmptyState({ title, description, actionLabel, onAction, icon }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--white)', borderRadius: '12px', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(37,67,84,0.05)', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        {icon || (
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-oswald)', fontSize: '18px', fontWeight: 600, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: '14px', color: 'var(--text-2)', maxWidth: '400px', marginBottom: '24px', lineHeight: '1.5' }}>
        {description}
      </div>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          style={{ background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37,67,84,0.15)' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
