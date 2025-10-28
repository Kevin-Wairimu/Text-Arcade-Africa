// frontend/netlify/functions/contact.js
const nodemailer = require("nodemailer");
require("dotenv").config(); // Loads .env in local dev (Netlify uses UI env vars)

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin":
      process.env.NODE_ENV === "development" ? "http://localhost:5173" : "https://yourdomain.com", // ← UPDATE WITH YOUR DOMAIN
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== "POST") {
    console.log(`Invalid method: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: "Method not allowed" }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
    console.log("Contact form payload:", payload);
  } catch (err) {
    console.error("Invalid JSON:", err.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, message: "Invalid JSON" }),
    };
  }

  const { name, email, message } = payload;

  // Validate required fields
  if (!email || !message) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, message: "Email and message are required" }),
    };
  }

  // Immediate response to client
  const clientResponse = {
    success: true,
    message: "Message received! We'll get back to you shortly.",
  };

  // Fire-and-forget email (non-blocking)
  setImmediate(async () => {
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false },
      });

      // Verify connection
      await transporter.verify();
      console.log("SMTP connection verified");

      const mailOptions = {
        from: `"Text Arcade Africa" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
        replyTo: email,
        subject: `Contact Form: ${name || "Anonymous"}`,
        text: `
Name: ${name || "N/A"}
Email: ${email}
Message:
${message}
        `.trim(),
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name || "N/A"}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Message:</strong></p>
          <blockquote>${message.replace(/\n/g, "<br>")}</blockquote>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Contact email sent:", info.messageId);
    } catch (err) {
      console.error("Failed to send contact email:", err.message);
      // Optional: send to error tracking (e.g. Sentry)
    }
  });

  // Return immediately
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(clientResponse),
  };
};