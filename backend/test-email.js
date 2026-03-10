require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  const port = parseInt(process.env.SMTP_PORT) || 587;
  const isSecure = port === 465;
  
  console.log(`📡 Testing connection to ${process.env.SMTP_HOST}:${port} (Secure: ${isSecure})`);
  console.log(`👤 User: ${process.env.SMTP_USER}`);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    console.log('✅ SMTP login successful');
  } catch (err) {
    console.error('❌ SMTP login failed:', err.message);
    if (err.message.includes('535')) {
      console.log('HINT: This is still an Authentication error. Check your App Password.');
    }
  }
}

test();
