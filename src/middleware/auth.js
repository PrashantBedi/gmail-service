const crypto = require('crypto');

const authenticateApiKey = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header'
      });
    }
    
    const encryptedKey = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Check if required environment variables are set
    if (!process.env.API_KEY || !process.env.ENCRYPTION_SECRET) {
      console.error('Authentication configuration missing - API_KEY or ENCRYPTION_SECRET not set');
      return res.status(500).json({
        success: false,
        message: 'Server authentication not configured'
      });
    }
    
    // Decrypt the API key
    const algorithm = 'aes-256-cbc';
    const secretKey = crypto.createHash('sha256').update(process.env.ENCRYPTION_SECRET).digest();
    
    try {
      // Parse the encrypted data
      const encryptedData = JSON.parse(Buffer.from(encryptedKey, 'base64').toString());
      const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(encryptedData.iv, 'hex'));
      
      let decryptedKey = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
      decryptedKey += decipher.final('utf8');
      
      // Verify the decrypted key matches the expected API key
      if (decryptedKey !== process.env.API_KEY) {
        return res.status(401).json({
          success: false,
          message: 'Invalid API key'
        });
      }
      
      // Authentication successful
      next();
      
    } catch (decryptError) {
      console.error('Decryption error:', decryptError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid encrypted key format'
      });
    }
    
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = {
  authenticateApiKey
};