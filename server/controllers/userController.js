const Player = require('../models/Player');
const Scrim  = require('../models/Scrim');
const generateToken = require('../utils/generateToken');

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/update-username  — authenticated user updates own username
// ─────────────────────────────────────────────────────────────────────────────
const updateUsername = async (req, res, next) => {
  try {
    const { newUsername } = req.body;
    if (!newUsername?.trim())
      return res.status(400).json({ message: 'New username is required' });

    const username = newUsername.trim().toLowerCase();
    const name     = newUsername.trim().charAt(0).toUpperCase() + newUsername.trim().slice(1);

    // Check if username already taken by another player
    const exists = await Player.findOne({ username });
    if (exists && exists._id.toString() !== req.user.id)
      return res.status(400).json({ message: 'Username already taken' });

    const oldPlayer = await Player.findById(req.user.id);
    const oldName   = oldPlayer.name;

    const player = await Player.findByIdAndUpdate(
      req.user.id,
      { username, name },
      { new: true }
    ).select('-password');

    // Propagate name change to Scrim records
    await Scrim.updateMany({ player: oldName }, { player: player.name });

    res.json({
      success: true,
      message: 'Username updated successfully',
      token: generateToken(player._id, player.role),
      user: { id: player._id, username: player.username, displayName: player.name, role: player.role },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/update-password  — authenticated user updates own password
// ─────────────────────────────────────────────────────────────────────────────
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Current and new passwords are required' });

    if (newPassword.length < 4)
      return res.status(400).json({ message: 'New password must be at least 4 characters' });

    const player = await Player.findById(req.user.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });

    const isMatch = await player.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    player.password = newPassword;
    await player.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/users  — Admin only: create a new player/auth account
// ─────────────────────────────────────────────────────────────────────────────
const createUser = async (req, res, next) => {
  try {
    const { username, email, password, role, name } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'Username and password are required' });

    const usernameNorm = username.trim().toLowerCase();
    const displayName  = name?.trim()
      || (username.trim().charAt(0).toUpperCase() + username.trim().slice(1));

    // Duplicate checks
    if (await Player.findOne({ username: usernameNorm }))
      return res.status(400).json({ message: 'Username already taken' });

    if (email && await Player.findOne({ email: email.trim().toLowerCase() }))
      return res.status(400).json({ message: 'Email already registered' });

    const count  = await Player.countDocuments();
    const player = await Player.create({
      name:     displayName,
      username: usernameNorm,
      email:    email ? email.trim().toLowerCase() : undefined,
      password,
      role:     role || 'viewer',
      order:    count,
    });

    res.status(201).json({
      message: 'Player created successfully',
      user: {
        id:          player._id,
        username:    player.username,
        displayName: player.name,
        email:       player.email || null,
        role:        player.role,
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
// PUT /api/users/:id/email  — Admin only: update a player's email
// ─────────────────────────────────────────────────────────────────────────────
const updateUserEmail = async (req, res, next) => {
  try {
    const { id }    = req.params;
    const { email } = req.body;

    if (!email?.trim())
      return res.status(400).json({ message: 'Email is required' });

    const emailNorm = email.trim().toLowerCase();

    const existing = await Player.findOne({ email: emailNorm });
    if (existing && existing._id.toString() !== id)
      return res.status(400).json({ message: 'Email already registered to another player' });

    const player = await Player.findByIdAndUpdate(
      id,
      { email: emailNorm },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!player) return res.status(404).json({ message: 'Player not found' });

    res.json({
      message: 'Email updated successfully',
      user: {
        id:          player._id,
        username:    player.username,
        displayName: player.name,
        email:       player.email,
        role:        player.role,
      },
    });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Email already registered' });
    next(err);
  }
};

module.exports = { updateUsername, updatePassword, createUser, updateUserEmail };
