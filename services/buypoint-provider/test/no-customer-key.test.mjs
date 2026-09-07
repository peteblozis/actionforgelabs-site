import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { resolveProduct } from '../src/index.js';

const origin = 'https://buy.example.test';

function request(path, options = {}) {
  return new Request(`https://provider.example.test${path}`, {
    ...options,
    headers: { origin, ...(options.headers || {}) },
  });
}

test('health never returns credential value', async () => {
  const secret = 'service-owned-secret-never-return';
  const response = await worker.fetch(request('/health'), {
    BUYPOINT_ALLOWED_ORIGIN: origin,
    BUYPOINT_OPENAI_API_KEY: secret,
  });
  const text = await response.text();
  assert.equal(response.status, 200);
  assert.equal(text.includes(secret), false);
  assert.equal(JSON.parse(text).configured, true);
});

test('missing service credential fails closed without asking customer for a key', async () => {
  const response = await resolveProduct(
    request('/api/buypoint/resolve', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ input: { type: 'text', value: 'test product' } }),
    }),
    { BUYPOINT_ALLOWED_ORIGIN: origin },
  );
  const payload = await response.json();
  assert.equal(response.status, 503);
  assert.equal(payload.error, 'provider_not_configured');
  assert.equal(JSON.stringify(payload).toLowerCase().includes('enter'), false);
  assert.equal(JSON.stringify(payload).toLowerCase().includes('api key'), false);
});