import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

let app;

beforeAll(() => {
  app = createApp();
});

describe('POST /api/auth/login', () => {
  it('retourne un token JWT avec des identifiants valides', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@ndembo.com', password: 'testpass123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@ndembo.com');
    expect(res.body.user.role).toBe('admin');
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejette un mot de passe incorrect avec 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@ndembo.com', password: 'mauvais' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('rejette un email inconnu avec 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inconnu@ndembo.com', password: 'testpass123' });

    expect(res.status).toBe(401);
  });

  it('valide le format email — rejette un email invalide avec 422', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pas-un-email', password: 'testpass123' });

    expect(res.status).toBe(422);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@ndembo.com', password: 'testpass123' });
    token = res.body.token;
  });

  it('retourne le profil utilisateur avec un token valide', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@ndembo.com');
    expect(res.body.password).toBeUndefined();
  });

  it('refuse sans token avec 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('refuse avec un token falsifié avec 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token.faux.ici');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/health', () => {
  it('retourne status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.ts).toBeDefined();
  });
});
