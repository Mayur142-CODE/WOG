const crypto   = require('crypto');
const Player   = require('../models/Player');
const generateToken = require('../utils/generateToken');
const { sendPasswordResetEmail } = require('../utils/sendEmail');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login  — accepts username OR email
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username/email and password are required' });

    const identifier = username.trim().toLowerCase();

    // Match by username OR email
    const player = await Player.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!player || !player.password)
      return res.status(401).json({ message: 'Invalid credentials' });

    if (!(await player.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      token: generateToken(player._id, player.role),
      user: {
        id:          player._id,
        username:    player.username,
        displayName: player.name,
        role:        player.role,
        email:       player.email || null,
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
    const player = await Player.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpires');
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email?.trim())
      return res.status(400).json({ message: 'Email is required' });

    const player = await Player.findOne({ email: email.trim().toLowerCase() });

    // Always return same message to prevent email enumeration
    if (!player) {
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const rawToken    = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    player.resetPasswordToken   = hashedToken;
    player.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await player.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl  = `${clientUrl}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail(player.email, resetUrl);
    } catch (emailErr) {
      player.resetPasswordToken   = undefined;
      player.resetPasswordExpires = undefined;
      await player.save({ validateBeforeSave: false });
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
// ─────────────────────────────────────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword)
      return res.status(400).json({ message: 'Token and new password are required' });

    if (newPassword.length < 4)
      return res.status(400).json({ message: 'Password must be at least 4 characters' });

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const player = await Player.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!player)
      return res.status(400).json({ message: 'Reset token is invalid or has expired' });

    player.password             = newPassword;
    player.resetPasswordToken   = undefined;
    player.resetPasswordExpires = undefined;
    await player.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe, forgotPassword, resetPassword };
