const dotenv = require('dotenv');
dotenv.config();

// Email configuration for SMTP service
// These values are loaded from environment variables
const emailConfig = {
  host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
  port: parseInt(process.env['SMTP_PORT']) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env['SMTP_USER'],
    pass: process.env['SMTP_PASS'],
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000, // 30 seconds
  socketTimeout: 60000 // 60 seconds
};

if (!emailConfig.auth.user || !emailConfig.auth.pass) {
  console.error('Email configuration is incomplete. Please check your environment variables.');
}

module.exports = {
  emailConfig
};