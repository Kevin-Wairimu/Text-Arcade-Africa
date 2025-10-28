const nodemailer = require("nodemailer");
require("dotenv").config();

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": process.env.NODE_ENV === "development" ? "http://localhost:5173" : "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle OPTIONS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== "POST") {
    console.log(`❌ Invalid method: ${event.httpMethod}`);
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: "Method not allowed" }) };
  }

  try {
    const { name, email, message } = JSON.parse(event.body);

    console.log("📥 Contact form payload:", { name, email, message });

    // Validate required fields (email and message only)
    if (!email || !message) {
      console.log("❌ Missing required fields in contact form");
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: "Email and message are required" }),
      };
    }

    // Respond immediately
    const responseBody = { success: true, message: "Message received! We'll get back to you shortly." };
    console.log("✅ Contact response sent to client");

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

        const verification = await transporter.verify();
        console.log("✅ SMTP connection verified:", verification);

        const mailOptions = {
          from: `"Text Arcade Africa" <${process.env.SMTP_USER}>`,
          to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER || "your-personal-email@outlook.com",
          subject: `Contact Form Submission${name ? ` from ${name}` : ""}`,
          text: `Name: ${name || "N/A"}\nEmail: ${email}\nMessage: ${message}`,
          replyTo: email,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Contact email sent:", { ...mailOptions, messageId: info.messageId });
      } catch (err) {
        console.error("❌ Contact email error:", err.message, err.stack);
      }
    });

    return { statusCode: 200, headers, body: JSON.stringify(responseBody) };
  } catch (err) {
    console.error("❌ Contact handler error:", err.message, err.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: "Failed to send message", error: err.message }),
    };
  }
};