export {};// Added to mark file as a module
/**
 * Request ID Middleware
 * Generates and attaches unique request IDs for tracing and correlation
 */

const crypto = require('crypto');

/**
 * Generate a unique request ID
 */
function generateRequestId() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Request ID middleware
 * Attaches a unique ID to each request for logging and tracing
 */
function requestIdMiddleware(req, res, next) {
  // Use existing request ID from header if present, otherwise generate new
  const requestId = req.headers['x-request-id'] || 
                    req.headers['x-correlation-id'] || 
                    generateRequestId();
  
  // Attach to request object
  req.id = requestId;
  req.requestId = requestId;
  
  // Set response header
  res.setHeader('X-Request-ID', requestId);
  
  // Attach to logger context if available
  if (req.log) {
    req.log = req.log.child({ requestId });
  }
  
  next();
}

module.exports = {
  requestIdMiddleware,
  generateRequestId
};
