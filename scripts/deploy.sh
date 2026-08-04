#!/bin/bash
# ============================================
# SAFEGUARD - Deploy Script
# Usage: ./deploy.sh <environment>
# ============================================

set -euo pipefail

ENV="${1:-dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=========================================="
echo "  SafeGuard Deployment"
echo "  Environment: $ENV"
echo "=========================================="

# ── Validate environment ──
case "$ENV" in
  dev|staging|production)
    ;;
  *)
    echo "ERROR: Invalid environment. Use: dev, staging, or production"
    exit 1
    ;;
esac

# ── Check prerequisites ──
echo ""
echo "[1/5] Checking prerequisites..."

command -v helm >/dev/null 2>&1 || { echo "ERROR: helm not found"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "ERROR: kubectl not found"; exit 1; }

echo "  helm:    $(helm version --short)"
echo "  kubectl: $(kubectl version --client --short)"

# ── Configure kubectl ──
echo ""
echo "[2/5] Configuring kubectl for $ENV..."

if [ "$ENV" = "dev" ]; then
  # Minikube
  minikube status >/dev/null 2>&1 || { echo "ERROR: Minikube is not running"; exit 1; }
  eval $(minikube docker-env)
else
  # EKS
  CLUSTER_NAME="safeguard-${ENV}"
  aws eks update-kubeconfig --name "$CLUSTER_NAME" --region ap-south-1
fi

kubectl cluster-info

# ── Create namespace ──
echo ""
echo "[3/5] Creating namespace..."
kubectl create namespace "safeguard-${ENV}" --dry-run=client -o yaml | kubectl apply -f -

# ── Deploy Helm charts ──
echo ""
echo "[4/5] Deploying services..."

SERVICES=(
  api-gateway
  auth-service
  user-service
  alert-service
  location-service
  incident-service
  admin-service
  notification-service
  analytics-service
)

for SERVICE in "${SERVICES[@]}"; do
  echo "  Deploying $SERVICE..."
  helm upgrade --install "$SERVICE" "$PROJECT_ROOT/deploy/helm/$SERVICE" \
    -f "$PROJECT_ROOT/deploy/helm/$SERVICE/values-${ENV}.yaml" \
    --namespace "safeguard-${ENV}" \
    --wait \
    --timeout 5m
done

# ── Verify deployment ──
echo ""
echo "[5/5] Verifying deployment..."
kubectl get pods -n "safeguard-${ENV}"
kubectl get svc -n "safeguard-${ENV}"

echo ""
echo "=========================================="
echo "  Deployment to $ENV complete!"
echo "=========================================="
