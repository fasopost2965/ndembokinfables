import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockLogin = vi.fn();

vi.mock('../hooks/useAuth.js', () => ({
  getToken: vi.fn(() => null),
  useAuth: vi.fn(() => ({
    token: null,
    user: null,
    login: mockLogin,
    logout: vi.fn(),
    isAuthenticated: false,
  })),
}));

vi.mock('../contexts/CRMContext.jsx', () => ({
  useCRM: vi.fn(() => ({
    state: {
      clients: [], athletes: [], devis: [], factures: [], contrats: [],
      projets: [], evenements: [], camps: [], vipMembers: [], activites: [],
      notificationsLues: [],
      company: { nom: 'Ndembo Kin Connect SARL', logoUrl: '' },
    },
    dispatch: vi.fn(),
    getNom: vi.fn(() => 'Inconnu'),
    confirmAction: vi.fn(),
    clientCA: vi.fn(() => 0),
  })),
  CRMProvider: ({ children }) => children,
}));

vi.mock('../contexts/ToastContext.jsx', () => ({
  useToast: vi.fn(() => ({ showToast: vi.fn() })),
  ToastProvider: ({ children }) => children,
}));

import Login from '../pages/Login.jsx';

beforeEach(() => {
  mockLogin.mockReset();
});

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Login', () => {
  it('affiche le champ email et mot de passe', () => {
    wrap(<Login />);
    expect(screen.getByPlaceholderText(/nom@ndembokin\.com/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/••••••••/)).toBeTruthy();
  });

  it('affiche le bouton Se connecter', () => {
    wrap(<Login />);
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeTruthy();
  });

  it('appelle login() avec email et mot de passe saisis', async () => {
    mockLogin.mockResolvedValue({ token: 'tok', user: { email: 'admin@ndembo.com' } });
    wrap(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/nom@ndembokin\.com/i), {
      target: { value: 'admin@ndembo.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/), {
      target: { value: 'admin1234' },
    });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@ndembo.com', 'admin1234');
    });
  });

  it('affiche un message d\'erreur si login échoue', async () => {
    mockLogin.mockRejectedValue(new Error('Identifiants incorrects'));
    wrap(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/nom@ndembokin\.com/i), {
      target: { value: 'x@y.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await screen.findByText(/Identifiants incorrects/i);
  });
});
