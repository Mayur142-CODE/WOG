const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const playerSchema = new mongoose.Schema(
  {
    // ── Game fields ──────────────────────────────────────────────────────────
    name:    { type: String, required: [true, 'Player name is required'], trim: true, unique: true },
    order:   { type: Number, required: true, default: 0 },   // legacy / BR order
    brOrder: { type: Number, default: null },                 // Battle Royale pay order
    csOrder: { type: Number, default: null },                 // Clash Squad pay order

    // ── Auth fields ──────────────────────────────────────────────────────────
    username: {
      type:      String,
      unique:    true,
      sparse:    true,
      trim:      true,
      lowercase: true,
    },
    email: {
      type:      String,
      unique:    true,
      sparse:    true,
      trim:      true,
      lowercase: true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: { type: String, minlength: 4 },
    role:     { type: String, enum: ['admin', 'viewer'], default: 'viewer' },

    // ── Password reset ────────────────────────────────────────────────────────
    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Hash password before save
playerSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

playerSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Player', playerSchema);
