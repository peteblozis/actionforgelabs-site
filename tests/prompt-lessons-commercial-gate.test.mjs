// Commercial launch gate. This deliberately FAILS when external evidence is absent.
// Run: node --test tests/prompt-lessons-commercial-gate.test.mjs
// No production release should be inferred from content-only CI.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const file = new URL('../evidence/prompt-lessons/commercial-readiness.json',import.meta.url);
const required = ['offer','price','sandbox_checkout','entitlement_readback','onboarding','delivery','feedback_inbox','testers_inbox','conversion_event','authenticated_access'];
test('commercial readiness requires source-bound real-world receipts',()=>{
 assert.ok(existsSync(file),'BLOCKED: no commercial-readiness evidence; do not launch');
 const e=JSON.parse(readFileSync(file,'utf8'));
 for(const k of required){
   const v=e[k];
   assert.ok(v && v.verified===true && typeof v.evidence_url==='string' && /^https:\/\//.test(v.evidence_url) && v.checked_at && v.source_commit, 'BLOCKED: '+k+' lacks verified evidence');
 }
 assert.equal(e.sandbox_checkout.environment,'sandbox');
 assert.ok(e.sandbox_checkout.transaction_id,'BLOCKED: no sandbox transaction ID');
 assert.ok(e.entitlement_readback.license_id,'BLOCKED: no entitlement readback license');
});
