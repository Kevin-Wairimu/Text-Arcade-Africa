const nodemailer = require("nodemailer");

exports.sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;
  console.log(`📩 New contact message from ${name} (${email})`);

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required." });
  }

  try {
    // ✅ Brevo SMTP Transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // Brevo uses STARTTLS (not SSL)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // ✅ Log connection test
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully.");

    // ✅ Send mail
    await transporter.sendMail({
      from: `"Text Africa Arcade" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2>📬 New Contact Message</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Message:</b></p>
          <p>${message}</p>
        </div>
      `,
    });

    console.log("✅ Contact email sent successfully.");
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ SERVER EMAIL ERROR:", error);
    res.status(500).json({ message: "Failed to send message. Please try again later." });
  }
};
