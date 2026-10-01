const AfricasTalking = require('africastalking')({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const voiceService = AfricasTalking.VOICE;

async function makeVoiceCall(to) {
  try {
    const result = await voiceService.call({
      callFrom: process.env.AT_VOICE_NUMBER,
      callTo: [to],
    });
    console.log('Voice call result:', JSON.stringify(result));
    return result;
  } catch (err) {
    console.error('Voice call failed:', err.message);
  }
}

module.exports = { makeVoiceCall };
