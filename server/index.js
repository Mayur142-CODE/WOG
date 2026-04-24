require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ─────────────────────────────────────────────────────────────────────────────
// Seed / Migration — runs once on every startup
// ─────────────────────────────────────────────────────────────────────────────
const seedData = async () => {
  const Player = require('./models/Player');
  const Scrim  = require('./models/Scrim');

  // ── 1. Normalize legacy roles ──────────────────────────────────────────────
  await Player.updateMany({ role: 'user' }, { role: 'viewer' });

  // ── 2. Seed / migrate the 4 core players with auth fields ─────────────────
  const password = await bcrypt.hash('wog1234', 12);

  const defaults = [
    { name: 'Dhruvil', username: 'dhruvil', email: 'dhruviltalsaniya4@gmail.com', role: 'viewer', order: 0 },
    { name: 'Dhruvin', username: 'dhruvin', email: 'lakhanidhruvin02@gmail.com',  role: 'viewer', order: 1 },
    { name: 'Dixit',   username: 'dixit',   email: 'dixitgohil0259@gmail.com',    role: 'viewer', order: 2 },
    { name: 'Mayur',   username: 'mayur',   email: 'mayurchavda122006@gmail.com', role: 'admin',  order: 3 },
  ];

  let adminCreated  = 0;
  let viewerCreated = 0;

  for (const u of defaults) {
    const existing = await Player.findOne({ name: u.name });

    if (!existing) {
      // Brand-new player — create with all fields (password already hashed above)
      await Player.create({ ...u, password });
      u.role === 'admin' ? adminCreated++ : viewerCreated++;
      console.log(`🌱 Created player: ${u.name} (${u.role}) — ${u.email}`);
    } else {
      // Existing player — patch only missing/changed auth fields
      const updates = {};
      if (!existing.username || existing.username !== u.username) updates.username = u.username;
      if (!existing.email    || existing.email    !== u.email)    updates.email    = u.email;
      if (!existing.role     || existing.role     !== u.role)     updates.role     = u.role;
      if (existing.order     !== u.order)                         updates.order    = u.order;
      // Set password only if the player has never had one (migration from old Player model)
      if (!existing.password) updates.password = password;

      if (Object.keys(updates).length > 0) {
        await Player.updateOne({ name: u.name }, { $set: updates });
        console.log(`🔄 Updated player: ${u.name} →`, Object.keys(updates).join(', '));
      }
    }
  }

  if (adminCreated  > 0) console.log(`✅ Admin user created: Mayur`);
  if (viewerCreated > 0) console.log(`✅ Viewer users created: ${viewerCreated}`);
  console.log('✅ Players seeded successfully');

  // ── 3. Link existing Scrim records to Player IDs ───────────────────────────
  const allPlayers = await Player.find();
  for (const player of allPlayers) {
    await Scrim.updateMany(
      { player: { $regex: new RegExp(`^${player.name}$`, 'i') }, user: { $exists: false } },
      { user: player._id }
    );
  }
  console.log('✅ Scrims linked to Player IDs');
};

// ─────────────────────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  await seedData();

  const app = express();

  // Dynamic CORS
  const allowedOrigins = [
    'http://localhost:5173',
    'https://wog-three.vercel.app',
    process.env.CLIENT_URL,
  ].filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }));

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
