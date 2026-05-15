#!/usr/bin/env bash
# Deploy the current site to Cloudflare Pages (project: xuhuwan)
# Live URL: https://xuhuwan.pages.dev
set -euo pipefail
cd "$(dirname "$0")"
exec wrangler pages deploy . --project-name=xuhuwan --branch=main --commit-dirty=true
