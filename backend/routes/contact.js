const express = require("express");
const { SibApiV3Sdk, tranEmailApi } = require("../utils/brevoClient");

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;
  console.log("📥 Contact form payload:", { name, email, message });

  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Text Arcade Africa";
  const receiverEmail = process.env.BREVO_RECEIVER_EMAIL || senderEmail;

  console.log("📦 Brevo Config:", { senderEmail, senderName, receiverEmail });

  try {
    // ✅ Admin email
    const adminEmail = new SibApiV3Sdk.SendSmtpEmail();
    adminEmail.sender = { email: senderEmail, name: senderName };
    adminEmail.to = [{ email: receiverEmail, name: "Site Admin" }];
    adminEmail.replyTo = { email: email };
    adminEmail.subject = `New Contact Message${name ? ` from ${name}` : ""}`;
    adminEmail.htmlContent = `
      <h3>New Contact Message</h3>
      <p><strong>Name:</strong> ${name || "N/A"}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    await tranEmailApi.sendTransacEmail(adminEmail);
    console.log("✅ Admin email sent via Brevo");

    // ✅ User auto-reply
    const userEmail = new SibApiV3Sdk.SendSmtpEmail();
    userEmail.sender = { email: senderEmail, name: senderName };
    userEmail.to = [{ email: email, name: name || "Valued User" }];
    userEmail.subject = "Thanks for contacting Text Arcade Africa!";
    userEmail.htmlContent = `
      <h3>Hello ${name || "there"} 👋</h3>
      <p>Thanks for reaching out to <strong>Text Arcade Africa</strong>!</p>
      <p>We’ve received your message and will get back to you soon.</p>
      <hr/>
      <p><em>Your message:</em></p>
      <blockquote>${message}</blockquote>
      <p>— The Text Arcade Africa Team</p>
    `;

    await tranEmailApi.sendTransacEmail(userEmail);
    console.log("✅ Auto-reply sent to user:", email);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully via Brevo!",
    });
  } catch (err) {
    console.error("❌ Brevo contact email error:", err.response?.text || err.message);
    res.status(500).json({
      success: false,
      message: "Failed to send email via Brevo.",
      error: err.response?.text || err.message,
    });
  }
});

module.exports = router;
