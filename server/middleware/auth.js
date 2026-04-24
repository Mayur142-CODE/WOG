const jwt    = require('jsonwebtoken');
const Player = require('../models/Player');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ message: 'Not authorized, no token' });

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Player.findById(decoded.id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!req.user) return res.status(401).json({ message: 'Player not found' });
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ message: 'Access denied: Admins only' });
};

module.exports = { protect, adminOnly };
