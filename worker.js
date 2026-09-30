// Basic auth for the /updates index page. Individual posts stay public so they're
// easy to share by link; the index is what's protected.
// Override the defaults with UPDATES_USER / UPDATES_PASS vars in the Cloudflare dashboard.
const PROTECTED = new Set(["/updates", "/updates/", "/updates/index.html"]);

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
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
