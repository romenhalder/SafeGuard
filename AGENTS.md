# ============================================
# SAFEGUARD - AGENTS.md
# Development Workflow & Conventions
# For AI agents and human developers
# ============================================

## Project Overview

SafeGuard is a multi-microservice emergency response platform.
Backend: Java 21 + Spring Boot 3.x
Frontend: Android (native) + React.js (Admin Dashboard)
Infra: Kubernetes + HashiCorp Vault + Terraform (local dev runs directly on Java 21, no Docker)

## Repository Structure

```
safeguard/
├── services/          # 11 Spring Boot microservices
├── apps/              # Android apps + React.js dashboard
├── libs/              # Shared Java libraries
├── deploy/
│   ├── terraform/     # Infrastructure as Code
│   ├── helm/          # Kubernetes Helm charts
│   └── vault/         # Vault configs & policies
├── monitoring/        # Prometheus, Grafana, Loki
├── scripts/           # DevOps utility scripts
└── .github/           # CI/CD workflows
```

## Microservices

| Service | Port | Description |
|---------|------|-------------|
| api-gateway | 8080 | Spring Cloud Gateway, routing, rate limiting |
| auth-service | 8081 | JWT, OTP, citizen/officer/admin login |
| user-service | 8082 | Citizen & Officer CRUD |
| alert-service | 8083 | SOS dispatch engine, proximity algorithm |
| location-service | 8084 | GPS tracking, geofencing |
| incident-service | 8085 | Incident logging, reports |
| admin-service | 8086 | Dashboard APIs, zone management |
| notification-service | 8087 | Push/SMS/WebSocket notifications |
| analytics-service | 8088 | Reports, statistics |
| service-registry | 8761 | Eureka service discovery |
| config-server | 8888 | Spring Cloud Config |

## Development Commands

```bash
# First-time setup
make setup

# Build & Test
make build                 # Build all services
make build-service SERVICE=auth-service  # Build one service
make test                  # Run all tests

# Local dev (Windows, no Docker)
.\start-local.ps1          # Start all 11 services on Java 21
.\stop-local.ps1           # Stop services

# Vault
make vault-init            # Initialize Vault
make vault-seed            # Seed secrets

# Deploy
make deploy-dev            # Deploy to Minikube
make deploy-staging        # Deploy to EKS staging
make deploy-prod           # Deploy to EKS production (requires approval)
```

## Branch Strategy

```
main              → Production releases
├── staging       → Staging deployments (auto-deploy on push)
├── develop       → Development deployments (auto-deploy on merge)
└── feature/*     → Feature branches (PR → CI builds → merge)
```

## Commit Convention

```
feat(auth-service): add OTP verification endpoint
fix(alert-service): fix proximity calculation radius
docs(readme): update deployment guide
chore(docker): update PostGIS image version
ci(github): add security scan workflow
```

## Secrets Management

**NEVER commit secrets to git.** All secrets come from HashiCorp Vault.

| Secret | Vault Path |
|--------|------------|
| DB credentials | `database/creds/{service}-role` (dynamic) |
| JWT secret | `safeguard/secret/{env}/app/jwt` |
| Redis password | `safeguard/secret/{env}/redis` |
| FCM credentials | `safeguard/secret/{env}/external/fcm-credentials` |
| Twilio | `safeguard/secret/{env}/external/twilio` |
| Google Maps | `safeguard/secret/{env}/external/google-maps-key` |

## Local Development

1. Copy `.env.example` to `.env`
2. Fill in local dev values (not production!)
3. Run `make build` to build all services (or `make build-service SERVICE=auth-service`)
4. Run `.\start-local.ps1` to start all 11 services on Java 21 (no Docker)
5. Run `.\stop-local.ps1` to stop them

## Testing

- Unit tests: `mvn test`
- Load tests: k6 scripts in `scripts/load-tests/`
- Security scans: gitleaks + OWASP dependency-check (CI)

## Environment Values

| Env | K8s | DB | Vault | Monitoring |
|-----|-----|----|-------|------------|
| dev | Minikube | Cloud-managed (Neon/Upstash/Atlas) | Dev mode | Optional |
| staging | EKS (3x t3.medium) | RDS | HA 3-node | Full stack |
| production | EKS (3-6x m5.large) | RDS Multi-AZ | HA + auto-unseal | Full + alerts |

## Key Architecture Decisions

1. **Redis Streams** over Kafka - simpler, already using Redis for caching
2. **Vault dynamic credentials** - DB passwords rotate every 24h
3. **Helm per service** - independent deployment & scaling
4. **Multi-cloud Terraform** - abstracted modules for AWS/Azure/NIC
5. **Atomic production deploys** - Helm `--atomic` flag for automatic rollback

## API Conventions

- All endpoints prefixed with `/api/`
- Authentication via `Authorization: Bearer <JWT>`
- Pagination: `?page=0&size=20`
- Geo queries: `?lat=22.5726&lng=88.3639&radius=3000`
- Response format: `{ "status": "SUCCESS", "data": {...}, "message": "..." }`

## Monitoring & Alerts

- **Prometheus**: Metrics collection (15s intervals)
- **Grafana**: Dashboards at `http://grafana:3000`
- **Loki**: Centralized logs
- **AlertManager**: Slack + PagerDuty alerts

Critical alerts:
- SOS service down → Immediate PagerDuty
- No officers on duty → Warning
- High error rate (>5%) → Warning
- DB connection pool >90% → Warning
