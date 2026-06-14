import { useCRM } from '../contexts/CRMContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../contexts/ToastContext';

export default function Projets() {
  const { state: { projets, clients }, dispatch, confirmAction } = useCRM();
  const addToast = useToast();
  const clientNom = (id) => { const c = clients.find(c => c.id === id); return c ? c.nom : '—'; };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Commercial</div>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Projets</h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-2)' }}>Suivi de l'avancement des projets en cours.</p>
        </div>
        <button style={{ background: 'var(--red)', color: 'var(--white)', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
          + Nouveau projet
        </button>
      </div>

      {projets.length === 0 ? (
        <div style={{ padding: '40px 20px' }}>
          <EmptyState 
            title="Aucun projet en cours" 
            description="Démarrez un nouveau projet pour le suivre ici."
            actionLabel="+ Nouveau projet"
            onAction={() => {}}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {projets.map(p => (
          <div key={p.ref} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '18px 20px', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(30,159,216,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', fontWeight: 700, color: 'var(--text-3)' }}>{p.ref}</span>
              <StatusBadge status={p.statut} />
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--navy-deep)', lineHeight: 1.35, marginBottom: '6px' }}>{p.nom}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '14px' }}>{clientNom(p.clientId)}</div>
            
            {/* Progress Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
              <div style={{ flex: 1, marginRight: '16px' }}>
                <div style={{ height: '6px', background: 'var(--bg-page)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.avancement}%`, background: p.statut === 'Terminé' ? 'var(--success)' : 'var(--cyan)', borderRadius: '99px', transition: 'width 0.3s ease' }}></div>
                </div>
                <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: 'var(--text-2)', marginTop: '5px' }}>{p.avancement}% achevé</div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  confirmAction('Supprimer ce projet ?', `Attention, la suppression de ${p.nom} est définitive.`, () => {
                    dispatch({ type: 'DELETE_PROJET', payload: p.ref });
                    addToast(`Projet ${p.nom} supprimé.`);
                  });
                }} 
                style={{ background: 'transparent', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }} 
                title="Supprimer" 
                onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'} 
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
