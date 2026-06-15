import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Connexion échouée. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)', fontFamily: 'var(--font-open-sans)' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, background: 'var(--navy-dark)', color: 'var(--white)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }} className="desktop-only">
        <div style={{ zIndex: 10, maxWidth: '500px' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--white)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
             <img src="/logo.png" alt="Logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-oswald)', fontSize: '48px', color: 'var(--white)', margin: '0 0 16px 0', lineHeight: 1.1 }}>NDEMBO KIN<br/><span style={{ color: 'var(--red)' }}>CONNECT</span></h1>
          <p style={{ fontSize: '16px', color: '#B9CBD8', lineHeight: 1.6 }}>L'espace premium dédié au pilotage sportif, à la gestion des contrats, des événements et des athlètes élite.</p>
        </div>
        <div style={{ position: 'absolute', right: '-20%', top: '-20%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(188,0,13,0.15) 0%, rgba(22,36,47,0) 70%)', zIndex: 0 }}></div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: 'var(--white)', padding: '40px', borderRadius: '12px', boxShadow: '0 12px 32px rgba(9,29,46,0.08)' }}>
          <div className="mobile-only" style={{ width: '48px', height: '48px', background: 'var(--navy-deep)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
             <img src="/logo.png" alt="Logo" style={{ width: '80%', height: '80%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-oswald)', fontSize: '28px', color: 'var(--navy-deep)', margin: '0 0 8px 0' }}>Connexion</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '13.5px', marginBottom: '32px' }}>Veuillez vous identifier pour accéder au CRM.</p>
          
          {error && <div style={{ background: 'rgba(188,0,13,0.1)', color: 'var(--red)', padding: '12px', borderRadius: '6px', fontSize: '12.5px', marginBottom: '20px', fontWeight: 600 }}>{error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Email professionnel</span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="nom@ndembokin.com" style={{ height: '44px', padding: '0 14px', border: '1px solid var(--border-input)', borderRadius: '6px', outline: 'none', fontSize: '14px' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Mot de passe</span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ height: '44px', padding: '0 14px', border: '1px solid var(--border-input)', borderRadius: '6px', outline: 'none', fontSize: '14px' }} />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
              <a href="#" style={{ fontSize: '11.5px', fontWeight: 600 }}>Mot de passe oublié ?</a>
            </div>
            <button type="submit" disabled={loading} style={{ height: '44px', background: 'var(--red)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '11.5px', color: 'var(--text-3)' }}>
            &copy; 2026 Ndembo Kin Connect SARL.
          </div>
        </div>
      </div>
    </div>
  );
}
