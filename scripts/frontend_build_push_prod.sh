#!/usr/bin/env bash
set -euo pipefail

# Resolve repo root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

WEB_DIR="$REPO_ROOT/app/web"
PROD_WEB_TF_DIR="$REPO_ROOT/infra/terraform/live/prod/web"

# --- Build frontend for PROD ---
cd "$WEB_DIR"
npm install
# If your Vite/React build uses "prod" instead of "production", switch the mode.
npm run build -- --mode production

# --- Read S3 bucket and CDN from PROD web stack outputs ---
BUCKET="$(terraform -chdir="$PROD_WEB_TF_DIR" output -raw web_bucket_name)"
CDN_DOMAIN="$(terraform -chdir="$PROD_WEB_TF_DIR" output -raw web_cdn_domain || true)"

# --- Upload artifacts ---
# Long-cache everything except index.html
aws s3 sync ./dist "s3://$BUCKET" \
  --delete \
  --cache-control "max-age=31536000,public" \
  --exclude "index.html"

# Short-cache index.html
aws s3 cp ./dist/index.html "s3://$BUCKET/index.html" \
  --cache-control "no-cache"

echo "✅ Frontend uploaded to s3://$BUCKET"

# --- CloudFront invalidation (best-effort) ---
# We prefer to get Distribution ID from TF output named 'web_cdn_id' if you add it.
# Fallback: resolve ID by matching the DomainName to CDN_DOMAIN.
DISTRIBUTION_ID=""
if terraform -chdir="$PROD_WEB_TF_DIR" output -raw web_cdn_id >/dev/null 2>&1; then
  DISTRIBUTION_ID="$(terraform -chdir="$PROD_WEB_TF_DIR" output -raw web_cdn_id)"
elif [[ -n "${CDN_DOMAIN:-}" && "$CDN_DOMAIN" != "null" ]]; then
  # CloudFront is global; no region flag
  DISTRIBUTION_ID="$(
    aws cloudfront list-distributions \
      --query "DistributionList.Items[?DomainName=='$CDN_DOMAIN'].Id | [0]" \
      --output text
  )"
fi

if [[ -n "${DISTRIBUTION_ID:-}" && "$DISTRIBUTION_ID" != "None" && "$DISTRIBUTION_ID" != "null" ]]; then
  INVALIDATION_ID="$(
    aws cloudfront create-invalidation \
      --distribution-id "$DISTRIBUTION_ID" \
      --paths "/*" \
      --query 'Invalidation.Id' \
      --output text
  )"
  echo "🧹 CloudFront invalidation created: $INVALIDATION_ID (Distribution: $DISTRIBUTION_ID)"
else
  echo "⚠️  Skipped CloudFront invalidation (no distribution id found)."
  echo "    Tip: export distribution id from Terraform as 'web_cdn_id' for a direct read."
fi

echo "✅ PROD frontend publish complete."
