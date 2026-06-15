import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

let app;
let token;

beforeAll(async () => {
  app = createApp();
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@ndembo.com', password: 'testpass123' });
  token = res.body.token;
});

const auth = () => ({ Authorization: `Bearer ${token}` });

describe('GET /api/clients', () => {
  it('retourne la liste des clients (auth requise)', async () => {
    const res = await request(app).get('/api/clients').set(auth());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('nom');
    expect(res.body[0]).toHaveProperty('ref');
  });

  it('refuse sans token avec 401', async () => {
    const res = await request(app).get('/api/clients');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/clients', () => {
  let clientId;

  it('crée un client valide', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set(auth())
      .send({ ref: 'CLI-TEST-NEW', nom: 'Nouveau Club', type: 'Club', email: 'nouveau@club.fr', ville: 'Lyon', pays: 'France' });

    expect(res.status).toBe(201);
    expect(res.body.nom).toBe('Nouveau Club');
    expect(res.body.id).toBeDefined();
    clientId = res.body.id;
  });

  it('rejette un client sans champ obligatoire avec 422', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set(auth())
      .send({ type: 'Club' });
    expect(res.status).toBe(422);
  });

  it('GET /:id retourne le client créé', async () => {
    const res = await request(app)
      .get(`/api/clients/${clientId}`)
      .set(auth());
    expect(res.status).toBe(200);
    expect(res.body.nom).toBe('Nouveau Club');
  });

  it('PUT /:id met à jour le client', async () => {
    const res = await request(app)
      .put(`/api/clients/${clientId}`)
      .set(auth())
      .send({ ref: 'CLI-TEST-NEW', nom: 'Club Modifié', type: 'Sponsor', email: 'modifie@club.fr', ville: 'Marseille', pays: 'France' });
    expect(res.status).toBe(200);
    expect(res.body.nom).toBe('Club Modifié');
    expect(res.body.ville).toBe('Marseille');
  });

  it('DELETE /:id supprime le client', async () => {
    const del = await request(app)
      .delete(`/api/clients/${clientId}`)
      .set(auth());
    expect(del.status).toBe(204);

    const get = await request(app)
      .get(`/api/clients/${clientId}`)
      .set(auth());
    expect(get.status).toBe(404);
  });
});
