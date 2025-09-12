const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Joi = require('joi');
const serverless = require('serverless-http');

const app = express();

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins for Netlify
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Email configuration from environment variables
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 30000,
  greetingTimeout: 15000,
  socketTimeout: 30000
};

const recipientEmail = process.env.RECIPIENT_EMAIL;

// Create transporter
let transporter;
try {
  transporter = nodemailer.createTransport(emailConfig);
} catch (error) {
  console.error('Failed to create email transporter:', error.message);
}

// Validation schema
const contactFormSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().min(10).max(20).required(),
  subject: Joi.string().trim().min(5).max(200).required(),
  body: Joi.string().trim().min(10).max(2000).required()
});

// Email template generator
const generateEmailTemplate = ({ name, email, phone, subject, body }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-top: 5px; padding: 10px; background-color: #f8f9fa; border-radius: 3px; }
          .message { background-color: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
            <p>You have received a new message from your website contact form.</p>
          </div>
          
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${name}</div>
          </div>
          
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${email}</div>
          </div>
          
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value">${phone}</div>
          </div>
          
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${subject}</div>
          </div>
          
          <div class="field">
            <div class="label">Message:</div>
            <div class="message">${body.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Email Backend Service API',
    version: '1.0.0',
    endpoints: {
      contact: 'POST /.netlify/functions/api/contact',
      health: 'GET /.netlify/functions/api/contact/health'
    }
  });
});

// Health check
app.get('/contact/health', async (req, res) => {
  try {
    if (!transporter) {
      return res.status(500).json({
        success: false,
        emailService: 'not configured'
      });
    }

    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });
    
    await Promise.race([transporter.verify(), timeoutPromise]);
    
    res.status(200).json({
      success: true,
      emailService: 'connected'
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      emailService: 'disconnected',
      note: 'Service available but email not configured'
    });
  }
});

// Contact form endpoint
app.post('/contact', async (req, res) => {
  try {
    // Validate input
    const { error, value } = contactFormSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      });
    }

    const { name, email, phone, subject, body } = value;

    // Check if email service is configured
    if (!transporter || !recipientEmail) {
      return res.status(500).json({
        success: false,
        message: 'Email service not configured'
      });
    }

    // Send email
    const emailTemplate = generateEmailTemplate({ name, email, phone, subject, body });

    const mailOptions = {
      from: `"Contact Form" <${emailConfig.auth.user}>`,
      to: recipientEmail,
      subject: `Contact Form: ${subject}`,
      html: emailTemplate,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject}

Message:
${body}
      `.trim()
    };

    const info = await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('Contact form error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send email. Please try again later.'
    });
  }
});

// Error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

module.exports.handler = serverless(app);