const SibApiV3Sdk = require("@getbrevo/brevo");

const brevo = new SibApiV3Sdk.TransactionalEmailsApi();
brevo.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

async function sendEmail({ to, subject, html }) {
  const sender = {
    name: process.env.BREVO_SENDER_NAME || "Text Arcade Africa",
    email: process.env.BREVO_SENDER_EMAIL || "textafricaarcade@gmail.com",
  };

  const emailData = {
    sender,
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  try {
    const response = await brevo.sendTransacEmail(emailData);
    const messageId =
      response?.body?.messageId || response?.messageId || response?.messageIds?.[0];

    console.log("📤 Brevo API raw response:", JSON.stringify(response, null, 2));

    if (messageId) {
      console.log("✅ Email sent successfully:", messageId);
    } else {
      console.warn("⚠️ Brevo did not return a message ID. Check sender verification or sandbox mode.");
    }

    return response;
  } catch (error) {
    console.error("❌ Brevo email send error:", error.response?.text || error.message);
    throw error;
  }
}

module.exports = sendEmail;
