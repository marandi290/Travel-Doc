import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app.js';

describe('Backend API Integration Tests', () => {
  it('GET /api/v1/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.status, 'healthy');
  });

  it('GET /unknown-route should return 404 and structured NOT_FOUND code', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  it('POST /api/v1/routes/plan without origin should return 400 validation error', async () => {
    const res = await request(app).post('/api/v1/routes/plan').send({});
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'INVALID_ORIGIN');
  });
});
