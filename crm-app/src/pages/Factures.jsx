import { useState } from 'react';
import { fmtUsd, dateFr, nextNumero } from '../crm-data';
import { useCRM } from '../contexts/CRMContext';
import StatusBadge from '../components/ui/StatusBadge';
import Drawer from '../components/ui/Drawer';
import { useToast } from '../contexts/ToastContext';
import EmptyState from '../components/ui/EmptyState';
import { FormSection, FormRow, TextField, TextareaField, AmountField, DateField, TypeCards, EntitySelector, ValidationSummary } from '../components/ui/FormControls';


const STATUTS = ['Tous', 'En attente', 'En retard', 'Payée'];

export default function Factures() {
  const { state: { factures, clients }, dispatch, confirmAction } = useCRM();

  const clientNom = (id) => { const c = clients.find(c => c.id === id); return c ? c.nom : '—'; };
  const [filter, setFilter] = useState('Tous');
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const addToast = useToast();
  const [editTarget, setEditTarget] = useState(null);
  const [fClient, setFClient] = useState('');
  const [fObjet, setFObjet] = useState('');
  const [fNotes, setFNotes] = useState('');
  const [fMontant, setFMontant] = useState('');
  const [fDateEmission, setFDateEmission] = useState('');
  const [fEcheance, setFEcheance] = useState('');
  const [fStatut, setFStatut] = useState('En attente');
  const [errors, setErrors] = useState({});

  const today = () => new Date().toISOString().slice(0,10);
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };

  const openCreate = () => {
    setEditTarget(null); setFClient(''); setFObjet(''); setFNotes(''); setFMontant('');
    setFDateEmission(today()); setFEcheance(addDays(30)); setFStatut('En attente'); setErrors({}); setIsDrawerOpen(true);
  };
  const openEdit = (f) => {
    setEditTarget(f); setFClient(String(f.clientId)); setFObjet(f.objet); setFNotes(f.notes || '');
    setFMontant(String(f.montant)); setFDateEmission(f.date || today()); setFEcheance(f.echeance || addDays(30));
    setFStatut(f.statut); setErrors({}); setIsDrawerOpen(true);
  };

  const filtered = factures.filter(d => {
    const matchFilter = filter === 'Tous' || d.statut === filter;
    const matchSearch = d.ref.toLowerCase().includes(search.toLowerCase()) || clientNom(d.clientId).toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalPayee = factures.filter(f => f.statut === 'Payée').reduce((s,f) => s+f.montant,0);
  const totalRetard = factures.filter(f => f.statut === 'En retard').reduce((s,f) => s+f.montant,0);

  const handleSave = () => {
    const errs = {};
    if (!fClient) errs.client = 'Veuillez sélectionner un client';
    if (!fObjet.trim()) errs.objet = "L'objet est requis";
    if (!fMontant || Number(fMontant) <= 0) errs.montant = 'Montant requis (> 0)';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (editTarget) {
      dispatch({ type: 'UPDATE_FACTURE', payload: { ...editTarget, clientId: Number(fClient), objet: fObjet, notes: fNotes, montant: Number(fMontant), date: fDateEmission, echeance: fEcheance, statut: fStatut } });
      addToast('Facture mise à jour.');
    } else {
      const nextRef = nextNumero('FAC-', new Date().getFullYear(), factures.map(f => f.ref));
      dispatch({ type: 'ADD_FACTURE', payload: { ref: nextRef, clientId: Number(fClient), objet: fObjet, notes: fNotes, montant: Number(fMontant), statut: fStatut, date: fDateEmission, echeance: fEcheance } });
      addToast('Facture créée avec succès !');
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = (e, f) => {
    e.stopPropagation();
    confirmAction(
      'Supprimer cette facture ?',
      `La facture ${f.ref} sera définitivement supprimée. Cette action est irréversible.`,
      () => {
        dispatch({ type: 'DELETE_FACTURE', payload: f.ref });
        addToast(`Facture ${f.ref} supprimée avec succès.`);
      }
    );
  };

  const handleMarkPaid = (e, f) => {
    e.stopPropagation();
    confirmAction(
      'Marquer comme payée ?',
      `La facture ${f.ref} sera marquée comme encaissée.`,
      () => {
        dispatch({ type: 'UPDATE_FACTURE_STATUT', payload: { ref: f.ref, statut: 'Payée' } });
        addToast(`Facture ${f.ref} marquée comme payée.`, 'success');
      }
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.18s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Commercial</div>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Factures</h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-2)' }}>Suivi des paiements, relances et encaissements.</p>
        </div>
        <button onClick={openCreate} style={{ background: 'var(--red)', color: 'var(--white)', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
          + Nouvelle facture
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Total factures', value: factures.length, accent: 'var(--navy-mid)' },
          { label: 'En attente', value: factures.filter(f=>f.statut==='En attente').length, accent: 'var(--gold)' },
          { label: 'En retard', value: factures.filter(f=>f.statut==='En retard').length, accent: 'var(--red)' },
          { label: 'Encaissé', value: fmtUsd(totalPayee), accent: 'var(--success)' },
          { label: 'Retard total', value: fmtUsd(totalRetard), accent: 'var(--red)' },
        ].map((k, i) => (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderLeft: `3px solid ${k.accent}`, borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: '0.1em' }}>{k.label}</div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '20px', marginTop: '6px' }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-page)', padding: '4px', borderRadius: '6px' }}>
            {STATUTS.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ background: filter === s ? 'var(--white)' : 'transparent', color: filter === s ? 'var(--navy-deep)' : 'var(--text-2)', border: 'none', padding: '5px 12px', borderRadius: '4px', fontWeight: filter === s ? 700 : 600, fontSize: '12px', cursor: 'pointer' }}>
                {s}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: '1px solid var(--border-input)', borderRadius: '6px', padding: '7px 12px', fontSize: '12.5px', outline: 'none' }} />
        </div>

        <div className="responsive-table-header" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1.2fr 120px 130px 110px', padding: '10px 20px', background: 'var(--navy-deep)', color: 'var(--white)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <span>Référence</span><span>Client</span><span>Objet</span><span style={{ textAlign: 'right' }}>Montant</span><span style={{ textAlign: 'right' }}>Échéance</span><span style={{ textAlign: 'right' }}>Statut</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px' }}>
            <EmptyState 
              title="Aucune facture trouvée" 
              description="Modifiez vos filtres ou créez une nouvelle facture."
              actionLabel="+ Nouvelle facture"
              onAction={openCreate}
            />
          </div>
        ) : (
          <div className="responsive-table">
            {filtered.map((f) => (
          <div key={f.ref} className="responsive-table-row" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1.2fr 120px 130px 110px', alignItems: 'center', padding: '13px 20px', borderTop: '1px solid var(--border)', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
          >
            <span className="responsive-table-cell" data-label="Référence" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)' }}>{f.ref}</span>
            <span className="responsive-table-cell" data-label="Client" style={{ fontSize: '13px', fontWeight: 600 }}>{clientNom(f.clientId)}</span>
            <span className="responsive-table-cell" data-label="Objet" style={{ fontSize: '12.5px', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{f.objet}</span>
            <span className="responsive-table-cell" data-label="Montant" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12.5px', fontWeight: 700, textAlign: 'right' }}>{fmtUsd(f.montant)}</span>
            <span className="responsive-table-cell" data-label="Échéance" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11.5px', color: f.statut === 'En retard' ? 'var(--red)' : 'var(--text-2)', textAlign: 'right' }}>{dateFr(f.echeance)}</span>
            <span className="responsive-table-cell" data-label="Statut" style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
              <StatusBadge status={f.statut} />
              {['En attente', 'En retard'].includes(f.statut) && (
                <button onClick={(e) => handleMarkPaid(e, f)} style={{ background: 'rgba(23,126,84,0.1)', border: '1px solid rgba(23,126,84,0.3)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--success)', display: 'flex', alignItems: 'center' }} title="Marquer payée">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); openEdit(f); }} style={{ background: 'transparent', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }} title="Modifier" onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button onClick={(e) => handleDelete(e, f)} style={{ background: 'transparent', border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }} title="Supprimer" onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </span>
          </div>
            ))}
          </div>
        )}

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-3)' }}>
          <span>{filtered.length} factures affichées</span>
          <span style={{ fontFamily: 'var(--font-jetbrains)' }}>Page 1 / 1</span>
        </div>
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editTarget ? 'Modifier la facture' : 'Nouvelle facture'} width="520px"
        footer={
          <>
            <button onClick={() => setIsDrawerOpen(false)} style={{ padding: '10px 18px', background: 'var(--white)', border: '1px solid var(--border-input)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSave} style={{ padding: '10px 22px', background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>{editTarget ? 'Enregistrer les modifications' : 'Créer la facture'}</button>
          </>
        }
      >
        <ValidationSummary errors={errors} />

        <FormSection title="Facturation" subtitle="Destinataire et objet de la facture">
          <EntitySelector
            label="Client" value={fClient} onChange={setFClient} required
            options={clients} error={errors.client}
            placeholder="Rechercher un client…"
          />
          <TextField
            label="Objet" value={fObjet} onChange={setFObjet} required
            placeholder="Ex. Activation sponsoring — acompte 50 %" maxLength={100}
            error={errors.objet}
          />
          <TextareaField
            label="Notes de facturation" value={fNotes} onChange={setFNotes}
            placeholder="Informations complémentaires, conditions de règlement…" rows={2} maxLength={400}
          />
        </FormSection>

        <FormSection title="Montant & Paiement" subtitle="Valeur et délais de règlement">
          <AmountField label="Montant" value={fMontant} onChange={setFMontant} required error={errors.montant} />
          <FormRow>
            <DateField label="Date d'émission" value={fDateEmission} onChange={setFDateEmission} required />
            <DateField
              label="Échéance" value={fEcheance} onChange={setFEcheance}
              shortcuts={[
                { label: '+30 j', value: addDays(30) },
                { label: '+60 j', value: addDays(60) },
                { label: '+90 j', value: addDays(90) },
              ]}
              hint="Date limite de règlement"
            />
          </FormRow>
        </FormSection>

        <FormSection title="Statut de paiement">
          <TypeCards label="Statut" value={fStatut} onChange={setFStatut} options={[
            { value: 'En attente', label: 'En attente', icon: '🕐', color: 'var(--gold)', bg: 'rgba(244,168,0,0.08)' },
            { value: 'En retard', label: 'En retard', icon: '⚠️', color: 'var(--red)', bg: 'rgba(188,0,13,0.06)' },
            { value: 'Payée', label: 'Payée', icon: '✅', color: 'var(--success)', bg: 'rgba(23,126,84,0.08)' },
          ]} />
        </FormSection>

        {fMontant > 0 && fEcheance && (
          <div style={{ background: 'var(--bg-page)', borderRadius: '8px', padding: '14px 16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: '8px' }}>Récapitulatif</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-2)' }}>Montant total</span>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, color: 'var(--navy-deep)', fontSize: '15px' }}>{fmtUsd(Number(fMontant))}</span>
            </div>
            {fEcheance && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginTop: '6px' }}>
                <span style={{ color: 'var(--text-2)' }}>À régler avant le</span>
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 600 }}>{dateFr(fEcheance)}</span>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
