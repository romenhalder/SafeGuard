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

CREATE INDEX idx_sos_status ON sos_incidents(status);
CREATE INDEX idx_sos_citizen ON sos_incidents(citizen_id);
CREATE INDEX idx_sos_location ON sos_incidents USING GIST(location);
CREATE INDEX idx_sos_created ON sos_incidents(created_at DESC);
CREATE INDEX idx_sos_officer ON sos_incidents(assigned_officer_id);
