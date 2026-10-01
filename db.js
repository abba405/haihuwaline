const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'data.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS facility (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT NOT NULL,
    phone    TEXT NOT NULL,
    ward     TEXT NOT NULL,
    active   INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS report (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_phone   TEXT NOT NULL,
    emergency_type   TEXT NOT NULL CHECK (emergency_type IN ('bleeding','prolonged_labor','seizure','other')),
    location_ward    TEXT NOT NULL,
    source_channel   TEXT NOT NULL CHECK (source_channel IN ('ussd','sms','web','voice')),
    status           TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','acknowledged','resolved')),
    created_at       TEXT NOT NULL DEFAULT (datetime('now')),
    acknowledged_at  TEXT,
    acknowledged_by  TEXT,
    resolved_at      TEXT
  );
`);

// Seed a few facilities the first time this runs, so routing has something
// to match against right away. Safe to run repeatedly — only inserts once.
const { c: facilityCount } = db.prepare('SELECT COUNT(*) AS c FROM facility').get();
if (facilityCount === 0) {
  const insert = db.prepare('INSERT INTO facility (name, phone, ward) VALUES (?, ?, ?)');
  insert.run('Gwale Primary Health Centre', '+2348031234567', 'Gwale');
  insert.run('Nassarawa General Hospital', '+2348061234568', 'Nassarawa');
  insert.run('Dala Community Clinic', '+2348101234569', 'Dala');
  insert.run('General Emergency Coordination Line', '+2348121234570', 'Other');
  console.log('Seeded 3 facilities into data.db');
}

module.exports = db;