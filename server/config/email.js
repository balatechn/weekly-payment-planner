const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailgun.org',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Non-blocking verify — only log, never crash the server
if (process.env.EMAIL_USER) {
  transporter.verify((error) => {
    if (error) {
      console.error('❌ SMTP connection failed:', error.message);
    } else {
      console.log('✅ SMTP server ready —', process.env.EMAIL_HOST);
    }
  });
} else {
  console.warn('⚠️  EMAIL_USER not set — email sending disabled');
}

module.exports = transporter;
