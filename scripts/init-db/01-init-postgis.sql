-- ============================================
-- SAFEGUARD - PostgreSQL Initialization
-- Creates PostGIS extension and base schemas
-- ============================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS safeguard;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO safeguard;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO safeguard;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO safeguard;

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'SafeGuard database initialized with PostGIS extension';
END $$;
