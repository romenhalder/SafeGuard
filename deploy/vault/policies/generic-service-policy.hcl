# ============================================
# SAFEGUARD - Vault Policy: Generic Service
# Used by: User, Incident, Admin, Analytics
# ============================================

# Database credentials
path "database/creds/{{identity.entity.aliases.auth_kubernetes_{{identity.entity.aliases.auth_kubernetes_{{identity.entity.aliases.auth_kubernetes_0.name}}-role}}" {
  capabilities = ["read"]
}

# Redis credentials
path "safeguard/secret/data/redis" {
  capabilities = ["read"]
}

# App secrets
path "safeguard/secret/data/app/jwt" {
  capabilities = ["read"]
}

# Service-specific secrets
path "safeguard/secret/data/app/{{identity.entity.metadata.service_name}}" {
  capabilities = ["read"]
}
