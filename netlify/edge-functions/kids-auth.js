/* ============================================================================
   kids-auth.js — the gate in front of /kids.

   MUST live at the repo root in netlify/edge-functions/. Netlify reads
   netlify.toml and this folder from the root only; a copy inside kids/ does
   nothing at all, and this gate is what stands between photographs of
   children and the open internet.

   ---------------------------------------------------------------------------
   WHY THE GATE IS HERE AND NOT IN THE PAGE

   A code checked by JavaScript in the browser is not a lock. Anyone can read
   the page source, and every image stays fetchable by its direct URL whether
   or not a code was ever typed. So the check happens here, at the edge,
   before Netlify serves anything under /kids — pages, lesson JSON, art and
   the photographs in the feed alike.

   What the visitor sees is still ours: with no valid session this function
   serves kids/public/gate.html, the branded two-door screen, rather than the
   browser's gray Basic Auth box. That page posts a code to /kids/__auth,
   which is the only other way in.

   THE SESSION COOKIE

   HMAC-signed with KIDS_SESSION_SECRET, so it cannot be forged, and it
   carries who signed in — that is how the feed knows whether a post is from
   Dorian or from Juliet without anyone choosing a name from a list.

   HttpOnly (JavaScript cannot read it), Secure, SameSite=Lax. Expiry slides:
   past halfway, a request gets a fresh cookie, so regular use never signs
   anyone out, while a device that goes quiet for six months has to type the
   code again.

   Changing KIDS_SESSION_SECRET invalidates every session on every device.

   ---------------------------------------------------------------------------
   THE TWO ENVIRONMENT VARIABLES (never in this repo)

     KIDS_SESSION_SECRET   any long random string
     KIDS_CODES            JSON, one entry per code:
       [{"code":"1234","role":"leader","name":"Dorian Hayes"},
        {"code":"5678","role":"leader","name":"Juliet Hayes"},
        {"code":"2468","role":"parent","name":"Parent"}]

   Leaders get their own code each, which is what makes a post signed and
   what lets one volunteer be removed without re-texting everybody. Parents
   share one. Set them in the Netlify UI or:

       netlify env:set KIDS_CODES '[...]'
       netlify deploy --prod

   Edge functions read env at deploy, so a code change needs a deploy.

   If either variable is missing the gate FAILS CLOSED — nothing under /kids
   is served at all. An unconfigured gate must never be an open one.
   ========================================================================== */

const COOKIE = "ghbc_kids";
const MAX_AGE_SECONDS = 180 * 24 * 60 * 60;
const GATE_PAGE = "/kids/public/gate.html";

/* Paths under /kids that are reachable without a code. The gate screen and
   its assets, or nobody could ever sign in; and the endpoint that checks a
   code. Registration forms go here when they move over, because a family
   that has not signed up yet cannot have a code. */
function isPublicPath(pathname) {
  return pathname.startsWith("/kids/public/") ||
         pathname === "/kids/__auth" ||
         pathname.startsWith("/kids/register") ||
         pathname.startsWith("/kids/volunteer");
}

function env(name) {
  try {
    if (typeof Netlify !== "undefined" && Netlify.env) return Netlify.env.get(name);
  } catch (e) { /* fall through */ }
  try {
    if (typeof Deno !== "undefined" && Deno.env) return Deno.env.get(name);
  } catch (e) { /* fall through */ }
  return undefined;
}

/* ------------------------------------------------------------- signing -- */

function b64url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unb64url(text) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - padded.length % 4) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function key(secret) {
  return crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
}

async function sign(payload, secret) {
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const mac = await crypto.subtle.sign("HMAC", await key(secret), new TextEncoder().encode(body));
  return body + "." + b64url(new Uint8Array(mac));
}

/* Returns the session payload, or null if the cookie is missing, malformed,
   forged or expired. Every failure looks the same from outside. */
