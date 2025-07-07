import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Import models
import Watchlist from '../server/models/Watchlist.js';

dotenv.config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set!');
  process.exit(1);
}

// Connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
  });
}

// JWT Middleware
const authenticateToken = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new Error('Access token required');
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return user;
  } catch (err) {
    throw new Error('Invalid token');
  }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Authenticate user
    const user = authenticateToken(req);
    const { method, query, body } = req;

    if (method === 'GET') {
      const watchlist = await Watchlist.find({ userId: user.userId });
      return res.json(watchlist);
    }

    if (method === 'POST') {
      const { symbol, name } = body;

      // Check if already in watchlist
      const existing = await Watchlist.findOne({
        userId: user.userId,
        symbol
      });

      if (existing) {
        return res.status(400).json({ message: 'Stock already in watchlist' });
      }

      const watchlistItem = new Watchlist({
        userId: user.userId,
        symbol,
        name
      });

      await watchlistItem.save();
      return res.json({ message: 'Stock added to watchlist', watchlistItem });
    }

    if (method === 'DELETE') {
      const { symbol } = query;
      
      await Watchlist.deleteOne({
        userId: user.userId,
        symbol: symbol.toUpperCase()
      });

      return res.json({ message: 'Stock removed from watchlist' });
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Watchlist API error:', error);
    if (error.message === 'Access token required' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}
