// Makhazin — Cloudflare Worker
// Serves static assets and provides: waitlist, warehouse listings, viewing requests, and a password-protected admin API (D1).

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const ROLES = new Set(["owner", "tenant"]);
const STATUSES = new Set(["available", "rented", "hidden"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const toInt = (v) => (v === "" || v == null ? null : Number.isFinite(Number(v)) ? Math.round(Number(v)) : NaN);
const toNum = (v) => (v === "" || v == null ? null : Number.isFinite(Number(v)) ? Number(v) : NaN);

/* ---------- schema (created on first request, idempotent) ---------- */
let schemaReady = null;
function ensureSchema(env) {
  if (!schemaReady) {
    schemaReady = env.DB.batch([
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS waitlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL CHECK (role IN ('owner','tenant')),
        name TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now')))`),
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS warehouses (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, city TEXT NOT NULL,
        area TEXT NOT NULL DEFAULT '', size_sqm INTEGER, price_egp_month INTEGER, clear_height_m REAL,
        features TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','rented','hidden')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')))`),
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT, warehouse_id INTEGER NOT NULL,
        name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now')))`),
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT, warehouse_id INTEGER NOT NULL, name TEXT NOT NULL DEFAULT '',
        key_hash TEXT NOT NULL UNIQUE, last_seen TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')))`),
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT, device_id INTEGER NOT NULL, warehouse_id INTEGER NOT NULL,
        temp_c REAL NOT NULL, humidity REAL NOT NULL, door_open INTEGER,
        created_at TEXT NOT NULL DEFAULT (datetime('now')))`),
      env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_readings_wh_time ON readings (warehouse_id, created_at)"),
    ]).catch((e) => { schemaReady = null; throw e; });
  }
  return schemaReady;
}

/* ---------- admin auth ---------- */
async function sha256(s) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
}
async function checkAdmin(request, env) {
  const expected = env.ADMIN_PASSWORD || "";
  if (!expected) return "not_configured";
  const [a, b] = await Promise.all([sha256(request.headers.get("x-admin-password") || ""), sha256(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0 ? "ok" : "denied";
}

/* ---------- notifications (email via Resend; free plan sends to the account owner only) ---------- */
function waDigits(phone) {
  let d = String(phone).replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "20" + d.slice(1); // Egyptian local format 01xxxxxxxxx -> 201xxxxxxxxx
  return d;
}
function notify(env, ctx, subject, text) {
  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL) return; // not configured: skip silently
  const task = fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({ from: "Makhazin <onboarding@resend.dev>", to: [env.NOTIFY_EMAIL], subject, text }),
  }).then(async (r) => { if (!r.ok) console.error("notify failed", r.status, (await r.text()).slice(0, 200)); })
    .catch((e) => console.error("notify error", e));
  ctx?.waitUntil ? ctx.waitUntil(task) : task;
}

/* ---------- waitlist ---------- */
async function waitlist(request, env, ctx) {
  if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
  let d;
  try { d = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }
  if (clean(d.website, 200) !== "") return json({ ok: true }); // honeypot
  const email = clean(d.email, 254).toLowerCase();
  const role = clean(d.role, 10).toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "invalid_email" }, 400);
  if (!ROLES.has(role)) return json({ ok: false, error: "invalid_role" }, 400);
  await env.DB.prepare(
    `INSERT INTO waitlist (email, role, name, phone, city) VALUES (?1,?2,?3,?4,?5)
     ON CONFLICT(email) DO UPDATE SET role = excluded.role,
       name = COALESCE(NULLIF(excluded.name,''), waitlist.name),
       phone = COALESCE(NULLIF(excluded.phone,''), waitlist.phone),
       city = COALESCE(NULLIF(excluded.city,''), waitlist.city)`
  ).bind(email, role, clean(d.name, 100), clean(d.phone, 30), clean(d.city, 80)).run();
  const ph = clean(d.phone, 30);
  notify(env, ctx, "New waitlist signup (" + role + ")",
    ["New waitlist signup", "", "Role: " + role, "Email: " + email, "Name: " + (clean(d.name, 100) || "-"),
     "Phone: " + (ph || "-"), "City: " + (clean(d.city, 80) || "-"),
     ph ? "WhatsApp: https://wa.me/" + waDigits(ph) : ""].filter((l, i, a) => l !== "" || i < 2).join("\n"));
  return json({ ok: true });
}

/* ---------- warehouses (public) ---------- */
const PUBLIC_COLS = "id, name, city, area, size_sqm, price_egp_month, clear_height_m, features, description, image_url, status";

async function listWarehouses(url, env) {
  const where = ["status != 'hidden'"], binds = [];
  const city = clean(url.searchParams.get("city"), 80);
  if (city) { where.push("LOWER(city) = LOWER(?)"); binds.push(city); }
  const minSize = toInt(url.searchParams.get("min_size"));
  if (minSize) { where.push("size_sqm >= ?"); binds.push(minSize); }
  const maxSize = toInt(url.searchParams.get("max_size"));
  if (maxSize) { where.push("size_sqm <= ?"); binds.push(maxSize); }
  const maxPrice = toInt(url.searchParams.get("max_price"));
  if (maxPrice) { where.push("price_egp_month <= ?"); binds.push(maxPrice); }
  const { results } = await env.DB.prepare(
    `SELECT ${PUBLIC_COLS} FROM warehouses WHERE ${where.join(" AND ")}
     ORDER BY CASE status WHEN 'available' THEN 0 ELSE 1 END, id DESC LIMIT 200`
  ).bind(...binds).all();
  return json({ ok: true, warehouses: results });
}

async function getWarehouse(id, env) {
  const row = await env.DB.prepare(`SELECT ${PUBLIC_COLS} FROM warehouses WHERE id = ? AND status != 'hidden'`).bind(id).first();
  return row ? json({ ok: true, warehouse: row }) : json({ ok: false, error: "not_found" }, 404);
}

async function createInquiry(request, env, ctx) {
  if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
  let d;
  try { d = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }
  if (clean(d.website, 200) !== "") return json({ ok: true }); // honeypot
  const wid = toInt(d.warehouse_id);
  const name = clean(d.name, 100), phone = clean(d.phone, 30), email = clean(d.email, 254).toLowerCase();
  if (!name) return json({ ok: false, error: "name_required" }, 400);
  if (phone.replace(/\D/g, "").length < 7) return json({ ok: false, error: "invalid_phone" }, 400);
  if (email && !EMAIL_RE.test(email)) return json({ ok: false, error: "invalid_email" }, 400);
  const wh = Number.isInteger(wid) && (await env.DB.prepare("SELECT name FROM warehouses WHERE id = ? AND status != 'hidden'").bind(wid).first());
  if (!wh) return json({ ok: false, error: "not_found" }, 404);
  const note = clean(d.message, 1000);
  await env.DB.prepare("INSERT INTO inquiries (warehouse_id, name, phone, email, message) VALUES (?1,?2,?3,?4,?5)")
    .bind(wid, name, phone, email, note).run();
  notify(env, ctx, "New viewing request: " + wh.name,
    ["New viewing request", "", "Warehouse: " + wh.name, "Name: " + name, "Phone: " + phone, "Email: " + (email || "-"),
     "Message: " + (note || "-"), "", "Reply on WhatsApp: https://wa.me/" + waDigits(phone)].join("\n"));
  return json({ ok: true });
}

/* ---------- IoT: device ingestion + public readings ---------- */
const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

async function ingest(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
  const key = request.headers.get("x-device-key") || "";
  if (key.length < 16 || key.length > 128) return json({ ok: false, error: "unauthorized" }, 401);
  const dev = await env.DB.prepare("SELECT id, warehouse_id, last_seen FROM devices WHERE key_hash = ?")
    .bind(hex(await sha256(key))).first();
  if (!dev) return json({ ok: false, error: "unauthorized" }, 401);

  let d;
  try { d = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }
  const t = Number(d.temp_c), h = Number(d.humidity);
  if (!Number.isFinite(t) || !Number.isFinite(h) || t < -40 || t > 85 || h < 0 || h > 100) {
    return json({ ok: false, error: "invalid_reading" }, 400);
  }
  const door = d.door_open === true || d.door_open === 1 ? 1 : d.door_open === false || d.door_open === 0 ? 0 : null;

  if (dev.last_seen && Date.now() - Date.parse(dev.last_seen.replace(" ", "T") + "Z") < 15000) {
    return json({ ok: false, error: "too_frequent" }, 429);
  }
  await env.DB.batch([
    env.DB.prepare("INSERT INTO readings (device_id, warehouse_id, temp_c, humidity, door_open) VALUES (?1,?2,?3,?4,?5)")
      .bind(dev.id, dev.warehouse_id, Math.round(t * 10) / 10, Math.round(h * 10) / 10, door),
    env.DB.prepare("UPDATE devices SET last_seen = datetime('now') WHERE id = ?").bind(dev.id),
  ]);
  if (Math.random() < 0.02) { // occasional cleanup: keep 30 days
    await env.DB.prepare("DELETE FROM readings WHERE created_at < datetime('now','-30 days')").run();
  }
  return json({ ok: true });
}

async function warehouseReadings(id, env) {
  const exists = await env.DB.prepare("SELECT 1 AS x FROM warehouses WHERE id = ? AND status != 'hidden'").bind(id).first();
  if (!exists) return json({ ok: false, error: "not_found" }, 404);
  const latest = await env.DB.prepare(
    `SELECT temp_c, humidity, door_open, created_at,
            CAST(strftime('%s','now') AS INTEGER) - CAST(strftime('%s', created_at) AS INTEGER) AS age_s
     FROM readings WHERE warehouse_id = ? ORDER BY created_at DESC, id DESC LIMIT 1`
  ).bind(id).first();
  if (!latest) return json({ ok: true, latest: null, series: [] });
  const { results } = await env.DB.prepare(
    `SELECT strftime('%Y-%m-%d %H:', created_at) || printf('%02d', (CAST(strftime('%M', created_at) AS INTEGER) / 15) * 15) AS t,
            ROUND(AVG(temp_c), 1) AS temp_c, ROUND(AVG(humidity), 1) AS humidity
     FROM readings WHERE warehouse_id = ? AND created_at >= datetime('now','-24 hours')
     GROUP BY t ORDER BY t`
  ).bind(id).all();
  return json({ ok: true, latest: { ...latest, online: latest.age_s < 300 }, series: results });
}

/* ---------- admin ---------- */
function parseWarehouse(d) {
  const w = {
    name: clean(d.name, 120), city: clean(d.city, 80), area: clean(d.area, 80),
    size_sqm: toInt(d.size_sqm), price_egp_month: toInt(d.price_egp_month), clear_height_m: toNum(d.clear_height_m),
    features: clean(d.features, 300), description: clean(d.description, 2000),
    image_url: clean(d.image_url, 500), status: clean(d.status || "available", 20),
  };
  if (!w.name) return { error: "name_required" };
  if (!w.city) return { error: "city_required" };
  if (Number.isNaN(w.size_sqm) || Number.isNaN(w.price_egp_month) || Number.isNaN(w.clear_height_m)) return { error: "invalid_number" };
  if ((w.size_sqm != null && w.size_sqm < 0) || (w.price_egp_month != null && w.price_egp_month < 0)) return { error: "invalid_number" };
  if (!STATUSES.has(w.status)) return { error: "invalid_status" };
  if (w.image_url && !/^https:\/\//i.test(w.image_url)) return { error: "image_must_be_https" };
  return { w };
}

async function admin(request, env, url) {
  const auth = await checkAdmin(request, env);
  if (auth === "not_configured") return json({ ok: false, error: "admin_not_configured" }, 503);
  if (auth !== "ok") return json({ ok: false, error: "unauthorized" }, 401);

  const path = url.pathname.replace(/^\/api\/admin\//, "");
  const m = path.match(/^warehouses(?:\/(\d+))?$/);

  if (path === "ping") return json({ ok: true });

  if (m) {
    const id = m[1] ? Number(m[1]) : null;
    if (request.method === "GET" && !id) {
      const { results } = await env.DB.prepare("SELECT * FROM warehouses ORDER BY id DESC LIMIT 500").all();
      return json({ ok: true, warehouses: results });
    }
    if (request.method === "POST" && !id) {
      let d; try { d = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }
      const p = parseWarehouse(d); if (p.error) return json({ ok: false, error: p.error }, 400);
      const w = p.w;
      const r = await env.DB.prepare(
        `INSERT INTO warehouses (name, city, area, size_sqm, price_egp_month, clear_height_m, features, description, image_url, status)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)`
      ).bind(w.name, w.city, w.area, w.size_sqm, w.price_egp_month, w.clear_height_m, w.features, w.description, w.image_url, w.status).run();
      return json({ ok: true, id: r.meta?.last_row_id ?? null }, 201);
    }
    if (request.method === "PUT" && id) {
      let d; try { d = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }
      const p = parseWarehouse(d); if (p.error) return json({ ok: false, error: p.error }, 400);
      const w = p.w;
      await env.DB.prepare(
        `UPDATE warehouses SET name=?1, city=?2, area=?3, size_sqm=?4, price_egp_month=?5, clear_height_m=?6,
         features=?7, description=?8, image_url=?9, status=?10 WHERE id=?11`
      ).bind(w.name, w.city, w.area, w.size_sqm, w.price_egp_month, w.clear_height_m, w.features, w.description, w.image_url, w.status, id).run();
      return json({ ok: true });
    }
    if (request.method === "DELETE" && id) {
      await env.DB.batch([
        env.DB.prepare("DELETE FROM readings WHERE warehouse_id = ?").bind(id),
        env.DB.prepare("DELETE FROM devices WHERE warehouse_id = ?").bind(id),
        env.DB.prepare("DELETE FROM warehouses WHERE id = ?").bind(id),
      ]);
      return json({ ok: true });
    }
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  const dm = path.match(/^devices(?:\/(\d+))?$/);
  if (dm) {
    const did = dm[1] ? Number(dm[1]) : null;
    if (request.method === "GET" && !did) {
      const { results } = await env.DB.prepare(
        `SELECT d.id, d.name, d.warehouse_id, w.name AS warehouse_name, d.last_seen, d.created_at
         FROM devices d LEFT JOIN warehouses w ON w.id = d.warehouse_id ORDER BY d.id DESC`
      ).all();
      return json({ ok: true, devices: results });
    }
    if (request.method === "POST" && !did) {
      let d; try { d = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }
      const wid = toInt(d.warehouse_id);
      const ok = Number.isInteger(wid) && (await env.DB.prepare("SELECT 1 AS x FROM warehouses WHERE id = ?").bind(wid).first());
      if (!ok) return json({ ok: false, error: "warehouse_not_found" }, 400);
      const raw = crypto.getRandomValues(new Uint8Array(24));
      const key = "mk_" + hex(raw); // shown once; only its hash is stored
      const r = await env.DB.prepare("INSERT INTO devices (warehouse_id, name, key_hash) VALUES (?1,?2,?3)")
        .bind(wid, clean(d.name, 80), hex(await sha256(key))).run();
      return json({ ok: true, id: r.meta?.last_row_id ?? null, key }, 201);
    }
    if (request.method === "DELETE" && did) {
      await env.DB.batch([
        env.DB.prepare("DELETE FROM readings WHERE device_id = ?").bind(did),
        env.DB.prepare("DELETE FROM devices WHERE id = ?").bind(did),
      ]);
      return json({ ok: true });
    }
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  if (path === "inquiries" && request.method === "GET") {
    const { results } = await env.DB.prepare(
      `SELECT i.id, i.name, i.phone, i.email, i.message, i.created_at, i.warehouse_id, w.name AS warehouse_name
       FROM inquiries i LEFT JOIN warehouses w ON w.id = i.warehouse_id ORDER BY i.id DESC LIMIT 500`
    ).all();
    return json({ ok: true, inquiries: results });
  }
  if (path === "waitlist" && request.method === "GET") {
    const { results } = await env.DB.prepare("SELECT email, role, name, phone, city, created_at FROM waitlist ORDER BY id DESC LIMIT 1000").all();
    return json({ ok: true, waitlist: results });
  }
  return json({ ok: false, error: "not_found" }, 404);
}

/* ---------- router ---------- */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    try {
      await ensureSchema(env);
      const p = url.pathname;
      if (p === "/api/waitlist") return await waitlist(request, env, ctx);
      if (p === "/api/inquiries") return await createInquiry(request, env, ctx);
      if (p === "/api/ingest") return await ingest(request, env);
      const rd = p.match(/^\/api\/warehouses\/(\d+)\/readings$/);
      if (rd && request.method === "GET") return await warehouseReadings(Number(rd[1]), env);
      if (p === "/api/warehouses" && request.method === "GET") return await listWarehouses(url, env);
      const one = p.match(/^\/api\/warehouses\/(\d+)$/);
      if (one && request.method === "GET") return await getWarehouse(Number(one[1]), env);
      if (p.startsWith("/api/admin/")) return await admin(request, env, url);
      return json({ ok: false, error: "not_found" }, 404);
    } catch (err) {
      console.error("worker error", err);
      return json({ ok: false, error: "server_error" }, 500);
    }
  },
};
