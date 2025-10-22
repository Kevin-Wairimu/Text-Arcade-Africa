require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTP() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    console.log('✅ SMTP login successful');
  } catch (err) {
    console.error('❌ SMTP login failed:', err.message);
  }
}

testSMTP();
