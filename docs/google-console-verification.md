# Google Cloud Console — Fit Teen setup & verification

Use this guide for **OAuth**, **domain/property verification**, and **OAuth app review** for [fit-teen.netlify.app](https://fit-teen.netlify.app).

---

## 1. OAuth client (Web application)

**Google Cloud → APIs & Services → Credentials → Create OAuth client ID**

| Field | Value |
|--------|--------|
| Application type | Web application |
| Name | Fit Teen |
| **Authorized JavaScript origins** | `https://fit-teen.netlify.app` |
| | `http://localhost:5173` |
| **Authorized redirect URIs** | `https://rxbmsrcvvgvtulcbdwwg.supabase.co/auth/v1/callback` |

Copy **Client ID** → Netlify env `VITE_GOOGLE_CLIENT_ID` and Supabase → Google provider.

> Fit Teen uses **Google Identity popup** (no Supabase URL in the address bar). JavaScript origins are required.

---

## 2. OAuth consent screen

| Field | Value |
|--------|--------|
| User type | External |
| App name | **Fit Teen** |
| User support email | Your email |
| App logo | Optional (512×512) |
| App home page | `https://fit-teen.netlify.app` |
| **Privacy policy URL** | `https://fit-teen.netlify.app/privacy` |
| Terms of service | Optional for testing |
| Publishing status | **Testing** (add Test users until verified) |

---

## 3. Domain / property verification (Search Console)

If Google asks you to verify ownership of `fit-teen.netlify.app`:

### Option A — HTML file (recommended on Netlify)

1. Search Console → Add property → URL prefix → `https://fit-teen.netlify.app`
2. Choose **HTML file** verification
3. File included in repo: **`public/google20c09b3b40932445.html`**
4. After Netlify deploy, open `https://fit-teen.netlify.app/google20c09b3b40932445.html` — should show the verification string
5. Click **Verify** in Search Console

### Option B — HTML meta tag

1. Google gives: `<meta name="google-site-verification" content="YOUR_CODE" />`
2. Add to `index.html` inside `<head>` (or set Netlify env and rebuild — see README)
3. Redeploy → Verify in Search Console

---

## 4. OAuth app verification (when leaving Testing mode)

Google may require:

- Privacy policy live at `/privacy`
- Demo video or written justification of scopes (email + profile only)
- Verified domain in Search Console
- App homepage showing Fit Teen branding

Scopes used: **openid**, **email**, **profile** (via Supabase / Google Sign-In).

---

## 5. Supabase (same Client ID)

**Project → Authentication → Providers → Google** — enable, paste Client ID + Secret.

**URL configuration:**

- Site URL: `https://fit-teen.netlify.app`
- Redirect URLs: `https://fit-teen.netlify.app/**`

---

## 6. Netlify environment variables

```
VITE_GOOGLE_CLIENT_ID=<same Web client ID>
VITE_SUPABASE_URL=https://rxbmsrcvvgvtulcbdwwg.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable key>
VITE_APP_URL=https://fit-teen.netlify.app
```

Redeploy after changes.

---

## Checklist

- [ ] OAuth Web client with origins + Supabase callback URI
- [ ] Consent screen: Fit Teen, privacy URL, test users
- [ ] Search Console property verified (HTML file in `public/` if required)
- [ ] Supabase Google provider enabled
- [ ] `VITE_GOOGLE_CLIENT_ID` on Netlify
- [ ] DB migrations `001` + `002` applied
