const mongoose = require('mongoose');

const scrimSchema = new mongoose.Schema(
  {
    player: {
      type: String,
      required: [true, 'Player name is required'],
      trim: true,
    },
    entryFee: {
      type: Number,
      required: [true, 'Entry fee is required'],
      min: [0, 'Entry fee cannot be negative'],
      default: 30,
    },
    rank: {
      type: String,
      required: [true, 'Rank is required'],
      enum: ['1', '2', '3', 'Below 3'],
    },
    winningAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    profitLoss: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scrim', scrimSchema);
