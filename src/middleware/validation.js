const Joi = require('joi');

const contactFormSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required'
    }),
  
  phone: Joi.string()
    .trim()
    .min(10)
    .max(20)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.min': 'Phone number must be at least 10 characters long',
      'string.max': 'Phone number cannot exceed 20 characters'
    }),
  
  subject: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Subject is required',
      'string.min': 'Subject must be at least 5 characters long',
      'string.max': 'Subject cannot exceed 200 characters'
    }),
  
  body: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'Message body is required',
      'string.min': 'Message must be at least 10 characters long',
      'string.max': 'Message cannot exceed 2000 characters'
    })
  }),
  
  recipientEmail: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid recipient email address',
      'string.empty': 'Recipient email is required'
    })
});

const validateContactForm = (req, res, next) => {
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
  
  req.body = value; // Use the validated and sanitized data
  next();
};

module.exports = {
  validateContactForm
};