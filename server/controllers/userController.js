const User = require('../models/User');
const Player = require('../models/Player');
const Scrim = require('../models/Scrim');
const generateToken = require('../utils/generateToken');

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/update-username
// ─────────────────────────────────────────────────────────────────────────────
const updateUsername = async (req, res, next) => {
  try {
    const { newUsername } = req.body;
    if (!newUsername || !newUsername.trim()) {
      return res.status(400).json({ message: 'New username is required' });
    }

    const username    = newUsername.trim().toLowerCase();
    const displayName = newUsername.trim().charAt(0).toUpperCase() + newUsername.trim().slice(1);

    // Check if username is already taken
    const exists = await User.findOne({ username });
    if (exists && exists._id.toString() !== req.user.id) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const oldUser       = await User.findById(req.user.id);
    const oldDisplayName = oldUser.displayName;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, displayName },
      { new: true }
    ).select('-password');

    // Propagate to Player and Scrim records
    await Player.updateMany(
      { name: oldDisplayName },
      { name: user.displayName, user: user._id }
    );
    await Scrim.updateMany(
      { player: oldDisplayName },
      { player: user.displayName, user: user._id }
    );

    res.json({
      success: true,
      message: 'Username updated successfully and propagated everywhere',
      token:   generateToken(user._id, user.role),
      user:    { id: user._id, username: user.username, displayName: user.displayName, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/update-password
// ─────────────────────────────────────────────────────────────────────────────
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }
    if (newPassword.length < 4) {
      return res.status(400).json({ message: 'New password must be at least 4 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/users  — Admin only
// Create a new user with username, email, password, role
// ─────────────────────────────────────────────────────────────────────────────
const createUser = async (req, res, next) => {
  try {
    const { username, email, password, role, displayName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const usernameNorm = username.trim().toLowerCase();
    const display      = displayName?.trim()
      || (username.trim().charAt(0).toUpperCase() + username.trim().slice(1));

    // Check duplicates
    const existingUsername = await User.findOne({ username: usernameNorm });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    if (email) {
      const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    const user = await User.create({
      username:    usernameNorm,
      displayName: display,
      password,
      email:       email ? email.trim().toLowerCase() : undefined,
      role:        role || 'viewer',
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id:          user._id,
        username:    user.username,
        displayName: user.displayName,
        email:       user.email || null,
        role:        user.role,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/:id/email  — Admin only
// Update a user's email address
// ─────────────────────────────────────────────────────────────────────────────
const updateUserEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailNorm = email.trim().toLowerCase();

    // Ensure email is not taken by another user
    const existing = await User.findOne({ email: emailNorm });
    if (existing && existing._id.toString() !== id) {
      return res.status(400).json({ message: 'Email already registered to another user' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { email: emailNorm },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'Email updated successfully',
      user: {
        id:          user._id,
        username:    user.username,
        displayName: user.displayName,
        email:       user.email,
        role:        user.role,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    next(err);
  }
};

module.exports = { updateUsername, updatePassword, createUser, updateUserEmail };
