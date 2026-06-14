import { useState } from 'react';
import { ACTIVITE_TYPES } from './activite-config';

const EMPTY = { type: 'note', contenu: '', auteur: '', date: '' };

export default function ActivityForm({ onSave, onCancel, initial = null }) {
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY, date: new Date().toISOString().slice(0, 10) });
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.contenu.trim()) { setError('Le contenu est requis.'); return; }
    setError('');
    onSave(form);
  };

  const labelStyle = { fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' };
  const inputStyle = { height: '36px', border: '1px solid var(--border-input)', borderRadius: '6px', padding: '0 10px', fontSize: '13px', width: '100%', boxSizing: 'border-box', background: 'var(--white)' };

  return (
    <div style={{ background: 'var(--bg-page)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <label>
          <span style={labelStyle}>Type</span>
          <select value={form.type} onChange={e => set('type', e.target.value)} style={inputStyle}>
            {ACTIVITE_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </label>
        <label>
          <span style={labelStyle}>Date</span>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputStyle} />
        </label>
      </div>
      <label>
        <span style={labelStyle}>Contenu *</span>
        <textarea
          value={form.contenu}
          onChange={e => set('contenu', e.target.value)}
          placeholder="Résumé de l'activité…"
          rows={3}
          style={{ border: `1px solid ${error ? 'var(--red)' : 'var(--border-input)'}`, borderRadius: '6px', padding: '8px 10px', fontSize: '13px', width: '100%', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.5 }}
        />
        {error && <span style={{ fontSize: '11px', color: 'var(--red)' }}>{error}</span>}
      </label>
      <label>
        <span style={labelStyle}>Auteur</span>
        <input value={form.auteur} onChange={e => set('auteur', e.target.value)} placeholder="Votre nom" style={inputStyle} />
      </label>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '7px 14px', border: '1px solid var(--border-input)', borderRadius: '6px', background: 'var(--white)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--text-2)' }}>
          Annuler
        </button>
        <button onClick={handleSave} style={{ padding: '7px 16px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
          {initial ? 'Mettre à jour' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
