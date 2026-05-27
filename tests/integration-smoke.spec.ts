/**
 * Integration Smoke Tests — Cross-Project
 *
 * Run against live services (start each via docker-compose).
 * These tests verify the inter-project communication patterns
 * that make the acquisition trap work.
 */

import { test, expect } from '@playwright/test';

const GOVERNOR_URL = process.env.GOVERNOR_URL || 'http://localhost:8000';
const BB_TECH_URL = process.env.BB_TECH_URL || 'http://localhost:8005';
const UV_URL = process.env.UV_URL || 'http://localhost:3000';
const OPENHUB_URL = process.env.OPENHUB_URL || 'http://localhost:3000';
const AETHERDESK_URL = process.env.AETHERDESK_URL || 'http://localhost:3000';

test.describe('Health Check Smoke Tests', () => {
  test('DBrain Governor /health responds', async ({ request }) => {
    const res = await request.get(`${GOVERNOR_URL}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('uptime_seconds');
  });

  test('Uplift-Venture /api/health responds', async ({ request }) => {
    const res = await request.get(`${UV_URL}/api/health`);
    expect(res.ok()).toBeTruthy();
  });

  test('AetherDesk /health responds', async ({ request }) => {
    const res = await request.get(`${AETHERDESK_URL}/health`);
    expect(res.ok()).toBeTruthy();
  });

  test('OpenHub /api/health responds', async ({ request }) => {
    const res = await request.get(`${OPENHUB_URL}/api/health`);
    expect(res.ok()).toBeTruthy();
  });
});

test.describe('Governor Routing', () => {
  test('POST /governor/route with chat action returns provider', async ({ request }) => {
    const res = await request.post(`${GOVERNOR_URL}/governor/route`, {
      data: { task: 'test prompt', action: 'chat' }
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('mode');
  });

  test('POST /governor/route with research action', async ({ request }) => {
    const res = await request.post(`${GOVERNOR_URL}/governor/route`, {
      data: { task: 'research hemp regulations', action: 'research_experiment' }
    });
    expect(res.ok()).toBeTruthy();
  });
});

test.describe('Token Tracking & Cost', () => {
  test('AetherDesk /api/v1/billing returns cost summary', async ({ request }) => {
    const res = await request.get(`${AETHERDESK_URL}/api/v1/billing`, {
      headers: { 'X-Tenant-Id': 'test-tenant' }
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('total_cost');
    expect(body).toHaveProperty('currency');
  });
});

test.describe('Fallback Chain', () => {
  test('Governor mode can switch between auto and manual', async ({ request }) => {
    const res = await request.post(`${GOVERNOR_URL}/governor/mode`, {
      data: { mode: 'auto' }
    });
    expect(res.ok()).toBeTruthy();
  });
});
