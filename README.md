# 🛡️ SafeGuard

**Smart Public Safety & Emergency Response Platform**

SafeGuard is a government-grade, real-time public safety ecosystem that digitally connects citizens with nearby on-duty police officers using GPS, live maps, and smart alerts. Our mission is to drastically reduce emergency response times and prevent crime before it escalates.

---

## 🚀 Features

The SafeGuard ecosystem is a multi-sided platform comprising four key modules:

1. **Citizen App (Mobile)**
   - One-tap SOS button with instant GPS coordinate capture.
   - Live view of nearby on-duty officers.
   - Real-time ETA tracking of the responding officer.
   - Offline SMS fallback for SOS alerts in low-connectivity areas.

2. **Police Officer App (Mobile)**
   - Secure login via Department credentials.
   - Live SOS alert popups with vibration and sound.
   - Auto-navigation to the incident scene.
   - Duty status toggle and background GPS sharing.

3. **Admin Web Dashboard (React.js)**
   - Real-time live map showing all officers and active incidents.
   - Patrol zone management (GeoJSON polygons).
   - Officer deployment and duty scheduling.
   - Analytics, incident tracking, and role-based access control (OC, SP, Super Admin).

4. **Smart Dispatch Engine (Backend)**
   - WebSocket-based real-time alert engine.
   - Proximity algorithms using PostGIS and Haversine formula to find nearest officers.
   - Auto-escalation if no officer responds within a threshold.

---

## 🏗️ Architecture & Tech Stack

SafeGuard is built using a modern microservices architecture designed for high availability and low latency.

* **Backend:** Java 21 + Spring Boot 3.x, Spring Cloud (Gateway, Config, Eureka)
* **Real-time:** Spring WebSocket + STOMP, Redis Pub/Sub
* **Frontend:** React.js (Admin Dashboard), Flutter / Native (Mobile Apps)
* **Databases:** PostgreSQL (Primary), PostGIS (Geospatial), MongoDB (Incident Logs), Redis (Cache & Real-time state)
* **Messaging:** Apache Kafka (Async alerts & GPS streaming)
* **Infrastructure:** Kubernetes (EKS/Minikube), Terraform, HashiCorp Vault

---

## 📂 Repository Structure

```text
safeguard/
├── services/          # 11 Spring Boot microservices
├── apps/              # Android apps + React.js admin dashboard
├── libs/              # Shared Java libraries
├── deploy/            # Infrastructure as Code (Terraform), Helm charts, Vault configs
├── monitoring/        # Prometheus, Grafana, Loki configurations
├── scripts/           # DevOps and utility scripts
└── .github/           # CI/CD workflows
```

---

## ⚙️ Microservices

| Service | Port | Description |
|---------|------|-------------|
| `api-gateway` | 8080 | Spring Cloud Gateway, routing, rate limiting |
| `auth-service` | 8081 | JWT, OTP, citizen/officer/admin login |
| `user-service` | 8082 | Citizen & Officer CRUD |
| `alert-service` | 8083 | SOS dispatch engine, proximity algorithm |
| `location-service` | 8084 | GPS tracking, geofencing |
| `incident-service` | 8085 | Incident logging, reports |
| `admin-service` | 8086 | Dashboard APIs, zone management |
| `notification-service`| 8087 | Push/SMS/WebSocket notifications |
| `analytics-service` | 8088 | Reports, statistics |
| `service-registry` | 8761 | Eureka service discovery |
| `config-server` | 8888 | Spring Cloud Config |

---

## 🛠️ Local Development & Setup

### Prerequisites
* Java 21 & Maven
* Node.js (for frontend)
* Make

### Quick Start (Windows, no Docker)

The local stack runs directly on Java 21 against cloud-managed databases
(PostgreSQL/Neon, Redis/Upstash, MongoDB/Atlas) configured in `.env`.

1. **Environment Setup**
   Copy `.env.example` to `.env` and fill in your local development values.
   ```bash
   cp .env.example .env
   ```

2. **Build Services**
   ```bash
   make build                 # Build all services
   make build-service SERVICE=auth-service  # Build a specific service
   ```

3. **Start All Services**
   ```bash
   .\start-local.ps1          # Starts all 11 Spring Boot services
   .\stop-local.ps1           # Stops them
   ```

4. **Initialize HashiCorp Vault (Secrets)** *(optional)*
   ```bash
   make vault-init
   make vault-seed
   ```

*(For testing, use `mvn test` for unit tests.)*

---

## 🔐 Secrets Management

**NEVER commit secrets to git.** All application secrets are managed dynamically via HashiCorp Vault.
* DB Credentials rotate every 24h (`database/creds/{service}-role`).
* Static secrets (JWT, API keys) are located under `safeguard/secret/{env}/*`.

---

## 🚢 Deployment

Deployment is handled via Helm and Terraform. We support environments from local Minikube to multi-AZ production clusters.

* **Dev:** `make deploy-dev` (Deploys to local Minikube)
* **Staging:** `make deploy-staging` (Deploys to EKS staging)
* **Production:** `make deploy-prod` (Requires manual approval)

---

## 📈 Monitoring & Alerts

* **Prometheus:** Metrics collection.
* **Grafana:** Dashboards available at `http://grafana:3000`.
* **Loki:** Centralized logging.
* **AlertManager:** Integrated with Slack and PagerDuty for critical system alerts (e.g., SOS service down).
