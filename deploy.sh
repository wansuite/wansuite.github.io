#!/usr/bin/env bash
# Deploy the current site to Cloudflare Pages (project: xuhuwan)
# Live URL: https://xuhuwan.pages.dev
#
# Steps:
#   1. Re-compile Tailwind CSS (so any new utility classes get included).
#   2. Upload site to Cloudflare Pages via wrangler.
set -euo pipefail
cd "$(dirname "$0")"

echo "→ Compiling Tailwind CSS..."
npx tailwindcss -c tailwind.config.cjs -i src/input.css -o assets/css/tailwind.css --minify

echo "→ Deploying to Cloudflare Pages..."
exec wrangler pages deploy . --project-name=xuhuwan --branch=main --commit-dirty=true
