#!/usr/bin/env bash
# =============================================================================
# Deploy HRIS Frontend to Cloudflare Pages
# Usage: ./scripts/deploy-frontend.sh [--production]
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WEB_DIR="$ROOT_DIR/apps/web"

ENVIRONMENT="${1:---preview}"
PROJECT_NAME="hris-management-web"

echo "🏗  Building frontend..."
cd "$WEB_DIR"
pnpm build

echo "🚀 Deploying to Cloudflare Pages ($ENVIRONMENT)..."

if [[ "$ENVIRONMENT" == "--production" ]]; then
  npx -y wrangler pages deploy dist \
    --project-name "$PROJECT_NAME" \
    --branch main \
    --commit-dirty=true
else
  npx -y wrangler pages deploy dist \
    --project-name "$PROJECT_NAME" \
    --commit-dirty=true
fi

echo "✅ Frontend deployed!"
echo ""
echo "📋 Next: Set these environment variables in the Cloudflare Pages dashboard:"
echo "   VITE_API_URL = https://your-api.onrender.com"
