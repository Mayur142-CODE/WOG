const User = require('../models/User');
const Player = require('../models/Player');
const Scrim = require('../models/Scrim');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// PUT /api/users/update-username
const updateUsername = async (req, res, next) => {
  try {
    const { newUsername } = req.body;
    if (!newUsername || !newUsername.trim()) {
      return res.status(400).json({ message: 'New username is required' });
    }

    const username = newUsername.trim().toLowerCase();
    const displayName = newUsername.trim().charAt(0).toUpperCase() + newUsername.trim().slice(1);

    // Check if username is already taken
    const exists = await User.findOne({ username });
    if (exists && exists._id.toString() !== req.user.id) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const oldUser = await User.findById(req.user.id);
    const oldDisplayName = oldUser.displayName;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, displayName },
      { new: true }
    ).select('-password');

    // Propagate changes to other collections
    // Update Player records
    await Player.updateMany(
      { name: oldDisplayName },
      { name: user.displayName, user: user._id }
    );

    // Update Scrim records
    await Scrim.updateMany(
      { player: oldDisplayName },
      { player: user.displayName, user: user._id }
    );

    res.json({
      success: true,
      message: 'Username updated successfully and propagated everywhere',
      token: generateToken(user._id, user.role),
      user: { id: user._id, username: user.username, displayName: user.displayName, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/update-password
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

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { updateUsername, updatePassword };
