#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ECR_TF_DIR="$REPO_ROOT/infra/terraform/ecr"
API_DIR="$REPO_ROOT/server/api"

API_REPO_URL="$(terraform -chdir="$ECR_TF_DIR" output -raw api_repo_url)"
SHA="$(git rev-parse --short HEAD)"

# Build and tag
docker buildx build --platform linux/amd64 -t "$API_REPO_URL:$SHA" "$API_DIR"

# Tag as latest for QA
docker tag "$API_REPO_URL:$SHA" "$API_REPO_URL:latest"

# Push both
docker push "$API_REPO_URL:$SHA"
docker push "$API_REPO_URL:latest"

# Show digest (from the SHA tag)
DIGEST=$(aws ecr describe-images \
  --repository-name "virtual-consultant/api" \
  --image-ids imageTag="$SHA" \
  --query 'imageDetails[0].imageDigest' \
  --output text)

echo "✅ Pushed API image"
echo "   Tags: $SHA, latest"
echo "   Digest: $DIGEST"
