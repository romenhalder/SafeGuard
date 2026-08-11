# 🛡️ SafeGuard — Smart Public Safety & Emergency Response Platform

> A multi-microservice emergency response platform connecting citizens, police officers, and command control in real time.
>
> **Backend:** Java 21 · Spring Boot 3.2.x · Spring Cloud · MongoDB · PostgreSQL/PostGIS · Redis (Upstash)
> **Frontend:** React.js (Admin Dashboard) · Android (Citizen & Officer apps)
> **Infra:** Local scripts (`start-local.ps1`) + managed cloud services (Neon, Upstash, Atlas) · GitHub Actions CI/CD

---

## 1. Project Vision

**Mission:** Reduce emergency response time from 10–30 minutes to **3–7 minutes** by digitally connecting every citizen with nearby on-duty officers using GPS, live maps, and smart alerts.

**Target market:** State Police Departments across India (B2G SaaS) — pilot in 1 district, then state-wide rollout.

---

## 2. System Architecture

```
┌────────────────────────── CLIENT LAYER ──────────────────────────┐
│  Citizen App (Android)   Officer App (Android)   Admin Dashboard │
│                                              (React.js :5173)     │
└──────────────┬───────────────────────┬───────────────────────────┘
               │  HTTPS / WSS          │  HTTPS
               ▼                       ▼
        ┌──────────────────────────────────────────────┐
        │  API GATEWAY (Spring Cloud Gateway) :8080    │
        │  Routing · Rate limiting · CORS · JWT        │
        └──────────────────────────────────────────────┘
               │
               ▼
   ┌──────────────────────────────────────────────────┐
   │              MICROSERVICES LAYER                 │
   ├──────────────┬──────────────┬────────────────────┤
   │ Auth :8081   │ User  :8082  │ Alert  :8083 (SOS) │
   │ Location:8084│ Incident:8085│ Admin  :8086       │
   │ Notification:8087│ Analytics:8088               │
   │ Eureka :8761 │ Config :8888 │                    │
   └──────┬───────┴──────┬───────┴────────────────────┘
          │              │
          ▼              ▼
   ┌──────────────────────────────────────────────┐
   │                DATA LAYER                     │
   │  PostgreSQL/PostGIS  (Neon, cloud)           │
   │  MongoDB             (Atlas, incident logs)  │
   │  Redis               (Upstash, streams)      │
   └──────────────────────────────────────────────┘
```

### 2.1 Microservices

| Service | Port | Role |
|---------|------|------|
| service-registry | 8761 | Eureka discovery |
| config-server | 8888 | Spring Cloud Config (native profile) |
| api-gateway | 8080 | Routing, rate limiting, WS proxy |
| auth-service | 8081 | JWT, login (citizen/officer/admin), refresh |
| user-service | 8082 | Citizen & officer CRUD |
| alert-service | 8083 | SOS dispatch engine, proximity |
| location-service | 8084 | GPS tracking, geofencing |
| incident-service | 8085 | Incident logging (Postgres + Mongo) |
| admin-service | 8086 | Dashboard APIs, officers, zones, incidents |
| notification-service | 8087 | Push / WebSocket notifications |
| analytics-service | 8088 | Reports & statistics |

### 2.2 Technology Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 21 (LTS) |
| Framework | Spring Boot 3.2.5, Spring Cloud 2023.0.1 |
| Security | Spring Security + JWT (jjwt 0.12.5) |
| DB | PostgreSQL + PostGIS (Neon), MongoDB Atlas |
| Cache/Streams | Redis (Upstash), Redis Streams |
| Migration | Flyway (auth-service owns base schema) |
| Geospatial | Hibernate Spatial + JTS |
| Frontend | React.js + Vite + TypeScript + Tailwind + Leaflet |
| CI/CD | GitHub Actions (build, scan, deploy) |
| Deploy (future) | Docker + Kubernetes + Helm + Terraform + Vault |

---

## 3. Repository Structure

```
safeguard/
├── services/          # 11 Spring Boot microservices
├── apps/
│   ├── admin-dashboard/   # React admin dashboard (Vite)
│   ├── citizen-app/       # (empty - planned)
│   └── officer-app/       # (empty - planned)
├── libs/safeguard-common/ # Shared library (JWT, Redis, DTOs, exceptions)
├── deploy/             # Terraform, Helm charts, Vault configs
├── docker/             # Dockerfile (Java 21) & Compose
├── monitoring/         # Prometheus, Grafana, Loki
├── scripts/            # DevOps utility scripts
├── .github/workflows/  # CI/CD pipelines
├── start-local.ps1     # Local no-Docker runner (Windows)
├── stop-local.ps1      # Stops SafeGuard services
└── .env                # Local/cloud credentials (gitignored)
```

---

## 4. Local Development (no Docker)

Services run as local Maven builds launched with the real `java.exe` — no containers.

