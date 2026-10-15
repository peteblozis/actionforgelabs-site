const commonStyles = `
:root{--bg:#0d0f14;--card:#151923;--line:#2b3142;--text:#eef2f7;--muted:#a8b2c2;--blue:#65a8ff;--green:#42d392;--amber:#ffbd59}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:Arial,sans-serif}
main{max-width:820px;margin:auto;padding:32px 22px}.badge{display:inline-block;border:1px solid var(--amber);color:var(--amber);padding:6px 10px;border-radius:8px;font-size:12px;font-weight:700}
h1{font-size:34px;margin:14px 0 8px}.sub{color:var(--muted);line-height:1.5}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-top:22px}
.card{display:block;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:21px;color:inherit;text-decoration:none}.card:hover{border-color:var(--blue)}
.tag{font-size:12px;color:var(--green);font-weight:800}.btn{display:inline-block;margin-top:10px;color:var(--blue);font-weight:800}.notice{margin-top:20px;color:var(--muted);font-size:13px}
`;

const testerHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>ActionForge Tester Systems</title><style>${commonStyles}</style></head><body><main><span class="badge">ACTIONFORGE · TESTERS</span><h1>Tester Systems</h1><p class="sub">Choose the MACIE test assigned to you. MACIE B and MACIE C operate independently and cannot access private MACIE A or SFC context.</p><section class="grid"><a class="card" href="https://macie.onrender.com/macie/b"><div class="tag">PROMPT CONSENSUS</div><h2>MACIE B</h2><p class="sub">Bring a prompt created anywhere and run it through the independent ChatGPT + Claude consensus tester.</p><span class="btn">OPEN MACIE B →</span></a><a class="card" href="https://macie.onrender.com/macie/c"><div class="tag">MATERIAL REVIEW</div><h2>MACIE C</h2><p class="sub">Submit existing material for independent ChatGPT + Claude consensus review.</p><span class="btn">OPEN MACIE C →</span></a></section><p class="notice">Tester access only. Do not enter private SFC material.</p></main></body></html>`;

const privateHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>ActionForge Private Systems</title><style>${commonStyles}</style></head><body><main><span class="badge">ACTIONFORGE · PRIVATE</span><h1>Private Systems</h1><p class="sub">Owner-only systems. Authentication is required before any private workspace or SFC context is available.</p><section class="grid"><a class="card" href="https://macie.onrender.com/macie/a"><div class="tag">OWNER-ONLY CONSENSUS</div><h2>MACIE A</h2><p class="sub">Private SageForge consensus workspace using ChatGPT and Claude. It remains isolated from MACIE B and MACIE C.</p><span class="btn">OPEN MACIE A →</span></a></section><p class="notice">Authorized owner access only. Sign in on the secure MACIE page.</p></main></body></html>`;

const headers = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/test" || url.pathname === "/test/" ) {
      return Response.redirect(new URL("/tester/", url), 302);
    }
    if (url.pathname === "/lab" || url.pathname === "/lab/") {
      return Response.redirect(new URL("/private/", url), 302);
    }
    if (url.pathname === "/tester" || url.pathname === "/tester/") {
      return new Response(testerHtml, { status: 200, headers });
    }
    if (url.pathname === "/private" || url.pathname === "/private/") {
      return new Response(privateHtml, { status: 200, headers });
    }
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }
};
