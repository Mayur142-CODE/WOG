require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const startServer = async () => {
  await connectDB();

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
