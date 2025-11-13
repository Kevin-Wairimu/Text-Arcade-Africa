const SibApiV3Sdk = require("@getbrevo/brevo");

// Create a single reusable Brevo client
const brevo = new SibApiV3Sdk.TransactionalEmailsApi();
brevo.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

/**
 * Send an email via Brevo
 * @param {string} to - recipient email
 * @param {string} subject - subject line
 * @param {string} html - HTML body
 */
async function sendEmail({ to, subject, html }) {
  const sender = {
    name: process.env.BREVO_SENDER_NAME,
    email: process.env.BREVO_SENDER_EMAIL,
  };

  const emailData = {
    sender, // ✅ this fixes "sender missing"
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  try {
    const response = await brevo.sendTransacEmail(emailData);
    console.log("✅ Email sent successfully:", response.messageId || "No ID");
    return response;
  } catch (error) {
    console.error("❌ Brevo email send error:", error.response?.text || error.message);
    throw error;
  }
}

module.exports = sendEmail;
