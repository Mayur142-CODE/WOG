const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendPasswordResetEmail } = require('../utils/sendEmail');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Accepts username OR email as the identifier
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username/email and password are required' });

    const identifier = username.trim().toLowerCase();

    // Match by username OR email
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      token: generateToken(user._id, user.role),
      user: {
        id:          user._id,
        username:    user.username,
        displayName: user.displayName,
        role:        user.role,
        email:       user.email || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// Body: { email }
// ─────────────────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim())
      return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        message: 'If that email is registered, a reset link has been sent.',
      });
    }

    // Generate raw token (sent in email)
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Hash token before storing (security: DB breach ≠ token leak)
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    user.resetPasswordToken   = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl  = `${clientUrl}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailErr) {
      // Roll back token if email fails
      user.resetPasswordToken   = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      console.error('Email send error:', emailErr.message);
      return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }

    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// Body: { token, newPassword }
// ─────────────────────────────────────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword)
      return res.status(400).json({ message: 'Token and new password are required' });

    if (newPassword.length < 4)
      return res.status(400).json({ message: 'Password must be at least 4 characters' });

    // Hash the incoming raw token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token.trim())
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // still valid
    });

    if (!user)
      return res.status(400).json({ message: 'Reset token is invalid or has expired' });

    // Update password (pre-save hook hashes it)
    user.password             = newPassword;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe, forgotPassword, resetPassword };
