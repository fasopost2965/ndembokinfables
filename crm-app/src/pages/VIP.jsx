import { useState } from 'react';
import { VIP_TIERS, genCarteNFC } from '../crm-data';
import { useCRM } from '../contexts/CRMContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import Drawer from '../components/ui/Drawer';
import { useToast } from '../contexts/ToastContext';
import { useSearchParams } from 'react-router-dom';
import { TypeCards, ValidationSummary } from '../components/ui/FormControls';

const clientNom = (clients, id) => { const c = clients.find(c => c.id === id); return c ? c.nom : '—'; };

const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--border-input)', borderRadius: '6px', fontSize: '13.5px', boxSizing: 'border-box', background: 'var(--white)', color: 'var(--text-1)' };
const labelStyle = { fontSize: '12px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '6px', display: 'block' };
const fieldStyle = { marginBottom: '20px' };

const EMPTY_FORM = { clientId: '', tier: 'Or', expire: '', statut: 'Actif' };

function NFCCard({ member, clients }) {
  const tier = VIP_TIERS[member.tier] || VIP_TIERS['Bronze'];
  return (
    <div style={{
      background: `linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-deep) 100%)`,
      borderRadius: '12px', padding: '20px', color: '#FFFFFF',
      position: 'relative', overflow: 'hidden', width: '280px', minHeight: '158px',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: tier.accent }}></div>
      <div style={{ position: 'absolute', right: '-12px', bottom: '-10px', width: '80px', height: '80px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-oswald)', fontSize: '24px', fontWeight: 700, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.05em' }}>NK</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: tier.accent }}>{member.tier} MEMBER</span>
        <svg width="28" height="18" viewBox="0 0 32 22" fill="none">
          <rect width="32" height="22" rx="3" fill="rgba(255,255,255,0.08)"/>
          <path d="M4 11 Q8 6 12 11 Q16 16 20 11 Q24 6 28 11" stroke={tier.accent} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>{member.carte}</div>
      <div style={{ fontFamily: 'var(--font-oswald)', fontWeight: 600, fontSize: '14px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{clientNom(clients, member.clientId)}</div>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px', fontFamily: 'var(--font-jetbrains)' }}>VALIDE JUSQU'AU {member.expire}</div>
    </div>
  );
}

export default function VIP() {
  const { state: { vipMembers, clients }, dispatch, confirmAction } = useCRM();
  const addToast = useToast();
  const [searchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(() => searchParams.get('action') === 'new');
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const [filterTier, setFilterTier] = useState('Tous');

  const tierColors = {
    'Or': { bg: 'rgba(244,168,0,0.16)', color: '#9A6B00' },
    'Argent': { bg: 'rgba(37,67,84,0.10)', color: '#5B6B77' },
    'Bronze': { bg: 'rgba(192,138,77,0.16)', color: '#A86B2F' },
  };

  const enrolledIds = new Set(vipMembers.map(m => m.clientId));
  const filteredMembers = filterTier === 'Tous' ? vipMembers : vipMembers.filter(m => m.tier === filterTier);

  const exportCSV = () => {
    const headers = ['Carte NFC', 'Client', 'Tier', 'Depuis', 'Expire', 'Statut'];
    const rows = vipMembers.map(m => [
      m.carte,
      clientNom(clients, m.clientId),
      m.tier,
      m.depuis,
      m.expire,
      m.statut,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'membres-vip.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (m) => {
    setEditTarget(m);
    setForm({ clientId: m.clientId, tier: m.tier, expire: m.expire, statut: m.statut });
    setErrors({});
    setDrawerOpen(true);
  };

  const handleSave = () => {
    const errs = {};
    if (!editTarget && !form.clientId) errs.clientId = 'Sélectionnez un client';
    if (!form.expire) errs.expire = "La date d'expiration est requise";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const toExpireFormat = (raw) => {
      if (!raw) return raw;
      if (raw.includes('/')) return raw;
      const [y, m] = raw.split('-');
      return `${m}/${y}`;
    };
    if (editTarget) {
      dispatch({ type: 'UPDATE_VIP', payload: { ...editTarget, tier: form.tier, expire: toExpireFormat(form.expire), statut: form.statut } });
      addToast('Membre VIP mis à jour.');
    } else {
      const clientId = Number(form.clientId);
      const moisAnnee = toExpireFormat(form.expire);
      const moisDebut = (() => {
        const d = new Date();
        const MOIS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];
        return MOIS[d.getMonth()] + ' ' + d.getFullYear();
      })();
      dispatch({ type: 'ADD_VIP', payload: { clientId, tier: form.tier, statut: form.statut, carte: genCarteNFC(), depuis: moisDebut, expire: moisAnnee } });
      addToast('Membre VIP affilié. Carte NFC générée.');
    }
    setDrawerOpen(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Relations</div>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Membres VIP</h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-2)' }}>Programme de fidélité — cartes NFC Or, Argent et Bronze.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={exportCSV} style={{ background: 'var(--white)', border: '1px solid var(--border-input)', padding: '8px 14px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-2)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <button onClick={openCreate} style={{ background: 'var(--gold)', color: 'var(--on-dark)', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
            + Affilier au programme
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', marginBottom: '20px', alignSelf: 'flex-start' }}>
        {['Tous', 'Or', 'Argent', 'Bronze'].map(t => (
          <button key={t} onClick={() => setFilterTier(t)} style={{ background: filterTier === t ? 'var(--navy-deep)' : 'transparent', color: filterTier === t ? 'var(--white)' : 'var(--text-2)', border: 'none', padding: '5px 14px', borderRadius: '5px', fontWeight: filterTier === t ? 700 : 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s' }}>
            {t}
            {t !== 'Tous' && <span style={{ marginLeft: '5px', opacity: 0.7, fontSize: '10.5px' }}>({vipMembers.filter(m => m.tier === t).length})</span>}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '14px', marginBottom: '28px' }}>
        {Object.entries(VIP_TIERS).map(([tier, info]) => {
          const count = vipMembers.filter(m => m.tier === tier).length;
          return (
            <div key={tier} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderLeft: `3px solid ${info.accent}`, borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: '0.1em' }}>{tier}</div>
              <div style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '24px', marginTop: '6px', color: info.chip }}>{count}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{info.remise} · {info.prix} USD/an</div>
            </div>
          );
        })}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderLeft: '3px solid var(--navy-deep)', borderRadius: '8px', padding: '14px 16px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: '0.1em' }}>Total membres</div>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '24px', marginTop: '6px' }}>{vipMembers.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>cartes NFC actives</div>
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontFamily: 'var(--font-oswald)', fontSize: '15px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--navy-deep)', letterSpacing: '0.04em', marginBottom: '14px' }}>Cartes NFC émises</div>
        {filteredMembers.length === 0 ? (
          <div style={{ padding: '20px' }}>
            <EmptyState
              title={filterTier === 'Tous' ? 'Aucun membre VIP' : `Aucun membre ${filterTier}`}
              description="Affiliez vos clients pour générer des cartes NFC."
              actionLabel="+ Affilier au programme"
              onAction={openCreate}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {filteredMembers.map(m => <NFCCard key={m.carte} member={m} clients={clients} />)}
          </div>
        )}
      </div>

      {/* Table */}
      {filteredMembers.length > 0 && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 160px 100px 100px 110px 72px', padding: '10px 20px', background: 'var(--navy-deep)', color: 'var(--white)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span>Client</span><span>Tier</span><span style={{ fontFamily: 'var(--font-jetbrains)' }}>Carte NFC</span><span>Depuis</span><span>Expire</span><span style={{ textAlign: 'right' }}>Statut</span><span></span>
          </div>
          {filteredMembers.map((m) => {
            const tc = tierColors[m.tier] || tierColors['Bronze'];
            return (
              <div key={m.carte} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 160px 100px 100px 110px 72px', alignItems: 'center', padding: '13px 20px', borderTop: '1px solid var(--border)', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
              >
                <span style={{ fontWeight: 700, fontSize: '13px' }}>{clientNom(clients, m.clientId)}</span>
                <span><span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 9px', borderRadius: '99px', background: tc.bg, color: tc.color }}>{m.tier}</span></span>
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', color: 'var(--text-2)' }}>{m.carte}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{m.depuis}</span>
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', color: 'var(--text-2)' }}>{m.expire}</span>
                <span style={{ textAlign: 'right' }}><StatusBadge status={m.statut} /></span>
                <span style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', alignItems: 'center' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(m); }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-3)' }}
                    title="Modifier"
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmAction('Révoquer ce membre VIP ?', `Attention, la carte de "${clientNom(clients, m.clientId)}" sera révoquée.`, () => {
                        dispatch({ type: 'DELETE_VIP', payload: m.clientId });
                        addToast(`Carte VIP de ${clientNom(clients, m.clientId)} révoquée.`);
                      });
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-3)' }}
                    title="Révoquer"
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editTarget ? 'Modifier le membre VIP' : 'Affilier au programme VIP'}
        footer={
          <>
            <button onClick={() => setDrawerOpen(false)} style={{ padding: '9px 18px', border: '1px solid var(--border-input)', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
            <button onClick={handleSave} style={{ padding: '9px 18px', background: 'var(--gold)', color: 'var(--on-dark)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              {editTarget ? 'Enregistrer' : 'Affilier & générer carte'}
            </button>
          </>
        }
      >
        <ValidationSummary errors={errors} />
        {!editTarget && (
          <div style={fieldStyle}>
            <label style={{ ...labelStyle, color: errors.clientId ? 'var(--red)' : undefined }}>Client *</label>
            <select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} style={{ ...inputStyle, borderColor: errors.clientId ? 'var(--red)' : undefined }}>
              <option value="">— Sélectionner un client —</option>
              {clients.filter(c => !enrolledIds.has(c.id)).map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            {errors.clientId && <div style={{ fontSize: '12px', color: 'var(--red)', marginTop: '4px' }}>{errors.clientId}</div>}
            {clients.filter(c => !enrolledIds.has(c.id)).length === 0 && (
              <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '6px' }}>Tous les clients sont déjà affiliés au programme VIP.</div>
            )}
          </div>
        )}
        {editTarget && (
          <div style={{ ...fieldStyle, padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>Client</div>
            <div style={{ fontWeight: 700, marginTop: '2px' }}>{clientNom(clients, editTarget.clientId)}</div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: 'var(--text-3)', marginTop: '4px' }}>{editTarget.carte}</div>
          </div>
        )}
        <div style={fieldStyle}>
          <TypeCards
            label="Tier"
            value={form.tier}
            onChange={v => setForm(f => ({ ...f, tier: v }))}
            options={Object.entries(VIP_TIERS).map(([t, info]) => ({
              value: t, label: t,
              icon: t === 'Or' ? '★' : t === 'Argent' ? '◈' : '◆',
              color: info.chip, bg: info.bg,
            }))}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '6px', paddingLeft: '2px' }}>
            {VIP_TIERS[form.tier]?.remise} · {VIP_TIERS[form.tier]?.prix} USD/an
          </div>
        </div>
        <div style={fieldStyle}>
          <label style={{ ...labelStyle, color: errors.expire ? 'var(--red)' : undefined }}>Date d'expiration *</label>
          <input
            type="month"
            value={form.expire.includes('/') ? `${form.expire.split('/')[1]}-${form.expire.split('/')[0]}` : form.expire}
            onChange={e => setForm(f => ({ ...f, expire: e.target.value }))}
            style={{ ...inputStyle, height: '40px', borderRadius: '6px', borderColor: errors.expire ? 'var(--red)' : undefined }}
          />
          {errors.expire && <div style={{ fontSize: '12px', color: 'var(--red)', marginTop: '4px' }}>{errors.expire}</div>}
        </div>
        <div style={fieldStyle}>
          <TypeCards
            label="Statut"
            value={form.statut}
            onChange={v => setForm(f => ({ ...f, statut: v }))}
            options={[
              { value: 'Actif', label: 'Actif', icon: '✓', color: 'var(--success)', bg: 'rgba(23,126,84,0.08)' },
              { value: 'Expire bientôt', label: 'Expire bientôt', icon: '⚠', color: 'var(--gold-text)', bg: 'rgba(244,168,0,0.1)' },
              { value: 'Expiré', label: 'Expiré', icon: '✕', color: 'var(--red)', bg: 'rgba(188,0,13,0.06)' },
            ]}
          />
        </div>
      </Drawer>
    </div>
  );
}