### 4.1 Prerequisites

- **JDK 21** (project is pinned to Java 21). `start-local.ps1` auto-resolves a JDK 21
  from `C:\Program Files\Java`, Adoptium, Zulu, or Microsoft installs.
- **Maven 3.9+**
- **Node 20+** (for the admin dashboard)
- Cloud accounts: **Neon** (Postgres), **Upstash** (Redis), **Atlas** (MongoDB)

### 4.2 First-time setup

```bash
# 1. Copy environment template
Copy-Item .env.example .env

# 2. Fill .env with your managed-service credentials:
#    POSTGRES_JDBC_URL / POSTGRES_USER / POSTGRES_PASSWORD   (Neon)
#    REDIS_URL                                              (Upstash rediss://)
#    MONGO_URI                                             (Atlas mongodb+srv://)
#    JWT_SECRET / JWT_EXPIRATION / JWT_REFRESH_EXPIRATION
#    EUREKA_CLIENT_SERVICEURL_DEFAULTZONE
#    SPRING_CLOUD_CONFIG_URI
#    REDIS_STREAM_SOS_ALERTS / REDIS_STREAM_GPS_UPDATES / REDIS_STREAM_NOTIFICATIONS
```

### 4.3 Start / Stop

```bash
# Build everything then start all 11 services
powershell -ExecutionPolicy Bypass -File .\start-local.ps1

# Start without rebuilding (after code changes you build manually)
powershell -ExecutionPolicy Bypass -File .\start-local.ps1 -SkipBuild

# Stop all services
powershell -ExecutionPolicy Bypass -File .\stop-local.ps1
```

The script:
- Resolves and pins **JDK 21** (fallback to `JAVA_HOME`).
- Loads `.env` into the process environment.
- Kills stale SafeGuard processes (prevents JAR file-lock on `mvn clean`).
- Pre-checks ports 8080–8088, 8761, 8888.
- Starts each service with real Java PIDs, logs to `logs\<service>.log`, tracks PIDs in `pids.json`.
- Polls `/actuator/health` (HTTP 200) with per-service timeouts and prints UP/DOWN.

### 4.4 Seed data (admin + demo officers/zones/incidents)

A seed script inserts demo data into Neon (bcrypt-hashed passwords):

| Entity | Sample | Login |
|--------|--------|-------|
| Admin | `admin` | `admin` / `Admin@123` |
| Officers | `OFF001..OFF005` | `OFF001` / `Officer@123` |
| Zones | 3 Kolkata patrol zones | — |
| Incidents | 3 demo SOS incidents | — |

> The seed script lives out-of-repo (temp tooling); the credentials above match the
> demo data used by the admin dashboard.

---

## 5. Admin Dashboard (React)

Location: `apps/admin-dashboard` (Vite + React + TypeScript + Tailwind + Leaflet).

### 5.1 Pages

| Page | Route | Data source |
|------|-------|-------------|
| Login | `/login` | `POST /api/auth/admin/login` (auth-service :8081) |
| Overview | `/` | `GET /api/admin/dashboard/overview` |
| Live Map | `/map` | `GET /api/admin/map/officers` + `GET /api/admin/zones` |
| Officers | `/officers` | Officers CRUD (`/api/admin/officers`) |
| Zones | `/zones` | `GET/POST /api/admin/zones` |
| Incidents | `/incidents` | `GET /api/admin/incidents?status=&incidentType=` |

### 5.2 Dev proxy

The Vite dev server proxies `/api` to the backend services directly:

```
/api/auth/*  -> http://localhost:8081
/api/admin/* -> http://localhost:8086
```

### 5.3 Run

```bash
cd apps/admin-dashboard
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```

---

## 6. API Conventions

- All endpoints prefixed with `/api/`.
- Auth via `Authorization: Bearer <JWT>`.
- Response envelope:

```json
{ "status": "SUCCESS", "data": { "...": "..." }, "message": "..." }
```

- Errors: `{ "status": "ERROR", "message": "...", "errors": [...] }`

### 6.1 Auth endpoints (auth-service :8081)

```
POST /api/auth/citizen/register
POST /api/auth/citizen/login
POST /api/auth/officer/login
POST /api/auth/admin/login
POST /api/auth/refresh-token
POST /api/auth/logout
```

### 6.2 Admin endpoints (admin-service :8086)

```
GET    /api/admin/dashboard/overview
GET    /api/admin/map/officers
GET    /api/admin/map/officers/on-duty
GET    /api/admin/officers
GET    /api/admin/officers/{id}
POST   /api/admin/officers
PUT    /api/admin/officers/{id}
DELETE /api/admin/officers/{id}
GET    /api/admin/zones
POST   /api/admin/zones
GET    /api/admin/incidents?status=&incidentType=
GET    /api/admin/incidents/{id}
```

---

## 7. Database Design

