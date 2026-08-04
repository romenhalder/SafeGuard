# ============================================
# SAFEGUARD - Vault Policy: Location Service
# ============================================

# Read database credentials
path "database/creds/location-service-role" {
  capabilities = ["read"]
}

# Read Redis credentials
path "safeguard/secret/data/redis" {
  capabilities = ["read"]
}

# Read app secrets
path "safeguard/secret/data/app/jwt" {
  capabilities = ["read"]
}

# Google Maps API key
path "safeguard/secret/data/external/google-maps-key" {
  capabilities = ["read"]
}
