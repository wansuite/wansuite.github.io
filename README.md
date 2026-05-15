# xuhuwan.pages.dev

Personal site of Xuhu Wan — Associate Professor at HKUST (Department of ISOM), principal of SFG and AGR systematic trading strategies.

## Stack
Plain HTML + Tailwind CSS (Play CDN) + Chart.js. No build step.

## Hosting
Deployed directly to **Cloudflare Pages** as project `xuhuwan`. Live URL: https://xuhuwan.pages.dev

GitHub repo (`wansuite/wansuite.github.io`) is the source-of-truth and is git-committed for version history, but **GitHub Pages is disabled** — Cloudflare Pages does not auto-deploy from Git in this setup. Every site update requires a manual `wrangler` deploy (see below).

## Deploy

Run after committing changes:

```bash
./deploy.sh
```

Or directly:

```bash
wrangler pages deploy . --project-name=xuhuwan --branch=main --commit-dirty=true
```

This uploads the current directory (excluding paths in `.cloudflareignore`) to Cloudflare Pages. Deploy takes ~5 sec; site updates within ~30 sec at https://xuhuwan.pages.dev.

## Edit
- `index.html` — main landing (Research / Teaching / ML in Practice)
- `research.html` — full research page (papers, abstracts, profiles)
- `teaching.html` — course details
- `about.html` — bio + contact
- `assets/data/funds.json` — live SFG/AGR NAV (regenerate via `python3 /tmp/compute_fund_stats.py`)
- `assets/js/charts.js` — chart rendering
- `assets/img/` — figures

## Deployment exclusions

`.cloudflareignore` keeps these out of the public site:
- `.git`, `.gitignore`, `.cloudflareignore`, `.vscode`, `.DS_Store`
- `README.md`
- `hkust-deploy/` (separate HKUST hosting package, not for the public site)
- `node_modules`
