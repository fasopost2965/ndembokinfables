import { createContext, useContext, useReducer, useEffect } from 'react';
import { CLIENTS, DEVIS, FACTURES, CONTRATS, PROJETS, EVENEMENTS, CAMPS, VIP_MEMBERS, ATHLETES, COMPANY } from '../crm-data';

const initialState = {
  clients: CLIENTS,
  devis: DEVIS,
  factures: FACTURES,
  contrats: CONTRATS,
  projets: PROJETS,
  evenements: EVENEMENTS,
  camps: CAMPS,
  vipMembers: VIP_MEMBERS,
  athletes: ATHLETES,
  company: COMPANY,
  activites: [],
  notificationsLues: [],
  confirmModal: { isOpen: false, title: '', message: '', onConfirm: null }
};

const CRMContext = createContext();

function crmReducer(state, action) {
  switch (action.type) {
    case 'ADD_CLIENT':
      return { ...state, clients: [action.payload, ...state.clients] };
    case 'UPDATE_CLIENT':
      return { ...state, clients: state.clients.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'ADD_DEVIS':
      return { ...state, devis: [action.payload, ...state.devis] };
    case 'UPDATE_DEVIS':
      return { ...state, devis: state.devis.map(d => d.ref === action.payload.ref ? { ...d, ...action.payload } : d) };
    case 'UPDATE_DEVIS_STATUT':
      return { ...state, devis: state.devis.map(d => d.ref === action.payload.ref ? { ...d, statut: action.payload.statut } : d) };
    case 'DELETE_DEVIS':
      return { ...state, devis: state.devis.filter(d => d.ref !== action.payload) };
    case 'ADD_FACTURE':
      return { ...state, factures: [action.payload, ...state.factures] };
    case 'UPDATE_FACTURE':
      return { ...state, factures: state.factures.map(f => f.ref === action.payload.ref ? { ...f, ...action.payload } : f) };
    case 'DELETE_FACTURE':
      return { ...state, factures: state.factures.filter(f => f.ref !== action.payload) };
    case 'ADD_CONTRAT':
      return { ...state, contrats: [action.payload, ...state.contrats] };
    case 'UPDATE_CONTRAT':
      return { ...state, contrats: state.contrats.map(c => c.ref === action.payload.ref ? action.payload : c) };
    case 'ADD_ATHLETE':
      return { ...state, athletes: [action.payload, ...state.athletes] };
    case 'UPDATE_ATHLETE':
      return { ...state, athletes: state.athletes.map(a => a.id === action.payload.id ? { ...a, ...action.payload } : a) };
    case 'DELETE_ATHLETE':
      return { ...state, athletes: state.athletes.filter(a => a.id !== action.payload) };
    case 'DELETE_CLIENT': {
      const deletedId = action.payload;
      // Devis and factures are kept with clientId = null so accounting history is preserved.
      // Camps and evenements linked to this client are also detached (not deleted) to avoid
      // losing operational records; they become "orphan" events.
      return {
        ...state,
        clients:    state.clients.filter(c => c.id !== deletedId),
        devis:      state.devis.map(d => d.clientId === deletedId ? { ...d, clientId: null, clientNom: 'Client supprimé' } : d),
        factures:   state.factures.map(f => f.clientId === deletedId ? { ...f, clientId: null, clientNom: 'Client supprimé' } : f),
        contrats:   state.contrats.filter(c => c.clientId !== deletedId),
        projets:    state.projets.filter(p => p.clientId !== deletedId),
        vipMembers: state.vipMembers.filter(v => v.clientId !== deletedId),
        evenements: state.evenements.map(e => e.clientId === deletedId ? { ...e, clientId: null } : e),
        camps:      state.camps.map(c => c.clientId === deletedId ? { ...c, clientId: null } : c),
        activites:  state.activites.filter(a => !(a.entityType === 'client' && a.entityId === deletedId)),
      };
    }
    case 'DELETE_CONTRAT':
      return {
        ...state,
        contrats: state.contrats.filter(c => c.ref !== action.payload),
        athletes: state.athletes.map(a => a.contractRef === action.payload ? { ...a, contractRef: null } : a),
      };
    case 'ADD_PROJET':
      return { ...state, projets: [action.payload, ...state.projets] };
    case 'UPDATE_PROJET':
      return { ...state, projets: state.projets.map(p => p.ref === action.payload.ref ? { ...p, ...action.payload } : p) };
    case 'DELETE_PROJET':
      return { ...state, projets: state.projets.filter(p => p.ref !== action.payload) };
    case 'ADD_VIP':
      return { ...state, vipMembers: [action.payload, ...state.vipMembers] };
    case 'UPDATE_VIP':
      return { ...state, vipMembers: state.vipMembers.map(v => v.clientId === action.payload.clientId ? { ...v, ...action.payload } : v) };
    case 'DELETE_VIP':
      return { ...state, vipMembers: state.vipMembers.filter(v => v.clientId !== action.payload) };
    case 'ADD_EVENEMENT':
      return { ...state, evenements: [action.payload, ...state.evenements] };
    case 'UPDATE_EVENEMENT':
      return { ...state, evenements: state.evenements.map(e => e.id === action.payload.id ? { ...e, ...action.payload } : e) };
    case 'DELETE_EVENEMENT':
      return { ...state, evenements: state.evenements.filter(e => e.id !== action.payload) };
    case 'ADD_CAMP':
      return { ...state, camps: [action.payload, ...state.camps] };
    case 'UPDATE_CAMP':
      return { ...state, camps: state.camps.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
    case 'DELETE_CAMP':
      return { ...state, camps: state.camps.filter(c => c.id !== action.payload) };
    case 'UPDATE_FACTURE_STATUT':
      return { ...state, factures: state.factures.map(f => f.ref === action.payload.ref ? { ...f, statut: action.payload.statut } : f) };
    case 'UPDATE_COMPANY':
      return { ...state, company: { ...state.company, ...action.payload } };
    case 'ADD_ACTIVITE':
      return { ...state, activites: [action.payload, ...state.activites] };
    case 'UPDATE_ACTIVITE':
      return { ...state, activites: state.activites.map(a => a.id === action.payload.id ? { ...a, ...action.payload } : a) };
    case 'DELETE_ACTIVITE':
      return { ...state, activites: state.activites.filter(a => a.id !== action.payload) };
    case 'MARK_NOTIFICATION_LUE':
      return { ...state, notificationsLues: [...new Set([...state.notificationsLues, action.payload])] };
    case 'MARK_ALL_NOTIFICATIONS_LUES':
      return { ...state, notificationsLues: action.payload };
    case 'RESTORE_STATE':
      return { ...action.payload, confirmModal: { isOpen: false, title: '', message: '', onConfirm: null } };
    case 'OPEN_CONFIRM':
      return { ...state, confirmModal: { isOpen: true, ...action.payload } };
    case 'CLOSE_CONFIRM':
      return { ...state, confirmModal: { ...state.confirmModal, isOpen: false } };

    default:
      return state;
  }
}

export function CRMProvider({ children }) {
  const [state, dispatch] = useReducer(crmReducer, initialState, (initial) => {
    try {
      const stored = localStorage.getItem('ndemboCrmState');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Reset confirm modal state on load
        parsed.confirmModal = { isOpen: false, title: '', message: '', onConfirm: null };
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse CRM state', e);
    }
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('ndemboCrmState', JSON.stringify(state));
  }, [state]);

  return (
    <CRMContext.Provider value={{ state, dispatch }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within CRMProvider');
  
  const getNom = (id) => {
    if (!id) return '—';
    const c = context.state.clients.find(c => c.id === id);
    if (c) return c.nom;
    const a = context.state.athletes.find(a => a.id === id);
    return a ? a.nom : '—';
  };

  const confirmAction = (title, message, onConfirm) => {
    context.dispatch({ type: 'OPEN_CONFIRM', payload: { title, message, onConfirm } });
  };

  return { ...context, getNom, confirmAction };
}
