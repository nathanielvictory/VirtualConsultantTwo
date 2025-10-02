#!/usr/bin/env bash
set -euo pipefail

# Always resolve repo root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

WEB_DIR="$REPO_ROOT/app/web"
QA_TF_DIR="$REPO_ROOT/infra/terraform/envs/qa"

# Build frontend for QA
cd "$WEB_DIR"
npm install
npm run build -- --mode qa

# Get bucket name from QA terraform outputs
BUCKET="$(terraform -chdir="$QA_TF_DIR" output -raw web_bucket_name)"

# Sync all built assets except index.html (long cache)
aws s3 sync ./dist "s3://$BUCKET" \
  --delete \
  --cache-control "max-age=31536000,public" \
  --exclude "index.html"

# Upload index.html separately (short cache, no-cache for hot reload)
aws s3 cp ./dist/index.html "s3://$BUCKET/index.html" \
  --cache-control "no-cache"

echo "✅ Frontend built and uploaded to s3://$BUCKET"
