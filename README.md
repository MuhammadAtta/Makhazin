# Makhazin

Warehouse marketplace for Egypt and the MENA region: verified listings, digital contracts with an audit trail, and live IoT monitoring (temperature, humidity, access).

This repository contains the market-validation landing page and its waitlist backend.

## Stack
- **Frontend:** a single static page, `public/index.html` (no build step)
- **Backend:** one Cloudflare Worker, `src/worker.js`, exposing `POST /api/waitlist`
- **Database:** Cloudflare D1 (`makhazin-waitlist`), schema in `schema.sql`
- **Deploy:** GitHub Actions on every push to `main` (`.github/workflows/deploy.yml`)

## Waitlist API
`POST /api/waitlist` with JSON:

| Field | Required | Notes |
|---|---|---|
| `email` | yes | validated, stored lowercase |
| `role` | yes | `owner` or `tenant` |
| `name`, `phone`, `city` | no | trimmed and length-limited |
| `website` | no | honeypot field, must stay empty |

Submitting the same email again updates the existing row instead of creating a duplicate.

## Read the signups
Cloudflare dashboard → Storage & databases → D1 → `makhazin-waitlist` → Console:

```sql
SELECT email, role, name, phone, city, created_at FROM waitlist ORDER BY id DESC;
```

## Deploy
Push to `main`. The workflow needs two repository secrets (Settings → Secrets and variables → Actions):
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Never commit tokens to the repository.

## Notes
- The sensor readout on the landing page is simulated and labelled as such.
- `pitch-deck.md`, `recruitment_job_posting.md` and `submission.md` are earlier planning documents from a previous direction. They are kept for reference only and do not describe the current product.
