require('dotenv').config();
const path = require('path');
const express = require('express');
const { createReport, getFacilityByWard, getReportById, getAllReports, acknowledgeReport, resolveReport } = require('./queries');
const { sendSMS } = require('./sms');
const { makeVoiceCall } = require('./voice');
const { sendAirtimeReward } = require('./airtime');
const { MESSAGES, LANGUAGE_PROMPT, LANG_MAP } = require('./translations');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // for the dashboard's acknowledge requests
app.use(express.static(path.join(__dirname, 'public'))); // serves the landing page + dashboard once built

// Menu option -> stored value mappings. Keeping these separate from the
// menu text means we can reword the menu later without touching the logic.
const EMERGENCY_TYPES = { '1': 'bleeding', '2': 'prolonged_labor', '3': 'other' };
const WARDS = { '1': 'Gwale', '2': 'Nassarawa', '3': 'Dala', '4': 'Other' };

// A CHW who acknowledges a report within this window earns an airtime reward.
const FAST_RESPONSE_THRESHOLD_MINUTES = 10;
const AIRTIME_REWARD_AMOUNT = '50'; // NGN

// USSD callback — Africa's Talking POSTs here on every menu step.
// text accumulates the user's choices separated by '*', e.g. "1*2*3"
// parts[0] is always the language choice (1=English, 2=Hausa); every menu
// level after that shifts by one compared to the earlier English-only version.
app.post('/ussd', async (req, res) => {
  const { text, phoneNumber } = req.body;
  const parts = text.split('*').filter(Boolean);
  let response = '';

  if (parts.length === 0) {
    response = LANGUAGE_PROMPT;
  } else {
    const lang = LANG_MAP[parts[0]];
    if (!lang) {
      response = MESSAGES.en.invalidOption;
    } else {
      const t = MESSAGES[lang];

      if (parts.length === 1) {
        response = t.mainMenu;
      } else if (parts.length === 2 && parts[1] === '1') {
        response = t.emergencyTypeMenu;
      } else if (parts.length === 2 && parts[1] === '2') {
        response = t.wardMenu;
      } else if (parts.length === 3 && parts[1] === '2') {
        const ward = WARDS[parts[2]];
        const facility = ward ? getFacilityByWard(ward) : null;
        response = facility ? t.facilityInfo(facility) : t.noFacilityInfo;
      } else if (parts.length === 3 && parts[1] === '1') {
        const type = EMERGENCY_TYPES[parts[2]];
        response = type ? t.wardMenu : t.invalidOption;
      } else if (parts.length === 4 && parts[1] === '1') {
        const type = EMERGENCY_TYPES[parts[2]];
        const ward = WARDS[parts[3]];
        response = (type && ward) ? t.landmarkPrompt : t.invalidOption;
      } else if (parts.length === 5 && parts[1] === '1') {
        const type = EMERGENCY_TYPES[parts[2]];
        const ward = WARDS[parts[3]];
        const landmarkInput = parts[4];
        const landmark = landmarkInput === '0' ? null : landmarkInput;

        if (!type || !ward) {
          response = t.invalidOption;
        } else {
          createReport({ reporterPhone: phoneNumber, emergencyType: type, ward, landmark, sourceChannel: 'ussd' });
          const facility = getFacilityByWard(ward);

          if (facility) {
            const landmarkNote = landmark ? ` Landmark: ${landmark}.` : '';
            const alertMessage = `EMERGENCY (${type.replace('_', ' ')}) reported in ${ward}.${landmarkNote} Reporter: ${phoneNumber}. Please respond.`;
            sendSMS(facility.phone, alertMessage); // fire-and-forget — don't block the USSD response on SMS delivery
          }

          // Await just the reporter's confirmation SMS so we know whether to fall back to a voice call.
          const confirmResult = await sendSMS(phoneNumber, t.smsConfirmation);
          if (!confirmResult) {
            makeVoiceCall(phoneNumber); // fire-and-forget — the USSD response shouldn't wait on a phone call connecting
          }

          response = t.reportConfirmation(facility);
        }
      } else {
        response = t.invalidOption;
      }
    }
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
});

app.get('/', (req, res) => res.send('Pregnancy Emergency backend is running.'));

// Returns all reports as JSON, newest first — the dashboard fetches this
// to render its live feed and stat counts.
app.get('/reports', (req, res) => {
  res.json(getAllReports());
});

// Voice callback — Africa's Talking hits this once the outbound call connects,
// asking what to say. Response must be AT's Voice XML format.
app.post('/voice', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="woman">Your emergency report has been received. Help has been alerted. Please stay calm, assistance is on the way.</Say>
</Response>`);
});

// CHW acknowledges a report — called from the dashboard's "Acknowledge" button.
// Rewards the CHW with airtime if they responded within the fast-response window.
app.post('/reports/:id/acknowledge', async (req, res) => {
  const { id } = req.params;
  const { acknowledgedBy } = req.body; // CHW's phone number

  const report = getReportById(id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  if (report.status !== 'new') {
    return res.status(400).json({ error: `Report is already ${report.status}` });
  }

  acknowledgeReport(id, acknowledgedBy);

  // created_at is stored as UTC via SQLite's datetime('now'); append 'Z' so
  // JS parses it as UTC instead of assuming local time.
  const createdAt = new Date(report.created_at.replace(' ', 'T') + 'Z');
  const minutesElapsed = (Date.now() - createdAt.getTime()) / 60000;

  let rewarded = false;
  if (acknowledgedBy && minutesElapsed <= FAST_RESPONSE_THRESHOLD_MINUTES) {
    await sendAirtimeReward(acknowledgedBy, AIRTIME_REWARD_AMOUNT);
    rewarded = true;
  }

  res.json({ status: 'acknowledged', minutesElapsed: Number(minutesElapsed.toFixed(1)), rewarded });
});

// CHW marks an acknowledged report as fully resolved.
app.post('/reports/:id/resolve', (req, res) => {
  const { id } = req.params;
  const report = getReportById(id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  if (report.status !== 'acknowledged') {
    return res.status(400).json({ error: `Report must be acknowledged first (currently ${report.status})` });
  }
  resolveReport(id);
  res.json({ status: 'resolved' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
