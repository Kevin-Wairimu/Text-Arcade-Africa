const nodemailer = require('nodemailer');

exports.sendFeedback = async (req, res) => {
  const { type, message } = req.body; // 'type' will be 'Help Request' or 'Feedback'

  console.log(`SERVER: Received a new ${type}: "${message}"`);

  if (!type || !message) {
    return res.status(400).json({ message: 'Type and message are required.' });
  }

  // 1. Create a Nodemailer "transporter"
  // This is the service that will send the email (e.g., Gmail)
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Or another email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: `"Your Website" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Send the email to yourself
    subject: `New Submission: ${type}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #1E6B2B;">New Website Submission</h2>
        <p>You have received a new <strong>${type}</strong>.</p>
        <hr>
        <p style="font-size: 16px; background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
          ${message}
        </p>
      </div>
    `,
  };

  // 3. Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log('SERVER: Email sent successfully.');
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('SERVER ERROR sending email:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
};