async function verify(token, secret) {
  if (!token || token.indexOf(".") < 0) return null;
  const [body, mac] = token.split(".");
  let expected;
  try {
    expected = b64url(new Uint8Array(
      await crypto.subtle.sign("HMAC", await key(secret), new TextEncoder().encode(body))
    ));
  } catch (e) {
    return null;
  }
  if (mac.length !== expected.length) return null;
  // Constant-time compare: a length check alone would leak nothing useful,
  // but an early-exit compare on the digest can.
  let diff = 0;
  for (let i = 0; i < mac.length; i++) diff |= mac.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;

  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(unb64url(body)));
  } catch (e) {
    return null;
  }
  const age = (Date.now() - (payload.t || 0)) / 1000;
  if (!(age >= 0) || age > MAX_AGE_SECONDS) return null;
  return payload;
}

function cookieHeader(token) {
  return `${COOKIE}=${token}; Path=/kids; Max-Age=${MAX_AGE_SECONDS}; ` +
         `HttpOnly; Secure; SameSite=Lax`;
}

function readCookie(request) {
  const raw = request.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE) return rest.join("=");
  }
  return null;
}

/* --------------------------------------------------------------- serving -- */

async function serveGate(request, status) {
  const response = await fetch(new URL(GATE_PAGE, request.url));
  const html = await response.text();
  return new Response(html, {
    status: status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

function json(body, status, extraHeaders) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: Object.assign({
      "content-type": "application/json",
      "cache-control": "no-store",
    }, extraHeaders || {}),
  });
}

/* Check a submitted code. Always takes the same visible path whether the code
   is right or wrong, and never says which part was wrong. */
async function handleAuth(request, secret, codesRaw) {
  if (request.method !== "POST") return json({ error: "method" }, 405);

  let submitted = "";
  try {
    const body = await request.json();
    submitted = String(body.code || "");
  } catch (e) {
    return json({ error: "bad request" }, 400);
  }

  let codes;
  try {
    codes = JSON.parse(codesRaw);
  } catch (e) {
    return json({ error: "server not configured" }, 503);
  }

  const match = Array.isArray(codes)
    ? codes.find((entry) => entry && String(entry.code) === submitted)
    : null;
  if (!match) return json({ error: "no" }, 401);

  const payload = {
    r: match.role === "leader" ? "leader" : "parent",
    n: match.name || "",
    t: Date.now(),
  };
  return json({ role: payload.r, name: payload.n }, 200,
              { "set-cookie": cookieHeader(await sign(payload, secret)) });
}

/* ------------------------------------------------------------------ main -- */

export default async function (request, context) {
  const url = new URL(request.url);
  const secret = env("KIDS_SESSION_SECRET");
  const codesRaw = env("KIDS_CODES");

  // Fail closed. An unconfigured gate serves nothing rather than everything.
  if (!secret || !codesRaw) {
    if (isPublicPath(url.pathname) && url.pathname !== "/kids/__auth") {
      return context.next();
    }
    return new Response("This section is not set up yet.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (url.pathname === "/kids/__auth") return handleAuth(request, secret, codesRaw);
  if (isPublicPath(url.pathname)) return context.next();

  const session = await verify(readCookie(request), secret);

  // Who am I? The app asks here rather than reading the cookie, which is
  // HttpOnly on purpose.
  if (url.pathname === "/kids/__me") {
    if (!session) return json({ error: "signed out" }, 401);
    return json({ role: session.r, name: session.n }, 200);
  }

  if (url.pathname === "/kids/__signout") {
    return json({ ok: true }, 200, {
      "set-cookie": `${COOKIE}=; Path=/kids; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
    });
  }

  if (!session) {
    // A page request gets the gate screen. Anything else — lesson JSON, art,
    // a PDF, a photograph — gets a flat 401, so nothing leaks to a direct URL.
    const wantsPage = (request.headers.get("accept") || "").includes("text/html");
    if (wantsPage) return serveGate(request, 200);
    return json({ error: "signed out" }, 401);
  }

  const response = await context.next();
  response.headers.set("x-robots-tag", "noindex, nofollow");

  // Slide the expiry when the session is past halfway.
  const age = (Date.now() - session.t) / 1000;
  if (age > MAX_AGE_SECONDS / 2) {
    const fresh = Object.assign({}, session, { t: Date.now() });
    response.headers.append("set-cookie", cookieHeader(await sign(fresh, secret)));
  }

  return response;
}
