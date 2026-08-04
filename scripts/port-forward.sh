#!/bin/bash
# ============================================
# SAFEGUARD - Port Forward Script
# Forwards K8s services to localhost
# ============================================

set -euo pipefail

ENV="${1:-dev}"
NAMESPACE="safeguard-${ENV}"

echo "=========================================="
echo "  SafeGuard Port Forwarding"
echo "  Namespace: $NAMESPACE"
echo "=========================================="
echo ""
echo "Services will be available at:"
echo "  API Gateway:     http://localhost:8080"
echo "  Auth Service:    http://localhost:8081"
echo "  User Service:    http://localhost:8082"
echo "  Alert Service:   http://localhost:8083"
echo "  Location Svc:    http://localhost:8084"
echo "  Incident Svc:    http://localhost:8085"
echo "  Admin Service:   http://localhost:8086"
echo "  Notification:    http://localhost:8087"
echo "  Analytics Svc:   http://localhost:8088"
echo ""
echo "Press Ctrl+C to stop all port forwards."
echo ""

# Kill all background processes on exit
trap 'kill $(jobs -p) 2>/dev/null; exit' SIGINT SIGTERM

# Port forward all services
kubectl port-forward -n "$NAMESPACE" svc/api-gateway 8080:8080 &
kubectl port-forward -n "$NAMESPACE" svc/auth-service 8081:8080 &
kubectl port-forward -n "$NAMESPACE" svc/user-service 8082:8080 &
kubectl port-forward -n "$NAMESPACE" svc/alert-service 8083:8080 &
kubectl port-forward -n "$NAMESPACE" svc/location-service 8084:8080 &
kubectl port-forward -n "$NAMESPACE" svc/incident-service 8085:8080 &
kubectl port-forward -n "$NAMESPACE" svc/admin-service 8086:8080 &
kubectl port-forward -n "$NAMESPACE" svc/notification-service 8087:8080 &
kubectl port-forward -n "$NAMESPACE" svc/analytics-service 8088:8080 &

echo "All port forwards active."
wait
