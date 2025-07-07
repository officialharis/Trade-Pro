import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Import models
import User from '../server/models/User.js';
import Stock from '../server/models/Stock.js';
import Portfolio from '../server/models/Portfolio.js';
import Transaction from '../server/models/Transaction.js';
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
    const { method, query } = req;

    if (method === 'GET' && query.type === 'stats') {
      const userId = user.userId;

      // Get portfolio holdings
      const holdings = await Portfolio.find({ userId });
      
      // Get user balance
      const userDoc = await User.findById(userId);
      
      // Get recent transactions
      const recentTransactions = await Transaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5);

      // Get watchlist count
      const watchlistCount = await Watchlist.countDocuments({ userId });

      // Calculate portfolio value (would need current stock prices)
      let portfolioValue = 0;
      let totalInvestment = 0;

      for (const holding of holdings) {
        const stock = await Stock.findOne({ symbol: holding.symbol });
        if (stock) {
          portfolioValue += stock.price * holding.quantity;
          totalInvestment += holding.avgPrice * holding.quantity;
        }
      }

      const totalGain = portfolioValue - totalInvestment;
      const gainPercentage = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

      // Initialize wallet if it doesn't exist (for existing users)
      if (!userDoc.wallet) {
        userDoc.wallet = {
          balance: userDoc.balance || 1000, // Use old balance or default $1000
          currency: 'USD',
          transactions: []
        };
        await userDoc.save();
      }

      return res.json({
        portfolioValue,
        totalInvestment,
        totalGain,
        gainPercentage,
        availableBalance: userDoc.wallet.balance,
        currency: userDoc.wallet.currency,
        totalHoldings: holdings.length,
        watchlistCount,
        recentTransactions
      });
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Dashboard API error:', error);
    if (error.message === 'Access token required' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}
