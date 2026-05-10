const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Server error in authentication.' });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

// Check if user is project member
const isProjectMember = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const projectId = req.params.id || req.params.projectId || req.body.project;
    
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required.' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (!project.isMember(req.user._id)) {
      return res.status(403).json({ 
        message: 'Access denied. You are not a member of this project.' 
      });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking project membership.' });
  }
};

// Check if user is project admin
const isProjectAdmin = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const projectId = req.params.id || req.params.projectId || req.body.project;
    
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required.' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (!project.isAdmin(req.user._id)) {
      return res.status(403).json({ 
        message: 'Access denied. You must be a project admin.' 
      });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking project admin status.' });
  }
};

module.exports = {
  protect,
  authorize,
  isProjectMember,
  isProjectAdmin
};
