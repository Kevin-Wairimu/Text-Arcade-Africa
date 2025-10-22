const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

// POST /api/contact
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  console.log("📥 Contact form payload:", { name, email, message });

  // Validate all fields
  if (!name || !email || !message) {
    console.log("❌ Missing required fields in contact form");
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  // Respond immediately
  res.json({ success: true, message: "Message received! We'll get back to you shortly." });

  // Send email asynchronously
  setImmediate(async () => {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false },
      });

      // Verify SMTP connection
      const verification = await transporter.verify();
      console.log("✅ SMTP connection verified:", verification);

      const mailOptions = {
        from: `"Text Arcade Africa" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER || "your-personal-email@example.com",
        subject: `Contact Form Submission from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        // Add reply-to for Gmail compatibility
        replyTo: email,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Contact email sent:", { ...mailOptions, messageId: info.messageId });
    } catch (err) {
      console.error("❌ Contact email error:", err.message, err.stack);
    }
  });
});

module.exports = router;