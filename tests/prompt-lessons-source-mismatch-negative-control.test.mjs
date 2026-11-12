// Synthetic negative control only: no purchase, provider, inbox, or launch evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

test('release gate rejects a receipt from a different source build', () => {
  const root = mkdtempSync(join(tmpdir(), 'prompt-lessons-source-binding-'));
  try {
    mkdirSync(join(root, 'tests'));
    mkdirSync(join(root, 'evidence', 'prompt-lessons'), { recursive: true });
    copyFileSync(resolve('tests/prompt-lessons-commercial-gate.test.mjs'), join(root, 'tests', 'prompt-lessons-commercial-gate.test.mjs'));
    const commit = 'a'.repeat(40);
    const receipt = {};
    const keys = ['offer','price','sandbox_checkout','entitlement_readback','onboarding','delivery','feedback_inbox','testers_inbox','conversion_event','authenticated_access'];
    for (const key of keys) {
      receipt[key] = {
        verified: true, // SYNTHETIC ONLY; intentionally not external proof
        evidence_url: 'https://github.com/peteblozis/actionforgelabs-site',
        source_commit: commit,
        checked_at: '2026-11-01T00:00:00Z'
      };
    }
    receipt.sandbox_checkout.environment = 'sandbox';
    receipt.sandbox_checkout.transaction_id = 'SYNTHETIC-NOT-A-TRANSACTION';
    receipt.entitlement_readback.license_id = 'SYNTHETIC-NOT-A-LICENSE';
    receipt.feedback_inbox.received_message_id = 'SYNTHETIC-NOT-A-MESSAGE';
    receipt.testers_inbox.received_message_id = 'SYNTHETIC-NOT-A-MESSAGE';
    receipt.conversion_event.event_id = 'SYNTHETIC-NOT-AN-EVENT';
    receipt.delivery.source_commit = 'b'.repeat(40);
    writeFileSync(join(root, 'evidence', 'prompt-lessons', 'commercial-readiness.json'), JSON.stringify(receipt));
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT; // prevent nested Node test runner from silently skipping
    const result = spawnSync(process.execPath, ['--test', join(root, 'tests', 'prompt-lessons-commercial-gate.test.mjs')], { env, encoding: 'utf8' });
    assert.notEqual(result.status, 0, 'release gate falsely accepted a mismatched source receipt');
    assert.match(result.stdout + result.stderr, /evidence belongs to a different source build/, 'gate must fail specifically on source binding, not a missing field');
    // Positive source binding is insufficient: obvious fake provider IDs must also fail closed.
    receipt.delivery.source_commit = commit;
    writeFileSync(join(root, 'evidence', 'prompt-lessons', 'commercial-readiness.json'), JSON.stringify(receipt));
    const fake = spawnSync(process.execPath, ['--test', join(root, 'tests', 'prompt-lessons-commercial-gate.test.mjs')], { env, encoding: 'utf8' });
    assert.notEqual(fake.status, 0, 'release gate falsely accepted synthetic purchase and delivery IDs');
    assert.match(fake.stdout + fake.stderr, /uses a synthetic identifier/, 'gate must specifically reject synthetic provider identifiers');
    // Same message receipt cannot prove delivery to two different inboxes.
    receipt.sandbox_checkout.transaction_id = 'sandbox-txn-12345';
    receipt.entitlement_readback.license_id = 'license-12345';
    receipt.feedback_inbox.received_message_id = 'message-12345';
    receipt.testers_inbox.received_message_id = 'message-12345';
    receipt.conversion_event.event_id = 'conversion-12345';
    writeFileSync(join(root, 'evidence', 'prompt-lessons', 'commercial-readiness.json'), JSON.stringify(receipt));
    const duplicateInbox = spawnSync(process.execPath, ['--test', join(root, 'tests', 'prompt-lessons-commercial-gate.test.mjs')], { env, encoding: 'utf8' });
    assert.notEqual(duplicateInbox.status, 0, 'release gate falsely accepted one receipt for two inboxes');
    assert.match(duplicateInbox.stdout + duplicateInbox.stderr, /feedback and testers inboxes reuse one message receipt/, 'gate must reject duplicate inbox evidence');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
