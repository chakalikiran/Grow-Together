const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Handle dummy bypass tokens
      if (token === 'dummy_student_token') {
        if (process.env.NODE_ENV === 'production') {
          return res.status(401).json({ success: false, message: 'Bypass tokens disabled in production' });
        }
        req.user = { _id: '65f8a2e4b8a1c92d5e3f4a01', name: 'Demo Student', email: 'student@demo.com', role: 'student' };
        return next();
      }
      if (token === 'dummy_mentor_token') {
        if (process.env.NODE_ENV === 'production') {
          return res.status(401).json({ success: false, message: 'Bypass tokens disabled in production' });
        }
        req.user = { _id: '65f8a2e4b8a1c92d5e3f4a02', name: 'Demo Mentor', email: 'mentor@demo.com', role: 'mentor' };
        return next();
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const mentorAuth = (req, res, next) => {
  if (req.user && req.user.role === 'mentor') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as mentor' });
  }
};

module.exports = { protect, mentorAuth };
