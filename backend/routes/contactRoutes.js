const express = require("express");
const { sendEmail } = require("../utils/email");
require("dotenv").config();

const router = express.Router();

// POST /api/contact
router.post("/", async (req, res) => {
  // Use a default name if not provided
  const { name = "Website Visitor", email, message } = req.body;

  console.log("📥 Contact form payload:", { name, email, message });

  // Validate required fields
  if (!email || !message) {
    console.log("❌ Missing required fields in contact form");
    return res.status(400).json({ 
      success: false, 
      message: "Email and message are required." 
    });
  }

  try {
    const mailOptions = {
      from: `"TAA Contact Form" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER || process.env.EMAIL_USER,
      subject: `New Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      replyTo: email, // This allows the admin to reply directly to the sender
    };

    console.log("📡 Attempting to send contact email...");
    await sendEmail(mailOptions);
    console.log("✅ Contact email sent successfully to", mailOptions.to);

    return res.status(200).json({ 
      success: true, 
      message: "Your message has been received! We will get back to you shortly." 
    });
  } catch (err) {
    console.error("❌ Contact email error details:");
    console.error("Error Message:", err.message);
    
    // Check for common SMTP errors
    if (err.message.includes("535") || err.message.toLowerCase().includes("auth")) {
      console.error("HINT: SMTP Authentication failed. Check your EMAIL/SMTP credentials in .env.");
    }

    // Still respond with an error so the frontend knows something went wrong
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Our team has been notified.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

module.exports = router;
