import { useState } from 'react';

/* ─── Wrappers structurels ─────────────────────────────────────────────── */

export function FormSection({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px' }}>
        <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--navy-deep)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '2px' }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>{children}</div>
    </div>
  );
}

export function FormRow({ children, cols = '1fr 1fr' }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '12px' }}>{children}</div>
  );
}

/* ─── TextField ────────────────────────────────────────────────────────── */

export function TextField({ label, value, onChange, required, placeholder = '', type = 'text', error, mono, maxLength, hint }) {
  const hasError = !!error;
  const borderColor = hasError ? 'var(--red)' : value ? 'var(--cyan)' : 'var(--border-input)';
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: hasError ? 'var(--red)' : 'var(--text-2)' }}>
        {label}{required && <span style={{ color: 'var(--red)', marginLeft: '3px' }}>*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{ height: '38px', border: `1px solid ${borderColor}`, borderRadius: '6px', padding: '0 12px', fontSize: '13px', fontFamily: mono ? 'var(--font-jetbrains)' : 'inherit', outline: 'none', background: 'var(--white)', color: 'var(--text-1)', transition: 'border-color 0.15s', boxSizing: 'border-box', width: '100%' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
        {hasError && <span style={{ color: 'var(--red)' }}>{error}</span>}
        {hint && !hasError && <span style={{ color: 'var(--text-3)' }}>{hint}</span>}
        {maxLength && <span style={{ color: 'var(--text-3)', marginLeft: 'auto' }}>{(value || '').length}/{maxLength}</span>}
      </div>
    </label>
  );
}

/* ─── SelectField ──────────────────────────────────────────────────────── */

export function SelectField({ label, value, onChange, options, required, error, hint }) {
  const hasError = !!error;
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: hasError ? 'var(--red)' : 'var(--text-2)' }}>
        {label}{required && <span style={{ color: 'var(--red)', marginLeft: '3px' }}>*</span>}
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ height: '38px', border: `1px solid ${hasError ? 'var(--red)' : value ? 'var(--cyan)' : 'var(--border-input)'}`, borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'var(--white)', color: 'var(--text-1)', outline: 'none', cursor: 'pointer', transition: 'border-color 0.15s', boxSizing: 'border-box', width: '100%' }}
      >
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
      {hasError && <span style={{ fontSize: '11px', color: 'var(--red)' }}>{error}</span>}
      {hint && !hasError && <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{hint}</span>}
    </label>
  );
}

/* ─── TextareaField ────────────────────────────────────────────────────── */

export function TextareaField({ label, value, onChange, required, placeholder = '', rows = 3, maxLength, error, hint }) {
  const hasError = !!error;
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: hasError ? 'var(--red)' : 'var(--text-2)' }}>
        {label}{required && <span style={{ color: 'var(--red)', marginLeft: '3px' }}>*</span>}
      </span>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        style={{ border: `1px solid ${hasError ? 'var(--red)' : value ? 'var(--cyan)' : 'var(--border-input)'}`, borderRadius: '6px', padding: '9px 12px', fontSize: '13px', resize: 'vertical', outline: 'none', fontFamily: 'var(--font-open-sans)', lineHeight: 1.55, transition: 'border-color 0.15s' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
        {hasError ? <span style={{ color: 'var(--red)' }}>{error}</span> : hint ? <span style={{ color: 'var(--text-3)' }}>{hint}</span> : <span />}
        {maxLength && <span style={{ color: 'var(--text-3)' }}>{(value || '').length}/{maxLength}</span>}
      </div>
    </label>
  );
}

/* ─── AmountField ──────────────────────────────────────────────────────── */

