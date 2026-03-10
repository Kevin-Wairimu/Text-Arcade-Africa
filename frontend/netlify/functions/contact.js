// frontend/netlify/functions/contact.js
const nodemailer = require("nodemailer");
require("dotenv").config(); // Loads .env in local dev (Netlify uses UI env vars)

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*", // More permissive for Netlify functions
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: "Method not allowed" }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
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

  try {
    const isGmail = process.env.SMTP_HOST?.includes("gmail") || 
                    process.env.SMTP_USER?.includes("gmail");

    const transporterConfig = isGmail ? {
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    } : {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    };

    const transporter = nodemailer.createTransport(transporterConfig);

    const mailOptions = {
      from: `"Text Arcade Africa" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
      replyTo: email,
      subject: `Contact Form: ${name || "Anonymous"}`,
      text: `Name: ${name || "N/A"}\nEmail: ${email}\nMessage:\n${message}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name || "N/A"}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Message:</strong></p>
        <blockquote>${message.replace(/\n/g, "<br>")}</blockquote>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Message received! We'll get back to you shortly.",
      }),
    };
  } catch (err) {
    console.error("Failed to send contact email:", err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Failed to send message. Please try again later.",
        error: err.message
      }),
    };
  }
};
