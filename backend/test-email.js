import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function sendTestEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // or smtp-relay.brevo.com if using Brevo
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.RECEIVER_EMAIL,
      subject: "✅ Test Email from Text Arcade Backend",
      text: "This is a test message sent from your backend via Nodemailer.",
    });

    console.log("✅ Email sent successfully:", info.messageId);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
}

sendTestEmail();
