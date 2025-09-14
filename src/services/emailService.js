const nodemailer = require('nodemailer');
const { emailConfig } = require('../config/email');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async verifyConnection() {
    try {
      // Add timeout for verification
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });
      
      await Promise.race([this.transporter.verify(), timeoutPromise]);
      console.log('Email service is ready to send emails');
      return true;
    } catch (error) {
      console.warn('Email service connection failed:', error.message);
      console.warn('Server will continue running, but emails cannot be sent');
      console.warn('Please check your SMTP configuration in .env file');
      return false;
    }
  }

  async sendContactEmail({ name, email, phone, subject, body, recipientEmail }) {
    try {
      const emailTemplate = this.generateEmailTemplate({
        name,
        email,
        phone,
        subject,
        body
      });

      const mailOptions = {
        from: `"Contact Form" <${emailConfig.auth.user}>`,
        to: recipientEmail,
        subject: `Contact Form: ${subject}`,
        html: emailTemplate,
        text: this.generateTextTemplate({ name, email, phone, subject, body })
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Failed to send email:', error.message);
      throw new Error('Email sending failed');
    }
  }

  generateEmailTemplate({ name, email, phone, subject, body }) {
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
  }

  generateTextTemplate({ name, email, phone, subject, body }) {
    return `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject}

Message:
${body}
    `.trim();
  }
}

module.exports = new EmailService();