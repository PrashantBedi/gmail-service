const express = require('express');
const emailService = require('../services/emailService');
const { validateContactForm } = require('../middleware/validation');

const router = express.Router();

// POST /api/contact - Send contact form email
router.post('/', validateContactForm, async (req, res) => {
  try {
    const { name, email, phone, subject, body, recipientEmail } = req.body;
    
    console.log('Received contact form submission:', { name, email, subject });
    
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
    
    res.status(500).json({
      success: false,
      message: 'Failed to send email. Please try again later.'
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