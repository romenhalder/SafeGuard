# ============================================
# SAFEGUARD PROJECT - Makefile
# Common commands for development & deployment
# (Docker removed - local dev uses start-local.ps1)
# ============================================

.PHONY: help build clean test seed vault-init \
        deploy-dev deploy-staging deploy-prod \
        port-forward lint

# Colors for output
BLUE=\033[0;34m
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)SafeGuard - Available Commands:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)  %-25s$(NC) %s\n", $$1, $$2}'

# ── BUILD ──────────────────────────────────────

build: ## Build all Java services
	@echo "$(BLUE)Building all services...$(NC)"
	mvn clean package -DskipTests -T 1C

build-service: ## Build a specific service (SERVICE=auth-service)
	@echo "$(BLUE)Building $(SERVICE)...$(NC)"
	mvn clean package -DskipTests -pl services/$(SERVICE) -am

clean: ## Clean all build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	mvn clean
	@echo "$(GREEN)Clean complete.$(NC)"

# ── TESTING ────────────────────────────────────

test: ## Run all unit tests
	@echo "$(BLUE)Running unit tests...$(NC)"
	mvn test

test-service: ## Run tests for specific service (SERVICE=auth-service)
	@echo "$(BLUE)Running tests for $(SERVICE)...$(NC)"
	mvn test -pl services/$(SERVICE) -am

# ── LOCAL DEVELOPMENT ─────────────────────────
# Local dev on Windows: run .\start-local.ps1
# (starts all 11 services on Java 21 without Docker)

# ── VAULT ──────────────────────────────────────

vault-init: ## Initialize Vault with dev secrets
	@echo "$(BLUE)Initializing Vault...$(NC)"
	./deploy/vault/init/setup-vault.sh

vault-seed: ## Seed Vault with application secrets
	@echo "$(BLUE)Seeding Vault secrets...$(NC)"
	./deploy/vault/init/seed-secrets.sh

vault-ui: ## Open Vault UI (dev mode)
	@echo "$(GREEN)Vault UI: http://localhost:8200 (dev-root-token)$(NC)"

# ── KUBERNETES ─────────────────────────────────

k8s-status: ## Show K8s cluster status
	@echo "$(BLUE)K8s Cluster Status:$(NC)"
	kubectl get nodes
	@echo ""
	kubectl get pods -A

deploy-dev: ## Deploy to Minikube dev environment
	@echo "$(BLUE)Deploying to dev (Minikube)...$(NC)"
	./scripts/deploy.sh dev

deploy-staging: ## Deploy to staging EKS
	@echo "$(BLUE)Deploying to staging...$(NC)"
	./scripts/deploy.sh staging

deploy-prod: ## Deploy to production EKS (requires approval)
	@echo "$(RED)Deploying to PRODUCTION...$(NC)"
	@read -p "Are you sure? (yes/no): " confirm && [ "$$confirm" = "yes" ] || exit 1
	./scripts/deploy.sh production

helm-install: ## Install all Helm charts (ENV=dev)
	@echo "$(BLUE)Installing Helm charts for $(ENV)...$(NC)"
	@for chart in api-gateway auth-service user-service alert-service location-service incident-service admin-service notification-service analytics-service; do \
		helm upgrade --install $$chart deploy/helm/$$chart \
			-f deploy/helm/$$chart/values-$(ENV).yaml \
			-n safeguard-$(ENV) --create-namespace; \
	done

helm-delete: ## Delete all Helm releases (ENV=dev)
	@echo "$(RED)Deleting Helm releases for $(ENV)...$(NC)"
	@for chart in api-gateway auth-service user-service alert-service location-service incident-service admin-service notification-service analytics-service; do \
		helm uninstall $$chart -n safeguard-$(ENV) 2>/dev/null || true; \
	done

# ── PORT FORWARDING ────────────────────────────

port-forward: ## Port-forward all services from K8s
	@echo "$(GREEN)Port-forwarding services...$(NC)"
	./scripts/port-forward.sh

# ── DATABASE ───────────────────────────────────

db-migrate: ## Run database migrations (Flyway via Maven)
	@echo "$(BLUE)Running database migrations...$(NC)"
	./scripts/db-migrate.sh

db-seed: ## Seed dev database with test data
	@echo "$(BLUE)Seeding database...$(NC)"
	./scripts/seed-data.sh

# ── SECURITY ───────────────────────────────────

gitleaks: ## Run gitleaks to detect secrets in repo
	@echo "$(BLUE)Running gitleaks...$(NC)"
	gitleaks detect --source . --verbose

# ── TERRAFORM ──────────────────────────────────

tf-init: ## Initialize Terraform (ENV=dev)
	@echo "$(BLUE)Initializing Terraform for $(ENV)...$(NC)"
	cd deploy/terraform/environments/$(ENV) && terraform init

tf-plan: ## Plan Terraform changes (ENV=dev)
	@echo "$(BLUE)Planning Terraform changes for $(ENV)...$(NC)"
	cd deploy/terraform/environments/$(ENV) && terraform plan

tf-apply: ## Apply Terraform changes (ENV=dev)
	@echo "$(RED)Applying Terraform for $(ENV)...$(NC)"
	cd deploy/terraform/environments/$(ENV) && terraform apply

tf-destroy: ## Destroy Terraform resources (ENV=dev)
	@echo "$(RED)DESTROYING Terraform resources for $(ENV)...$(NC)"
	@read -p "Are you SURE? (yes/no): " confirm && [ "$$confirm" = "yes" ] || exit 1
	cd deploy/terraform/environments/$(ENV) && terraform destroy

# ── LINT & FORMAT ──────────────────────────────

lint: ## Run linting on all Java services
	@echo "$(BLUE)Running checkstyle...$(NC)"
	mvn checkstyle:check -T 1C

format: ## Format code
	@echo "$(BLUE)Formatting code...$(NC)"
	mvn spotless:apply

# ── DEVELOPER ONBOARDING ──────────────────────

setup: ## First-time developer setup
	@echo "$(GREEN)Setting up SafeGuard development environment...$(NC)"
	@echo "$(BLUE)Step 1: Checking prerequisites...$(NC)"
	@command -v java >/dev/null 2>&1 || { echo "$(RED)Java 21 required. Install from https://adoptium.net$(NC)"; exit 1; }
	@command -v mvn >/dev/null 2>&1 || { echo "$(RED)Maven 3.9+ required. Install from https://maven.apache.org$(NC)"; exit 1; }
	@command -v kubectl >/dev/null 2>&1 || { echo "$(YELLOW)kubectl not found. Install for K8s deployment.$(NC)"; }
	@command -v helm >/dev/null 2>&1 || { echo "$(YELLOW)Helm not found. Install for K8s deployment.$(NC)"; }
	@echo "$(BLUE)Step 2: Creating .env file...$(NC)"
	@if [ ! -f .env ]; then cp .env.example .env && echo "$(YELLOW)Created .env from template. Edit with your values!$(NC)"; else echo "$(GREEN).env already exists.$(NC)"; fi
	@echo "$(BLUE)Step 3: Building project...$(NC)"
	mvn clean package -DskipTests -T 1C
	@echo ""
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(GREEN)  SafeGuard Dev Environment Ready!$(NC)"
	@echo "$(GREEN)========================================$(NC)"
	@echo ""
	@echo "$(BLUE)  Next steps (Windows, no Docker):$(NC)"
	@echo "  1. Edit .env with your cloud DB values"
	@echo "  2. .\start-local.ps1   (start all 11 services)"
	@echo "  3. .\stop-local.ps1    (stop services)"
	@echo ""
