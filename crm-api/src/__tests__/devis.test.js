import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

let app;
let token;
let clientId;

beforeAll(async () => {
  app = createApp();

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@ndembo.com', password: 'testpass123' });
  token = loginRes.body.token;

  const clientRes = await request(app)
    .get('/api/clients')
    .set('Authorization', `Bearer ${token}`);
  clientId = clientRes.body[0]?.id;
});

const auth = () => ({ Authorization: `Bearer ${token}` });

describe('GET /api/devis', () => {
  it('retourne la liste des devis (vide au départ)', async () => {
    const res = await request(app).get('/api/devis').set(auth());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('refuse sans token', async () => {
    const res = await request(app).get('/api/devis');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/devis', () => {
  let devisId;

  it('crée un devis valide avec lignes', async () => {
    const res = await request(app)
      .post('/api/devis')
      .set(auth())
      .send({
        ref: 'DEV-2026-TEST',
        clientId,
        statut: 'Brouillon',
        date: '2026-06-15',
        expiration: '2026-07-15',
        objet: 'Prestation test',
        montant: 5000,
        lignes: [
          { description: 'Conseil sportif', qte: 10, prix: 300 },
          { description: 'Frais déplacement', qte: 2, prix: 250 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.ref).toBe('DEV-2026-TEST');
    expect(res.body.statut).toBe('Brouillon');
    devisId = res.body.id;
  });

  it('PATCH /:id/statut met à jour le statut', async () => {
    const res = await request(app)
      .patch(`/api/devis/${devisId}/statut`)
      .set(auth())
      .send({ statut: 'Envoyé' });
    expect(res.status).toBe(200);
    expect(res.body.statut).toBe('Envoyé');
  });

  it('DELETE /:id supprime le devis', async () => {
    const del = await request(app)
      .delete(`/api/devis/${devisId}`)
      .set(auth());
    expect(del.status).toBe(204);
  });
});
