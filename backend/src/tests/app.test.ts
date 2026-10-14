import request from 'supertest';

jest.mock('../config/db', () => ({
  query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
}));

import app from '../app';

describe('health', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'connected' });
  });
});

describe('not found', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('authentication guard', () => {
  it.each([
    ['GET', '/api/patients'],
    ['GET', '/api/appointments'],
    ['GET', '/api/dashboard/stats'],
    ['GET', '/api/auth/me'],
    ['DELETE', '/api/patients/1'],
  ])('%s %s returns 401 without a token', async (method, url) => {
    const res = await request(app)[method.toLowerCase() as 'get' | 'delete'](url);

    expect(res.status).toBe(401);
  });
});

describe('validation', () => {
  it('POST /api/auth/login rejects an empty body', async () => {
    const res = await request(app).post('/api/auth/login').send({});

    expect(res.status).toBe(400);
  });
});

describe('swagger', () => {
  it('serves a spec that documents every route group', async () => {
    const res = await request(app).get('/openapi.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining([
        '/auth/login',
        '/auth/me',
        '/patients',
        '/appointments',
        '/dashboard/stats',
      ]),
    );
    expect(res.body.components.schemas).toHaveProperty('Patient');
  });
});