**Single-Flyway-owner model** — `auth-service` owns the base schema migration
(`V1__init_auth_schema.sql`), which creates shared tables:

- `citizens` — registered citizens (bcrypt password, verified flag)
- `officers` — department ID, rank, duty status, `current_location` (PostGIS Point)
- `admin_users` — dashboard logins (`username` + bcrypt + role)
- `patrol_zones` — `zone_boundary` (PostGIS Polygon)
- `sos_incidents` — full lifecycle + timestamps + rating
- `officer_locations` — GPS history

PostGIS is enabled via `CREATE EXTENSION IF NOT EXISTS postgis;` in the migration.

**MongoDB** (`safeguard_incidents`): `IncidentLog` — event-sourced activity trail
(SOS_TRIGGERED → ALERT_SENT → OFFICER_ACCEPTED → OFFICER_ARRIVED → RESOLVED).

**Redis**: refresh tokens, streams (`sos_alerts`, `gps_updates`, `notifications`).

---

## 8. CI/CD Pipelines

### 8.1 `ci-build.yml` — CI Build & Test
- Trigger: PR to `develop/staging/main`; push to `develop` (paths: services/libs/pom.xml).
- Detect changed services → matrix build+test per service (Java 21, Temurin).
- OWASP Dependency Check (CVSS ≥ 7 fails; NVD API key optional).
- Docker build + push to ECR (develop only).

### 8.2 `security-scan.yml` — Security Scan & Audit
- **secret-scan** — Gitleaks + TruffleHog.
- **dependency-scan** — OWASP Dependency Check with `.github/dependency-check-suppressions.xml`,
  NVD API key + delay to avoid rate limits.
- **image-scan** — Trivy on built images (CRITICAL/HIGH).
- **code-analysis** — **GitHub CodeQL** (Java, Java 21) — replaces SonarQube, no external secrets needed.

### 8.3 CD workflows
- `cd-deploy-dev.yml` / `cd-deploy-staging.yml` / `cd-deploy-production.yml` —
  Helm + EKS deploys to dev/staging/production. Production requires approval.

---

## 9. Current Status (2026-08-10)

### ✅ Completed
- All **11 microservices** running locally on **Java 21** (no Docker).
- Managed cloud infra wired: **Neon** Postgres/PostGIS, **Upstash** Redis, **Atlas** MongoDB.
- `start-local.ps1` / `stop-local.ps1` — reliable local runner (JDK-21 pin, PID tracking, logs).
- Java 21 migration (`pom.xml`, CI workflows, Dockerfile).
- PostGIS base schema via Flyway (auth-service).
- Admin-service: JTS geometry (Officer lat/lng, Zone GeoJSON), `GET /api/admin/incidents`,
  Spring Security JWT on `/api/admin/**`.
- Seed data: admin + 5 officers + 3 zones + 3 incidents.
- Admin login works (`POST /api/auth/admin/login` → JWT).
- GitHub Actions: **CodeQL** code analysis, OWASP dependency scan with suppressions.

### 🚧 In Progress
- **Admin Dashboard** (`apps/admin-dashboard`) — scaffolding pages against live backend.
- E2E SOS smoke test (register → SOS → dispatch → accept → arrive → resolve → analytics).

### ⏳ Planned
- Citizen & officer Android apps.
- WebSocket live-tracking verification (Redis Streams).
- Prometheus/Grafana/Loki monitoring stack.
- Kubernetes/Helm deployment (Java 21 images).

---

## 10. Monitoring & Alerts

- **Prometheus**: metrics every 15s (`/actuator/prometheus`).
- **Grafana**: dashboards (`http://grafana:3000`).
- **Loki**: centralized logs.
- Critical alerts: SOS service down → PagerDuty; no officers on duty → warning;
  error rate > 5% → warning; DB pool > 90% → warning.

---

## 11. Security & Compliance

- JWT access tokens + refresh tokens; RBAC (`CITIZEN`, `OFFICER`, `OC`, `SP`, `SUPER_ADMIN`).
- Passwords bcrypt-hashed; secrets in gitignored `.env` (never committed).
- **All secrets in Vault** for deployed environments (`safeguard/secret/{env}/...`).
- OWASP dependency check + CodeQL + Gitleaks in CI.
- Designed for **IT Act 2000 / DPDP Act 2023 / CERT-In** compliance.

---

## 12. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `JAR not found: services/...` | Run `start-local.ps1` **without** `-SkipBuild` |
| Port already in use | Stop the holder process or run `stop-local.ps1` |
| Service timed out but log shows boot | Check `/actuator/health` manually; timeouts are health-poll failures, not boot failures |
| `mvn` jar-lock error | Stop services first, then rebuild |
| Admin login 401 | Confirm `admin` row exists (bcrypt `Admin@123`) and auth-service is UP on :8081 |
| Dashboard 401 on `/api/admin` | Log in first; attach `Authorization: Bearer <JWT>` |
