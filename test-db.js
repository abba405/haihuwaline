// Quick sanity check — run this once with `node test-db.js` to confirm
// the schema, seed data, and queries all work before wiring this into the
// USSD flow in step 3.
const { createReport, getFacilityByWard, getAllReports } = require('./queries');

const id = createReport({
  reporterPhone: '+2349078417811',
  emergencyType: 'bleeding',
  ward: 'Gwale',
  sourceChannel: 'ussd',
});

console.log('Created report id:', id);
console.log('Matching facility for Gwale:', getFacilityByWard('Gwale'));
console.log('All reports so far:', getAllReports());
