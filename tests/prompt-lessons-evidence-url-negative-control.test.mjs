// Run the actual release gate against isolated evidence, without modifying repository receipts.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const source = new URL('./prompt-lessons-commercial-gate.test.mjs', import.meta.url);
const required = ['offer','price','sandbox_checkout','entitlement_readback','onboarding','delivery','feedback_inbox','testers_inbox','conversion_event','authenticated_access'];
const commit = 'a'.repeat(40);
function runGate(badUrl) {
  const root = mkdtempSync(join(tmpdir(), 'prompt-lessons-url-gate-'));
  try {
    mkdirSync(join(root,'tests'));
    mkdirSync(join(root,'evidence','prompt-lessons'), {recursive:true});
    copyFileSync(source, join(root,'tests','prompt-lessons-commercial-gate.test.mjs'));
    const receipt = {};
    for (const key of required) receipt[key] = {verified:true,evidence_url:'https://receipts.vendor.com/record/123',source_commit:commit,checked_at:'2026-11-01T12:00:00Z'};
    receipt.offer.evidence_url = badUrl;
    receipt.sandbox_checkout.environment='sandbox';
    receipt.sandbox_checkout.transaction_id='txn_12345';
    receipt.entitlement_readback.license_id='lic_12345';
    receipt.feedback_inbox.received_message_id='message_123';
    receipt.testers_inbox.received_message_id='message_456';
    receipt.conversion_event.event_id='evt_12345';
    writeFileSync(join(root,'evidence','prompt-lessons','commercial-readiness.json'),JSON.stringify(receipt));
    const env = {...process.env};
    delete env.NODE_TEST_CONTEXT;
    return spawnSync(process.execPath,['--test','tests/prompt-lessons-commercial-gate.test.mjs'],{cwd:root,encoding:'utf8',timeout:30000,env});
  } finally { rmSync(root,{recursive:true,force:true}); }
}
for (const url of ['https://internal.localhost/receipt','https://receipts.test/receipt','https://user:password@receipts.vendor.com/receipt','https://receipts.vendor.com/receipt#unverifiable', 'https://10.0.0.1/receipt', 'https://192.168.1.20/receipt', 'https://169.254.169.254/receipt', 'https://[::1]/receipt']) {
  test('commercial gate rejects untrustworthy evidence URL: '+url,()=>{
    const result=runGate(url);
    assert.equal(result.error,undefined,String(result.error));
    assert.notEqual(result.status,0,'Gate incorrectly accepted untrustworthy URL');
    assert.match(result.stdout+result.stderr,/BLOCKED: offer evidence URL embeds credentials or fragments|BLOCKED: offer uses placeholder evidence|BLOCKED: offer evidence URL uses non-public network|BLOCKED: offer evidence URL uses unverified IPv6 host/);
  });
}
test('commercial gate accepts structurally sound receipt fixture (NOT actual provider verification)',()=>{
  const result=runGate('https://receipts.vendor.com/record/123');
  assert.equal(result.error,undefined,String(result.error));
  assert.equal(result.status,0,result.stdout+result.stderr);
});
