import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800); // Auto-dismiss 2.8s
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        bottom: '26px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 200,
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: 'var(--navy-dark)',
            color: 'var(--white)',
            padding: '12px 20px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 8px 24px rgba(9, 29, 46, 0.2)',
            animation: 'slideUp 0.25s ease-out forwards',
            fontWeight: 600,
            fontSize: '13.5px'
          }}>
            {t.type === 'success' ? (
              <CheckCircle2 size={18} color="var(--success)" />
            ) : (
              <AlertCircle size={18} color="var(--red)" />
            )}
            {t.message}
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
