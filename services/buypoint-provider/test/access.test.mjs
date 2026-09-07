import test from "node:test";
import assert from "node:assert/strict";

import { testerAccess } from "../src/access.js";

function request(email) {
  const headers = email ? { "cf-access-authenticated-user-email": email } : {};
  return new Request("https://provider.example/api/buypoint/access", { headers });
}

test("fails closed when tester allowlist is not configured", () => {
  assert.deepEqual(testerAccess(request("tester@example.com"), {}), {
    ok: false, status: 503, error: "tester_access_not_configured",
  });
});

test("requires identity verified by Cloudflare Access", () => {
  assert.deepEqual(testerAccess(request(), { BUYPOINT_TESTER_EMAILS: "tester@example.com" }), {
    ok: false, status: 401, error: "tester_identity_required",
  });
});

test("denies an email not on the approved tester list", () => {
  assert.deepEqual(testerAccess(request("outside@example.com"), {
    BUYPOINT_TESTER_EMAILS: "tester@example.com",
  }), { ok: false, status: 403, error: "tester_not_authorized" });
});

test("accepts an approved tester without passwords or API keys", () => {
  assert.deepEqual(testerAccess(request("TESTER@example.com"), {
    BUYPOINT_TESTER_EMAILS: "first@example.com, tester@example.com",
  }), { ok: true, email: "tester@example.com" });
});

test("removing an email revokes that tester independently", () => {
  const before = testerAccess(request("tester@example.com"), {
    BUYPOINT_TESTER_EMAILS: "tester@example.com,other@example.com",
  });
  const after = testerAccess(request("tester@example.com"), {
    BUYPOINT_TESTER_EMAILS: "other@example.com",
  });
  assert.equal(before.ok, true);
  assert.deepEqual(after, { ok: false, status: 403, error: "tester_not_authorized" });
});
