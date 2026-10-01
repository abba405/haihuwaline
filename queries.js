const db = require('./db');

function createReport({ reporterPhone, emergencyType, ward, sourceChannel }) {
  const info = db.prepare(`
    INSERT INTO report (reporter_phone, emergency_type, location_ward, source_channel)
    VALUES (?, ?, ?, ?)
  `).run(reporterPhone, emergencyType, ward, sourceChannel);
  return info.lastInsertRowid;
}

function getFacilityByWard(ward) {
  return db.prepare('SELECT * FROM facility WHERE ward = ? AND active = 1').get(ward);
}

function getReportById(id) {
  return db.prepare('SELECT * FROM report WHERE id = ?').get(id);
}

function getAllReports() {
  return db.prepare('SELECT * FROM report ORDER BY created_at DESC').all();
}

function acknowledgeReport(id, acknowledgedBy) {
  db.prepare(`
    UPDATE report
    SET status = 'acknowledged', acknowledged_at = datetime('now'), acknowledged_by = ?
    WHERE id = ?
  `).run(acknowledgedBy, id);
}

function resolveReport(id) {
  db.prepare(`
    UPDATE report SET status = 'resolved', resolved_at = datetime('now') WHERE id = ?
  `).run(id);
}

module.exports = { createReport, getFacilityByWard, getReportById, getAllReports, acknowledgeReport, resolveReport };
