const Scrim  = require('../models/Scrim');
const Player = require('../models/Player');
const Turn   = require('../models/Turn');

// Helper: get or create the singleton Turn doc
const getTurn = async () => {
  let turn = await Turn.findOne();
  if (!turn) turn = await Turn.create({ currentIndex: 0, csIndex: 0 });
  return turn;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/summary?mode=BR|CS
// ─────────────────────────────────────────────────────────────────────────────
const getSummary = async (req, res, next) => {
  try {
    const mode = (req.query.mode || 'BR').toUpperCase();
    const validModes = ['BR', 'CS'];
    if (!validModes.includes(mode))
      return res.status(400).json({ message: 'Invalid mode. Use BR or CS.' });

    const [allScrims, allPlayers, turn] = await Promise.all([
      Scrim.find({}),
      Player.find(),
      getTurn(),
    ]);

    // Filter scrims for requested mode
    // Existing scrims with no mode field default to BR
    const scrims = allScrims.filter((s) => (s.mode || 'BR') === mode);

    const totalMatches   = scrims.length;
    const totalSpending  = scrims.reduce((sum, s) => sum + s.entryFee, 0);
    const totalWinning   = scrims.reduce((sum, s) => sum + s.winningAmount, 0);
    const totalProfitLoss = scrims.reduce((sum, s) => sum + s.profitLoss, 0);

    // Sort players by the mode-specific order field
    // Falls back to `order` (legacy) if brOrder/csOrder not set yet
    const orderField = mode === 'CS' ? 'csOrder' : 'brOrder';
    const players = allPlayers
      .filter((p) => p[orderField] != null)
      .sort((a, b) => a[orderField] - b[orderField]);

    // If no mode-specific order set yet, fall back to legacy order for BR
    const sortedPlayers = players.length > 0
      ? players
      : allPlayers.slice().sort((a, b) => a.order - b.order);

    const turnIndex = mode === 'CS' ? turn.csIndex : turn.currentIndex;
    const currentPlayer = sortedPlayers.length > 0
      ? sortedPlayers[turnIndex % sortedPlayers.length]
      : null;

    res.json({
      mode,
      totalMatches,
      totalSpending,
      totalWinning,
      totalProfitLoss,
      currentPlayer: currentPlayer ? currentPlayer.name : 'N/A',
      currentIndex:  turnIndex,
      players:       sortedPlayers,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/summary/reset-turn?mode=BR|CS
// ─────────────────────────────────────────────────────────────────────────────
const resetTurn = async (req, res, next) => {
  try {
    const mode = (req.query.mode || 'BR').toUpperCase();
    const field = mode === 'CS' ? 'csIndex' : 'currentIndex';

    await Turn.findOneAndUpdate({}, { [field]: 0 }, { upsert: true });

    const players = await Player.find().sort({ order: 1 });
    res.json({
      message: `${mode} turn reset to first player`,
      currentPlayer: players.length > 0 ? players[0].name : 'N/A',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, resetTurn };
