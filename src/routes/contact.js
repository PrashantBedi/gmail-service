const express = require('express');
const emailService = require('../services/emailService');
const { validateContactForm } = require('../middleware/validation');
const { authenticateApiKey } = require('../middleware/auth');

const router = express.Router();

// POST /api/contact - Send contact form email
router.post('/', authenticateApiKey, validateContactForm, async (req, res) => {
  try {
    const { name, email, phone, subject, body, recipientEmail } = req.body;
    
    console.log('Received contact form submission:', { name, email, subject });
    
    // Check if email service is configured
    const isEmailConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;
    if (!isEmailConfigured) {
      console.error('Email service not configured - missing SMTP credentials');
      return res.status(500).json({
        success: false,
        message: 'Email service is not configured. Please contact the administrator.'
      });
    }
    
    const result = await emailService.sendContactEmail({
      name,
      email,
      phone,
      subject,
      body,
      recipientEmail
    });
    
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId
    });
    
  } catch (error) {
    console.error('Contact form error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Email error: ${error.message}`
      : 'Failed to send email. Please try again later.';
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

// GET /api/contact/health - Health check for email service
router.get('/health', async (req, res) => {
  try {
    const isConnected = await emailService.verifyConnection();
    
    res.status(200).json({
      success: true,
      emailService: isConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email service health check failed'
    });
  }
});

module.exports = router;