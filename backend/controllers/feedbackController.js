const { sendEmail } = require("../utils/email");

exports.sendFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    await sendEmail({
      to: process.env.SMTP_USER || process.env.EMAIL_USER,
      subject: `Feedback from ${name || "Anonymous"}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      replyTo: email
    });

    res.status(200).json({ message: "Feedback sent successfully" });
  } catch (err) {
    console.error("❌ Feedback error:", err);
    res.status(500).json({ error: "Failed to send feedback" });
  }
};
