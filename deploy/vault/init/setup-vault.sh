#!/bin/bash
# ============================================
# SAFEGUARD - Vault Initialization Script
# Sets up Vault for the first time
# ============================================

set -euo pipefail

VAULT_ADDR="${VAULT_ADDR:-http://localhost:8200}"
export VAULT_ADDR

echo "=========================================="
echo "  SafeGuard Vault Initialization"
echo "  Addr: $VAULT_ADDR"
echo "=========================================="

# ── Check if Vault is running ──
echo ""
echo "[1/4] Checking Vault status..."
if ! vault status 2>/dev/null; then
  echo "ERROR: Cannot connect to Vault at $VAULT_ADDR"
  echo "Make sure Vault is running: make up-infra"
  exit 1
fi

# ── Check if already initialized ──
INIT_STATUS=$(vault status -format=json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('initialized', False))" 2>/dev/null || echo "False")

if [ "$INIT_STATUS" = "True" ]; then
  echo "Vault is already initialized."
  echo "To re-initialize, first unseal and login, then run:"
  echo "  vault operator rekey -init -key-shares=1 -key-threshold=1"
else
  echo ""
  echo "[2/4] Initializing Vault (dev mode)..."

  if [ "${VAULT_DEV_ROOT_TOKEN_ID:-}" != "" ]; then
    echo "Dev mode: Using dev root token"
    echo "Token: $VAULT_DEV_ROOT_TOKEN_ID"
  else
    echo "Initializing with 1 key share, 1 threshold (dev mode only!)"
    vault operator init -key-shares=1 -key-threshold=1 -format=json > vault-init-keys.json
    echo "Init keys saved to vault-init-keys.json (KEEP SECURE!)"
  fi
fi

# ── Login ──
echo ""
echo "[3/4] Authenticating..."
if [ "${VAULT_DEV_ROOT_TOKEN_ID:-}" != "" ]; then
  vault login "$VAULT_DEV_ROOT_TOKEN_ID"
else
  echo "Please unseal Vault manually:"
  echo "  vault operator unseal <key-from-vault-init-keys.json>"
  echo "Then login with the root token."
  exit 0
fi

# ── Seed secrets ──
echo ""
echo "[4/4] Seeding secrets..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/seed-secrets.sh"

echo ""
echo "=========================================="
echo "  Vault initialization complete!"
echo "  UI: $VAULT_ADDR"
echo "=========================================="
