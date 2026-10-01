#!/usr/bin/env bash
# =============================================================================
# Setup Cloudflare R2 bucket for HRIS media uploads
# Prerequisites: wrangler must be authenticated (npx wrangler login)
# Usage: ./scripts/setup-r2.sh
# =============================================================================
set -euo pipefail

BUCKET_NAME="${R2_BUCKET_NAME:-hris-media}"

echo "🪣 Creating R2 bucket: $BUCKET_NAME"
npx -y wrangler r2 bucket create "$BUCKET_NAME" || echo "Bucket may already exist, continuing..."

echo ""
echo "📋 CORS configuration for browser-direct uploads:"
cat << 'CORS'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://hris-management-web.pages.dev", "http://localhost:5173"],
      "AllowedMethods": ["GET", "PUT", "HEAD"],
      "AllowedHeaders": ["Content-Type", "Authorization"],
      "MaxAgeSeconds": 3600
    }
  ]
}
CORS

echo ""
echo "✅ R2 bucket setup complete!"
echo ""
echo "📋 To get your R2 credentials:"
echo "   1. Go to Cloudflare Dashboard → R2 → your bucket → Manage API tokens"
echo "   2. Create a token with Object Read & Write permissions"
echo "   3. Copy STORAGE_ACCESS_KEY_ID and STORAGE_SECRET_ACCESS_KEY"
echo ""
echo "📋 R2 endpoint format:"
echo "   https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
echo ""
echo "📋 Public URL (enable R2.dev subdomain in bucket settings):"
echo "   https://pub-<HASH>.r2.dev"
