# Fit Teen — Setup Guide

Athletic lifestyle tracker for teen athletes. Dark-mode first, mobile-optimized.

## Tech stack

- **Frontend:** React (Vite) + Tailwind CSS + Recharts
- **Auth & DB:** Supabase (Google OAuth)
- **AI food scan:** Netlify Functions + Google Gemini (server-only)
- **Deploy:** Netlify

---

## Secrets & security model

| Variable | Where it lives | Exposed to browser? |
|----------|----------------|---------------------|
| `VITE_SUPABASE_URL` | `.env.local` / Netlify env | Yes (public) |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` / Netlify env | Yes (public, RLS-protected) |
| `GEMINI_API_KEY` | **Netlify dashboard only** | **Never** |
| `SUPABASE_SERVICE_ROLE_KEY` | **Netlify dashboard only** | **Never** |
| `GEMINI_API_KEY` | **Netlify dashboard only** | **Never** |

The Gemini key and Supabase service role key **must never** be prefixed with `VITE_` and **must never** be committed to git. They only run inside `netlify/functions/` at request time.

`.env.local` is gitignored. Copy `.env.example` for client vars only.

### Netlify secret scanning (deploy failures)

Netlify scans build output for env var values. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` **intentionally** appear in `dist/` — that is normal for Supabase client apps.

**Rules to avoid failed deploys:**

1. **Never commit** real project URLs, keys, or tokens in git (use placeholders in docs).
2. Use **`VITE_SUPABASE_URL` only** — do **not** also set `SUPABASE_URL` in Netlify (duplicate value triggers scans).
3. `netlify.toml` lists public `VITE_*` keys in `SECRETS_SCAN_OMIT_KEYS` — do not remove.
4. True secrets (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) must never appear in source or client bundle.

### Netlify dashboard → Site settings → Environment variables

```
GEMINI_API_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_GOOGLE_CLIENT_ID=...
VITE_APP_URL=https://fit-teen.netlify.app
```

---

## Supabase setup (when ready)

1. Create a project at [supabase.com](https://supabase.com)
2. **Authentication → Providers → Google** — enable and add OAuth credentials
3. **Authentication → URL Configuration** — add redirect URLs:
   - `http://localhost:5173`
   - `https://your-site.netlify.app`
4. Run `supabase/migrations/001_initial_schema.sql` in **SQL Editor**
5. Copy **Project URL** and **anon public key** into `.env.local`

> **Stop here and share credentials when ready** — the app will not connect until env vars are set.

---

## Local development

```bash
npm install
cp .env.example .env.local
# Fill in Supabase client vars

# Terminal 1 — Vite
npm run dev

# Terminal 2 — Netlify functions (AI scan)
npm run dev:netlify
```

AI food scan requires `npm run dev:netlify` so `/api/analyze-food` is proxied with server secrets from a local `.env` file (also gitignored).

For local Netlify dev, create `.env` at project root with **server-only** keys (see `server.env.example`):

```
GEMINI_API_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=...
```

---

## Phased delivery status

See `.cursor-tasks.md` for the live checklist.

---

## Invite friends

Share the public app URL (`VITE_APP_URL`). No user PII is included in workout/milestone shares.
