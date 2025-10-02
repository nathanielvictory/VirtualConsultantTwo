#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ECR_TF_DIR="$REPO_ROOT/infra/terraform/ecr"

API_REPO_URL="$(terraform -chdir="$ECR_TF_DIR" output -raw api_repo_url)"
REGISTRY="${API_REPO_URL%%/*}"                          # 123...dkr.ecr.us-east-1.amazonaws.com
REGION="$(echo "$REGISTRY" | awk -F. '{print $(NF-2)}')" # ✅ us-east-1

echo "Using registry: $REGISTRY"
echo "Using region:   $REGION"

aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY"

echo "✅ Logged in to $REGISTRY ($REGION)"
