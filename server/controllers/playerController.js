const Player = require('../models/Player');
const Turn = require('../models/Turn');

// Helper: get or create turn document
const getTurn = async () => {
  let turn = await Turn.findOne();
  if (!turn) turn = await Turn.create({ currentIndex: 0 });
  return turn;
};

// GET /api/players
const getPlayers = async (req, res, next) => {
  try {
    const players = await Player.find().sort({ order: 1 });
    const turn = await getTurn();
    res.json({ players, currentIndex: turn.currentIndex });
  } catch (err) {
    next(err);
  }
};

// POST /api/players
const createPlayer = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Player name is required' });
    }
    const count = await Player.countDocuments();
    const player = await Player.create({ name: name.trim(), order: count });
    res.status(201).json(player);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Player name already exists' });
    }
    next(err);
  }
};

// PUT /api/players/reorder — body: [{ _id, order }]
const reorderPlayers = async (req, res, next) => {
  try {
    const updates = req.body; // array of { _id, order }
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Invalid reorder payload' });
    }
    const ops = updates.map(({ _id, order }) =>
      Player.findByIdAndUpdate(_id, { order }, { new: true })
    );
    await Promise.all(ops);
    const players = await Player.find().sort({ order: 1 });
    // Reset turn index to 0 when order changes
    await Turn.findOneAndUpdate({}, { currentIndex: 0 }, { upsert: true });
    res.json({ players, message: 'Order updated successfully' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/players/:id
const updatePlayer = async (req, res, next) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/players/:id
const deletePlayer = async (req, res, next) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });
    // Re-index orders
    const remaining = await Player.find().sort({ order: 1 });
    const ops = remaining.map((p, i) =>
      Player.findByIdAndUpdate(p._id, { order: i })
    );
    await Promise.all(ops);
    // Reset turn if index is out of range
    const turn = await getTurn();
    if (turn.currentIndex >= remaining.length) {
      await Turn.findOneAndUpdate({}, { currentIndex: 0 }, { upsert: true });
    }
    res.json({ message: 'Player deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPlayers, createPlayer, reorderPlayers, updatePlayer, deletePlayer };
