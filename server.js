const app = require('./src/app');
const emailService = require('./src/services/emailService');

const PORT = process.env.PORT || 3000;

// Start server
const startServer = async () => {
  try {
    // Verify email service connection
    const emailConnected = await emailService.verifyConnection();
    
    if (!emailConnected) {
      console.warn('Warning: Email service is not properly configured');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📧 Email service: ${emailConnected ? '✅ Connected' : '❌ Disconnected'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\nAPI Endpoints:`);
      console.log(`  POST http://localhost:${PORT}/api/contact`);
      console.log(`  GET  http://localhost:${PORT}/api/contact/health`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();