const nodemailer = require("nodemailer");

exports.sendFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"TAA Feedback" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `Feedback from ${name || "Anonymous"}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    res.status(200).json({ message: "Feedback sent successfully" });
  } catch (err) {
    console.error("❌ Feedback error:", err);
    res.status(500).json({ error: "Failed to send feedback" });
  }
};
