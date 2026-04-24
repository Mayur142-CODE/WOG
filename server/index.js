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
    { username: 'dhruvil', displayName: 'Dhruvil', password: 'wog1234', role: 'viewer', email: 'dhruviltalsaniya4@gmail.com'  },
    { username: 'mayur',   displayName: 'Mayur',   password: 'wog1234', role: 'admin',  email: 'mayurchavda122006@gmail.com'  },
    { username: 'dixit',   displayName: 'Dixit',   password: 'wog1234', role: 'viewer', email: 'dixitgohil0259@gmail.com'     },
    { username: 'dhruvin', displayName: 'Dhruvin', password: 'wog1234', role: 'viewer', email: 'lakhanidhruvin02@gmail.com'   },
  ];
  for (const u of defaults) {
    const exists = await User.findOne({ username: u.username });
    if (!exists) {
      // New user — create with email (password hashed by pre-save hook)
      await User.create(u);
      console.log(`🌱 Created user: ${u.username} (${u.email})`);
    } else if (!exists.email || exists.email !== u.email) {
      // Existing user missing email or has a different one — patch only the email field
      // (never touches password or role)
      await User.updateOne(
        { username: u.username },
        { $set: { email: u.email.trim().toLowerCase() } }
      );
      console.log(`📧 Email assigned: ${u.username} → ${u.email}`);
    }
  }
  console.log('✅ Emails assigned successfully');

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

  // Dynamic CORS configuration
  const allowedOrigins = [
    'http://localhost:5173',
    'https://wog-three.vercel.app',
    process.env.CLIENT_URL
  ].filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
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
