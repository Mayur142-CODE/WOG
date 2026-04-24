const mongoose = require('mongoose');

// Singleton document — stores turn state for both modes
const turnSchema = new mongoose.Schema(
  {
    currentIndex: { type: Number, default: 0, min: 0 },  // BR turn index
    csIndex:      { type: Number, default: 0, min: 0 },  // CS turn index
  },
  { timestamps: true }
);

module.exports = mongoose.model('Turn', turnSchema);
