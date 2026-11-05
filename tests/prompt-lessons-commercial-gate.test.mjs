// Release gate: structural receipt validation, NOT external service verification.
// Run: node --test tests/prompt-lessons-commercial-gate.test.mjs
// A PASS means only that evidence fields are populated and internally consistent.
// Independently verify the linked provider receipts before authorizing release.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const file = new URL('../evidence/prompt-lessons/commercial-readiness.json', import.meta.url);
const required = ['offer','price','sandbox_checkout','entitlement_readback','onboarding','delivery','feedback_inbox','testers_inbox','conversion_event','authenticated_access'];
const sha = /^[a-f0-9]{40}$/i;
const knownFakeHosts = new Set(['example.com','example.org','example.net','localhost','127.0.0.1']);

test('commercial readiness requires complete, source-bound evidence; not just green lesson tests', () => {
 assert.ok(existsSync(file), 'BLOCKED: no commercial-readiness evidence; do not launch');
 const e = JSON.parse(readFileSync(file, 'utf8'));
 assert.ok(e && typeof e === 'object' && !Array.isArray(e));
 for (const key of required) {
  const v = e[key];
  assert.ok(v && v.verified === true, 'BLOCKED: '+key+' not verified');
  assert.ok(typeof v.evidence_url === 'string', 'BLOCKED: '+key+' missing evidence URL');
  const url = new URL(v.evidence_url);
  assert.equal(url.protocol, 'https:', 'BLOCKED: '+key+' evidence must use HTTPS');
  assert.ok(!knownFakeHosts.has(url.hostname.toLowerCase()) && !url.hostname.toLowerCase().endsWith('.example'), 'BLOCKED: '+key+' uses placeholder evidence');
  assert.ok(sha.test(v.source_commit), 'BLOCKED: '+key+' lacks full source commit');
  const time = Date.parse(v.checked_at);
  assert.ok(Number.isFinite(time) && time <= Date.now(), 'BLOCKED: '+key+' has invalid or future check timestamp');
 }
 assert.equal(e.sandbox_checkout.environment, 'sandbox');
 assert.ok(typeof e.sandbox_checkout.transaction_id === 'string' && e.sandbox_checkout.transaction_id.trim(), 'BLOCKED: no sandbox transaction ID');
 assert.ok(typeof e.entitlement_readback.license_id === 'string' && e.entitlement_readback.license_id.trim(), 'BLOCKED: no entitlement readback license');
 assert.equal(e.sandbox_checkout.source_commit, e.entitlement_readback.source_commit, 'BLOCKED: checkout and entitlement evidence refer to different builds');
 assert.ok(e.feedback_inbox.received_message_id && e.testers_inbox.received_message_id, 'BLOCKED: sent email alone is not proof of inbox receipt');
 assert.ok(e.conversion_event.event_id, 'BLOCKED: no observed conversion event ID');
});
