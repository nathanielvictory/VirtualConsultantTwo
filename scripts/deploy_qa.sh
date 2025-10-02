#!/usr/bin/env bash
set -euo pipefail

# Resolve repo root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
QA_TF_DIR="$REPO_ROOT/infra/terraform/envs/qa"

# 1) ECR login
"$REPO_ROOT/scripts/ecr_login.sh"

# 2) Build + push images (API, Worker), tag :latest for QA
"$REPO_ROOT/scripts/api_build_push.sh"
"$REPO_ROOT/scripts/worker_build_push.sh"

# 3) Frontend build + upload to S3
"$REPO_ROOT/scripts/frontend_build_push.sh"

# 4) Apply QA infra (expects task defs to use :latest in QA)
terraform -chdir="$QA_TF_DIR" init -input=false
terraform -chdir="$QA_TF_DIR" apply -auto-approve -input=false

echo "✅ QA release complete."

# (Optional) If you already have ECS services and want to roll them now, uncomment:
# CLUSTER="vc-qa"
# for SVC in api worker; do
#   aws ecs update-service --cluster "$CLUSTER" --service "$SVC" --force-new-deployment >/dev/null
#   echo "🔁 Forced new deployment for $SVC"
# done
