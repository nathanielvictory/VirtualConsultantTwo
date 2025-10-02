#!/usr/bin/env bash
set -euo pipefail

# Resolve repo root regardless of where it's run from
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ECR_TF_DIR="$REPO_ROOT/infra/terraform/ecr"
WORKER_DIR="$REPO_ROOT/server/agent"

# Get ECR worker repo URL from terraform outputs
WORKER_REPO_URL="$(terraform -chdir="$ECR_TF_DIR" output -raw worker_repo_url)"
SHA="$(git rev-parse --short HEAD)"

# Build for ECS's arch, tag with SHA
docker buildx build --platform linux/amd64 -t "$WORKER_REPO_URL:$SHA" "$WORKER_DIR"

# Also tag as latest for QA
docker tag "$WORKER_REPO_URL:$SHA" "$WORKER_REPO_URL:latest"

# Push both
docker push "$WORKER_REPO_URL:$SHA"
docker push "$WORKER_REPO_URL:latest"

# Get digest (immutable ref for prod)
DIGEST=$(aws ecr describe-images \
  --repository-name "virtual-consultant/worker" \
  --image-ids imageTag="$SHA" \
  --query 'imageDetails[0].imageDigest' \
  --output text)

echo "✅ Pushed WORKER image"
echo "   Tags: $SHA, latest"
echo "   Digest: $DIGEST"
