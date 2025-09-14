const serverless = require('serverless-http');
const app = require('../../src/app');

// Export the handler for Netlify Functions
exports.handler = serverless(app);