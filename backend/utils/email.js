const nodemailer = require("nodemailer");

/**
 * Creates a nodemailer transporter based on environment variables.
 */
const createTransporter = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  // Check if it's Gmail (either by host or email domain)
  const isGmail = process.env.SMTP_HOST?.includes("gmail") || 
                  user?.includes("gmail");

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  // Fallback to custom SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false, // Helps with some shared hosting providers
    },
  });
};

/**
 * Generic function to send email.
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: options.from || `"Text Arcade Africa" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo,
    };

    console.log(`SERVER: Sending email to ${options.to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`SERVER: Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    if (error.responseCode === 535) {
      console.error("SERVER SMTP ERROR: Authentication failed (535). Please verify your SMTP credentials or use a fresh App Password.");
    } else {
      console.error("SERVER SMTP ERROR:", error.message);
    }
    throw error;
  }
};

module.exports = { sendEmail, createTransporter };
