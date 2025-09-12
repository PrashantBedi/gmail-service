# Email Backend Service

A robust Node.js backend service built with Express and Nodemailer for handling contact form submissions and sending emails.

## Features

- **Contact Form Processing**: Receives name, email, phone, subject, and body from frontend
- **Email Sending**: Sends formatted emails to configured recipient
- **Input Validation**: Comprehensive validation using Joi
- **Error Handling**: Robust error handling and logging
- **CORS Support**: Configurable CORS for frontend integration
- **Health Checks**: Email service health monitoring

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Update the `.env` file with your email configuration:
   ```env
   # Email Configuration (Example for Gmail)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   RECIPIENT_EMAIL=admin@yourcompany.com

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

   **For Gmail:**
   - Enable 2-factor authentication
   - Generate an App Password (not your regular password)
   - Use the App Password in `SMTP_PASS`

3. **Start the Server**
   ```bash
   npm run dev  # Development with auto-reload
   npm start    # Production
   ```

## API Endpoints

### POST /api/contact
Send a contact form email.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "subject": "Hello from contact form",
  "body": "This is a test message from the contact form."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "message-id"
}
```

### GET /api/contact/health
Check email service health status.

**Response:**
```json
{
  "success": true,
  "emailService": "connected"
}
```

## Frontend Integration

```javascript
const sendContactForm = async (formData) => {
  try {
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Email sent successfully');
    } else {
      console.error('Failed to send email:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

## Email Providers

The service works with any SMTP provider. Common configurations:

**Gmail:**
- Host: `smtp.gmail.com`
- Port: `587`
- Requires App Password

**SendGrid:**
- Host: `smtp.sendgrid.net`
- Port: `587`
- Username: `apikey`
- Password: Your SendGrid API key

**Mailgun:**
- Host: `smtp.mailgun.org`
- Port: `587`
- Use your Mailgun credentials

## Security Features

- Input validation and sanitization
- CORS configuration
- Error message sanitization in production
- Request size limits
- Secure email template generation

## Project Structure

```
src/
├── config/
│   └── email.js          # Email configuration
├── middleware/
│   ├── validation.js     # Input validation
│   └── errorHandler.js   # Error handling
├── routes/
│   └── contact.js        # Contact route handlers
├── services/
│   └── emailService.js   # Email sending logic
└── app.js                # Express app setup
server.js                 # Server entry point
```