# WPT Royale Partners — website

The affiliate landing site of WPT Royale Partners: a home page, `/terms-and-conditions/` and `/privacy-policy/`.

It is a **static site** built with [Astro](https://astro.build) and hosted on **Cloudflare Workers** (static assets +
a small Worker). There is no database, no CMS and no server to maintain: every push to `main` rebuilds the site and
deploys it through GitHub Actions.

- [Tech stack](#tech-stack)
- [Run it locally](#run-it-locally)
- [Where to edit content](#where-to-edit-content)
- [How the deployment works](#how-the-deployment-works)
- [Moving the deployment to your Cloudflare account — step by step](#moving-the-deployment-to-your-cloudflare-account--step-by-step)
- [Launch checklist](#launch-checklist)
- [Optional: stage environment](#optional-stage-environment)
- [Optional: deploy by hand without GitHub Actions](#optional-deploy-by-hand-without-github-actions)
- [Optional: forms](#optional-forms)
- [Troubleshooting](#troubleshooting)

---

## Tech stack

| | |
| --- | --- |
| Framework | Astro 7, `output: 'static'` (the build is a folder of HTML/CSS/JS/images in `dist/`) |
| Language | TypeScript (pinned to 6.x — do not upgrade to 7, `astro check` does not support it yet) |
| Styles | plain CSS (`src/styles/`), no Tailwind / SCSS |
| Hosting | Cloudflare Workers with static assets (`wrangler.jsonc`, Worker code in `worker/index.ts`) |
| CI/CD | GitHub Actions, `.github/workflows/deploy.yml` |
| Package manager | pnpm (version fixed in `package.json` → `packageManager`) |
| Node.js | 22.12 or newer |

## Run it locally

```bash
corepack enable          # makes the pnpm version from package.json available
pnpm install
pnpm dev                 # http://localhost:4321
```

| Command | What it does |
| --- | --- |
| `pnpm dev` | development server with hot reload |
| `pnpm build` | production build into `dist/` (first generates the Open Graph images into `public/og/`) |
| `pnpm preview` | serves the built `dist/` locally |
| `pnpm check` | type checks of the Astro templates and the Worker — run after code changes, expect `0 errors` |
| `pnpm seo` | after `pnpm build`: validates titles, descriptions, canonical, Open Graph, JSON-LD, robots/sitemap |

`robots.txt`, `sitemap.xml`, `llms.txt` and `llms-full.txt` are generated into `dist/` on every build — do not
create them by hand.

## Where to edit content

| What | File |
| --- | --- |
| All texts of the home page, header, footer | `src/i18n/en.ts` |
| Terms and Conditions text | `src/i18n/en.terms.ts` |
| Privacy Policy text | `src/i18n/en.privacy.ts` |
| Brand name, contact e-mail, socials | `src/data/site.ts` |
| Page titles and meta descriptions | `src/pages/[...locale]/*.astro` (`title` / `description` props) |
| Images | `src/assets/<section>/` (sources at 2x, optimized at build time) |
| Open Graph images (link previews) | `src/assets/og/*.jpg` → generated into `public/og/` on build |
| Favicon | `public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png` |
| Production URL | `astro.config.mjs` → `site` |

Open items left in the code are marked with `TODO` (for example the target of the "Contact Us" link):
`grep -rn TODO src public astro.config.mjs wrangler.jsonc`.

## How the deployment works

```
git push origin main
      │
      ▼
GitHub Actions — workflow "Deploy" (.github/workflows/deploy.yml)
  1. pnpm install --frozen-lockfile
  2. pnpm build                       → dist/
  3. wrangler deploy --env=""         → uploads dist/ + worker/index.ts to Cloudflare
      │
      ▼
Cloudflare Worker  "wpt-royal-partners"   (name in wrangler.jsonc)
  serves dist/ on the custom domain from wrangler.jsonc → routes
```

- The workflow runs on every push to `main` (and to `stage`, if that branch exists) and can also be started by hand:
  GitHub → **Actions** → **Deploy** → **Run workflow**.
- It needs **one** repository secret: `CLOUDFLARE_API_TOKEN`. The Cloudflare account id is read from `wrangler.jsonc`.
- Cloudflare's own Git integration (Workers Builds / Cloudflare GitHub App) is **not** used. Do not connect the
  repository in the Cloudflare dashboard — the site would be deployed twice by two different systems.
- Every page starts with an HTML comment `<!-- Published: <build time UTC> · commit <sha> -->`, so you can always see
  which commit is live (View Source, first line).
- What the Worker does (`worker/index.ts`): serves the static files; unknown URLs get `dist/404.html` with status 404;
  `/api/*` is reserved for forms (not connected, see [Forms](#optional-forms)).
- Response headers (security headers, caching of `/_astro/*`, the temporary `noindex`) are in `public/_headers`.

## Moving the deployment to your Cloudflare account — step by step

`wrangler.jsonc` has no Cloudflare account yet (`account_id` is a placeholder), and the domain in it and in
`astro.config.mjs` is the temporary preview domain `wpt-royal-partners.site`. Follow these steps once to deploy the site
from your own GitHub and Cloudflare accounts. Until then a push to `main` fails at the deploy step — the live site is
not affected.

### Step 1. The repository

Either accept a GitHub repository transfer into your organization, or create an empty repository and push the code:

```bash
git remote set-url origin git@github.com:<your-org>/<your-repo>.git
git push -u origin main
```

Make sure **Settings → Actions → General** allows actions to run (they are allowed by default).

### Step 2. The domain in Cloudflare

1. Log in to your Cloudflare account. The **Workers Free plan is enough** for this site.
2. Add the domain the site will live on (**Add a domain / Websites → Add**) and switch its nameservers at the registrar
   to the ones Cloudflare shows. Wait until the zone status is **Active**.
3. If the hostname you want to use (e.g. `example.com` or `www.example.com`) **already has an A / AAAA / CNAME record**,
   delete that record — Cloudflare refuses to attach a Worker custom domain to a hostname with an existing record.

No domain on Cloudflare yet? See [Troubleshooting → deploy to a workers.dev address](#troubleshooting).

### Step 3. Your account id

Cloudflare dashboard → **Workers & Pages** (or the account home page) → the right column shows **Account ID**.
Copy it — it is not a secret.

### Step 4. Update the configuration in the repository

**`wrangler.jsonc`**

```jsonc
{
  "name": "wpt-royal-partners",          // Worker name in your account — keep it or rename (lowercase, dashes)
  "account_id": "<YOUR ACCOUNT ID>",     // from step 3
  "routes": [{ "pattern": "<your-domain.com>", "custom_domain": true }],
  // ...
  "vars": {
    "ENVIRONMENT": "production",         // keep as is ("stage" in env.stage)
    "NOTIFY": "telegram",
    "SITE_NAME": "<your-domain.com>"
  },
  "env": {
    "stage": {
      "routes": [{ "pattern": "stage.<your-domain.com>", "custom_domain": true }],
      // ...
      "vars": { "ENVIRONMENT": "stage", "NOTIFY": "telegram", "SITE_NAME": "<your-domain.com>" }
    }
  }
}
```

- To serve both the bare domain and `www`, add a second route:
  `{ "pattern": "www.<your-domain.com>", "custom_domain": true }`.
- Cloudflare creates the DNS records and the SSL certificate for every `custom_domain` route automatically on deploy.

**`astro.config.mjs`**

```js
site: 'https://<your-domain.com>',
```

This value is required: canonical URLs, `og:url` / `og:image`, the Schema.org data, `sitemap.xml` and `robots.txt` are
built from it. It must be exactly the address the site opens on (with or without `www`, as you chose above).

Check that everything still builds:

```bash
pnpm install
pnpm check            # 0 errors
pnpm build && pnpm seo
pnpm exec wrangler deploy --env="" --dry-run     # shows what would be uploaded, deploys nothing
```

Commit these changes, but **do not push yet** — the secret from steps 5–6 must exist first, otherwise the first run fails
(harmless, you can re-run it later).

### Step 5. Create the Cloudflare API token

Cloudflare dashboard → your profile icon → **My Profile → API Tokens → Create Token**:

1. Template **Edit Cloudflare Workers** → **Use template**.
   It includes Workers Scripts: Edit, Workers Routes: Edit, Account Settings: Read, and a few others the template adds.
2. **Add more** → **Zone → DNS → Edit** (needed for `custom_domain`, which writes the DNS record).
3. Only if you plan to connect the forms later: **Account → D1 → Edit**.
4. **Account Resources** → Include → *your account*.
   **Zone Resources** → Include → Specific zone → *your domain*.
5. **Continue to summary → Create Token**, copy the token (it is shown only once).

Verify it in your terminal (do not paste the token into chats or commit it anywhere):

```bash
curl -s https://api.cloudflare.com/client/v4/user/tokens/verify \
  -H "Authorization: Bearer <TOKEN>"
# expected: "status":"active"
```

### Step 6. Add the token to GitHub

GitHub → repository → **Settings → Secrets and variables → Actions → New repository secret**:

- Name: `CLOUDFLARE_API_TOKEN`
- Secret: the token from step 5

Or with the GitHub CLI: `gh secret set CLOUDFLARE_API_TOKEN -R <your-org>/<your-repo>` (paste the token at the prompt).

This is the only secret the deployment needs.

### Step 7. First deploy

```bash
git push origin main
```

GitHub → **Actions** → **Deploy** → open the run. A successful run ends with the step **Deploy Worker**, whose log shows
the Worker name and your custom domain. A run takes about 1–2 minutes.

Check the live site:

```bash
curl -sI https://<your-domain.com>/            # HTTP/2 200
curl -s  https://<your-domain.com>/ | head -1  # <!-- Published: … · commit <sha of your last commit> -->
curl -sI https://<your-domain.com>/missing     # HTTP/2 404
```

Right after the very first deploy the certificate can take a few minutes — a TLS error or 5xx during that time is
normal, wait and retry.

From now on every push (or merge) to `main` deploys the site automatically.

## Launch checklist

The site is currently **closed for search engines on purpose** (it was waiting for approval). Before going public:

1. **Remove the `X-Robots-Tag: noindex` line** (and its `TODO` comment) from the `/*` block in `public/_headers`.
   Keep `X-Frame-Options` and `Cross-Origin-Opener-Policy`.
2. `site` in `astro.config.mjs` is the final production URL.
3. Resolve the remaining `TODO`s (`grep -rn TODO src public astro.config.mjs wrangler.jsonc`).
4. `pnpm build && pnpm seo` → 0 errors.
5. Push to `main`, then check: `curl -sI https://<your-domain.com>/` no longer contains `x-robots-tag: noindex`, and
   `https://<your-domain.com>/robots.txt` points to the sitemap.
6. Optionally submit `https://<your-domain.com>/sitemap.xml` in Google Search Console.

## Optional: stage environment

A preview copy of the site on its own subdomain, for checking changes before they reach production. The workflow and
`wrangler.jsonc` already support it; it is switched on simply by creating the `stage` branch.

| | Production | Stage |
| --- | --- | --- |
| Git branch | `main` | `stage` |
| Worker in Cloudflare | `wpt-royal-partners` | `wpt-royal-partners-stage` (created automatically on the first deploy) |
| Domain | `<your-domain.com>` | `stage.<your-domain.com>` (any subdomain you like) |
| Search engines | open after launch | always closed: the Worker adds `X-Robots-Tag: noindex` to every response and serves `robots.txt` with `Disallow: /` |
| Config | top level of `wrangler.jsonc` | `env.stage` in `wrangler.jsonc` |

Do steps 1–7 of the production setup first — stage uses the same account, the same API token and the same GitHub
secret.

### Stage step 1. Choose the subdomain and check DNS

1. Pick the hostname, e.g. `stage.<your-domain.com>`. It must be in a zone of the same Cloudflare account.
2. Cloudflare dashboard → the domain → **DNS → Records**: make sure there is **no** record for this hostname
   (`stage`). Do not create one — Cloudflare creates the DNS record and the certificate itself on the first deploy.
3. The API token from step 5 already covers it if the subdomain is in the same zone. A subdomain of a **different**
   domain needs that zone added to the token (**Zone Resources**, plus **DNS: Edit** for it).

### Stage step 2. Set the subdomain in `wrangler.jsonc`

```jsonc
"env": {
  "stage": {
    "routes": [{ "pattern": "stage.<your-domain.com>", "custom_domain": true }],
    // assets: keep as is
    "vars": {
      "ENVIRONMENT": "stage",              // must stay "stage": this is what turns on noindex
      "NOTIFY": "telegram",
      "SITE_NAME": "<your-domain.com>"
    }
  }
}
```

`env.stage` inherits nothing from the top level (Wrangler rule), so `routes`, `assets` and `vars` are all written out
there. If `env.stage.routes` is missing, the stage Worker would try to take over the production domain.

Check: `pnpm exec wrangler deploy --env stage --dry-run` lists the Worker `wpt-royal-partners-stage` and the stage
route. Commit the change to `main`.

### Stage step 3. Create the branch

```bash
git switch main && git pull
git switch -c stage
git push -u origin stage
```

The push starts the **Deploy** workflow for the `stage` branch (GitHub → **Actions**); it runs
`wrangler deploy --env stage`. The log of the **Deploy Worker** step shows `wpt-royal-partners-stage` and the
subdomain.

### Stage step 4. Check it

```bash
curl -sI https://stage.<your-domain.com>/             # HTTP/2 200 and x-robots-tag: noindex
curl -s  https://stage.<your-domain.com>/robots.txt   # User-agent: *  Disallow: /
curl -s  https://stage.<your-domain.com>/ | head -1   # <!-- Published: … · commit <sha of the stage commit> -->
```

Right after the first deploy the certificate can take a few minutes — wait and retry.

Note: canonical links and Open Graph URLs on stage point to the production domain (`site` in `astro.config.mjs`).
This is intended — stage is a copy of production, not a separate site.

### Day-to-day workflow with stage

```bash
git switch stage
# … make changes, commit …
git push origin stage                     # → deployed to https://stage.<your-domain.com>

# after the changes are approved on stage:
git switch main
git merge --ff-only stage                 # or open a pull request stage → main on GitHub
git push origin main                      # → deployed to production
git switch stage
```

Optionally protect `main` on GitHub (**Settings → Branches → Add rule**: require a pull request) so that production
only changes through a reviewed merge from `stage`.

To restrict who can open the stage site (e.g. only your team and the client), put it behind **Cloudflare Zero Trust
→ Access → Applications → Self-hosted**, application domain `stage.<your-domain.com>` (free for up to 50 users).

### Not using stage

Never create the `stage` branch — nothing is deployed for it, and `env.stage` in `wrangler.jsonc` stays unused.
To remove stage later: delete the branch (`git push origin --delete stage`), then delete the Worker
`wpt-royal-partners-stage` in **Workers & Pages** (this also removes its custom domain).

## Optional: deploy by hand without GitHub Actions

```bash
pnpm install
pnpm build
pnpm exec wrangler login                 # opens the browser, log in to your Cloudflare account
pnpm exec wrangler deploy --env=""       # production;  --env stage for the stage Worker
```

`--env=""` explicitly selects the top-level (production) configuration. Prefer the GitHub Actions flow so that what is
live always matches `main`.

## Optional: forms

The site has **no forms** right now — all sign-up buttons link to `https://tracking.wptpartners.com/v2/sign-up`.
`worker/index.ts` already contains a ready form handler (`POST /api/form` → Cloudflare D1 → Telegram and/or e-mail) that
is inactive until it is configured. Connecting it requires:

1. a D1 database (`pnpm exec wrangler d1 create <name>`) and the `d1_databases` + `ratelimits` bindings in
   `wrangler.jsonc` (top level and `env.stage`);
2. Worker secrets: `pnpm exec wrangler secret put TELEGRAM_BOT_TOKEN --env=""` (also `TELEGRAM_CHAT_ID`,
   `TELEGRAM_WEBHOOK_SECRET`);
3. the **D1: Edit** permission on the API token — the workflow then applies `migrations/` automatically before each
   deploy;
4. the form markup on the pages.

## Troubleshooting

| Symptom | Cause → fix |
| --- | --- |
| Run fails with `Invalid access token [code: 9109]` or `Authentication error [code: 10000]` | The secret is wrong (extra space / line break, Global API Key instead of a token) or the token lacks a permission / is for another account → verify the token (step 5), set the secret again, **Re-run failed jobs** |
| Run fails on the custom domain (`custom_domain` / `already has externally managed DNS records`) | The zone is not in the account from `account_id`, the token lacks **Zone → DNS: Edit** for that zone, or the hostname still has an old A/CNAME record → fix and re-run |
| `account_id` errors / "could not find account" | `account_id` in `wrangler.jsonc` is not your account, or the token was created without that account in Account Resources |
| A new Worker appeared, the domain still shows the old site | `name` in `wrangler.jsonc` differs from the Worker that owns the domain → use one name, redeploy, delete the extra Worker in the dashboard |
| Warning `Multiple environments are defined` | Only in manual commands: add `--env=""` (the workflow already does) |
| `pnpm install --frozen-lockfile` fails in CI | `package.json` was changed without updating `pnpm-lock.yaml` → run `pnpm install` locally and commit the lockfile |
| Site works, but Google shows nothing | `X-Robots-Tag: noindex` is still in `public/_headers` → see [Launch checklist](#launch-checklist) |
| The site is deployed twice / builds appear in the Cloudflare dashboard | The repository was connected in Cloudflare (Workers Builds) → Worker → **Settings → Build → Disconnect** |
| No domain on Cloudflare yet — deploy to a workers.dev address | In `wrangler.jsonc` remove `routes` and add `"workers_dev": true`; set `site` in `astro.config.mjs` to the `https://wpt-royal-partners.<your-subdomain>.workers.dev` address shown after the deploy, then rebuild and push |
