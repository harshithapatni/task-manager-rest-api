const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Validates the JSON Web Token (JWT) sent in the HTTP Authorization header.
 * If valid, it attaches the decoded user information to req.user.
 * If missing, invalid, or expired, it returns HTTP 401 Unauthorized.
 */
const authMiddleware = (req, res, next) => {
  // Retrieve the Authorization header from the incoming request
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  // Check if header is present and formatted as 'Bearer <token>'
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access denied. No token provided.',
    });
  }

  // Extract the token by removing 'Bearer ' prefix
  const token = authHeader.split(' ')[1];

  if (!token || token.trim() === '') {
    return res.status(401).json({
      error: 'Access denied. No token provided.',
    });
  }

  try {
    // Verify the token using the secret stored in the .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user payload (e.g., { id, email, iat, exp }) to the request object
    req.user = decoded;

    // Proceed to the next middleware or controller
    next();
  } catch (error) {
    // Token is either invalid or expired
    return res.status(401).json({
      error: 'Invalid or expired token.',
    });
  }
};

module.exports = authMiddleware;
