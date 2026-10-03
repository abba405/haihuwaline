// NOTE: Hausa strings here are a first-pass draft. Please read through and
// correct any phrasing before the demo — accuracy matters more than speed here.
const MESSAGES = {
  en: {
    mainMenu: `CON Welcome to HaihuwaLine
1. Report emergency
2. Nearest facility info`,
    emergencyTypeMenu: `CON Select emergency type
1. Bleeding
2. Prolonged labor
3. Other danger sign`,
    wardMenu: `CON Select your ward
1. Gwale
2. Nassarawa
3. Dala
4. Other / not listed`,
    landmarkPrompt: `CON Enter a nearby landmark (e.g. "near the market"), or send 0 to skip:`,
    facilityInfo: (facility) => `END Nearest facility: ${facility.name}\nPhone: ${facility.phone}`,
    noFacilityInfo: `END No facility info available for that ward right now.`,
    reportConfirmation: (facility) => facility
      ? `END Thank you. Your report has been received.\nAlert sent to ${facility.name}.`
      : `END Thank you. Your report has been received.`,
    invalidOption: `END Invalid option. Please try again.`,
    smsConfirmation: 'Your emergency report has been received. Help has been alerted.',
  },
  ha: {
    mainMenu: `CON Barka da zuwa HaihuwaLine
1. Kai rahoton gaggawa
2. Bayanin asibiti mafi kusa`,
    emergencyTypeMenu: `CON Zaɓi irin gaggawar
1. Zub da jini
2. Wahalar haihuwa
3. Wata alamar hatsari`,
    wardMenu: `CON Zaɓi unguwarka
1. Gwale
2. Nassarawa
3. Dala
4. Waninsu / ba a jera ba`,
    landmarkPrompt: `CON Shigar da wata alama ta kusa (misali "kusa da kasuwa"), ko aika 0 don tsallakewa:`,
    facilityInfo: (facility) => `END Asibiti mafi kusa: ${facility.name}\nLambar waya: ${facility.phone}`,
    noFacilityInfo: `END Babu bayanin asibiti a unguwar nan a yanzu.`,
    reportConfirmation: (facility) => facility
      ? `END Na gode. An karɓi rahotonka.\nAn aika sanarwa zuwa ${facility.name}.`
      : `END Na gode. An karɓi rahotonka.`,
    invalidOption: `END Zaɓi ba daidai ba ne. Ka sake gwadawa.`,
    smsConfirmation: 'An karɓi rahoton gaggawar ku. An sanar da taimako zuwa gare ku.',
  },
};

// The very first screen, before any language is chosen — shown in both
// languages at once so either speaker knows what to press.
const LANGUAGE_PROMPT = `CON Welcome to HaihuwaLine / Barka da zuwa HaihuwaLine
1. English
2. Hausa`;

const LANG_MAP = { '1': 'en', '2': 'ha' };

module.exports = { MESSAGES, LANGUAGE_PROMPT, LANG_MAP };
