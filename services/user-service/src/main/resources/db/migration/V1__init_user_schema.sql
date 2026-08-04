CREATE TABLE IF NOT EXISTS citizens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100),
    address TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    rank VARCHAR(50),
    phone VARCHAR(15) NOT NULL,
    badge_number VARCHAR(30),
    duty_status VARCHAR(20) DEFAULT 'OFF_DUTY',
    assigned_zone_id UUID,
    current_location GEOMETRY(Point, 4326),
    last_location_update TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE INDEX idx_officers_duty ON officers(duty_status);
CREATE INDEX idx_officers_location ON officers USING GIST(current_location);
CREATE INDEX idx_zones_boundary ON patrol_zones USING GIST(zone_boundary);