export function AmountField({ label, value, onChange, required, error, currency = 'USD', hint }) {
  const hasError = !!error;
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: hasError ? 'var(--red)' : 'var(--text-2)' }}>
        {label}{required && <span style={{ color: 'var(--red)', marginLeft: '3px' }}>*</span>}
      </span>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '12px', color: 'var(--text-3)' }}>{currency === 'USD' ? '$' : 'FC'}</span>
        <input
          type="number"
          min="0"
          step="any"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="0"
          style={{ width: '100%', height: '38px', border: `1px solid ${hasError ? 'var(--red)' : value ? 'var(--cyan)' : 'var(--border-input)'}`, borderRadius: '6px', padding: '0 12px 0 28px', fontSize: '13px', fontFamily: 'var(--font-jetbrains)', outline: 'none', background: 'var(--white)', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
        />
        {value > 0 && (
          <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: 'var(--text-3)', pointerEvents: 'none' }}>{currency}</span>
        )}
      </div>
      {hasError ? <span style={{ fontSize: '11px', color: 'var(--red)' }}>{error}</span> : hint && <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{hint}</span>}
      {value > 0 && <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{Number(value).toLocaleString('fr-FR')} {currency}</span>}
    </label>
  );
}

/* ─── DateField ────────────────────────────────────────────────────────── */

export function DateField({ label, value, onChange, required, error, hint, shortcuts }) {
  const hasError = !!error;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: hasError ? 'var(--red)' : 'var(--text-2)' }}>
        {label}{required && <span style={{ color: 'var(--red)', marginLeft: '3px' }}>*</span>}
      </span>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ height: '38px', border: `1px solid ${hasError ? 'var(--red)' : value ? 'var(--cyan)' : 'var(--border-input)'}`, borderRadius: '6px', padding: '0 12px', fontSize: '13px', outline: 'none', background: 'var(--white)', transition: 'border-color 0.15s', fontFamily: 'var(--font-jetbrains)', boxSizing: 'border-box', width: '100%' }}
      />
      {shortcuts && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {shortcuts.map(s => (
            <button key={s.label} type="button" onClick={() => onChange(s.value)}
              style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border-input)', background: value === s.value ? 'var(--cyan)' : 'var(--white)', color: value === s.value ? 'var(--white)' : 'var(--text-2)', cursor: 'pointer' }}>
              {s.label}
            </button>
          ))}
        </div>
      )}
      {hasError ? <span style={{ fontSize: '11px', color: 'var(--red)' }}>{error}</span> : hint && <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{hint}</span>}
    </div>
  );
}

/* ─── SliderField ──────────────────────────────────────────────────────── */

export function SliderField({ label, value, onChange, min = 0, max = 100, step = 5, hint }) {
  const pct = Math.round((value - min) / (max - min) * 100);
  const color = pct >= 100 ? 'var(--success)' : pct >= 60 ? 'var(--cyan)' : pct >= 30 ? 'var(--gold)' : 'var(--navy-mid)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '14px', color }}>{value}{max === 100 ? '%' : ''}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color, cursor: 'pointer' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-3)' }}>
        <span>{min}{max === 100 ? '%' : ''}</span>
        <span>{max / 2}{max === 100 ? '%' : ''}</span>
        <span>{max}{max === 100 ? '%' : ''}</span>
      </div>
      {hint && <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{hint}</span>}
    </div>
  );
}

/* ─── TypeCards — sélecteur visuel en pills ────────────────────────────── */

