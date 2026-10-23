// Two jobs, everything else is served straight from the assets:
// 1. Shared Dream Jar links, /d/<share_id>: count the open, then show the Dream Jar page.
// 2. Email subscriptions to /updates: /api/subscribe and /api/unsubscribe, backed by the DB
//    (D1) binding. The emails themselves go out from David's Gmail via updates/send_update.py.

// A dream shared from the app carries goodapplabs.ai/d/<share_id>. Each real open counts one
// "person reached" for the virality numbers on the HQ dashboard. share-open stores only the
// id and the time, and ignores ids the app never logged.
const SHARE_PATH = /^\/d\/([A-Za-z0-9]{8,24})\/?$/;
const SHARE_OPEN_URL = "https://ywrzipaephysgeeyigid.supabase.co/functions/v1/share-open";
// Link previews (iMessage sends facebookexternalhit/Twitterbot, WhatsApp its own) fetch the
// page without anyone opening it, so they don't count.
const NOT_A_PERSON = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|skype|embedly|pinterest|google|bing|curl|wget|python|headless/i;

async function sharedDream(request, env, ctx, shareId) {
  // Always fetch the page as a GET: a HEAD passed through to the assets comes back 404.
  const page = await env.ASSETS.fetch(new URL("/dream-jar/shared", request.url));
  const body = request.method === "HEAD" ? null : page.body;
  const res = new Response(body, page);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "private, no-store");

  const cookie = `djs_${shareId}=1`;
  const seen = (request.headers.get("Cookie") || "").split(/;\s*/).includes(cookie);
  const person = !NOT_A_PERSON.test(request.headers.get("User-Agent") || "");
  if (person && !seen && request.method === "GET") {
    ctx.waitUntil(
      fetch(SHARE_OPEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ share_id: shareId }),
      }).catch(() => {})
    );
    // Only so the same browser isn't counted twice for this link.
    res.headers.append("Set-Cookie", `${cookie}; Path=/d/${shareId}; Max-Age=31536000; Secure; HttpOnly; SameSite=Lax`);
  }
  return res;
}

// Subscriptions. Signup is a plain insert (no confirmation email: the worker can't send mail).
// send_update.py shows David each new address before it gets its first email.
const EMAIL = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/;

function page(title, body, status = 200) {
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${title} · GoodApp Labs</title><link rel="icon" href="/logo.svg" type="image/svg+xml">
<style>body{margin:0;background:#faf7f1;color:#191714;font:18px/1.6 'Helvetica Neue',Helvetica,Arial,sans-serif}
.wrap{max-width:520px;margin:0 auto;padding:72px 20px}h1{font-size:30px;letter-spacing:-0.02em;margin:0 0 12px}
p{color:#5f5850;margin:0 0 20px}a{color:#191714}button{font:inherit;font-weight:600;padding:10px 18px;border:0;
border-radius:8px;background:#191714;color:#fff;cursor:pointer}button:hover{background:#c2740f}</style></head>
<body><div class="wrap"><h1>${title}</h1>${body}</div></body></html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

async function subscribe(request, env) {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const form = await request.formData().catch(() => null);
  const email = String(form?.get("email") || "").trim().toLowerCase();
  const wantsJson = (request.headers.get("Accept") || "").includes("application/json");
  const reply = (ok, status = 200) => wantsJson
    ? Response.json({ ok }, { status })
    : Response.redirect(new URL(`/updates?subscribed=${ok ? 1 : 0}#subscribe`, request.url), 303);

  // Bots fill in every field; people never see this one. Pretend it worked.
  if (form?.get("website")) return reply(true);
  if (email.length > 254 || !EMAIL.test(email)) return reply(false, 400);

  await env.DB.prepare(
    `INSERT INTO subscribers (email, token, created_at) VALUES (?1, ?2, ?3)
     ON CONFLICT (email) DO UPDATE SET unsubscribed_at = NULL`
  ).bind(email, crypto.randomUUID().replaceAll("-", ""), new Date().toISOString()).run();
  return reply(true);
}

// GET shows a button (so link scanners in mail apps can't unsubscribe anyone); POST does it.
// Mail apps' one-click unsubscribe (RFC 8058) POSTs here directly.
async function unsubscribe(request, env) {
  const token = new URL(request.url).searchParams.get("t") || "";
  const row = token && await env.DB.prepare("SELECT email, unsubscribed_at FROM subscribers WHERE token = ?1")
    .bind(token).first();
  if (!row) return page("Link not found", `<p>This unsubscribe link isn't valid. Email <a href="mailto:hello@goodapplabs.ai">hello@goodapplabs.ai</a> and we'll take you off the list.</p>`, 404);

  if (request.method === "POST") {
    await env.DB.prepare("UPDATE subscribers SET unsubscribed_at = ?1 WHERE token = ?2 AND unsubscribed_at IS NULL")
      .bind(new Date().toISOString(), token).run();
    return page("You're unsubscribed", `<p>You won't get any more GoodApp Labs update emails. The posts are always at <a href="/updates">goodapplabs.ai/updates</a>.</p>`);
  }
  if (row.unsubscribed_at) return page("You're unsubscribed", `<p>You're already off the list.</p>`);
  return page("Unsubscribe?", `<p>Stop sending GoodApp Labs update emails to ${row.email.replace(/[<>&"]/g, "")}?</p>
<form method="post"><button type="submit">Unsubscribe</button></form>`);
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const share = SHARE_PATH.exec(pathname);
    if (share) return sharedDream(request, env, ctx, share[1]);
    if (pathname === "/api/subscribe") return subscribe(request, env);
    if (pathname === "/api/unsubscribe") return unsubscribe(request, env);
    return env.ASSETS.fetch(request);
  },
};
