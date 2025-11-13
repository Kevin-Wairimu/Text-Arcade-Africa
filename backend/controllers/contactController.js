const sendEmail = require("../utils/sendEmail");

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate inputs
    if (!email || !message) {
      return res.status(400).json({ message: "Email and message are required." });
    }

    // Prepare the email
    const subject = `New Contact Form Submission${name ? ` from ${name}` : ""}`;
    const html = `
      <h2>New Message from Text Africa Arcade</h2>
      ${name ? `<p><strong>Name:</strong> ${name}</p>` : ""}
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    // Send via Brevo
    await sendEmail({
      to: process.env.BREVO_RECEIVER_EMAIL,
      subject,
      html,
    });

    console.log("📨 Contact email sent successfully!");
    res.status(200).json({ message: "Your message was sent successfully!" });
  } catch (error) {
    console.error("❌ Contact form error:", error);
    res.status(500).json({ message: "Failed to send message. Please try again later." });
  }
};
