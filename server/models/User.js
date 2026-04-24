const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username:    { type: String, required: true, unique: true, trim: true, lowercase: true },
    password:    { type: String, required: true, minlength: 4 },
    role:        { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
    displayName: { type: String, required: true },

    // Email — optional for legacy users, unique when provided
    email: {
      type:      String,
      unique:    true,
      sparse:    true,   // allows multiple docs with no email (null)
      trim:      true,
      lowercase: true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    // Password reset
    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
