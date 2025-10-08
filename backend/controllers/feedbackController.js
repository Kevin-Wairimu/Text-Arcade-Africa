const nodemailer = require("nodemailer");
require("dotenv").config();

exports.sendFeedback = async (req, res) => {
  try {
    console.log("SERVER: Received a new Help Request:", req.body.message);

    const { name, email, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // ✅ Create reusable transporter with Gmail credentials from .env
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Email details
    const mailOptions = {
      from: `"Text Africa Arcade" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send to your inbox
      subject: `Help Request / Feedback from ${name || "Anonymous"}`,
      text: `
Name: ${name || "N/A"}
Email: ${email || "N/A"}
Message: ${message}
      `,
    };

    // ✅ Send mail
    await transporter.sendMail(mailOptions);
    console.log("✅ Feedback email sent successfully!");

    res.status(200).json({ success: true, message: "Feedback sent successfully" });
  } catch (error) {
    console.error("SERVER ERROR sending email:", error);
    res.status(500).json({ error: "Failed to send feedback" });
  }
};
