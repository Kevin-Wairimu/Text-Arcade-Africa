require("dotenv").config();
const SibApiV3Sdk = require("sib-api-v3-sdk");

async function testBrevo() {
  try {
    // ✅ Initialize the API client with your key
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

    // ✅ Create API instance
    const accountApi = new SibApiV3Sdk.AccountApi();

    // ✅ Fetch account details to verify the key works
    const account = await accountApi.getAccount();
    console.log("✅ Brevo API key is valid!");
    console.log("👤 Account:", account.email);
    console.log("🏢 Company:", account.companyName);
    console.log("📧 Default Sender:", account.plan[0]?.credits?.sms || "Email plan active");

    // ✅ Verify sender email
    console.log("\n🔍 Checking sender email config...");
    console.log({
      senderEmail: process.env.BREVO_SENDER_EMAIL,
      senderName: process.env.BREVO_SENDER_NAME,
      receiverEmail: process.env.BREVO_RECEIVER_EMAIL,
    });

    if (!process.env.BREVO_SENDER_EMAIL) {
      console.warn("⚠️ Missing BREVO_SENDER_EMAIL in .env");
    } else {
      console.log("✅ Sender email configured correctly!");
    }
  } catch (err) {
    console.error("❌ Brevo test failed:", err.response?.text || err.message);
  }
}

testBrevo();
