const nodemailer = require("nodemailer");

/**
 * Creates a nodemailer transporter based on environment variables.
 */
const createTransporter = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT) || 465;

  const isGmail = host.includes("gmail") || user?.includes("gmail");

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false, // Ensures SSL/TLS works in strict deployment environments
      },
    });
  }

  // Fallback to custom SMTP
  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false, 
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
