// ============================================
// SAFEGUARD - MongoDB Initialization
// Creates initial collections and indexes
// ============================================

db = db.getSiblingDB('safeguard_incidents');

// Create incident_logs collection
db.createCollection('incident_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['incident_id', 'events'],
      properties: {
        incident_id: {
          bsonType: 'string',
          description: 'UUID of the incident from PostgreSQL'
        },
        events: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['event', 'timestamp'],
            properties: {
              event: { bsonType: 'string' },
              timestamp: { bsonType: 'date' },
              data: { bsonType: 'object' }
            }
          }
        }
      }
    }
  }
});

// Create indexes for incident_logs
db.incident_logs.createIndex({ incident_id: 1 }, { unique: true });
db.incident_logs.createIndex({ 'events.timestamp': 1 });
db.incident_logs.createIndex({ 'events.event': 1 });

// Create activity_logs collection
db.createCollection('activity_logs');
db.activity_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL
db.activity_logs.createIndex({ user_id: 1 });
db.activity_logs.createIndex({ action: 1 });

// Create gps_tracks collection (historical GPS data)
db.createCollection('gps_tracks');
db.gps_tracks.createIndex({ officer_id: 1, timestamp: -1 });
db.gps_tracks.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

print('SafeGuard MongoDB collections and indexes created successfully');
