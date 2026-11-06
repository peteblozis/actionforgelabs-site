// Independent negative-control test: the commercial release gate must fail closed.
// Does not create or modify checkout evidence, and cannot establish commercial readiness.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const evidence = new URL('../evidence/prompt-lessons/commercial-readiness.json', import.meta.url);
test('without actual commercial receipts, the launch gate refuses release', () => {
  assert.equal(existsSync(evidence), false, 'Evidence now exists: run a real authenticated receipt audit, not this missing-evidence negative control');
  const run = spawnSync(process.execPath, ['--test', 'tests/prompt-lessons-commercial-gate.test.mjs'], {
    cwd: new URL('..', import.meta.url), encoding: 'utf8', timeout: 30000
  });
  assert.equal(run.error, undefined, String(run.error));
  assert.notEqual(run.status, 0, 'Release gate falsely passed with no evidence');
  assert.match(run.stdout + run.stderr, /BLOCKED: no commercial-readiness evidence; do not launch/);
});
