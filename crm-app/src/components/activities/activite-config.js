export const ACTIVITE_TYPE_CONFIG = {
  appel:   { label: 'Appel',   bg: 'rgba(30,159,216,0.12)',  color: '#1E78A8', icon: '📞' },
  email:   { label: 'Email',   bg: 'rgba(244,168,0,0.14)',   color: '#9A6B00', icon: '✉️' },
  reunion: { label: 'Réunion', bg: 'rgba(37,67,84,0.12)',    color: '#254354', icon: '🤝' },
  relance: { label: 'Relance', bg: 'rgba(188,0,13,0.10)',    color: '#BC000D', icon: '🔔' },
  note:    { label: 'Note',    bg: 'rgba(23,126,84,0.12)',   color: '#177E54', icon: '📝' },
};

export const ACTIVITE_TYPES = Object.keys(ACTIVITE_TYPE_CONFIG);
