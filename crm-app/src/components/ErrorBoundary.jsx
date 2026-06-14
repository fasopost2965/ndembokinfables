import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-open-sans)', color: 'var(--text-1)' }}>
          <h1 style={{ fontFamily: 'var(--font-oswald)', color: 'var(--red)', fontSize: '32px' }}>Oups ! Une erreur est survenue.</h1>
          <p style={{ color: 'var(--text-2)' }}>Le CRM a rencontré un problème inattendu. Veuillez rafraîchir la page.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 24px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
          >
            Rafraîchir
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
