// Two jobs, everything else is served straight from the assets:
// 1. Basic auth for the /updates index page. Individual posts stay public so they're
//    easy to share by link; the index is what's protected.
//    Override the defaults with UPDATES_USER / UPDATES_PASS vars in the Cloudflare dashboard.
// 2. Shared Dream Jar links, /d/<share_id>: count the open, then show the Dream Jar page.
const PROTECTED = new Set(["/updates", "/updates/", "/updates/index.html"]);

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

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const share = SHARE_PATH.exec(pathname);
    if (share) return sharedDream(request, env, ctx, share[1]);
    if (!PROTECTED.has(pathname)) {
      return env.ASSETS.fetch(request);
    }

    const user = env.UPDATES_USER || "gappl";
    const pass = env.UPDATES_PASS || "gappl";

    const [scheme, encoded] = (request.headers.get("Authorization") || "").split(" ");
    if (scheme === "Basic" && encoded) {
      let decoded = "";
      try { decoded = atob(encoded); } catch {}
      const i = decoded.indexOf(":");
      if (i !== -1 && decoded.slice(0, i) === user && decoded.slice(i + 1) === pass) {
        const upstream = await env.ASSETS.fetch(request);
        const res = new Response(upstream.body, upstream);
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
        res.headers.set("Cache-Control", "private, no-store");
        return res;
      }
    }

    return new Response("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="GoodApp Labs updates", charset="UTF-8"' },
    });
  },
};
