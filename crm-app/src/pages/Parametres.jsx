import { COMPANY } from '../crm-data';
import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

const SECTIONS = [
  { id: 'societe', label: 'Société' },
  { id: 'facturation', label: 'Facturation' },
  { id: 'utilisateurs', label: 'Utilisateurs' },
  { id: 'notifications', label: 'Notifications' },
];

function Field({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: 'var(--text-1)', fontFamily: mono ? 'var(--font-jetbrains)' : 'var(--font-open-sans)' }}>{value}</div>
    </div>
  );
}

export default function Parametres() {
  const [activeSection, setActiveSection] = useState('societe');
  const addToast = useToast();

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Système</div>
        <h1 style={{ fontSize: '30px', margin: 0 }}>Paramètres</h1>
        <p style={{ margin: '6px 0 0 0', color: 'var(--text-2)' }}>Configuration générale de l'espace Ndembo Kin Connect CRM.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Sidebar nav */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '6px', background: activeSection === s.id ? 'var(--bg-page)' : 'transparent', border: 'none', fontWeight: activeSection === s.id ? 700 : 600, color: activeSection === s.id ? 'var(--navy-deep)' : 'var(--text-2)', cursor: 'pointer', fontSize: '13px', marginBottom: '2px' }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeSection === 'societe' && (
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
              <div style={{ fontFamily: 'var(--font-oswald)', fontWeight: 600, fontSize: '15px', textTransform: 'uppercase', color: 'var(--navy-deep)', marginBottom: '20px' }}>Informations de la société</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' }}>
                <Field label="Raison sociale" value={COMPANY.nom} />
                <Field label="RCCM" value={COMPANY.rccm} mono />
                <Field label="ID National" value={COMPANY.idNat} mono />
                <Field label="NIF" value={COMPANY.nif} mono />
                <Field label="Email" value={COMPANY.email} />
                <Field label="Téléphone" value={COMPANY.tel} mono />
                <Field label="WhatsApp" value={COMPANY.whatsapp} mono />
              </div>
              <div style={{ marginTop: '18px' }}>
                <Field label="Adresse" value={COMPANY.adresse} />
              </div>
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => addToast('Informations mises à jour !')} style={{ background: 'var(--navy-deep)', color: 'var(--white)', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                  Sauvegarder les modifications
                </button>
              </div>
            </div>
          )}
          {activeSection === 'facturation' && (
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
              <div style={{ fontFamily: 'var(--font-oswald)', fontWeight: 600, fontSize: '15px', textTransform: 'uppercase', color: 'var(--navy-deep)', marginBottom: '20px' }}>Coordonnées bancaires</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' }}>
                <Field label="Banque" value={COMPANY.banque} />
                <Field label="Code SWIFT" value={COMPANY.swift} mono />
                <Field label="Devise par défaut" value="USD — Dollar américain" />
              </div>
            </div>
          )}
          {activeSection === 'utilisateurs' && (
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
              <div style={{ fontFamily: 'var(--font-oswald)', fontWeight: 600, fontSize: '15px', textTransform: 'uppercase', color: 'var(--navy-deep)', marginBottom: '20px' }}>Utilisateurs du système</div>
              {[
                { nom: 'A. Ndembo', email: 'a.ndembo@ndembokin.com', role: 'Administrateur', actif: true },
                { nom: 'B. Kasongo', email: 'b.kasongo@ndembokin.com', role: 'Comptable', actif: true },
              ].map((u, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i === 0 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--navy-deep)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                      {u.nom.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{u.nom}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>{u.email}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: 'rgba(23,126,84,0.12)', color: 'var(--success)' }}>{u.role}</span>
                </div>
              ))}
            </div>
          )}
          {activeSection === 'notifications' && (
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
              <div style={{ fontFamily: 'var(--font-oswald)', fontWeight: 600, fontSize: '15px', textTransform: 'uppercase', color: 'var(--navy-deep)', marginBottom: '20px' }}>Préférences de notifications</div>
              {[
                { label: 'Échéance de facture', detail: 'Alerte 7 jours avant l\'échéance' },
                { label: 'Devis accepté', detail: 'Notification lors de l\'acceptation d\'un devis' },
                { label: 'Contrat expirant', detail: 'Alerte 30 jours avant expiration' },
                { label: 'Renouvellement VIP', detail: 'Notification pour les adhésions expirant dans 60 jours' },
              ].map((n, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{n.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '2px' }}>{n.detail}</div>
                  </div>
                  <div style={{ width: '42px', height: '24px', borderRadius: '99px', background: 'var(--cyan)', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '99px', background: 'var(--white)', position: 'absolute', top: '2px', right: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
