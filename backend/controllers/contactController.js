const nodemailer = require('nodemailer');

exports.sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;
  console.log(`SERVER: Received new contact message from ${name} (${email})`);

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  // Use the same transporter configuration as your feedback controller
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define the email options
  const mailOptions = {
    from: `"Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Send the email to yourself
    subject: `New Contact Form Submission from ${name}`,
    // CRITICAL: This allows you to "Reply" directly to the user
    replyTo: email, 
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #1E6B2B;">New Contact Form Submission</h2>
        <hr>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <h3 style="color: #1E6B2B; margin-top: 20px;">Message:</h3>
        <p style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('SERVER: Contact email sent successfully.');
    res.status(200).json({ message: 'Message sent successfully! We will get back to you soon.' });
  } catch (error) {
    console.error('SERVER ERROR sending contact email:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
};