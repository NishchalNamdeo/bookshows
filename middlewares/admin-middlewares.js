const jwt = require('jsonwebtoken');

// Middleware to check if the user is logged in and has admin privileges
module.exports.authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  // console.log(token);
  

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user role is 'admin'
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You are not authorized to perform this action.' });
    }

    // Set the decoded admin data to req.admin to be accessed in the next route handler
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};
