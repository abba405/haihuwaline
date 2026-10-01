const AfricasTalking = require('africastalking')({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const smsService = AfricasTalking.SMS;

async function sendSMS(to, message) {
  try {
    const result = await smsService.send({ to, message });
    console.log('SMS send result:', JSON.stringify(result));
    return result;
  } catch (err) {
    console.error('SMS send failed:', err.message);
    // Deliberately not re-thrown — a failed SMS shouldn't crash the USSD
    // response the reporter is waiting on. Step 5's Voice fallback exists
    // partly to cover this case.
  }
}

module.exports = { sendSMS };