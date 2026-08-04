CREATE TABLE IF NOT EXISTS officer_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_officer_locations_officer ON officer_locations(officer_id);
CREATE INDEX idx_officer_locations_time ON officer_locations(recorded_at DESC);
CREATE INDEX idx_officer_locations_geom ON officer_locations USING GIST(location);
