#!/bin/bash
# ============================================
# SAFEGUARD - Seed Data Script
# Populates dev database with test data
# ============================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=========================================="
echo "  SafeGuard - Seeding Development Data"
echo "=========================================="

DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-safeguard_dev}"
DB_USER="${POSTGRES_USER:-safeguard}"
DB_PASSWORD="${POSTGRES_PASSWORD:-localdev123}"

export PGPASSWORD="$DB_PASSWORD"

echo ""
echo "[1/4] Creating test patrol zones..."

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<SQL
-- Test patrol zones (Kolkata areas)
INSERT INTO patrol_zones (id, zone_name, zone_boundary, area_name, thana_name, district, state)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Park Street Zone',
   ST_GeomFromText('POLYGON((88.35 22.54, 88.36 22.54, 88.36 22.55, 88.35 22.55, 88.35 22.54))', 4326),
   'Park Street', 'Park Street', 'Kolkata', 'West Bengal'),
  ('a1000000-0000-0000-0000-000000000002', 'Salt Lake Zone',
   ST_GeomFromText('POLYGON((88.42 22.57, 88.44 22.57, 88.44 22.59, 88.42 22.59, 88.42 22.57))', 4326),
   'Salt Lake', 'Bidhannagar', 'Kolkata', 'West Bengal'),
  ('a1000000-0000-0000-0000-000000000003', 'Howrah Zone',
   ST_GeomFromText('POLYGON((88.26 22.56, 88.28 22.56, 88.28 22.58, 88.26 22.58, 88.26 22.56))', 4326),
   'Howrah', 'Howrah', 'Howrah', 'West Bengal')
ON CONFLICT (id) DO NOTHING;
SQL

echo "[2/4] Creating test officers..."

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<SQL
INSERT INTO officers (id, department_id, name, rank, phone, badge_number, assigned_zone_id, duty_status, current_location)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'WB-POL-001', 'Inspector Rajesh Kumar', 'Inspector', '+919876543210', 'BADGE-001',
   'a1000000-0000-0000-0000-000000000001', 'ON_DUTY',
   ST_SetSRID(ST_MakePoint(88.3550, 22.5475), 4326)),
  ('b1000000-0000-0000-0000-000000000002', 'WB-POL-002', 'SI Amit Das', 'Sub-Inspector', '+919876543211', 'BADGE-002',
   'a1000000-0000-0000-0000-000000000001', 'ON_DUTY',
   ST_SetSRID(ST_MakePoint(88.3570, 22.5490), 4326)),
  ('b1000000-0000-0000-0000-000000000003', 'WB-POL-003', 'Constable Priya Mondal', 'Constable', '+919876543212', 'BADGE-003',
   'a1000000-0000-0000-0000-000000000002', 'ON_DUTY',
   ST_SetSRID(ST_MakePoint(88.4300, 22.5800), 4326)),
  ('b1000000-0000-0000-0000-000000000004', 'WB-POL-004', 'SI Suresh Roy', 'Sub-Inspector', '+919876543213', 'BADGE-004',
   'a1000000-0000-0000-0000-000000000002', 'OFF_DUTY',
   ST_SetSRID(ST_MakePoint(88.4350, 22.5850), 4326)),
  ('b1000000-0000-0000-0000-000000000005', 'WB-POL-005', 'Constable Arjun Singh', 'Constable', '+919876543214', 'BADGE-005',
   'a1000000-0000-0000-0000-000000000003', 'ON_DUTY',
   ST_SetSRID(ST_MakePoint(88.2700, 22.5700), 4326))
ON CONFLICT (id) DO NOTHING;
SQL

echo "[3/4] Creating test citizens..."

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<SQL
INSERT INTO citizens (id, name, phone, email, address, is_verified)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Test Citizen 1', '+919000000001', 'test1@example.com', '123 Park Street, Kolkata', true),
  ('c1000000-0000-0000-0000-000000000002', 'Test Citizen 2', '+919000000002', 'test2@example.com', '456 Salt Lake, Kolkata', true),
  ('c1000000-0000-0000-0000-000000000003', 'Test Citizen 3', '+919000000003', 'test3@example.com', '789 Howrah', false)
ON CONFLICT (id) DO NOTHING;
SQL

echo "[4/4] Creating test admin users..."

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<SQL
-- Admin user: admin / admin123 (bcrypt hashed)
INSERT INTO admin_users (id, officer_id, username, password_hash, role, accessible_zone_id)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'admin', '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'SUPER_ADMIN', NULL),
  ('d1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001',
   'oc_parkstreet', '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'OC', 'a1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
SQL

echo ""
echo "=========================================="
echo "  Seed data complete!"
echo "  Test officers: 5 (3 on-duty, 1 off-duty, 1 in other zone)"
echo "  Test citizens: 3"
echo "  Test admins: 2 (password: admin123)"
echo "  Patrol zones: 3 (Park Street, Salt Lake, Howrah)"
echo "=========================================="
