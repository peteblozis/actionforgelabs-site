const ACCESS_EMAIL_HEADER = "cf-access-authenticated-user-email";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function approvedEmails(env) {
  return new Set(
    String(env.BUYPOINT_TESTER_EMAILS || "")
      .split(/[\n,;]/)
      .map(normalizeEmail)
      .filter(Boolean),
  );
}

function testerAccess(request, env) {
  const approved = approvedEmails(env);
  if (!approved.size) {
    return { ok: false, status: 503, error: "tester_access_not_configured" };
  }
  const email = normalizeEmail(request.headers.get(ACCESS_EMAIL_HEADER));
  if (!email) {
    return { ok: false, status: 401, error: "tester_identity_required" };
  }
  if (!approved.has(email)) {
    return { ok: false, status: 403, error: "tester_not_authorized" };
  }
  return { ok: true, email };
}

export { ACCESS_EMAIL_HEADER, normalizeEmail, approvedEmails, testerAccess };
