
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const ROLES = new Set(["owner", "tenant"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function clean(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

async function handleWaitlist(request, env) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  if (clean(data.website, 200) !== "") return json({ ok: true });

  const email = clean(data.email, 254).toLowerCase();
  const role = clean(data.role, 10).toLowerCase();
  const name = clean(data.name, 100);
  const phone = clean(data.phone, 30);
  const city = clean(data.city, 80);

  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "invalid_email" }, 400);
  if (!ROLES.has(role)) return json({ ok: false, error: "invalid_role" }, 400);

  try {
    await env.DB.prepare(
      `INSERT INTO waitlist (email, role, name, phone, city)
       VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT(email) DO UPDATE SET
         role = excluded.role,
         name = COALESCE(NULLIF(excluded.name, ''), waitlist.name),
         phone = COALESCE(NULLIF(excluded.phone, ''), waitlist.phone),
         city = COALESCE(NULLIF(excluded.city, ''), waitlist.city)`
    )
      .bind(email, role, name, phone, city)
      .run();
  } catch (err) {
    console.error("waitlist insert failed", err);
    return json({ ok: false, error: "server_error" }, 500);
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/waitlist") return handleWaitlist(request, env);
    return env.ASSETS.fetch(request);
  },
};
