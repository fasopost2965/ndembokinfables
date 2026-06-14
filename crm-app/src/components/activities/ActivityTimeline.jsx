import { useState, useMemo } from 'react';
import { useCRM } from '../../contexts/CRMContext';
import { useToast } from '../../contexts/ToastContext';
import ActivityCard from './ActivityCard';
import ActivityForm from './ActivityForm';

export default function ActivityTimeline({ entityType, entityId }) {
  const { state: { activites }, dispatch, confirmAction } = useCRM();
  const addToast = useToast();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  const list = useMemo(() =>
    [...activites]
      .filter(a => a.entityType === entityType && a.entityId === entityId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [activites, entityType, entityId]
  );

  const handleSave = (form) => {
    dispatch({
      type: 'ADD_ACTIVITE',
      payload: {
        id: Date.now(),
        entityType,
        entityId,
        ...form,
        createdAt: new Date().toISOString(),
      },
    });
    setAdding(false);
    addToast('Activité enregistrée.');
  };

  const handleUpdate = (form) => {
    dispatch({ type: 'UPDATE_ACTIVITE', payload: { ...editing, ...form } });
    setEditing(null);
    addToast('Activité mise à jour.');
  };

  const handleDelete = (id) => {
    confirmAction('Supprimer cette activité ?', 'Cette action est irréversible.', () => {
      dispatch({ type: 'DELETE_ACTIVITE', payload: id });
      addToast('Activité supprimée.');
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: '0.12em' }}>
          Historique CRM ({list.length})
        </h3>
        {!adding && (
          <button
            onClick={() => { setEditing(null); setAdding(true); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            + Ajouter
          </button>
        )}
      </div>

      {adding && (
        <div style={{ marginBottom: '16px' }}>
          <ActivityForm onSave={handleSave} onCancel={() => setAdding(false)} />
        </div>
      )}

      {list.length === 0 && !adding ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>💬</div>
          <div style={{ fontFamily: 'var(--font-oswald)', fontSize: '14px', color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            Aucune activité
          </div>
          <p style={{ fontSize: '12.5px', margin: '0 0 14px' }}>Enregistrez un appel, email ou note pour démarrer l&apos;historique.</p>
          <button
            onClick={() => setAdding(true)}
            style={{ padding: '8px 16px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            Première activité
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {list.map(a => (
            editing?.id === a.id ? (
              <ActivityForm
                key={a.id}
                initial={editing}
                onSave={handleUpdate}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <ActivityCard
                key={a.id}
                activite={a}
                onEdit={(act) => { setAdding(false); setEditing(act); }}
                onDelete={handleDelete}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
}
