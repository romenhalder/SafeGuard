-- ============================================
-- SAFEGUARD - Base Schema (owned by auth-service)
-- Single-Flyway-owner model: this migration creates the shared
-- base tables for the whole platform. Other PostGIS services
-- run with flyway.enabled=false and ddl-auto=none.
-- ============================================

-- ── PostGIS ──
CREATE EXTENSION IF NOT EXISTS postgis;

-- ── Citizens ──
CREATE TABLE IF NOT EXISTS citizens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100),
    address TEXT,
    aadhaar_hash VARCHAR(64),
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ── Officers ──
CREATE TABLE IF NOT EXISTS officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    rank VARCHAR(50),
    phone VARCHAR(15) NOT NULL,
    badge_number VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    duty_status VARCHAR(20) DEFAULT 'OFF_DUTY',
    assigned_zone_id UUID,
    current_location GEOMETRY(Point, 4326),
    last_location_update TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ── Admin Users ──
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    accessible_zone_id UUID,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ── Patrol Zones ──
CREATE TABLE IF NOT EXISTS patrol_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name VARCHAR(100) NOT NULL,
    zone_boundary GEOMETRY(Polygon, 4326),
    oc_officer_id UUID,
    area_name VARCHAR(100),
    thana_name VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ── SOS Incidents ──
CREATE TABLE IF NOT EXISTS sos_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID NOT NULL,
    incident_type VARCHAR(50),
    description TEXT,
    location GEOMETRY(Point, 4326) NOT NULL,
    address_text TEXT,
    status VARCHAR(30) DEFAULT 'PENDING',
    priority VARCHAR(20) DEFAULT 'NORMAL',
    assigned_officer_id UUID,
    alert_sent_at TIMESTAMP DEFAULT NOW(),
    officer_accepted_at TIMESTAMP,
    officer_arrived_at TIMESTAMP,
    resolved_at TIMESTAMP,
    citizen_rating INTEGER CHECK (citizen_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ── Officer Locations ──
CREATE TABLE IF NOT EXISTS officer_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_citizens_phone ON citizens(phone);
CREATE INDEX IF NOT EXISTS idx_officers_department_id ON officers(department_id);
CREATE INDEX IF NOT EXISTS idx_officers_duty ON officers(duty_status);
CREATE INDEX IF NOT EXISTS idx_officers_location ON officers USING GIST(current_location);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_zones_boundary ON patrol_zones USING GIST(zone_boundary);
CREATE INDEX IF NOT EXISTS idx_sos_status ON sos_incidents(status);
CREATE INDEX IF NOT EXISTS idx_sos_citizen ON sos_incidents(citizen_id);
CREATE INDEX IF NOT EXISTS idx_sos_location ON sos_incidents USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_sos_created ON sos_incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sos_officer ON sos_incidents(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_officer_locations_officer ON officer_locations(officer_id);
