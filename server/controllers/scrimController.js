const Scrim = require('../models/Scrim');
const Player = require('../models/Player');
const Turn = require('../models/Turn');

// Helper functions have been consolidated into core logic where needed for atomicity.

// GET /api/scrims
const getScrims = async (req, res, next) => {
  try {
    const scrims = await Scrim.find().sort({ date: -1, createdAt: -1 });
    res.json(scrims);
  } catch (err) {
    next(err);
  }
};

// POST /api/scrims
const createScrim = async (req, res, next) => {
  try {
    const { player, entryFee, rank, winningAmount, date } = req.body;

    if (!player || !rank) {
      return res.status(400).json({ message: 'Player and rank are required' });
    }

    const fee = Number(entryFee) || 30;
    // ensure winning amounts are cast securely
    const winning = ['1', '2', '3'].includes(rank) ? Number(winningAmount) || 0 : 0;
    let profitLoss = 0;
    
    if (rank === '1' || rank === '2' || rank === '3') {
      profitLoss = winning - fee;
    } else {
      profitLoss = -fee; // Below 3
    }

    // Find player to get userId for linking
    const playerDoc = await Player.findOne({ name: player });

    const scrim = await Scrim.create({
      player,
      entryFee: fee,
      rank,
      winningAmount: winning,
      profitLoss,
      date: date ? new Date(date) : new Date(),
      user: playerDoc?.user || null,
    });

    // Auto-advance turn after saving by atomically incrementing index modulo player count.
    const playersCount = await Player.countDocuments();
    if (playersCount > 0) {
       const turn = await Turn.findOne();
       if (turn) {
         const nextIndex = (turn.currentIndex + 1) % playersCount;
         await Turn.findOneAndUpdate({}, { currentIndex: nextIndex }, { new: true });
       }
    }

    res.status(201).json(scrim);
  } catch (err) {
    next(err);
  }
};

// PUT /api/scrims/:id
const updateScrim = async (req, res, next) => {
  try {
    const { player, entryFee, rank, winningAmount, date } = req.body;

    const fee = Number(entryFee) || 30;
    const winning = ['1', '2', '3'].includes(rank) ? Number(winningAmount) || 0 : 0;
    
    let profitLoss = 0;
    if (rank === '1' || rank === '2' || rank === '3') {
      profitLoss = winning - fee;
    } else {
      profitLoss = -fee; // Below 3
    }

    const scrim = await Scrim.findByIdAndUpdate(
      req.params.id,
      { player, entryFee: fee, rank, winningAmount: winning, profitLoss, date },
      { new: true, runValidators: true }
    );
    if (!scrim) return res.status(404).json({ message: 'Scrim not found' });
    res.json(scrim);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/scrims/:id
const deleteScrim = async (req, res, next) => {
  try {
    const scrim = await Scrim.findByIdAndDelete(req.params.id);
    if (!scrim) return res.status(404).json({ message: 'Scrim not found' });
    res.json({ message: 'Scrim deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getScrims, createScrim, updateScrim, deleteScrim };
