const express = require("express");
const { sendEmail } = require("../utils/email");
require("dotenv").config();

const router = express.Router();

/**
 * sendContactMessage
 * This can be used as a standalone controller function or via the router below.
 */
const sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;

  console.log("📥 Contact form payload (Controller):", { name, email, message });

  // Validate all fields
  if (!name || !email || !message) {
    console.log("❌ Missing required fields in contact form");
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const mailOptions = {
      from: `"Text Arcade Africa" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER || process.env.EMAIL_USER,
      subject: `New Contact Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
      replyTo: email
    };

    await sendEmail(mailOptions);
    console.log("✅ Contact email sent (Controller)");

    return res.json({ 
      success: true, 
      message: "Message received! We'll get back to you shortly." 
    });
  } catch (err) {
    console.error("❌ Contact email error (Controller):", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// POST /api/contact (Legacy Router support)
router.post("/", sendContactMessage);

module.exports = { router, sendContactMessage };
