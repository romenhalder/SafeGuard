# ============================================
# SAFEGUARD - Vault Policy: Auth Service
# ============================================

# Read database credentials
path "database/creds/auth-service-role" {
  capabilities = ["read"]
}

# Read JWT secrets
path "safeguard/secret/data/app/jwt" {
  capabilities = ["read"]
}

# Read external service secrets
path "safeguard/secret/data/external/*" {
  capabilities = ["read"]
}

# Encrypt/decrypt Aadhaar hashes
path "transit/encrypt/safeguard-data" {
  capabilities = ["update"]
}

path "transit/decrypt/safeguard-data" {
  capabilities = ["update"]
}
