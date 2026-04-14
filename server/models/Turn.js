const mongoose = require('mongoose');

// Singleton document — only one turn state exists
const turnSchema = new mongoose.Schema(
  {
    currentIndex: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Turn', turnSchema);
