# Pregnancy Emergency — step 1: project & AT sandbox setup

## 1. Create your Africa's Talking sandbox account
1. Go to https://account.africastalking.com/auth/register and sign up.
2. Once logged in, you'll land in the **Sandbox** app by default (no need to create a live app yet).
3. In the sandbox dashboard sidebar, go to **Settings → API Key** and generate a key.
   Your username in sandbox is always `sandbox`.
4. Copy the template env file to a real one, then edit it:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and paste your API key into `AT_API_KEY`. Leave `AT_USERNAME=sandbox`
   as-is — that value is fixed for every sandbox app, it's not something you generate.

## 2. Install dependencies
```bash
npm install
```

## 3. Run the server locally
```bash
npm run dev
```
This starts the USSD callback server on `http://localhost:3000/ussd`.

## 4. Expose it to the internet with ngrok
Africa's Talking needs a public URL to send USSD requests to.
```bash
ngrok http 3000
```
Copy the `https://...ngrok-free.app` URL it gives you.

## 5. Register the USSD callback in the AT dashboard
1. In the sandbox dashboard, go to **USSD → Create Channel**.
2. You'll get a sandbox service code that looks like `*384*XXXXX#`.
3. Set the **Callback URL** to `https://<your-ngrok-url>/ussd`.

## 6. Test it
Use the built-in **USSD Simulator** in the sandbox dashboard (Settings → left sidebar → Simulator).
Enter your sandbox service code and a test phone number, then dial through the menu.
You should see:
```
Welcome to Pregnancy Emergency Alert
1. Report emergency
2. Nearest facility info
```

If that renders and you can navigate into it, step 1 is done — the webhook plumbing works,
which is the thing most people get stuck on.

## Next
Step 2 builds the real data model (Report + Facility) so option 1 actually saves something
instead of just returning a canned "thank you" message.
