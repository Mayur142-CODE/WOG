require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const seedData = async () => {
  const Player = require('./models/Player');
  const User   = require('./models/User');

  // Normalize legacy 'user' role to 'viewer' EARLY to prevent validation errors
  await User.updateMany({ role: 'user' }, { role: 'viewer' });

  // Seed players
  if ((await Player.countDocuments()) === 0) {
    await Player.insertMany(
      ['Dhruvil', 'Mayur', 'Dixit', 'Dhruvin'].map((name, order) => ({ name, order }))
    );
    console.log('🌱 Seeded default players');
  }

  // Seed users (pre-save hook hashes passwords)
  const defaults = [
    { username: 'dhruvil', displayName: 'Dhruvil', password: 'wog1234', role: 'viewer' },
    { username: 'mayur',   displayName: 'Mayur',   password: 'wog1234', role: 'admin'  },
    { username: 'dixit',   displayName: 'Dixit',   password: 'wog1234', role: 'viewer' },
    { username: 'dhruvin', displayName: 'Dhruvin', password: 'wog1234', role: 'viewer' },
  ];
  for (const u of defaults) {
    const exists = await User.findOne({ username: u.username });
    if (!exists) {
      await User.create(u);
      console.log(`🌱 Created user: ${u.username}`);
    }
  }

  // --- Data Migration: Link Players and Scrims to User IDs ---
  const Scrim  = require('./models/Scrim');
  const allUsers = await User.find();
  for (const user of allUsers) {
    // Link Player by name (case-insensitive or exact match)
    await Player.updateMany(
      { name: { $regex: new RegExp(`^${user.displayName}$`, 'i') }, user: { $exists: false } },
      { user: user._id }
    );
    // Link Scrims by player name
    await Scrim.updateMany(
      { player: { $regex: new RegExp(`^${user.displayName}$`, 'i') }, user: { $exists: false } },
      { user: user._id }
    );
  }
  console.log('✅ Data migration: Linked existing records to User IDs');
};

const startServer = async () => {
  await connectDB();
  await seedData();

  const app = express();

  app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
  app.use(express.json());

  app.use('/api/auth',    require('./routes/auth'));
  app.use('/api/players', require('./routes/players'));
  app.use('/api/scrims',  require('./routes/scrims'));
  app.use('/api/summary', require('./routes/summary'));
  app.use('/api/users',   require('./routes/users'));

  app.get('/api/health', (_req, res) =>
    res.json({ status: 'ok', message: '🎮 WoG Scrim Manager API running' })
  );

  app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
};

startServer();
