const Scrim  = require('../models/Scrim');
const Player = require('../models/Player');
const Turn   = require('../models/Turn');

// Helper: get or create Turn doc
const getTurn = async () => {
  let turn = await Turn.findOne();
  if (!turn) turn = await Turn.create({ currentIndex: 0, csIndex: 0 });
  return turn;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/scrims?mode=BR|CS|all
// ─────────────────────────────────────────────────────────────────────────────
const getScrims = async (req, res, next) => {
  try {
    const mode = req.query.mode?.toUpperCase();
    const filter = mode && mode !== 'ALL' ? { mode } : {};
    const scrims = await Scrim.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(scrims);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/scrims
// ─────────────────────────────────────────────────────────────────────────────
const createScrim = async (req, res, next) => {
  try {
    const { player, entryFee, rank, winningAmount, date, mode = 'BR', result } = req.body;

    if (!player) return res.status(400).json({ message: 'Player is required' });

    const fee     = Number(entryFee) || 30;
    const modeUp  = (mode || 'BR').toUpperCase();
    let profitLoss = 0;
    let winning    = 0;

    if (modeUp === 'BR') {
      if (!rank) return res.status(400).json({ message: 'Rank is required for BR' });
      winning    = ['1', '2', '3'].includes(rank) ? Number(winningAmount) || 0 : 0;
      profitLoss = ['1', '2', '3'].includes(rank) ? winning - fee : -fee;
    } else if (modeUp === 'CS') {
      if (!result || !['WIN', 'DEFEAT'].includes(result.toUpperCase()))
        return res.status(400).json({ message: 'Result (WIN/DEFEAT) is required for CS' });
      winning    = result.toUpperCase() === 'WIN' ? Number(winningAmount) || 0 : 0;
      profitLoss = result.toUpperCase() === 'WIN' ? winning - fee : -fee;
    }

    const playerDoc = await Player.findOne({ name: player });

    const scrim = await Scrim.create({
      player,
      mode:         modeUp,
      rank:         modeUp === 'BR' ? rank : undefined,
      result:       modeUp === 'CS' ? result.toUpperCase() : undefined,
      entryFee:     fee,
      winningAmount: winning,
      profitLoss,
      date:         date ? new Date(date) : new Date(),
      user:         playerDoc?._id || null,
    });

    // Rotate the correct turn index
    const turn        = await getTurn();
    const playerCount = await Player.countDocuments();
    if (playerCount > 0) {
      if (modeUp === 'CS') {
        const next = (turn.csIndex + 1) % playerCount;
        await Turn.findOneAndUpdate({}, { csIndex: next });
      } else {
        const next = (turn.currentIndex + 1) % playerCount;
        await Turn.findOneAndUpdate({}, { currentIndex: next });
      }
    }

    res.status(201).json(scrim);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/scrims/:id
// ─────────────────────────────────────────────────────────────────────────────
const updateScrim = async (req, res, next) => {
  try {
    const { player, entryFee, rank, winningAmount, date, result, mode } = req.body;

    const fee    = Number(entryFee) || 30;
    const modeUp = (mode || 'BR').toUpperCase();
    let profitLoss = 0;
    let winning    = 0;

    if (modeUp === 'BR') {
      winning    = ['1', '2', '3'].includes(rank) ? Number(winningAmount) || 0 : 0;
      profitLoss = ['1', '2', '3'].includes(rank) ? winning - fee : -fee;
    } else {
      winning    = result?.toUpperCase() === 'WIN' ? Number(winningAmount) || 0 : 0;
      profitLoss = result?.toUpperCase() === 'WIN' ? winning - fee : -fee;
    }

    const scrim = await Scrim.findByIdAndUpdate(
      req.params.id,
      { player, mode: modeUp, rank, result: result?.toUpperCase(), entryFee: fee, winningAmount: winning, profitLoss, date },
      { new: true, runValidators: false }   // runValidators: false since rank/result are conditionally required
    );
    if (!scrim) return res.status(404).json({ message: 'Scrim not found' });
    res.json(scrim);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/scrims/:id
// ─────────────────────────────────────────────────────────────────────────────
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
