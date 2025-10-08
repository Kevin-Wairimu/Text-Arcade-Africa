const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Get token from header
  const token = req.header('authorization');

  // 2. Check if token doesn't exist
  if (!token) {
    console.log('AUTH MIDDLEWARE ERROR: No token, authorization denied.');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // The token from the browser comes as "Bearer [token]". We need to remove "Bearer ".
  const tokenValue = token.split(' ')[1];
  
  if (!tokenValue) {
      console.log('AUTH MIDDLEWARE ERROR: Token is malformed.');
      return res.status(401).json({ message: 'Token is malformed' });
  }

  // 3. Verify token
  try {
    const secret = process.env.JWT_SECRET || 'your_default_secret_key';
    const decoded = jwt.verify(tokenValue, secret);

    // Add the user from the payload to the request object
    req.user = decoded.user;
    
    console.log('AUTH MIDDLEWARE: Token is valid. Proceeding to next function.');
    next(); // Move on to the next piece of middleware (the controller)

  } catch (err) {
    console.log('AUTH MIDDLEWARE ERROR: Token is not valid.');
    res.status(401).json({ message: 'Token is not valid' });
  }
};