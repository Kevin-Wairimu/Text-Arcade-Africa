const axios = require("axios");

// ✅ Contact Controller — Send contact form message using Brevo API (HTTP, not SMTP)
exports.sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;
  console.log(`📩 New contact message from ${name} (${email})`);

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    // ✅ Send via Brevo HTTP API
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Text Africa Arcade", email: process.env.SMTP_USER },
        to: [{ email: process.env.SMTP_USER, name: "TAA Admin" }],
        replyTo: { email, name },
        subject: `📬 New Contact Message from ${name}`,
        htmlContent: `
          <div style="font-family:Arial,sans-serif;padding:20px;background:#f9f9f9;border-radius:8px;">
            <h2 style="color:#007b55;">New Message Received</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p style="background:#fff;padding:10px;border-radius:5px;">${message}</p>
          </div>
        `,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        timeout: 15000,
      }
    );

    console.log("✅ Brevo email sent successfully:", response.data);
    return res
      .status(200)
      .json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);

    // Detailed error if available
    if (error.response) {
      console.error("Response:", error.response.data);
    }

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to send your message. Please try again later.",
      error: error.message,
    });
  }
};
