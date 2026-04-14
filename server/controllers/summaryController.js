const Scrim = require('../models/Scrim');
const Player = require('../models/Player');
const Turn = require('../models/Turn');

// Helper: get or create turn
const getTurn = async () => {
  let turn = await Turn.findOne();
  if (!turn) turn = await Turn.create({ currentIndex: 0 });
  return turn;
};

// GET /api/summary
const getSummary = async (req, res, next) => {
  try {
    const [scrims, players, turn] = await Promise.all([
      Scrim.find(),
      Player.find().sort({ order: 1 }),
      getTurn(),
    ]);

    const totalMatches = scrims.length;
    const totalSpending = scrims.reduce((sum, s) => sum + s.entryFee, 0);
    const totalWinning = scrims.reduce((sum, s) => sum + s.winningAmount, 0);
    const totalProfitLoss = scrims.reduce((sum, s) => sum + s.profitLoss, 0);

    const currentPlayer =
      players.length > 0 ? players[turn.currentIndex % players.length] : null;

    res.json({
      totalMatches,
      totalSpending,
      totalWinning,
      totalProfitLoss,
      currentPlayer: currentPlayer ? currentPlayer.name : 'N/A',
      currentIndex: turn.currentIndex,
      players,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/summary/reset-turn
const resetTurn = async (req, res, next) => {
  try {
    await Turn.findOneAndUpdate({}, { currentIndex: 0 }, { upsert: true });
    const players = await Player.find().sort({ order: 1 });
    res.json({
      message: 'Turn reset to first player',
      currentPlayer: players.length > 0 ? players[0].name : 'N/A',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, resetTurn };
