import nodemailer from "nodemailer";

// Utility function to send an email with retry
async function sendEmailWithRetry(transporter, mailOptions, retries = 2) {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Email send failed: ${error.message}`);
    if (retries > 0) {
      console.log(`🔁 Retrying... (${2 - retries + 1})`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return sendEmailWithRetry(transporter, mailOptions, retries - 1);
    }
    throw error;
  }
}

export const sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  console.log(`📩 New contact message from ${name} (${email})`);

  try {
    // ✅ Create transporter using Brevo SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465, // true if using 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ Email content
    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.SMTP_USER, // or your main contact inbox
      subject: `📩 New Contact Message from ${name}`,
      html: `
        <div style="font-family:sans-serif; padding:10px">
          <h2>New Contact Form Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left:3px solid #ccc; margin:10px 0; padding-left:10px">
            ${message}
          </blockquote>
          <p>— Text Arcade Africa Contact Form</p>
        </div>
      `,
    };

    // ✅ Try sending email with retry logic
    await sendEmailWithRetry(transporter, mailOptions);

    // ✅ Respond only after sendMail succeeds
    res.json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("❌ Contact form error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
      error: error.message,
    });
  }
};
