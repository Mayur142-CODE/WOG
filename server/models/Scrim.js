const mongoose = require('mongoose');

const scrimSchema = new mongoose.Schema(
  {
    player: {
      type: String,
      required: [true, 'Player name is required'],
      trim: true,
    },

    // ── Mode ────────────────────────────────────────────────────────────────
    mode: {
      type: String,
      enum: ['BR', 'CS'],
      default: 'BR',
    },

    // ── Battle Royale fields ─────────────────────────────────────────────────
    rank: {
      type: String,
      enum: ['1', '2', '3', 'Below 3'],
      // required only for BR — validated in controller
    },

    // ── Clash Squad fields ───────────────────────────────────────────────────
    result: {
      type: String,
      enum: ['WIN', 'DEFEAT'],
      // required only for CS — validated in controller
    },

    // ── Shared financial fields ──────────────────────────────────────────────
    entryFee: {
      type: Number,
      required: [true, 'Entry fee is required'],
      min: [0, 'Entry fee cannot be negative'],
      default: 30,
    },
    winningAmount: { type: Number, default: 0, min: 0 },
    profitLoss:    { type: Number, default: 0 },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Player reference (same collection)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scrim', scrimSchema);