export function TypeCards({ label, value, onChange, options, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)' }}>
        {label}{required && <span style={{ color: 'var(--red)', marginLeft: '3px' }}>*</span>}
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {options.map(o => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          const active = value === opt.value;
          return (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px', borderRadius: '8px', border: `2px solid ${active ? (opt.color || 'var(--cyan)') : 'var(--border)'}`, background: active ? (opt.bg || 'rgba(30,159,216,0.08)') : 'var(--white)', cursor: 'pointer', transition: 'all 0.15s', fontSize: '12.5px', fontWeight: active ? 700 : 500, color: active ? (opt.color || 'var(--navy-deep)') : 'var(--text-2)' }}>
              {opt.icon && <span style={{ fontSize: '14px' }}>{opt.icon}</span>}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── EntitySelector — sélecteur avec recherche inline ─────────────────── */

export function EntitySelector({ label, value, onChange, options, placeholder = 'Choisir…', required, error, renderOption }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const selected = options.find(o => String(o.id) === String(value));
  const filtered = search ? options.filter(o => o.nom.toLowerCase().includes(search.toLowerCase())) : options;
  const hasError = !!error;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', position: 'relative' }}>
      <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: hasError ? 'var(--red)' : 'var(--text-2)' }}>
        {label}{required && <span style={{ color: 'var(--red)', marginLeft: '3px' }}>*</span>}
      </span>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button type="button" onClick={() => setOpen(!open)}
          style={{ flex: 1, height: '38px', border: `1px solid ${hasError ? 'var(--red)' : selected ? 'var(--cyan)' : 'var(--border-input)'}`, borderRadius: '6px', padding: '0 12px', fontSize: '13px', background: 'var(--white)', color: selected ? 'var(--text-1)' : 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', transition: 'border-color 0.15s', minWidth: 0 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selected ? (renderOption ? renderOption(selected) : selected.nom) : placeholder}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        {selected && (
          <button type="button" onClick={() => { onChange(''); setSearch(''); }}
            title="Effacer la sélection"
            style={{ width: '38px', height: '38px', flexShrink: 0, border: '1px solid var(--border-input)', borderRadius: '6px', background: 'var(--white)', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.color = 'var(--text-3)'; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, marginTop: '4px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(9,29,46,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '8px' }}>
              <input autoFocus placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', height: '32px', border: '1px solid var(--border-input)', borderRadius: '5px', padding: '0 10px', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filtered.length === 0 && <div style={{ padding: '12px 14px', fontSize: '12.5px', color: 'var(--text-3)' }}>Aucun résultat</div>}
              {filtered.map(o => (
                <div key={o.id} onClick={() => { onChange(String(o.id)); setOpen(false); setSearch(''); }}
                  style={{ padding: '9px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: String(o.id) === String(value) ? 700 : 400, background: String(o.id) === String(value) ? 'var(--bg-page)' : 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-page)'}
                  onMouseLeave={e => e.currentTarget.style.background = String(o.id) === String(value) ? 'var(--bg-page)' : 'transparent'}>
                  {renderOption ? renderOption(o) : (
                    <>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--navy-deep)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                        {o.nom.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{o.nom}</div>
                        {o.type && <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{o.type}{o.ville ? ' · ' + o.ville : ''}</div>}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {hasError && <span style={{ fontSize: '11px', color: 'var(--red)' }}>{error}</span>}
    </div>
  );
}

/* ─── ToggleSwitch ─────────────────────────────────────────────────────── */

export function ToggleSwitch({ label, checked, onChange, hint }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{label}</div>
        {hint && <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '2px' }}>{hint}</div>}
      </div>
      <div onClick={() => onChange(!checked)}
        style={{ width: '44px', height: '24px', borderRadius: '99px', background: checked ? 'var(--cyan)' : 'var(--border-input)', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s', marginLeft: '16px' }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '99px', background: 'var(--white)', position: 'absolute', top: '2px', left: checked ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </div>
    </div>
  );
}

/* ─── ValidationSummary ────────────────────────────────────────────────── */

export function ValidationSummary({ errors }) {
  const errs = Object.values(errors).filter(Boolean);
  if (errs.length === 0) return null;
  return (
    <div style={{ background: 'rgba(188,0,13,0.06)', border: '1px solid rgba(188,0,13,0.2)', borderRadius: '6px', padding: '10px 14px', marginBottom: '4px' }}>
      <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--red)', marginBottom: '4px' }}>Veuillez corriger les erreurs suivantes :</div>
      {errs.map((e, i) => <div key={i} style={{ fontSize: '11.5px', color: 'var(--red)' }}>• {e}</div>)}
    </div>
  );
}
