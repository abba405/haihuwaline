const AfricasTalking = require('africastalking')({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const airtimeService = AfricasTalking.AIRTIME;

async function sendAirtimeReward(phoneNumber, amount = '50', currencyCode = 'NGN') {
  try {
    const result = await airtimeService.send({
      recipients: [{ phoneNumber, amount, currencyCode }],
    });
    console.log('Airtime send result:', JSON.stringify(result));
    return result;
  } catch (err) {
    console.error('Airtime send failed:', err.message);
  }
}

module.exports = { sendAirtimeReward };
