# ============================================
# SAFEGUARD - Vault HA Configuration (Staging/Prod)
# ============================================

ui = true
disable_mlock = false

storage "raft" {
  path    = "/vault/file"
  node_id = "vault-${VAULT_RAFT_NODE_ID}"

  retry_join {
    leader_api_addr = "https://vault-0.vault-internal:8200"
  }
  retry_join {
    leader_api_addr = "https://vault-1.vault-internal:8200"
  }
  retry_join {
    leader_api_addr = "https://vault-2.vault-internal:8200"
  }
}

listener "tcp" {
  address       = "0.0.0.0:8200"
  tls_cert_file = "/vault/tls/tls.crt"
  tls_key_file  = "/vault/tls/tls.key"

  telemetry {
    unauthenticated_metrics_access = true
  }
}

seal "awskms" {
  region     = "ap-south-1"
  kms_key_id = "${VAULT_UNSEAL_KMS_KEY_ID}"
}

api_addr     = "https://vault.safeguard.svc.cluster.local:8200"
cluster_addr = "https://vault-${VAULT_RAFT_NODE_ID}.vault-internal:8201"

telemetry {
  prometheus_retention_time = "30s"
  disable_hostname          = true
}
