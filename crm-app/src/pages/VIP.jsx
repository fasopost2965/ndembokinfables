import { VIP_TIERS } from '../crm-data';
import { useCRM } from '../contexts/CRMContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../contexts/ToastContext';

const clientNom = (clients, id) => { const c = clients.find(c => c.id === id); return c ? c.nom : '—'; };

// Carte NFC visuelle
function NFCCard({ member, clients }) {
  const tier = VIP_TIERS[member.tier] || VIP_TIERS['Bronze'];
  return (
    <div style={{
      background: `linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-deep) 100%)`,
      borderRadius: '12px',
      padding: '20px',
      color: '#FFFFFF',
      position: 'relative',
      overflow: 'hidden',
      width: '280px',
      minHeight: '158px',
    }}>
      {/* Gold accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: tier.accent }}></div>
      
      {/* Logo watermark */}
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
  const tierColors = {
    'Or': { bg: 'rgba(244,168,0,0.16)', color: '#9A6B00' },
    'Argent': { bg: 'rgba(37,67,84,0.10)', color: '#5B6B77' },
    'Bronze': { bg: 'rgba(192,138,77,0.16)', color: '#A86B2F' },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Relations</div>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Membres VIP</h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-2)' }}>Programme de fidélité — cartes NFC Or, Argent et Bronze.</p>
        </div>
        <button style={{ background: 'var(--gold)', color: 'var(--on-dark)', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
          + Affilier au programme
        </button>
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
        {vipMembers.length === 0 ? (
          <div style={{ padding: '20px' }}>
            <EmptyState 
              title="Aucun membre VIP" 
              description="Affiliez vos clients pour générer des cartes NFC."
              actionLabel="+ Affilier au programme"
              onAction={() => {}}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {vipMembers.map(m => <NFCCard key={m.carte} member={m} clients={clients} />)}
          </div>
        )}
      </div>

      {/* Table */}
      {vipMembers.length > 0 && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="responsive-table-header" style={{ display: 'grid', gridTemplateColumns: '1fr 80px 160px 100px 100px 110px 40px', padding: '10px 20px', background: 'var(--navy-deep)', color: 'var(--white)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span>Client</span><span>Tier</span><span style={{ fontFamily: 'var(--font-jetbrains)' }}>Carte NFC</span><span>Depuis</span><span>Expire</span><span style={{ textAlign: 'right' }}>Statut</span><span></span>
          </div>

        <div className="responsive-table">
        {vipMembers.map((m, i) => {
          const tc = tierColors[m.tier] || tierColors['Bronze'];
          return (
            <div key={m.carte} className="responsive-table-row" style={{ display: 'grid', gridTemplateColumns: '1fr 80px 160px 100px 100px 110px 40px', alignItems: 'center', padding: '13px 20px', borderTop: '1px solid var(--border)', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
            >
              <span className="responsive-table-cell" data-label="Client" style={{ fontWeight: 700, fontSize: '13px' }}>{clientNom(clients, m.clientId)}</span>
              <span className="responsive-table-cell" data-label="Tier"><span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 9px', borderRadius: '99px', background: tc.bg, color: tc.color }}>{m.tier}</span></span>
              <span className="responsive-table-cell" data-label="Carte NFC" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', color: 'var(--text-2)' }}>{m.carte}</span>
              <span className="responsive-table-cell" data-label="Depuis" style={{ fontSize: '12px', color: 'var(--text-2)' }}>{m.depuis}</span>
              <span className="responsive-table-cell" data-label="Expire" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', color: 'var(--text-2)' }}>{m.expire}</span>
              <span className="responsive-table-cell" data-label="Statut" style={{ textAlign: 'right' }}><StatusBadge status={m.statut} /></span>
              <span className="responsive-table-cell" data-label="Action" style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingLeft: '8px' }}>
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
      </div>
      )}
    </div>
  );
}
