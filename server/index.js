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
  // NOTE: Player.create() triggers the pre-save bcrypt hook — pass RAW password.
  // Player.updateOne($set) bypasses hooks   — pass PRE-HASHED password.
  const RAW_PASSWORD    = 'wog1234';
  const hashedPassword  = await bcrypt.hash(RAW_PASSWORD, 12);

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
      // Brand-new — pass RAW password so pre-save hook hashes it exactly once
      await Player.create({ ...u, password: RAW_PASSWORD });
      u.role === 'admin' ? adminCreated++ : viewerCreated++;
      console.log(`🌱 Created player: ${u.name} (${u.role}) — ${u.email}`);
    } else {
      // Existing — updateOne bypasses pre-save, so always write the PRE-HASHED value.
      // This also corrects any previously double-hashed password in the DB.
      const updates = {
        password: hashedPassword,           // always correct the hash
        username: u.username,
        email:    u.email,
        role:     u.role,
        order:    u.order,
      };
      await Player.updateOne({ name: u.name }, { $set: updates });
      console.log(`🔄 Updated player: ${u.name} (password corrected)`);
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
