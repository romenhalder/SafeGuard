# ============================================
# SAFEGUARD - Vault Policy: Alert Service
# ============================================

# Read database credentials (PostgreSQL)
path "database/creds/alert-service-role" {
  capabilities = ["read"]
}

# Read MongoDB credentials
path "database/creds/mongo-role" {
  capabilities = ["read"]
}

# Read Redis credentials
path "safeguard/secret/data/redis" {
  capabilities = ["read"]
}

# Read app secrets
path "safeguard/secret/data/app/*" {
  capabilities = ["read"]
}

# Read external service secrets (FCM, SMS)
path "safeguard/secret/data/external/fcm-credentials" {
  capabilities = ["read"]
}

path "safeguard/secret/data/external/twilio*" {
  capabilities = ["read"]
}

path "safeguard/secret/data/external/msg91*" {
  capabilities = ["read"]
}
