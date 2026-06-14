import { useState } from 'react';
import { useCRM } from '../contexts/CRMContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import Drawer from '../components/ui/Drawer';
import { useToast } from '../contexts/ToastContext';
import { nextNumero } from '../crm-data';
import { FormSection, FormRow, TextField, TextareaField, DateField, TypeCards, EntitySelector, SliderField, ValidationSummary } from '../components/ui/FormControls';

const EMPTY_FORM = { clientId: '', nom: '', description: '', statut: 'Planifié', avancement: 0, dateDebut: '', dateFin: '' };

export default function Projets() {
  const { state: { projets, clients }, dispatch, confirmAction } = useCRM();
  const addToast = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [errors, setErrors] = useState({});
  const clientNom = (id) => { const c = clients.find(c => c.id === id); return c ? c.nom : '—'; };

  const openCreate = () => {
    setEditTarget(null); setForm(EMPTY_FORM); setErrors({}); setDrawerOpen(true);
  };

  const openEdit = (p) => {
    setEditTarget(p);
    setForm({ clientId: p.clientId ?? '', nom: p.nom, description: p.description || '', statut: p.statut, avancement: p.avancement, dateDebut: p.dateDebut || '', dateFin: p.dateFin || '' });
    setErrors({}); setDrawerOpen(true);
  };

  const setStatut = (v) => setForm(f => ({
    ...f,
    statut: v,
    avancement: v === 'Terminé' ? 100 : (v === 'Planifié' && f.avancement === 100 ? 0 : f.avancement),
  }));

  const setAvancement = (v) => setForm(f => ({
    ...f,
    avancement: v,
    statut: v === 100 ? 'Terminé' : (f.statut === 'Terminé' ? 'En cours' : f.statut),
  }));

  const handleSave = () => {
    const errs = {};
    if (!form.clientId) errs.client = 'Veuillez sélectionner un client';
    if (!form.nom.trim()) errs.nom = 'Le nom du projet est requis';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (editTarget) {
      dispatch({ type: 'UPDATE_PROJET', payload: { ...editTarget, ...form, clientId: Number(form.clientId), avancement: Number(form.avancement) } });
      addToast('Projet mis à jour.');
    } else {
      const ref = nextNumero('PRJ-', new Date().getFullYear(), projets.map(p => p.ref));
      dispatch({ type: 'ADD_PROJET', payload: { ref, clientId: Number(form.clientId), nom: form.nom, description: form.description, statut: form.statut, avancement: Number(form.avancement), dateDebut: form.dateDebut, dateFin: form.dateFin } });
      addToast('Projet créé.');
    }
    setDrawerOpen(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Commercial</div>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Projets</h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-2)' }}>Suivi de l'avancement des projets en cours.</p>
        </div>
        <button onClick={openCreate} style={{ background: 'var(--red)', color: 'var(--white)', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
          + Nouveau projet
        </button>
      </div>

      {projets.length === 0 ? (
        <div style={{ padding: '40px 20px' }}>
          <EmptyState
            title="Aucun projet en cours"
            description="Démarrez un nouveau projet pour le suivre ici."
            actionLabel="+ Nouveau projet"
            onAction={openCreate}
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                <div style={{ flex: 1, marginRight: '16px' }}>
                  <div style={{ height: '6px', background: 'var(--bg-page)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p.avancement}%`, background: p.statut === 'Terminé' ? 'var(--success)' : 'var(--cyan)', borderRadius: '99px', transition: 'width 0.3s ease' }}></div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: 'var(--text-2)', marginTop: '5px' }}>{p.avancement}% achevé</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                    style={{ background: 'transparent', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}
                    title="Modifier"
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
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
            </div>
          ))}
        </div>
      )}

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editTarget ? 'Modifier le projet' : 'Nouveau projet'}
        width="520px"
        footer={
          <>
            <button onClick={() => setDrawerOpen(false)} style={{ padding: '10px 18px', border: '1px solid var(--border-input)', borderRadius: '6px', background: 'var(--white)', cursor: 'pointer', fontWeight: 700, color: 'var(--text-2)' }}>Annuler</button>
            <button onClick={handleSave} style={{ padding: '10px 22px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              {editTarget ? 'Enregistrer les modifications' : 'Créer le projet'}
            </button>
          </>
        }
      >
        <ValidationSummary errors={errors} />

        <FormSection title="Identification" subtitle="Client et intitulé du projet">
          <EntitySelector
            label="Client" value={form.clientId} onChange={v => setForm(f => ({ ...f, clientId: v }))}
            required options={clients} error={errors.client}
            placeholder="Rechercher un client…"
          />
          <TextField
            label="Nom du projet" value={form.nom} onChange={v => setForm(f => ({ ...f, nom: v }))}
            required placeholder="Ex. Tournoi corporate Mazembe" maxLength={80}
            error={errors.nom}
          />
          <TextareaField
            label="Description (optionnelle)" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))}
            placeholder="Contexte, objectifs, livrables attendus…" rows={3} maxLength={400}
          />
        </FormSection>

        <FormSection title="Calendrier" subtitle="Dates de début et de fin prévues">
          <FormRow>
            <DateField label="Date de début" value={form.dateDebut} onChange={v => setForm(f => ({ ...f, dateDebut: v }))} />
            <DateField label="Date de fin prévue" value={form.dateFin} onChange={v => setForm(f => ({ ...f, dateFin: v }))} hint="Optionnelle" />
          </FormRow>
        </FormSection>

        <FormSection title="Statut & Avancement" subtitle="Progression du projet">
          <TypeCards label="Statut" value={form.statut} onChange={setStatut} options={[
            { value: 'Planifié', label: 'Planifié', icon: '📋', color: 'var(--text-2)', bg: 'var(--bg-page)' },
            { value: 'En cours', label: 'En cours', icon: '▶️', color: 'var(--cyan)', bg: 'rgba(30,159,216,0.08)' },
            { value: 'Terminé', label: 'Terminé', icon: '✅', color: 'var(--success)', bg: 'rgba(23,126,84,0.08)' },
          ]} />
          <SliderField
            label="Avancement" value={Number(form.avancement)} onChange={setAvancement}
            hint={form.statut === 'Terminé' ? 'Projet terminé — avancement à 100 %' : undefined}
          />
        </FormSection>

        {form.clientId && form.nom && (
          <div style={{ background: 'var(--bg-page)', borderRadius: '8px', padding: '14px 16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: '10px' }}>Récapitulatif</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-2)' }}>Client</span>
              <span style={{ fontWeight: 700 }}>{clientNom(Number(form.clientId))}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-2)' }}>Statut</span>
              <span style={{ fontWeight: 700 }}>{form.statut}</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${form.avancement}%`, background: form.statut === 'Terminé' ? 'var(--success)' : 'var(--cyan)', borderRadius: '99px', transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: 'var(--text-3)', marginTop: '5px', textAlign: 'right' }}>{form.avancement}% achevé</div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
