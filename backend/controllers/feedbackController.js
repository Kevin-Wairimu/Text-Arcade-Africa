const { SibApiV3Sdk, tranEmailApi } = require("../utils/brevoClient");

exports.sendFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const sender = {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME || "Text Arcade Africa",
    };

    const adminEmail = {
      email: process.env.BREVO_RECEIVER_EMAIL || process.env.BREVO_SENDER_EMAIL,
      name: "Admin",
    };

    // ✨ Stylish HTML email content
    const feedbackEmail = new SibApiV3Sdk.SendSmtpEmail({
      sender,
      to: [adminEmail],
      subject: `📬 New Feedback from ${name || "Anonymous"}`,
      htmlContent: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f8; padding: 30px;">
          <div style="max-width: 650px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(90deg, #2E7D32, #1B5E20); color: white; padding: 20px 25px; font-size: 20px; font-weight: bold;">
              🌍 Text Arcade Africa — New Feedback
            </div>

            <!-- Body -->
            <div style="padding: 25px;">
              <p style="font-size: 16px; color: #333;">👋 <b>Hello Admin,</b></p>
              <p style="font-size: 15px; color: #444;">You’ve received new feedback from your website:</p>

              <div style="background: #e8f5e9; border-left: 5px solid #2E7D32; padding: 15px 20px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 6px 0;"><b>Name:</b> ${name || "Anonymous"}</p>
                <p style="margin: 6px 0;"><b>Email:</b> ${email || "Not provided"}</p>
                <p style="margin: 6px 0;"><b>Message:</b></p>
                <p style="margin: 10px 0; color: #222; line-height: 1.6;">${message}</p>
              </div>

              <p style="font-size: 13px; color: #777;">📅 <b>Received:</b> ${new Date().toLocaleString()}</p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f1f8e9; color: #2E7D32; text-align: center; padding: 12px; font-size: 13px;">
              ✨ This email was sent automatically by <b>Text Arcade Africa Feedback System</b>.
            </div>
          </div>
        </div>
      `,
    });

    await tranEmailApi.sendTransacEmail(feedbackEmail);
    console.log("✅ Feedback email sent successfully via Brevo!");

    res.status(200).json({ message: "Feedback sent successfully via Brevo!" });
  } catch (err) {
    console.error("❌ Brevo feedback error:", err.response?.text || err.message);
    res.status(500).json({ error: "Failed to send feedback." });
  }
};
