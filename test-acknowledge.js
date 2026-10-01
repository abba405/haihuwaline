// Run `node index.js` (or npm run dev) in one terminal, then run this in another
// to simulate a CHW acknowledging the most recent report.
const { getAllReports } = require('./queries');

async function main() {
  const reports = getAllReports();
  if (reports.length === 0) {
    console.log('No reports yet — submit one via the USSD simulator first.');
    return;
  }

  const latest = reports[0];
  console.log('Acknowledging report:', latest.id, '| status:', latest.status);

  const res = await fetch(`http://localhost:${process.env.PORT || 3000}/reports/${latest.id}/acknowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ acknowledgedBy: '+2347065743551' }), // use one of your registered sandbox numbers
  });

  const data = await res.json();
  console.log('Response:', data);
}

main();
