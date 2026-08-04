#!/bin/bash
# ============================================
# SAFEGUARD - Database Migration Script
# Uses Flyway for schema migrations
# ============================================

set -euo pipefail

ENV="${1:-dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=========================================="
echo "  SafeGuard Database Migration"
echo "  Environment: $ENV"
echo "=========================================="

# ── Get database connection from Vault (or env for dev) ──
if [ "$ENV" = "dev" ]; then
  DB_HOST="${POSTGRES_HOST:-localhost}"
  DB_PORT="${POSTGRES_PORT:-5432}"
  DB_NAME="${POSTGRES_DB:-safeguard_dev}"
  DB_USER="${POSTGRES_USER:-safeguard}"
  DB_PASSWORD="${POSTGRES_PASSWORD:-localdev123}"
else
  echo "Fetching credentials from Vault..."
  export VAULT_ADDR="${VAULT_ADDR}"
  export VAULT_TOKEN="${VAULT_TOKEN}"

  DB_CREDS=$(vault read -format=json database/creds/auth-service-role)
  DB_HOST=$(vault read -format=json safeguard/secret/config/postgres | jq -r '.data.data.host')
  DB_PORT="5432"
  DB_NAME="safeguard_${ENV}"
  DB_USER=$(echo "$DB_CREDS" | jq -r '.data.username')
  DB_PASSWORD=$(echo "$DB_CREDS" | jq -r '.data.password')
fi

echo "Database: $DB_HOST:$DB_PORT/$DB_NAME"

# ── Run Flyway migration ──
echo ""
echo "Running Flyway migrations..."

docker run --rm \
  flyway/flyway:10 \
  -url="jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME" \
  -user="$DB_USER" \
  -password="$DB_PASSWORD" \
  -locations="filesystem:$PROJECT_ROOT/services/*/src/main/resources/db/migration" \
  migrate

echo ""
echo "Migration complete!"
