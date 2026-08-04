# ============================================
# SAFEGUARD - Vault Policy: Notification Service
# ============================================

# Read Redis credentials
path "safeguard/secret/data/redis" {
  capabilities = ["read"]
}

# Read app secrets
path "safeguard/secret/data/app/jwt" {
  capabilities = ["read"]
}

# Firebase Cloud Messaging
path "safeguard/secret/data/external/fcm-credentials" {
  capabilities = ["read"]
}

# Twilio SMS
path "safeguard/secret/data/external/twilio*" {
  capabilities = ["read"]
}

# MSG91 SMS
path "safeguard/secret/data/external/msg91*" {
  capabilities = ["read"]
}
